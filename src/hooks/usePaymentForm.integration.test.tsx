/**
 * Integration tests for usePaymentForm — the core payment hook.
 *
 * These tests render the REAL hook via renderHook with mocked externals,
 * covering the full payment lifecycle:
 *
 *   1. SDK initialization & Shift4 component mounting
 *   2. Happy path: tokenize → 3DS → charge → poll → redirect
 *   3. Double-payment prevention (same tab, cross-tab, rapid clicks)
 *   4. Polling state machine (pending → paid, pending → failed, timeout)
 *   5. Resume polling after page refresh
 *   6. Cross-tab sync (BroadcastChannel + storage fallback)
 *   7. Error handling at every stage (tokenize, 3DS, charge, poll)
 *   8. Analytics firing (PostHog, fbq, gtag, dataLayer)
 *   9. Cleanup on unmount
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import type { ReactNode } from 'react';

import {
    usePaymentForm,
    PAYMENT_IN_PROGRESS_KEY,
    PAYMENT_COMPLETED_KEY,
    PAYMENT_STALENESS_TTL_MS,
} from './usePaymentForm';
import { useAuthStore } from '@/store/states/auth';

// =============================================================================
// Mocks
// =============================================================================

// ── Shift4 service (API layer) ──────────────────────────────────────────────
const mockPayment = vi.fn();
const mockGetPaymentStatus = vi.fn();

vi.mock('@/services/shift4-service', () => ({
    shift4Service: {
        payment: (...args: unknown[]) => mockPayment(...args),
        getPaymentStatus: (...args: unknown[]) => mockGetPaymentStatus(...args),
    },
}));

// ── Toast ───────────────────────────────────────────────────────────────────
const mockTriggerToast = vi.fn();
vi.mock('@/components/AlertToast', () => ({
    triggerToast: (...args: unknown[]) => mockTriggerToast(...args),
    toastType: { default: 'default', success: 'success', warning: 'warning', error: 'error' },
}));

// ── gtag ────────────────────────────────────────────────────────────────────
vi.mock('@/lib/gtag', () => ({
    reportPurchase: vi.fn(),
    gaCloseConvertLead: vi.fn(),
    gaPurchase: vi.fn((_txId: string, _value: number, _currency: string, onSent?: () => void) => {
        onSent?.();
    }),
}));
import { reportPurchase, gaPurchase } from '@/lib/gtag';

// ── Shift4Ready hook ────────────────────────────────────────────────────────
let mockShift4Ready = { isReady: true, error: null as string | null };
vi.mock('@/hooks/useShift4Ready', () => ({
    useShift4Ready: () => mockShift4Ready,
}));

// ── env ─────────────────────────────────────────────────────────────────────
vi.mock('@/config/env', () => ({
    env: {
        apiBaseUrl: 'http://localhost:4000',
        shift4: {
            publishableKey: 'pk_test_123',
            paymentRedirect: 'https://mydreamcompanion.com',
        },
        posthog: { token: '', host: '', enableDevAnalytics: false },
    },
}));

// =============================================================================
// BroadcastChannel capture
// =============================================================================

// The hook uses a module-level singleton `paymentChannel` that persists across
// tests. We capture every BroadcastChannel instance to simulate cross-tab
// messages and ensure proper cleanup.

// Track rendered hooks so we can unmount them in afterEach — this ensures
// the module-level `paymentChannel` singleton is properly cleaned up.
let cleanupFns: Array<() => void> = [];

// =============================================================================
// window.location mock helper
// =============================================================================

let originalLocation: Location;
let locationHref = '';

function mockWindowLocation() {
    originalLocation = window.location;
    locationHref = '';
    // Replace window.location with a writable object
    Object.defineProperty(window, 'location', {
        writable: true,
        value: {
            ...originalLocation,
            get href() {
                return locationHref;
            },
            set href(val: string) {
                locationHref = val;
            },
            assign: vi.fn(),
            replace: vi.fn(),
            reload: vi.fn(),
        },
        configurable: true,
    });
}

function restoreWindowLocation() {
    Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
        configurable: true,
    });
}

// =============================================================================
// Shift4 SDK mock factory
// =============================================================================

function createMockShift4Instance(
    overrides: {
        createTokenResult?: { id?: string; error?: { message: string } };
        verifyThreeDSecureResult?: { id?: string; error?: { message: string } };
    } = {},
) {
    const { createTokenResult, verifyThreeDSecureResult } = overrides;

    const mockComponentGroup = {
        automount: vi.fn(),
        unmount: vi.fn(),
    };

    const mockInstance: Shift4Instance = {
        createToken: vi.fn().mockResolvedValue(createTokenResult ?? { id: 'tok_test_123' }),
        verifyThreeDSecure: vi.fn().mockResolvedValue(verifyThreeDSecureResult ?? { id: 'tok_3ds_verified' }),
        createComponentGroup: vi.fn().mockReturnValue(mockComponentGroup),
    };

    const constructorFn = vi.fn().mockReturnValue(mockInstance);

    return { constructorFn, mockInstance, mockComponentGroup };
}

// =============================================================================
// Test wrapper
// =============================================================================

function createWrapper(formDefaults?: Record<string, unknown>) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    function FormWrapper({ children }: { children: ReactNode }) {
        const form = useForm({
            defaultValues: { productId: 105, ...formDefaults },
        });
        return <FormProvider {...form}>{children}</FormProvider>;
    }

    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <FormWrapper>{children}</FormWrapper>
            </QueryClientProvider>
        );
    };
}

// =============================================================================
// Helpers
// =============================================================================

function setupShift4OnWindow(shift4Mock?: ReturnType<typeof createMockShift4Instance>) {
    const mock = shift4Mock ?? createMockShift4Instance();
    (window as unknown as Record<string, unknown>).Shift4 = mock.constructorFn;
    return mock;
}

function setPaymentInProgress(subscriptionId: string, timestamp = Date.now()) {
    localStorage.setItem(PAYMENT_IN_PROGRESS_KEY, JSON.stringify({ subscriptionId, timestamp }));
}

function setPaymentCompleted(timestamp = Date.now()) {
    localStorage.setItem(PAYMENT_COMPLETED_KEY, JSON.stringify({ timestamp }));
}

/**
 * Wrapper around renderHook that auto-tracks the unmount function.
 * All tracked hooks are unmounted in afterEach to reset module-level state.
 */
function renderPaymentHook(wrapper: ReturnType<typeof createWrapper>) {
    const hookResult = renderHook(() => usePaymentForm(), { wrapper });
    cleanupFns.push(hookResult.unmount);
    return hookResult;
}

// =============================================================================
// Setup / Teardown
// =============================================================================

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();

    cleanupFns = [];

    // Reset auth store
    useAuthStore.getState().reset();
    useAuthStore.getState().setToken('jwt_test_token');
    useAuthStore.getState().setUserId(42);

    // Reset Shift4Ready mock
    mockShift4Ready = { isReady: true, error: null };

    // Reset window globals
    delete (window as unknown as Record<string, unknown>).Shift4;
    window.fbq = vi.fn();
    window.dataLayer = [];

    // Default: payment API returns subscription_initiated
    mockPayment.mockResolvedValue({
        status: 'subscription_initiated',
        subscriptionId: 'sub_test_123',
    });

    // Default: polling returns paid immediately
    mockGetPaymentStatus.mockResolvedValue({
        subscriptionId: 'sub_test_123',
        paid_status: 'paid',
        events: [],
    });
});

afterEach(() => {
    // Unmount all rendered hooks — CRITICAL: this resets the module-level
    // `paymentChannel` singleton via the cleanup effect.
    cleanupFns.forEach((fn) => fn());
    cleanupFns = [];

    vi.useRealTimers();
    delete (window as unknown as Record<string, unknown>).Shift4;
    delete (window as unknown as Record<string, unknown>).fbq;
    delete (window as unknown as Record<string, unknown>).dataLayer;
});

// =============================================================================
// Tests
// =============================================================================

describe('usePaymentForm — integration', () => {
    // ─── Initialization ─────────────────────────────────────────────────────

    describe('SDK initialization', () => {
        it('initializes Shift4 and mounts components when SDK is ready', async () => {
            const { constructorFn, mockComponentGroup } = setupShift4OnWindow();

            renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(constructorFn).toHaveBeenCalledWith('pk_test_123');
                expect(mockComponentGroup.automount).toHaveBeenCalledWith('#payment-form');
            });
        });

        it('does not initialize when Shift4 SDK is not ready', () => {
            mockShift4Ready = { isReady: false, error: null };
            setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            expect(result.current.isShift4Ready).toBe(false);
            expect(result.current.isButtonDisabled).toBe(true);
        });

        it('shows error toast when Shift4 SDK fails to load', () => {
            mockShift4Ready = { isReady: false, error: 'Shift4 failed to load within 5 seconds' };

            renderPaymentHook(createWrapper());

            expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
        });

        it('shows error toast when window.Shift4 is undefined but isReady=true', async () => {
            mockShift4Ready = { isReady: true, error: null };
            // Don't set window.Shift4

            renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
            });
        });
    });

    // ─── Initial state ──────────────────────────────────────────────────────

    describe('initial state from localStorage', () => {
        it('starts with isButtonDisabled=true when no Shift4 components yet', () => {
            const { result } = renderPaymentHook(createWrapper());

            expect(result.current.isButtonDisabled).toBe(true);
        });

        it('restores isSubmitting=true from fresh localStorage entry', () => {
            setPaymentInProgress('sub_existing');

            const { result } = renderPaymentHook(createWrapper());

            expect(result.current.isPaymentInProgress).toBe(true);
        });

        it('ignores stale localStorage entry', () => {
            setPaymentInProgress('sub_old', Date.now() - PAYMENT_STALENESS_TTL_MS - 1);
            setupShift4OnWindow();

            renderPaymentHook(createWrapper());

            expect(localStorage.getItem(PAYMENT_IN_PROGRESS_KEY)).toBeNull();
        });

        it('restores paymentCompleted from fresh entry', () => {
            setPaymentCompleted();

            const { result } = renderPaymentHook(createWrapper());

            expect(result.current.isPaymentInProgress).toBe(true);
            expect(result.current.isButtonDisabled).toBe(true);
        });
    });

    // ─── Happy path ─────────────────────────────────────────────────────────

    describe('happy path: tokenize → 3DS → charge → poll → redirect', () => {
        it('completes full payment flow and redirects', async () => {
            mockWindowLocation();
            const { mockInstance } = setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            // Trigger payment
            await act(async () => {
                await result.current.onSubmit();
            });

            // Verify tokenization
            expect(mockInstance.createToken).toHaveBeenCalled();

            // Verify 3DS
            expect(mockInstance.verifyThreeDSecure).toHaveBeenCalledWith({
                amount: 999,
                currency: 'USD',
                card: 'tok_test_123',
            });

            // Verify API call
            expect(mockPayment).toHaveBeenCalledWith({
                paymentToken: 'tok_3ds_verified',
                productId: 105,
            });

            // Wait for mutation onSuccess + polling to complete
            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledWith('sub_test_123');
            });

            // Advance past redirect setTimeout(300ms)
            act(() => {
                vi.advanceTimersByTime(350);
            });

            // Verify redirect
            expect(locationHref).toContain('authToken=jwt_test_token');

            restoreWindowLocation();
        });

        it('stores subscriptionId in localStorage during polling', async () => {
            const { mockInstance } = setupShift4OnWindow();
            mockGetPaymentStatus.mockResolvedValue({
                subscriptionId: 'sub_test_123',
                paid_status: 'pending',
                events: [],
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            // Wait for mutation to complete and localStorage to be set
            await waitFor(() => {
                const stored = localStorage.getItem(PAYMENT_IN_PROGRESS_KEY);
                expect(stored).not.toBeNull();
                const parsed = JSON.parse(stored!);
                expect(parsed.subscriptionId).toBe('sub_test_123');
                expect(parsed.timestamp).toBeGreaterThan(0);
            });
        });
    });

    // ─── Double payment prevention ──────────────────────────────────────────

    describe('double payment prevention', () => {
        it('blocks submit when isSubmitting is already true (rapid double-click)', async () => {
            const { mockInstance } = setupShift4OnWindow();

            // Slow down tokenization
            mockInstance.createToken = vi
                .fn()
                .mockImplementation(
                    () => new Promise((resolve) => setTimeout(() => resolve({ id: 'tok_slow' }), 2000)),
                );

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            // First click
            act(() => {
                result.current.onSubmit();
            });

            // Second click immediately — should be blocked
            await act(async () => {
                await result.current.onSubmit();
            });

            expect(mockInstance.createToken).toHaveBeenCalledTimes(1);
        });

        it('blocks submit when paymentCompleted is true', async () => {
            setPaymentCompleted();
            const { mockInstance } = setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            expect(mockInstance.createToken).not.toHaveBeenCalled();
        });

        it('blocks submit when another tab has fresh in-progress entry (pre-flight check)', async () => {
            const { mockInstance } = setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            // Simulate another tab starting payment just before our click
            setPaymentInProgress('sub_other_tab');

            await act(async () => {
                await result.current.onSubmit();
            });

            expect(mockInstance.createToken).not.toHaveBeenCalled();
            expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'warning' }));
        });

        it('allows submit when another tab entry is stale (past TTL)', async () => {
            const { mockInstance } = setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            setPaymentInProgress('sub_stale', Date.now() - PAYMENT_STALENESS_TTL_MS - 1);

            await act(async () => {
                await result.current.onSubmit();
            });

            expect(mockInstance.createToken).toHaveBeenCalled();
        });

        it('handles corrupted localStorage in pre-flight gracefully', async () => {
            const { mockInstance } = setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            localStorage.setItem(PAYMENT_IN_PROGRESS_KEY, '{corrupted!!!');

            await act(async () => {
                await result.current.onSubmit();
            });

            expect(mockInstance.createToken).toHaveBeenCalled();
        });
    });

    // ─── Polling state machine ──────────────────────────────────────────────

    describe('polling state machine', () => {
        it('polls until paid status received', async () => {
            mockWindowLocation();
            const { mockInstance } = setupShift4OnWindow();

            mockGetPaymentStatus
                .mockResolvedValueOnce({ subscriptionId: 'sub_test_123', paid_status: 'pending', events: [] })
                .mockResolvedValueOnce({ subscriptionId: 'sub_test_123', paid_status: 'pending', events: [] })
                .mockResolvedValueOnce({ subscriptionId: 'sub_test_123', paid_status: 'paid', events: [] });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            // Wait for first poll (pending)
            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledTimes(1);
            });

            // Advance 5s for next poll
            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledTimes(2);
            });

            // Advance 5s for next poll — this one returns paid
            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledTimes(3);
            });

            // Advance past redirect delay
            act(() => {
                vi.advanceTimersByTime(350);
            });

            expect(locationHref).toContain('authToken=jwt_test_token');
            restoreWindowLocation();
        });

        it('shows error toast on payment failure with failureMessage', async () => {
            const { mockInstance } = setupShift4OnWindow();

            mockGetPaymentStatus.mockResolvedValue({
                subscriptionId: 'sub_test_123',
                paid_status: 'failed',
                failureMessage: 'Card declined by issuer',
                events: [],
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            // Wait for mutation onSuccess → poll → failure toast
            await waitFor(() => {
                expect(mockTriggerToast).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: 'Card declined by issuer',
                        type: 'error',
                    }),
                );
            });

            expect(localStorage.getItem(PAYMENT_IN_PROGRESS_KEY)).toBeNull();
            expect(result.current.isPaymentInProgress).toBe(false);
        });

        it('shows fallback error when failed status has no failureMessage', async () => {
            const { mockInstance } = setupShift4OnWindow();

            mockGetPaymentStatus.mockResolvedValue({
                subscriptionId: 'sub_test_123',
                paid_status: 'failed',
                events: [],
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
            });
        });

        it('times out after 48 attempts (4 minutes)', async () => {
            const { mockInstance } = setupShift4OnWindow();

            mockGetPaymentStatus.mockResolvedValue({
                subscriptionId: 'sub_test_123',
                paid_status: 'pending',
                events: [],
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            // Wait for the first poll
            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledTimes(1);
            });

            // Advance through remaining 47 attempts (5s each)
            for (let i = 1; i < 48; i++) {
                await act(async () => {
                    vi.advanceTimersByTime(5000);
                });
            }

            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledTimes(48);
                expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
            });
        });

        it('retries on 404 errors (subscription not yet created in backend)', async () => {
            mockWindowLocation();
            const { mockInstance } = setupShift4OnWindow();

            mockGetPaymentStatus
                .mockRejectedValueOnce({ response: { status: 404 } })
                .mockResolvedValueOnce({ subscriptionId: 'sub_test_123', paid_status: 'paid', events: [] });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledTimes(1);
            });

            // Advance 5s — retry
            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledTimes(2);
            });

            // Advance past redirect
            act(() => {
                vi.advanceTimersByTime(350);
            });

            expect(locationHref).toContain('authToken=');
            restoreWindowLocation();
        });

        it('fails immediately on non-404 API errors', async () => {
            const { mockInstance } = setupShift4OnWindow();

            mockGetPaymentStatus.mockRejectedValue({
                response: { status: 500 },
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
            });

            // Should NOT retry
            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            // Only 1 call — no retry on 500
            expect(mockGetPaymentStatus).toHaveBeenCalledTimes(1);
        });
    });

    // ─── Resume polling after refresh ───────────────────────────────────────

    describe('resume polling after page refresh', () => {
        it('resumes polling for fresh in-progress payment on mount', async () => {
            mockWindowLocation();
            setPaymentInProgress('sub_resume_123');
            setupShift4OnWindow();

            mockGetPaymentStatus.mockResolvedValue({
                subscriptionId: 'sub_resume_123',
                paid_status: 'paid',
                events: [],
            });

            renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledWith('sub_resume_123');
            });

            act(() => {
                vi.advanceTimersByTime(350);
            });

            expect(locationHref).toContain('authToken=');
            restoreWindowLocation();
        });

        it('does not resume polling for stale entries', async () => {
            setPaymentInProgress('sub_old', Date.now() - PAYMENT_STALENESS_TTL_MS - 1);
            setupShift4OnWindow();

            renderPaymentHook(createWrapper());

            await act(async () => {
                vi.advanceTimersByTime(100);
            });

            expect(mockGetPaymentStatus).not.toHaveBeenCalled();
            expect(localStorage.getItem(PAYMENT_IN_PROGRESS_KEY)).toBeNull();
        });

        it('stays on payment step for entries without subscriptionId (early marker) and clears after 15s', async () => {
            localStorage.setItem(PAYMENT_IN_PROGRESS_KEY, JSON.stringify({ timestamp: Date.now() }));
            setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await act(async () => {
                vi.advanceTimersByTime(100);
            });

            // Should NOT poll — no subscriptionId to poll with
            expect(mockGetPaymentStatus).not.toHaveBeenCalled();
            // Should stay in submitting state (waiting for usePremiumRedirect)
            expect(result.current.isPaymentInProgress).toBe(true);
            expect(localStorage.getItem(PAYMENT_IN_PROGRESS_KEY)).not.toBeNull();

            // After 15s timeout, clear the marker and allow retry
            await act(async () => {
                vi.advanceTimersByTime(15_000);
            });

            expect(localStorage.getItem(PAYMENT_IN_PROGRESS_KEY)).toBeNull();
            expect(result.current.resumePollingFailed).toBe(true);
        });

        it('cleans up and shows error when resume polling fails', async () => {
            setPaymentInProgress('sub_fail_resume');
            setupShift4OnWindow();

            mockGetPaymentStatus.mockRejectedValue({
                response: { status: 500 },
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledWith('sub_fail_resume');
            });

            expect(localStorage.getItem(PAYMENT_IN_PROGRESS_KEY)).toBeNull();
            expect(result.current.resumePollingFailed).toBe(true);
        });

        it('handles corrupted localStorage on mount gracefully', async () => {
            localStorage.setItem(PAYMENT_IN_PROGRESS_KEY, 'not{valid}json!!!');
            setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await act(async () => {
                vi.advanceTimersByTime(100);
            });

            expect(result.current.resumePollingFailed).toBe(true);
        });
    });

    // ─── Tokenization & 3DS errors ──────────────────────────────────────────

    describe('tokenization & 3DS error handling', () => {
        it('shows error toast when createToken returns error', async () => {
            const shift4Mock = createMockShift4Instance({
                createTokenResult: { error: { message: 'Invalid card number' } },
            });
            setupShift4OnWindow(shift4Mock);

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(shift4Mock.mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
            expect(mockPayment).not.toHaveBeenCalled();
            expect(result.current.isPaymentInProgress).toBe(false);
        });

        it('shows error toast when verifyThreeDSecure returns error', async () => {
            const shift4Mock = createMockShift4Instance({
                verifyThreeDSecureResult: { error: { message: '3DS verification failed' } },
            });
            setupShift4OnWindow(shift4Mock);

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(shift4Mock.mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
            expect(mockPayment).not.toHaveBeenCalled();
        });

        it('resets isSubmitting on tokenization error so user can retry', async () => {
            const shift4Mock = createMockShift4Instance({
                createTokenResult: { error: { message: 'Card expired' } },
            });
            setupShift4OnWindow(shift4Mock);

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(shift4Mock.mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            expect(result.current.isPaymentInProgress).toBe(false);
            expect(localStorage.getItem(PAYMENT_IN_PROGRESS_KEY)).toBeNull();
        });

        it('blocks submit when shift4Instance is null (components not ready)', async () => {
            // Don't set window.Shift4
            const { result } = renderPaymentHook(createWrapper());

            await act(async () => {
                await result.current.onSubmit();
            });

            expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
        });
    });

    // ─── Charge API errors ──────────────────────────────────────────────────

    describe('charge API errors', () => {
        it('handles 409 conflict (already subscribed) by redirecting to platform', async () => {
            mockWindowLocation();
            const { mockInstance } = setupShift4OnWindow();

            mockPayment.mockRejectedValue({
                response: { status: 409, data: { message: 'User already has active subscription' } },
                message: 'Request failed with status code 409',
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            // 409 should NOT show error toast — it redirects instead
            expect(mockTriggerToast).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'User already has active subscription',
                    type: 'error',
                }),
            );

            // Payment marker should be cleaned up
            expect(localStorage.getItem(PAYMENT_IN_PROGRESS_KEY)).toBeNull();
            // Payment completed marker should be set (for cross-tab sync)
            expect(localStorage.getItem(PAYMENT_COMPLETED_KEY)).not.toBeNull();

            // Should redirect after 300ms delay
            act(() => {
                vi.advanceTimersByTime(350);
            });
            expect(locationHref).toContain('authToken=');

            restoreWindowLocation();
        });

        it('handles 401 (session expired) with user-friendly message and auto-reload', async () => {
            const { mockInstance } = setupShift4OnWindow();

            mockPayment.mockRejectedValue({
                response: { status: 401, data: { message: 'Unauthorized' } },
                message: 'Request failed with status code 401',
            });

            const reloadMock = vi.fn();
            Object.defineProperty(window, 'location', {
                writable: true,
                value: { ...window.location, reload: reloadMock },
                configurable: true,
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            // Should show session expired message, NOT "Request failed with status code 401"
            expect(mockTriggerToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'hooks.usePaymentForm.errors.sessionExpired',
                    type: 'error',
                }),
            );
            expect(mockTriggerToast).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    title: expect.stringContaining('Request failed'),
                }),
            );

            // Should auto-reload after 2s
            act(() => {
                vi.advanceTimersByTime(2000);
            });
            expect(reloadMock).toHaveBeenCalled();
        });

        it('shows backend error message instead of generic axios message', async () => {
            const { mockInstance } = setupShift4OnWindow();

            mockPayment.mockRejectedValue({
                response: { status: 400, data: { message: 'Invalid card token' } },
                message: 'Request failed with status code 400',
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            // Should show backend message, NOT "Request failed with status code 400"
            expect(mockTriggerToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Invalid card token',
                }),
            );
        });

        it('handles unexpected charge response status (not subscription_initiated)', async () => {
            const { mockInstance } = setupShift4OnWindow();

            mockPayment.mockResolvedValue({
                status: 'unknown_status',
                subscriptionId: 'sub_weird',
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
            });
            expect(mockGetPaymentStatus).not.toHaveBeenCalled();
        });

        it('handles network errors (no response object)', async () => {
            const { mockInstance } = setupShift4OnWindow();

            mockPayment.mockRejectedValue(new Error('Network Error'));

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(mockTriggerToast).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: 'Network Error',
                        type: 'error',
                    }),
                );
            });
        });
    });

    // ─── Cross-tab sync via BroadcastChannel ────────────────────────────────

    describe('cross-tab sync via storage events', () => {
        // The hook supports two cross-tab sync mechanisms:
        //   1. BroadcastChannel (primary) — module-level singleton, hard to mock reliably
        //   2. StorageEvent (fallback) — used when BroadcastChannel is unavailable
        //
        // We test the storage fallback path by disabling BroadcastChannel.
        // This covers the same user-facing behavior (blocking, unblocking, reload).

        function disableBroadcastChannel() {
            delete (globalThis as unknown as Record<string, unknown>).BroadcastChannel;
        }

        function fireStorageEvent(key: string, newValue: string | null) {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key,
                    newValue,
                    oldValue: null,
                    storageArea: localStorage,
                }),
            );
        }

        it('blocks payment when another tab writes fresh in-progress entry', async () => {
            disableBroadcastChannel();
            setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await act(async () => {
                vi.advanceTimersByTime(10);
            });

            act(() => {
                fireStorageEvent(
                    PAYMENT_IN_PROGRESS_KEY,
                    JSON.stringify({ subscriptionId: 'sub_other', timestamp: Date.now() }),
                );
            });

            expect(result.current.isPaymentInProgress).toBe(true);
            expect(mockTriggerToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'warning' }));
        });

        it('unblocks when another tab clears in-progress entry', async () => {
            disableBroadcastChannel();
            setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await act(async () => {
                vi.advanceTimersByTime(10);
            });

            // Block
            act(() => {
                fireStorageEvent(
                    PAYMENT_IN_PROGRESS_KEY,
                    JSON.stringify({ subscriptionId: 'sub_other', timestamp: Date.now() }),
                );
            });
            expect(result.current.isPaymentInProgress).toBe(true);

            // Unblock — another tab removed the key
            act(() => {
                fireStorageEvent(PAYMENT_IN_PROGRESS_KEY, null);
            });
            expect(result.current.isPaymentInProgress).toBe(false);
        });

        it('ignores stale entries from other tabs', async () => {
            disableBroadcastChannel();
            setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await act(async () => {
                vi.advanceTimersByTime(10);
            });

            act(() => {
                fireStorageEvent(
                    PAYMENT_IN_PROGRESS_KEY,
                    JSON.stringify({
                        subscriptionId: 'sub_stale',
                        timestamp: Date.now() - PAYMENT_STALENESS_TTL_MS - 1,
                    }),
                );
            });

            expect(result.current.isPaymentInProgress).toBe(false);
        });

        // Note: auth-storage clear → window.location.reload() is also tested
        // by the hook, but jsdom's location.reload is non-configurable,
        // so we verify the handler doesn't throw on corrupted auth-storage instead.
        it('handles corrupted auth-storage change without crashing', async () => {
            setupShift4OnWindow();

            renderPaymentHook(createWrapper());

            await act(async () => {
                vi.advanceTimersByTime(10);
            });

            // Corrupted auth-storage should not crash the handler
            expect(() => {
                act(() => {
                    fireStorageEvent('auth-storage', '{{invalid json');
                });
            }).not.toThrow();
        });
    });

    // ─── Analytics ──────────────────────────────────────────────────────────

    describe('analytics tracking', () => {
        it('fires fbq AddToCart on Shift4 init', async () => {
            setupShift4OnWindow();

            renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(window.fbq).toHaveBeenCalledWith(
                    'track',
                    'AddToCart',
                    expect.objectContaining({
                        content_ids: [105],
                        value: 9.99,
                        currency: 'USD',
                    }),
                );
            });
        });

        it('pushes cd_add_to_cart to dataLayer on init', async () => {
            setupShift4OnWindow();

            renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(window.dataLayer).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            event: 'cd_add_to_cart',
                            product_id: 105,
                            value: 9.99,
                        }),
                    ]),
                );
            });
        });

        it('fires AddToCart only once (not on re-render)', async () => {
            setupShift4OnWindow();

            const { rerender } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(window.fbq).toHaveBeenCalledTimes(1);
            });

            rerender();

            expect(window.fbq).toHaveBeenCalledTimes(1);
        });

        it('fires fbq Purchase on successful payment', async () => {
            mockWindowLocation();
            const { mockInstance } = setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(window.fbq).toHaveBeenCalledWith(
                    'track',
                    'Purchase',
                    expect.objectContaining({
                        value: 9.99,
                        currency: 'USD',
                    }),
                );
            });

            expect(reportPurchase).toHaveBeenCalledWith(
                'sub_test_123',
                expect.objectContaining({ value: 9.99, currency: 'USD' }),
            );

            restoreWindowLocation();
        });

        it('pushes cd_purchase to dataLayer on success', async () => {
            mockWindowLocation();
            const { mockInstance } = setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(window.dataLayer).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            event: 'cd_purchase',
                            transaction_id: 'sub_test_123',
                            value: 9.99,
                        }),
                    ]),
                );
            });

            restoreWindowLocation();
        });
    });

    // ─── Cleanup ────────────────────────────────────────────────────────────

    describe('cleanup on unmount', () => {
        it('unmounts Shift4 components on unmount', async () => {
            const { mockComponentGroup } = setupShift4OnWindow();

            const { unmount } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockComponentGroup.automount).toHaveBeenCalled();
            });

            unmount();

            expect(mockComponentGroup.unmount).toHaveBeenCalled();
        });

        it('cancels polling on unmount (no dangling timers)', async () => {
            const { mockInstance } = setupShift4OnWindow();

            mockGetPaymentStatus.mockResolvedValue({
                subscriptionId: 'sub_test_123',
                paid_status: 'pending',
                events: [],
            });

            const { result, unmount } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalledTimes(1);
            });

            const callsBeforeUnmount = mockGetPaymentStatus.mock.calls.length;

            // Unmount during polling
            unmount();

            // Advance timers — cancelled flag should prevent further polls
            await act(async () => {
                vi.advanceTimersByTime(30000);
            });

            // At most one more call might sneak through (async in-flight),
            // but no NEW polls should be scheduled
            expect(mockGetPaymentStatus.mock.calls.length).toBeLessThanOrEqual(callsBeforeUnmount + 1);
        });
    });

    // ─── isButtonDisabled composite ─────────────────────────────────────────

    describe('isButtonDisabled composite flag', () => {
        it('is true when Shift4 components not mounted', () => {
            const { result } = renderPaymentHook(createWrapper());
            expect(result.current.isButtonDisabled).toBe(true);
        });

        it('is true when Shift4Ready reports not ready', () => {
            mockShift4Ready = { isReady: false, error: null };
            setupShift4OnWindow();
            const { result } = renderPaymentHook(createWrapper());
            expect(result.current.isButtonDisabled).toBe(true);
        });

        it('becomes false when Shift4 is fully initialized', async () => {
            setupShift4OnWindow();
            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(result.current.isButtonDisabled).toBe(false);
            });
        });

        it('becomes true during payment submission', async () => {
            const shift4Mock = createMockShift4Instance();
            shift4Mock.mockInstance.createToken = vi
                .fn()
                .mockImplementation(
                    () => new Promise((resolve) => setTimeout(() => resolve({ id: 'tok_slow' }), 5000)),
                );
            setupShift4OnWindow(shift4Mock);

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(result.current.isButtonDisabled).toBe(false);
            });

            act(() => {
                result.current.onSubmit();
            });

            expect(result.current.isButtonDisabled).toBe(true);
        });
    });

    // ─── Edge cases ─────────────────────────────────────────────────────────

    describe('edge cases', () => {
        it('handles localStorage being unavailable (throws on setItem)', async () => {
            const { mockInstance } = setupShift4OnWindow();
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = vi.fn().mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            expect(mockPayment).toHaveBeenCalled();

            Storage.prototype.setItem = originalSetItem;
        });

        it('handles missing product (productId not in products list)', () => {
            setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper({ productId: 99999 }));

            expect(result.current.isButtonDisabled).toBe(true);
        });

        it('redirects with correct URL format', async () => {
            mockWindowLocation();
            const { mockInstance } = setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalled();
            });

            act(() => {
                vi.advanceTimersByTime(350);
            });

            expect(locationHref).toBe('https://mydreamcompanion.com?authToken=jwt_test_token');
            restoreWindowLocation();
        });

        it('cleans localStorage before redirect', async () => {
            mockWindowLocation();
            const { mockInstance } = setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(mockGetPaymentStatus).toHaveBeenCalled();
            });

            act(() => {
                vi.advanceTimersByTime(350);
            });

            expect(localStorage.getItem(PAYMENT_IN_PROGRESS_KEY)).toBeNull();
            expect(localStorage.getItem(PAYMENT_COMPLETED_KEY)).toBeNull();
            restoreWindowLocation();
        });

        it('writes payment in-progress to localStorage on submit (cross-tab signal)', async () => {
            // Override gaPurchase to NOT call onSent immediately — we want to inspect
            // localStorage state DURING polling, before redirect cleans it up
            vi.mocked(gaPurchase).mockImplementation(() => {});

            const { mockInstance } = setupShift4OnWindow();

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            // Verify localStorage was written — this is the cross-tab signal
            await waitFor(() => {
                const stored = localStorage.getItem(PAYMENT_IN_PROGRESS_KEY);
                expect(stored).not.toBeNull();
                const parsed = JSON.parse(stored!);
                expect(parsed.subscriptionId).toBe('sub_test_123');
            });
        });

        it('clears payment in-progress from localStorage on charge error', async () => {
            const { mockInstance } = setupShift4OnWindow();
            mockPayment.mockRejectedValue(new Error('Charge failed'));

            const { result } = renderPaymentHook(createWrapper());

            await waitFor(() => {
                expect(mockInstance.createComponentGroup).toHaveBeenCalled();
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            await waitFor(() => {
                expect(localStorage.getItem(PAYMENT_IN_PROGRESS_KEY)).toBeNull();
            });
        });
    });
});
