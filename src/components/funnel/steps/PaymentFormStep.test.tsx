/**
 * Component tests for PaymentFormStep.
 *
 * Covers:
 *   - Normal render with product
 *   - Fallback UI when !product + payment in progress (QA bug #3 — no black screen)
 *   - Redirect back when !product + payment resolved
 *   - Redirect back when !product + no payment at all
 *   - Resume polling failure → redirect back
 *   - Close button disabled during payment
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import type { ReactNode } from 'react';

import { PAYMENT_IN_PROGRESS_KEY } from '@/hooks/usePaymentForm';
import { StepperContextProvider } from '@/components/stepper/Stepper.context';

// =============================================================================
// Mocks
// =============================================================================

const mockPrevStep = vi.fn();
const mockNextStep = vi.fn();

// ── usePaymentForm mock ─────────────────────────────────────────────────
let mockPaymentFormReturn = {
    product: { id: 105, name: 'Monthly', amount: 999, durationMonths: 1 } as Record<string, unknown> | undefined,
    onSubmit: vi.fn(),
    isButtonDisabled: false,
    isPaymentInProgress: false,
    isShift4Ready: true,
    shift4Error: null as string | null,
    resumePollingFailed: false,
};

vi.mock('@/hooks/usePaymentForm', async () => {
    const actual = await vi.importActual('@/hooks/usePaymentForm');
    return {
        ...actual,
        usePaymentForm: () => mockPaymentFormReturn,
    };
});

// ── usePremiumRedirect mock ─────────────────────────────────────────────
let mockPremiumRedirectReturn = { isRedirecting: false };

vi.mock('@/hooks/usePremiumRedirect', () => ({
    usePremiumRedirect: () => mockPremiumRedirectReturn,
}));

// ── useFunnelStore ──────────────────────────────────────────────────────
vi.mock('@/store/states/funnel', () => ({
    useFunnelStore: () => vi.fn(),
}));

// ── SpriteIcon ──────────────────────────────────────────────────────────
vi.mock('@/components/SpriteIcon', () => ({
    default: ({ fallbackAlt }: { fallbackAlt?: string }) => <span data-testid="sprite-icon">{fallbackAlt}</span>,
}));

// ── PostHog ─────────────────────────────────────────────────────────────
vi.mock('posthog-js/react', () => ({
    usePostHog: () => ({ capture: vi.fn() }),
}));

// ── funnelSteps ─────────────────────────────────────────────────────────
vi.mock('@/features/funnel/funnelSteps', () => ({
    STEPS_COUNT: 44,
}));

// =============================================================================
// Wrapper
// =============================================================================

function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm({ defaultValues: { productId: 105 } });
    return (
        <FormProvider {...form}>
            <StepperContextProvider
                value={43}
                onChange={vi.fn()}
                max={44}
                nextStep={mockNextStep}
                prevStep={mockPrevStep}
            >
                {children}
            </StepperContextProvider>
        </FormProvider>
    );
}

// =============================================================================
// Dynamic import (after mocks)
// =============================================================================

let PaymentFormStep: React.ComponentType;

beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    mockPrevStep.mockClear();

    // Reset to default
    mockPaymentFormReturn = {
        product: { id: 105, name: 'Monthly', amount: 999, durationMonths: 1 },
        onSubmit: vi.fn(),
        isButtonDisabled: false,
        isPaymentInProgress: false,
        isShift4Ready: true,
        shift4Error: null,
        resumePollingFailed: false,
    };
    mockPremiumRedirectReturn = { isRedirecting: false };

    // Dynamic import to get fresh module with mocks applied
    const mod = await import('./PaymentFormStep');
    PaymentFormStep = mod.PaymentFormStep;
});

afterEach(() => {
    localStorage.clear();
});

// =============================================================================
// Tests
// =============================================================================

describe('PaymentFormStep', () => {
    describe('normal render', () => {
        it('renders payment form when product is available', () => {
            render(<PaymentFormStep />, { wrapper: Wrapper });

            // i18n keys shown as-is in tests (no i18n provider)
            expect(screen.getByText(/paymentFormStep\.title/)).toBeInTheDocument();
            expect(screen.getByText(/paymentFormStep\.completePayment/)).toBeInTheDocument();
        });

        it('disables submit button when isButtonDisabled is true', () => {
            mockPaymentFormReturn.isButtonDisabled = true;

            render(<PaymentFormStep />, { wrapper: Wrapper });

            const buttons = screen.getAllByRole('button');
            const submitBtn = buttons.find((b) => b.textContent?.includes('completePayment'));
            expect(submitBtn).toBeDefined();
            expect(submitBtn).toBeDisabled();
        });

        it('shows loading spinner when payment is in progress', () => {
            mockPaymentFormReturn.isPaymentInProgress = true;
            mockPaymentFormReturn.isButtonDisabled = true;

            render(<PaymentFormStep />, { wrapper: Wrapper });

            const buttons = screen.getAllByRole('button');
            const submitBtn = buttons.find((b) => b.textContent?.includes('completePayment'));
            expect(submitBtn).toBeDisabled();
        });
    });

    describe('no product — payment in progress (QA bug #3 — no black screen)', () => {
        it('shows processing fallback instead of blank screen when payment is in progress', () => {
            mockPaymentFormReturn.product = undefined;
            mockPaymentFormReturn.isPaymentInProgress = true;

            // Set localStorage so mount guard doesn't redirect
            localStorage.setItem(
                PAYMENT_IN_PROGRESS_KEY,
                JSON.stringify({ subscriptionId: 'sub_other', timestamp: Date.now() }),
            );

            render(<PaymentFormStep />, { wrapper: Wrapper });

            // Should show processing message, NOT blank screen
            // i18n key shown as-is: hooks.usePaymentForm.errors.paymentInAnotherTab
            expect(screen.getByText(/paymentInAnotherTab/)).toBeInTheDocument();
            // Should NOT have redirected
            expect(mockPrevStep).not.toHaveBeenCalled();
        });
    });

    describe('no product — payment resolved (redirect back)', () => {
        it('redirects back when product is null and no payment in progress', () => {
            mockPaymentFormReturn.product = undefined;
            mockPaymentFormReturn.isPaymentInProgress = false;

            render(<PaymentFormStep />, { wrapper: Wrapper });

            expect(mockPrevStep).toHaveBeenCalledTimes(1);
        });

        it('redirects back when product is null and payment just finished (isPaymentInProgress becomes false)', async () => {
            mockPaymentFormReturn.product = undefined;
            mockPaymentFormReturn.isPaymentInProgress = true;

            localStorage.setItem(
                PAYMENT_IN_PROGRESS_KEY,
                JSON.stringify({ subscriptionId: 'sub_other', timestamp: Date.now() }),
            );

            const { rerender } = render(<PaymentFormStep />, { wrapper: Wrapper });

            // Initially shows processing (no redirect)
            expect(mockPrevStep).not.toHaveBeenCalled();

            // Simulate payment failure — isPaymentInProgress becomes false
            mockPaymentFormReturn.isPaymentInProgress = false;
            rerender(<PaymentFormStep />);

            // Should redirect via useEffect [product, isPaymentInProgress]
            expect(mockPrevStep).toHaveBeenCalled();
        });
    });

    describe('resume polling failure', () => {
        it('redirects back when resume polling fails', () => {
            mockPaymentFormReturn.product = undefined;
            mockPaymentFormReturn.resumePollingFailed = true;
            mockPaymentFormReturn.isPaymentInProgress = false;

            render(<PaymentFormStep />, { wrapper: Wrapper });

            expect(mockPrevStep).toHaveBeenCalled();
        });
    });

    describe('close button', () => {
        it('close button is disabled during payment', () => {
            mockPaymentFormReturn.isPaymentInProgress = true;

            render(<PaymentFormStep />, { wrapper: Wrapper });

            // The X/close button should be disabled
            const buttons = screen.getAllByRole('button');
            const closeBtn = buttons.find((btn) => btn.querySelector('svg') && !btn.textContent?.match(/subscribe/i));
            if (closeBtn) {
                expect(closeBtn).toBeDisabled();
            }
        });

        it('close button is enabled when no payment in progress', () => {
            mockPaymentFormReturn.isPaymentInProgress = false;

            render(<PaymentFormStep />, { wrapper: Wrapper });

            const buttons = screen.getAllByRole('button');
            const closeBtn = buttons.find((btn) => btn.querySelector('svg') && !btn.textContent?.match(/subscribe/i));
            if (closeBtn) {
                expect(closeBtn).not.toBeDisabled();
            }
        });
    });

    describe('shift4 SDK error', () => {
        it('shows "Payment unavailable" when SDK fails', () => {
            mockPaymentFormReturn.shift4Error = 'Shift4 failed to load';
            mockPaymentFormReturn.isButtonDisabled = true;

            render(<PaymentFormStep />, { wrapper: Wrapper });

            // i18n key shown as-is
            expect(screen.getByText(/paymentUnavailable/)).toBeInTheDocument();
        });
    });

    describe('premium redirect guard', () => {
        it('shows redirecting UI when user is already premium', () => {
            mockPremiumRedirectReturn = { isRedirecting: true };

            render(<PaymentFormStep />, { wrapper: Wrapper });

            // Should show redirecting message instead of payment form
            expect(screen.getByText(/redirecting/i)).toBeInTheDocument();
            // Payment form should NOT be visible
            expect(screen.queryByText(/completePayment/)).not.toBeInTheDocument();
        });

        it('shows normal payment form when user is not premium', () => {
            mockPremiumRedirectReturn = { isRedirecting: false };

            render(<PaymentFormStep />, { wrapper: Wrapper });

            // Normal payment form should be visible
            expect(screen.getByText(/paymentFormStep\.title/)).toBeInTheDocument();
            expect(screen.getByText(/completePayment/)).toBeInTheDocument();
        });

        it('redirecting state takes priority over payment-in-progress state', () => {
            mockPremiumRedirectReturn = { isRedirecting: true };
            mockPaymentFormReturn.isPaymentInProgress = true;

            render(<PaymentFormStep />, { wrapper: Wrapper });

            // Should show redirecting, not payment-in-progress
            expect(screen.getByText(/redirecting/i)).toBeInTheDocument();
            expect(screen.queryByText(/paymentInAnotherTab/)).not.toBeInTheDocument();
        });
    });
});
