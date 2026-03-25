import { describe, expect, it, vi, beforeEach } from 'vitest';

import { reportPurchase, reportSignUp, reportEmailVerified } from './gtag';

describe('gtag reporting', () => {
    beforeEach(() => {
        window.gtag = vi.fn();
        // Reset dedup set between tests by re-importing would be complex,
        // so we use unique eventIds per test
    });

    describe('reportPurchase', () => {
        it('calls gtag with purchase conversion data', () => {
            reportPurchase('txn_123', { value: 19.99, currency: 'USD' });

            expect(window.gtag).toHaveBeenCalledWith(
                'event',
                'conversion',
                expect.objectContaining({
                    send_to: expect.stringContaining('/VknOCJqP-ZIbEPmC_8I9'),
                    transaction_id: 'txn_123',
                    value: 19.99,
                    currency: 'USD',
                }),
            );
        });

        it('works without optional params', () => {
            reportPurchase('txn_456');

            expect(window.gtag).toHaveBeenCalledWith(
                'event',
                'conversion',
                expect.objectContaining({
                    transaction_id: 'txn_456',
                }),
            );
        });

        it('deduplicates events with same eventId', () => {
            reportPurchase('txn_1', { eventId: 'dedup_purchase_1' });
            reportPurchase('txn_2', { eventId: 'dedup_purchase_1' });

            expect(window.gtag).toHaveBeenCalledTimes(1);
        });

        it('allows different eventIds', () => {
            reportPurchase('txn_a', { eventId: 'dedup_p_a' });
            reportPurchase('txn_b', { eventId: 'dedup_p_b' });

            expect(window.gtag).toHaveBeenCalledTimes(2);
        });
    });

    describe('reportSignUp', () => {
        it('calls gtag with signup conversion', () => {
            reportSignUp();

            expect(window.gtag).toHaveBeenCalledWith(
                'event',
                'conversion',
                expect.objectContaining({
                    send_to: expect.stringContaining('/ztJvCKrt-ZIbEPmC_8I9'),
                }),
            );
        });

        it('deduplicates with eventId', () => {
            reportSignUp(undefined, 'dedup_signup_1');
            reportSignUp(undefined, 'dedup_signup_1');

            expect(window.gtag).toHaveBeenCalledTimes(1);
        });
    });

    describe('reportEmailVerified', () => {
        it('calls gtag with email conversion', () => {
            reportEmailVerified();

            expect(window.gtag).toHaveBeenCalledWith(
                'event',
                'conversion',
                expect.objectContaining({
                    send_to: expect.stringContaining('/ZG5eCPiy-pIbEPmC_8I9'),
                }),
            );
        });
    });

    describe('gtag queue', () => {
        it('queues calls when gtag is not available, then flushes on next call', () => {
            window.gtag = undefined as unknown as typeof window.gtag;

            // These get queued
            reportSignUp(undefined, 'queue_test_1');

            // Now make gtag available
            window.gtag = vi.fn();

            // Next call should flush the queue
            reportEmailVerified(undefined, 'queue_test_2');

            // Original queued call + new call
            expect(window.gtag).toHaveBeenCalledTimes(2);
        });
    });

    describe('does not crash when window.gtag is undefined', () => {
        it('silently no-ops', () => {
            window.gtag = undefined as unknown as typeof window.gtag;
            expect(() => reportPurchase('txn_safe')).not.toThrow();
        });
    });
});
