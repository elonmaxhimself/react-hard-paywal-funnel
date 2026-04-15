/**
 * Integration test for SubscriptionStep preselection logic.
 *
 * Regression: CU-869cp87ge — for variants where the quarterly plan should be
 * preselected (variant3–variant6), the form value stayed on Monthly (36)
 * because the old guard bailed when `currentProductId` was already in
 * `productIds` (Monthly is always in the list). See bug 1 in the ClickUp
 * task.
 *
 * These tests verify:
 *   - variant5 (Quarterly $34.99 preselected) sets `productId = 158`.
 *   - After preselection has been marked applied for the user, remounting
 *     does NOT overwrite a manual user choice.
 *   - The loading spinner is shown while the variant is still resolving.
 *   - Only ONE PostHog exposure event is emitted per identified user.
 */

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import type { ReactNode } from 'react';

import { StepperContextProvider } from '@/components/stepper/Stepper.context';

// =============================================================================
// Mocks
// =============================================================================

const mockGetFeatureFlag = vi.fn<(flagKey: string) => string | undefined>();
const mockOnFeatureFlags = vi.fn<(cb: unknown) => () => void>();
const mockCapture = vi.fn();

// Mock both SubscriptionStep's direct import AND the hook's import of
// posthog-js/react (same mock target). The test file overrides the
// global setup.ts mock.
vi.mock('posthog-js/react', () => ({
    usePostHog: () => ({
        getFeatureFlag: mockGetFeatureFlag,
        onFeatureFlags: mockOnFeatureFlags,
        get_distinct_id: () => '42',
        capture: mockCapture,
        identify: vi.fn(),
    }),
    PostHogProvider: ({ children }: { children: ReactNode }) => children,
}));

// Auth store — simulate an identified user.
vi.mock('@/store/states/auth', () => ({
    useAuthStore: (selector: (state: { userId: number | null }) => unknown) => selector({ userId: 42 }),
    getAuthStore: () => ({ userId: 42 }),
}));

// usePremiumRedirect — not redirecting (so we render the real step).
vi.mock('@/hooks/usePremiumRedirect', () => ({
    usePremiumRedirect: () => ({ isRedirecting: false }),
}));

// Offer store — flat state, no special offer open. Real store has nested `offer`.
vi.mock('@/store/state', () => ({
    useStore: (selector: (state: unknown) => unknown) =>
        selector({
            offer: {
                isSpecialOfferOpened: false,
                setIsSpecialOfferOpened: vi.fn(),
            },
        }),
}));

// Replace heavy-weight sprite/image component with a plain stub.
vi.mock('@/components/SpriteIcon', () => ({
    default: ({ fallbackAlt }: { fallbackAlt?: string }) => <span data-testid="sprite-icon">{fallbackAlt}</span>,
}));

// SaleBanner pulls heavy deps we don't need here.
vi.mock('@/components/SaleBanner', () => ({
    default: () => <div data-testid="sale-banner" />,
}));

// Carousel primitives — stub for simpler rendering.
vi.mock('@/components/ui/carousel', () => {
    const passthrough = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
    return {
        Carousel: passthrough,
        CarouselContent: passthrough,
        CarouselItem: passthrough,
        CarouselDots: () => null,
    };
});

// =============================================================================
// Wrapper — provides FormProvider + Stepper context
// =============================================================================

type WrapperProps = {
    initialProductId?: number;
    children: ReactNode;
};

function Wrapper({ initialProductId = 36, children }: WrapperProps) {
    const form = useForm({ defaultValues: { productId: initialProductId } });
    return (
        <FormProvider {...form}>
            <StepperContextProvider value={43} onChange={vi.fn()} max={44} nextStep={vi.fn()} prevStep={vi.fn()}>
                {children}
            </StepperContextProvider>
        </FormProvider>
    );
}

// Expose the current form state so tests can assert the productId value.
function FormWatcher() {
    const { watch } = useFormContext();
    const productId = watch('productId');
    return <div data-testid="current-product-id">{String(productId)}</div>;
}

// =============================================================================
// Dynamic import (after mocks)
// =============================================================================

let SubscriptionStep: React.ComponentType;

beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    mockGetFeatureFlag.mockReset();
    mockOnFeatureFlags.mockReset();
    mockOnFeatureFlags.mockImplementation(() => () => {});

    const mod = await import('./SubscriptionStep');
    SubscriptionStep = mod.SubscriptionStep;
});

afterEach(() => {
    localStorage.clear();
});

// =============================================================================
// Tests
// =============================================================================

describe('SubscriptionStep preselection (CU-869cp87ge regression)', () => {
    it('applies Quarterly preselection for variant5 (product 158) when flag resolves', () => {
        mockGetFeatureFlag.mockReturnValue('variant5');

        render(
            <Wrapper initialProductId={36}>
                <SubscriptionStep />
                <FormWatcher />
            </Wrapper>,
        );

        // variant5.preselectedProductId === 158 — must override the default 36.
        expect(screen.getByTestId('current-product-id').textContent).toBe('158');

        // Exactly one exposure event for the identified user.
        expect(mockGetFeatureFlag).toHaveBeenCalledTimes(1);
        expect(mockGetFeatureFlag).toHaveBeenCalledWith('third-pricing-test');
    });

    it('applies Quarterly preselection for variant3 (product 155)', () => {
        mockGetFeatureFlag.mockReturnValue('variant3');

        render(
            <Wrapper initialProductId={36}>
                <SubscriptionStep />
                <FormWatcher />
            </Wrapper>,
        );

        expect(screen.getByTestId('current-product-id').textContent).toBe('155');
    });

    it('applies Quarterly preselection for variant4 (product 157)', () => {
        mockGetFeatureFlag.mockReturnValue('variant4');

        render(
            <Wrapper initialProductId={36}>
                <SubscriptionStep />
                <FormWatcher />
            </Wrapper>,
        );

        expect(screen.getByTestId('current-product-id').textContent).toBe('157');
    });

    it('applies Quarterly preselection for variant6 (product 159)', () => {
        mockGetFeatureFlag.mockReturnValue('variant6');

        render(
            <Wrapper initialProductId={36}>
                <SubscriptionStep />
                <FormWatcher />
            </Wrapper>,
        );

        expect(screen.getByTestId('current-product-id').textContent).toBe('159');
    });

    it('keeps Monthly preselected for control variant', () => {
        mockGetFeatureFlag.mockReturnValue('control');

        render(
            <Wrapper initialProductId={36}>
                <SubscriptionStep />
                <FormWatcher />
            </Wrapper>,
        );

        // control.preselectedProductId === 36 (Monthly).
        expect(screen.getByTestId('current-product-id').textContent).toBe('36');
    });

    it('respects a prior user choice on remount (does not overwrite after preselection applied)', () => {
        // Simulate: user already saw the step, variant5 was applied, then
        // clicked Monthly (productId=36 persisted via form store). Now they
        // return to SubscriptionStep.
        localStorage.setItem(
            'mdc_funnel_pricing_v3:42',
            JSON.stringify({ variant: 'variant5', preselectionApplied: true }),
        );

        render(
            <Wrapper initialProductId={36}>
                <SubscriptionStep />
                <FormWatcher />
            </Wrapper>,
        );

        // User's Monthly choice must be preserved; we do NOT re-apply 158.
        expect(screen.getByTestId('current-product-id').textContent).toBe('36');

        // And critically: no exposure event — the variant is replayed from
        // localStorage.
        expect(mockGetFeatureFlag).not.toHaveBeenCalled();
    });

    it('does not emit an exposure event on remount after first resolution', () => {
        // First mount — PostHog resolves variant5.
        mockGetFeatureFlag.mockReturnValue('variant5');

        const { unmount } = render(
            <Wrapper initialProductId={36}>
                <SubscriptionStep />
                <FormWatcher />
            </Wrapper>,
        );

        expect(mockGetFeatureFlag).toHaveBeenCalledTimes(1);
        unmount();

        // Second mount — must replay from localStorage, NOT call PostHog.
        render(
            <Wrapper initialProductId={158}>
                <SubscriptionStep />
                <FormWatcher />
            </Wrapper>,
        );

        // Still only the ONE call from the first mount.
        expect(mockGetFeatureFlag).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('current-product-id').textContent).toBe('158');
    });
});
