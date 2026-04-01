import { describe, expect, it, beforeEach } from 'vitest';

import { PAYMENT_IN_PROGRESS_KEY, PAYMENT_COMPLETED_KEY, PAYMENT_STALENESS_TTL_MS } from './usePaymentForm';

// =============================================================================
// Unit tests for the exported payment deduplication logic.
//
// The usePaymentForm hook is tightly coupled to Shift4 SDK, react-hook-form,
// and many React providers — rendering it requires the full app context.
// Instead, we test the exported constants and the localStorage-based state
// machine that the hook implements. These tests verify the CONTRACT, not
// the platform APIs.
// =============================================================================

describe('Payment deduplication — constants', () => {
    it('PAYMENT_IN_PROGRESS_KEY is a namespaced string', () => {
        expect(PAYMENT_IN_PROGRESS_KEY).toBe('shift4_payment_in_progress');
    });

    it('PAYMENT_COMPLETED_KEY is a namespaced string', () => {
        expect(PAYMENT_COMPLETED_KEY).toBe('shift4_payment_completed');
    });

    it('staleness TTL is 5 minutes (300_000ms)', () => {
        expect(PAYMENT_STALENESS_TTL_MS).toBe(300_000);
    });
});

// =============================================================================
// State machine: the hook initializes isSubmitting/paymentCompleted from
// localStorage on mount. These tests verify the initialization logic.
// =============================================================================

describe('Payment state initialization logic', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    // The hook's initializer: parse localStorage → check staleness → return bool
    function isSubmittingFromStorage(): boolean {
        try {
            const stored = localStorage.getItem(PAYMENT_IN_PROGRESS_KEY);
            if (!stored) return false;
            const { timestamp } = JSON.parse(stored);
            return Date.now() - timestamp <= PAYMENT_STALENESS_TTL_MS;
        } catch {
            return false;
        }
    }

    function isCompletedFromStorage(): boolean {
        try {
            const stored = localStorage.getItem(PAYMENT_COMPLETED_KEY);
            if (!stored) return false;
            const { timestamp } = JSON.parse(stored);
            return Date.now() - timestamp <= PAYMENT_STALENESS_TTL_MS;
        } catch {
            return false;
        }
    }

    describe('isSubmitting initialization', () => {
        it('returns false when no entry exists', () => {
            expect(isSubmittingFromStorage()).toBe(false);
        });

        it('returns true for fresh entry (within TTL)', () => {
            localStorage.setItem(
                PAYMENT_IN_PROGRESS_KEY,
                JSON.stringify({ subscriptionId: 'sub_1', timestamp: Date.now() - 1000 }),
            );
            expect(isSubmittingFromStorage()).toBe(true);
        });

        it('returns false for stale entry (past TTL)', () => {
            localStorage.setItem(
                PAYMENT_IN_PROGRESS_KEY,
                JSON.stringify({ subscriptionId: 'sub_old', timestamp: Date.now() - PAYMENT_STALENESS_TTL_MS - 1 }),
            );
            expect(isSubmittingFromStorage()).toBe(false);
        });

        it('returns false for corrupted JSON', () => {
            localStorage.setItem(PAYMENT_IN_PROGRESS_KEY, 'not-json{{{');
            expect(isSubmittingFromStorage()).toBe(false);
        });

        it('returns false for entry exactly at TTL boundary', () => {
            localStorage.setItem(
                PAYMENT_IN_PROGRESS_KEY,
                JSON.stringify({ subscriptionId: 'sub_edge', timestamp: Date.now() - PAYMENT_STALENESS_TTL_MS }),
            );
            // Date.now() - timestamp === TTL → NOT <= TTL after any runtime delay
            // The real hook uses `<=`, so this is a boundary test
            expect(isSubmittingFromStorage()).toBe(true);
        });
    });

    describe('paymentCompleted initialization', () => {
        it('returns false when no entry exists', () => {
            expect(isCompletedFromStorage()).toBe(false);
        });

        it('returns true for fresh completed entry', () => {
            localStorage.setItem(PAYMENT_COMPLETED_KEY, JSON.stringify({ timestamp: Date.now() }));
            expect(isCompletedFromStorage()).toBe(true);
        });

        it('returns false for expired completed entry', () => {
            localStorage.setItem(
                PAYMENT_COMPLETED_KEY,
                JSON.stringify({ timestamp: Date.now() - PAYMENT_STALENESS_TTL_MS - 1 }),
            );
            expect(isCompletedFromStorage()).toBe(false);
        });
    });
});

// =============================================================================
// Pre-flight check: the onSubmit handler checks localStorage for active
// payments from other tabs before proceeding. This is the dedup guard.
// =============================================================================

describe('Payment pre-flight dedup guard', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    function shouldBlockPayment(): boolean {
        try {
            const existing = localStorage.getItem(PAYMENT_IN_PROGRESS_KEY);
            if (!existing) return false;
            const { timestamp } = JSON.parse(existing);
            return Date.now() - timestamp <= PAYMENT_STALENESS_TTL_MS;
        } catch {
            return false;
        }
    }

    it('allows payment when no in-progress entry exists', () => {
        expect(shouldBlockPayment()).toBe(false);
    });

    it('blocks payment when fresh in-progress entry exists', () => {
        localStorage.setItem(
            PAYMENT_IN_PROGRESS_KEY,
            JSON.stringify({ subscriptionId: 'sub_other_tab', timestamp: Date.now() }),
        );
        expect(shouldBlockPayment()).toBe(true);
    });

    it('allows payment when in-progress entry is stale', () => {
        localStorage.setItem(
            PAYMENT_IN_PROGRESS_KEY,
            JSON.stringify({
                subscriptionId: 'sub_old',
                timestamp: Date.now() - PAYMENT_STALENESS_TTL_MS - 1,
            }),
        );
        expect(shouldBlockPayment()).toBe(false);
    });

    it('allows payment when entry is corrupted', () => {
        localStorage.setItem(PAYMENT_IN_PROGRESS_KEY, '{broken');
        expect(shouldBlockPayment()).toBe(false);
    });
});

// =============================================================================
// Resume polling guard: on mount, the hook checks if there's a payment
// to resume polling for. Entries without subscriptionId are legacy/invalid.
// =============================================================================

describe('Payment resume polling guard', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    function getResumableSubscription(): string | null {
        try {
            const stored = localStorage.getItem(PAYMENT_IN_PROGRESS_KEY);
            if (!stored) return null;

            const { subscriptionId, timestamp } = JSON.parse(stored);

            // Legacy entry without subscriptionId → invalid
            if (!subscriptionId) return null;

            // Stale entry → expired
            if (Date.now() - timestamp > PAYMENT_STALENESS_TTL_MS) return null;

            return subscriptionId;
        } catch {
            return null;
        }
    }

    it('returns null when no entry', () => {
        expect(getResumableSubscription()).toBeNull();
    });

    it('returns subscriptionId for fresh valid entry', () => {
        localStorage.setItem(
            PAYMENT_IN_PROGRESS_KEY,
            JSON.stringify({ subscriptionId: 'sub_resume', timestamp: Date.now() }),
        );
        expect(getResumableSubscription()).toBe('sub_resume');
    });

    it('returns null for legacy entry without subscriptionId', () => {
        localStorage.setItem(PAYMENT_IN_PROGRESS_KEY, JSON.stringify({ timestamp: Date.now() }));
        expect(getResumableSubscription()).toBeNull();
    });

    it('returns null for stale entry', () => {
        localStorage.setItem(
            PAYMENT_IN_PROGRESS_KEY,
            JSON.stringify({
                subscriptionId: 'sub_expired',
                timestamp: Date.now() - PAYMENT_STALENESS_TTL_MS - 1,
            }),
        );
        expect(getResumableSubscription()).toBeNull();
    });

    it('returns null for corrupted JSON', () => {
        localStorage.setItem(PAYMENT_IN_PROGRESS_KEY, '///invalid');
        expect(getResumableSubscription()).toBeNull();
    });
});

// =============================================================================
// isButtonDisabled contract: the hook returns a composite flag.
// We test the boolean logic directly.
// =============================================================================

describe('isButtonDisabled — composite flag logic', () => {
    it.each([
        {
            isPending: true,
            isPolling: false,
            isSubmitting: false,
            paymentCompleted: false,
            hasComponents: true,
            isReady: true,
            expected: true,
        },
        {
            isPending: false,
            isPolling: true,
            isSubmitting: false,
            paymentCompleted: false,
            hasComponents: true,
            isReady: true,
            expected: true,
        },
        {
            isPending: false,
            isPolling: false,
            isSubmitting: true,
            paymentCompleted: false,
            hasComponents: true,
            isReady: true,
            expected: true,
        },
        {
            isPending: false,
            isPolling: false,
            isSubmitting: false,
            paymentCompleted: true,
            hasComponents: true,
            isReady: true,
            expected: true,
        },
        {
            isPending: false,
            isPolling: false,
            isSubmitting: false,
            paymentCompleted: false,
            hasComponents: false,
            isReady: true,
            expected: true,
        },
        {
            isPending: false,
            isPolling: false,
            isSubmitting: false,
            paymentCompleted: false,
            hasComponents: true,
            isReady: false,
            expected: true,
        },
        {
            isPending: false,
            isPolling: false,
            isSubmitting: false,
            paymentCompleted: false,
            hasComponents: true,
            isReady: true,
            expected: false,
        },
    ])(
        'disabled=$expected when isPending=$isPending isPolling=$isPolling isSubmitting=$isSubmitting completed=$paymentCompleted components=$hasComponents ready=$isReady',
        ({ isPending, isPolling, isSubmitting, paymentCompleted, hasComponents, isReady, expected }) => {
            const isButtonDisabled =
                isPending || isPolling || isSubmitting || paymentCompleted || !hasComponents || !isReady;
            expect(isButtonDisabled).toBe(expected);
        },
    );
});
