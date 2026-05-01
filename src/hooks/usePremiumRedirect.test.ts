/**
 * Unit tests for usePremiumRedirect hook.
 *
 * Covers:
 *   - Calls GET /auth/me on mount when authToken exists
 *   - Redirects via redirectToMainApp when isPremium === true
 *   - Does NOT redirect when isPremium === false
 *   - Does NOT redirect when getMe() fails (network error, 401, etc.)
 *   - Does NOT call getMe() when no authToken
 *   - Only calls getMe() once (idempotent — no double calls on re-render)
 *   - Cleanup: cancels pending promise on unmount
 *   - Returns { isRedirecting: true } when redirect is triggered
 *   - Returns { isRedirecting: false } by default
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { usePremiumRedirect } from './usePremiumRedirect';
import { useAuthStore } from '@/store/states/auth';

// =============================================================================
// Mocks
// =============================================================================

const mockGetMe = vi.fn();
const mockRedirectToMainApp = vi.fn().mockResolvedValue(undefined);

vi.mock('@/services/auth-service', () => ({
    authService: {
        getMe: (...args: unknown[]) => mockGetMe(...args),
    },
}));

vi.mock('@/utils/auth/redirectToMainApp', () => ({
    redirectToMainApp: (...args: unknown[]) => mockRedirectToMainApp(...args),
}));

vi.mock('@/config/env', () => ({
    env: {
        apiBaseUrl: 'http://localhost:4000',
        shift4: {
            publishableKey: 'pk_test_123',
            paymentRedirect: 'https://mydreamcompanion.com',
        },
        posthog: { token: '', host: '', enableDevAnalytics: false },
        sessionTransferApiUrl: 'https://api.mydreamcompanion.com',
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ authToken: null, userId: null });
});

// =============================================================================
// Tests
// =============================================================================

describe('usePremiumRedirect', () => {
    describe('when user has authToken', () => {
        beforeEach(() => {
            useAuthStore.setState({ authToken: 'valid-jwt-token', userId: 42 });
        });

        it('calls getMe() on mount', async () => {
            mockGetMe.mockResolvedValue({ id: 42, isPremium: false });

            renderHook(() => usePremiumRedirect());

            await waitFor(() => {
                expect(mockGetMe).toHaveBeenCalledTimes(1);
            });
        });

        it('redirects via redirectToMainApp when isPremium is true', async () => {
            mockGetMe.mockResolvedValue({ id: 42, isPremium: true });

            const { result } = renderHook(() => usePremiumRedirect());

            await waitFor(() => {
                expect(result.current.isRedirecting).toBe(true);
            });

            await waitFor(() => {
                expect(mockRedirectToMainApp).toHaveBeenCalledWith('https://mydreamcompanion.com', 'valid-jwt-token');
            });
        });

        it('does NOT redirect when isPremium is false', async () => {
            mockGetMe.mockResolvedValue({ id: 42, isPremium: false });

            const { result } = renderHook(() => usePremiumRedirect());

            await waitFor(() => {
                expect(mockGetMe).toHaveBeenCalledTimes(1);
            });

            // Wait a tick for async to settle
            await new Promise((r) => setTimeout(r, 200));

            expect(mockRedirectToMainApp).not.toHaveBeenCalled();
            expect(result.current.isRedirecting).toBe(false);
        });

        it('does NOT redirect when getMe() fails with network error', async () => {
            mockGetMe.mockRejectedValue(new Error('Network Error'));

            const { result } = renderHook(() => usePremiumRedirect());

            await waitFor(() => {
                expect(mockGetMe).toHaveBeenCalledTimes(1);
            });

            // Wait a tick for async to settle
            await new Promise((r) => setTimeout(r, 200));

            expect(mockRedirectToMainApp).not.toHaveBeenCalled();
            expect(result.current.isRedirecting).toBe(false);
        });

        it('does NOT redirect when getMe() fails with 401', async () => {
            mockGetMe.mockRejectedValue({
                response: { status: 401, data: { message: 'Unauthorized' } },
            });

            const { result } = renderHook(() => usePremiumRedirect());

            await waitFor(() => {
                expect(mockGetMe).toHaveBeenCalledTimes(1);
            });

            // Wait a tick for async to settle
            await new Promise((r) => setTimeout(r, 200));

            expect(mockRedirectToMainApp).not.toHaveBeenCalled();
            expect(result.current.isRedirecting).toBe(false);
        });

        it('only calls getMe() once even on re-render', async () => {
            mockGetMe.mockResolvedValue({ id: 42, isPremium: false });

            const { rerender } = renderHook(() => usePremiumRedirect());

            await waitFor(() => {
                expect(mockGetMe).toHaveBeenCalledTimes(1);
            });

            rerender();
            rerender();
            rerender();

            expect(mockGetMe).toHaveBeenCalledTimes(1);
        });

        it('does NOT redirect if unmounted before getMe resolves', async () => {
            let resolveGetMe: (value: { id: number; isPremium: boolean }) => void;
            mockGetMe.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveGetMe = resolve;
                    }),
            );

            const { unmount } = renderHook(() => usePremiumRedirect());

            expect(mockGetMe).toHaveBeenCalledTimes(1);

            unmount();

            await act(async () => {
                resolveGetMe!({ id: 42, isPremium: true });
            });

            await new Promise((r) => setTimeout(r, 200));

            expect(mockRedirectToMainApp).not.toHaveBeenCalled();
        });
    });

    describe('when user has no authToken', () => {
        it('does NOT call getMe()', () => {
            useAuthStore.setState({ authToken: null, userId: null });

            renderHook(() => usePremiumRedirect());

            expect(mockGetMe).not.toHaveBeenCalled();
        });

        it('returns isRedirecting: false', () => {
            useAuthStore.setState({ authToken: null, userId: null });

            const { result } = renderHook(() => usePremiumRedirect());

            expect(result.current.isRedirecting).toBe(false);
        });
    });

    describe('redirect behavior', () => {
        it('passes correct redirectUrl and authToken to redirectToMainApp', async () => {
            useAuthStore.setState({ authToken: 'my-special-token', userId: 42 });
            mockGetMe.mockResolvedValue({ id: 42, isPremium: true });

            renderHook(() => usePremiumRedirect());

            await waitFor(() => {
                expect(mockRedirectToMainApp).toHaveBeenCalledWith('https://mydreamcompanion.com', 'my-special-token');
            });
        });
    });
});
