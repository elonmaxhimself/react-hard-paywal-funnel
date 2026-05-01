import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleAuthSuccess } from './handleAuthSuccess';

// Mock gtag
vi.mock('@/lib/gtag', () => ({
    reportSignUp: vi.fn(),
    reportEmailVerified: vi.fn(),
}));

import { reportSignUp, reportEmailVerified } from '@/lib/gtag';

describe('handleAuthSuccess', () => {
    const mockSetUserId = vi.fn();
    const mockSetToken = vi.fn();
    const mockSetFormState = vi.fn();
    const mockSetStep = vi.fn();
    const mockNextStep = vi.fn();
    const mockPosthog = { identify: vi.fn(), capture: vi.fn() } as unknown as Parameters<
        typeof handleAuthSuccess
    >[0]['posthog'];

    const baseParams = {
        userId: 42,
        email: 'test@example.com',
        authToken: 'jwt-test-token',
        posthog: mockPosthog,
        setUserId: mockSetUserId,
        setToken: mockSetToken,
        setFormState: mockSetFormState,
        setStep: mockSetStep,
        nextStep: mockNextStep,
        funnelFormValues: { email: 'test@example.com', password: 'Pass1' } as unknown as Parameters<
            typeof handleAuthSuccess
        >[0]['funnelFormValues'],
        activeStep: 10,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        window.fbq = vi.fn();
        window.dataLayer = [];
    });

    it('sets userId and authToken in store', () => {
        handleAuthSuccess(baseParams);

        expect(mockSetUserId).toHaveBeenCalledWith(42);
        expect(mockSetToken).toHaveBeenCalledWith('jwt-test-token');
    });

    it('advances to next step', () => {
        handleAuthSuccess(baseParams);

        expect(mockSetStep).toHaveBeenCalledWith(11); // activeStep + 1
        expect(mockNextStep).toHaveBeenCalled();
    });

    it('fires Facebook Pixel Lead event', () => {
        handleAuthSuccess(baseParams);

        expect(window.fbq).toHaveBeenCalledWith('track', 'Lead', {
            user_id: 42,
            email: 'test@example.com',
        });
    });

    it('fires Google Ads conversions', () => {
        handleAuthSuccess(baseParams);

        expect(reportSignUp).toHaveBeenCalled();
        expect(reportEmailVerified).toHaveBeenCalled();
    });

    it('pushes GTM dataLayer event', () => {
        handleAuthSuccess(baseParams);

        expect(window.dataLayer).toContainEqual(
            expect.objectContaining({
                event: 'cd_signup',
                user_id: '42',
                email_domain: 'example.com',
            }),
        );
    });

    it('identifies user in PostHog', () => {
        handleAuthSuccess(baseParams);

        expect(mockPosthog.identify).toHaveBeenCalledWith('42', {
            email_domain: 'example.com',
        });
    });

    it('does not crash when posthog is undefined', () => {
        expect(() => {
            handleAuthSuccess({ ...baseParams, posthog: undefined });
        }).not.toThrow();
    });

    it('does not crash when fbq is undefined', () => {
        window.fbq = undefined;

        expect(() => {
            handleAuthSuccess(baseParams);
        }).not.toThrow();
    });

    it('saves form state for next step', () => {
        handleAuthSuccess(baseParams);

        expect(mockSetFormState).toHaveBeenCalledWith(baseParams.funnelFormValues);
    });
});
