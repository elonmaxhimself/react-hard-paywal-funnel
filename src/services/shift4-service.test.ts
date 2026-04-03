import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AxiosResponse } from 'axios';

import { shift4Service } from './shift4-service';

// Mock the axios instance used by the service
vi.mock('@/lib/axios', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

import axios from '@/lib/axios';

const mockAxios = vi.mocked(axios);

describe('shift4Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('payment', () => {
        it('calls POST /shift4/charge with correct payload', async () => {
            const mockResponse = {
                data: { status: 'subscription_initiated', subscriptionId: 'sub_123' },
            } as AxiosResponse;
            mockAxios.post.mockResolvedValue(mockResponse);

            const result = await shift4Service.payment({
                paymentToken: 'tok_test',
                productId: 105,
            });

            expect(mockAxios.post).toHaveBeenCalledWith('/shift4/charge', {
                paymentToken: 'tok_test',
                productId: 105,
            });
            expect(result.status).toBe('subscription_initiated');
            expect(result.subscriptionId).toBe('sub_123');
        });

        it('propagates API errors', async () => {
            mockAxios.post.mockRejectedValue({
                response: { status: 409, data: { message: 'Already subscribed' } },
            });

            await expect(shift4Service.payment({ paymentToken: 'tok_dup', productId: 105 })).rejects.toMatchObject({
                response: { status: 409 },
            });
        });
    });

    describe('getPaymentStatus', () => {
        it('calls GET /shift4/payment-status/:subscriptionId', async () => {
            const mockResponse = {
                data: {
                    subscriptionId: 'sub_123',
                    paid_status: 'paid',
                    events: [],
                },
            } as AxiosResponse;
            mockAxios.get.mockResolvedValue(mockResponse);

            const result = await shift4Service.getPaymentStatus('sub_123');

            expect(mockAxios.get).toHaveBeenCalledWith('/shift4/payment-status/sub_123');
            expect(result.paid_status).toBe('paid');
        });

        it('returns pending status', async () => {
            mockAxios.get.mockResolvedValue({
                data: { subscriptionId: 'sub_123', paid_status: 'pending', events: [] },
            } as AxiosResponse);

            const result = await shift4Service.getPaymentStatus('sub_123');
            expect(result.paid_status).toBe('pending');
        });

        it('returns failed status with message', async () => {
            mockAxios.get.mockResolvedValue({
                data: {
                    subscriptionId: 'sub_123',
                    paid_status: 'failed',
                    failureMessage: 'Card declined',
                    events: [],
                },
            } as AxiosResponse);

            const result = await shift4Service.getPaymentStatus('sub_123');
            expect(result.paid_status).toBe('failed');
            expect(result.failureMessage).toBe('Card declined');
        });
    });
});
