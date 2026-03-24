import { describe, expect, it, vi, beforeEach } from 'vitest';

import { processOAuthCallback } from './processOAuthCallback';
import { createJWT, createFunnelFormValues } from '../../../test/factories';

vi.mock('@/services/auth-service', () => ({
    authService: {
        verifyOAuthToken: vi.fn(),
    },
}));

vi.mock('@/utils/auth/handleAuthSuccess', () => ({
    handleAuthSuccess: vi.fn(),
}));

vi.mock('@/components/AlertToast', () => ({
    triggerToast: vi.fn(),
    toastType: { error: 'error', warning: 'warning', success: 'success' },
}));

import { authService } from '@/services/auth-service';
import { handleAuthSuccess } from '@/utils/auth/handleAuthSuccess';
import { triggerToast } from '@/components/AlertToast';

describe('processOAuthCallback', () => {
    const mockForm = {
        reset: vi.fn(),
        getValues: vi.fn(() => createFunnelFormValues()),
    };

    const mockStepper = {
        value: 10,
        onChange: vi.fn(),
        max: 31,
        nextStep: vi.fn(),
        prevStep: vi.fn(),
    };

    const baseParams = {
        code: 'oauth_code_123',
        state: 'google' as const,
        restoreOAuthState: vi.fn(),
        clearOAuthState: vi.fn(),
        form: mockForm as never,
        stepper: mockStepper,
        posthog: { identify: vi.fn(), capture: vi.fn() } as never,
        setUserId: vi.fn(),
        setToken: vi.fn(),
        setFormState: vi.fn(),
        setStep: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('verifies OAuth token and calls handleAuthSuccess on success', async () => {
        const formValues = createFunnelFormValues();
        baseParams.restoreOAuthState.mockReturnValue({ formValues, step: 10 });

        const jwt = createJWT({ userId: 42, email: 'user@test.com' });
        vi.mocked(authService.verifyOAuthToken).mockResolvedValue({ authToken: jwt });

        await processOAuthCallback(baseParams);

        expect(authService.verifyOAuthToken).toHaveBeenCalledWith('google', { code: 'oauth_code_123' });
        expect(mockForm.reset).toHaveBeenCalledWith(formValues);
        expect(handleAuthSuccess).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 42,
                email: 'user@test.com',
                authToken: jwt,
            }),
        );
        expect(baseParams.clearOAuthState).toHaveBeenCalled();
    });

    it('restores form values from OAuth state', async () => {
        const savedForm = createFunnelFormValues({ style: 'anime' });
        baseParams.restoreOAuthState.mockReturnValue({ formValues: savedForm, step: 5 });

        const jwt = createJWT({ userId: 1, email: 'a@b.com' });
        vi.mocked(authService.verifyOAuthToken).mockResolvedValue({ authToken: jwt });

        await processOAuthCallback(baseParams);

        expect(mockForm.reset).toHaveBeenCalledWith(savedForm);
    });

    it('uses current form values when no OAuth state saved', async () => {
        baseParams.restoreOAuthState.mockReturnValue({ formValues: null, step: 0 });

        const jwt = createJWT({ userId: 1, email: 'a@b.com' });
        vi.mocked(authService.verifyOAuthToken).mockResolvedValue({ authToken: jwt });

        await processOAuthCallback(baseParams);

        expect(mockForm.reset).not.toHaveBeenCalled();
        expect(mockForm.getValues).toHaveBeenCalled();
    });

    it('navigates to restored step + 1', async () => {
        baseParams.restoreOAuthState.mockReturnValue({
            formValues: createFunnelFormValues(),
            step: 7,
        });

        const jwt = createJWT({ userId: 1, email: 'a@b.com' });
        vi.mocked(authService.verifyOAuthToken).mockResolvedValue({ authToken: jwt });

        await processOAuthCallback(baseParams);

        expect(handleAuthSuccess).toHaveBeenCalledWith(
            expect.objectContaining({
                activeStep: 7,
            }),
        );
        // nextStep calls stepper.onChange(step + 1) = 8
    });

    it('shows error toast on API failure', async () => {
        baseParams.restoreOAuthState.mockReturnValue({ formValues: null, step: 0 });
        vi.mocked(authService.verifyOAuthToken).mockRejectedValue({
            response: { data: { messages: ['Token expired'] } },
        });

        await processOAuthCallback(baseParams);

        expect(triggerToast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Token expired',
                type: 'error',
            }),
        );
        expect(baseParams.clearOAuthState).not.toHaveBeenCalled();
    });

    it('shows fallback message when API error has no messages', async () => {
        baseParams.restoreOAuthState.mockReturnValue({ formValues: null, step: 0 });
        vi.mocked(authService.verifyOAuthToken).mockRejectedValue(new Error('Network error'));

        await processOAuthCallback(baseParams);

        expect(triggerToast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'OAuth verification failed',
            }),
        );
    });

    it('shows error toast on invalid JWT', async () => {
        baseParams.restoreOAuthState.mockReturnValue({ formValues: null, step: 0 });
        vi.mocked(authService.verifyOAuthToken).mockResolvedValue({ authToken: 'invalid-jwt' });

        await processOAuthCallback(baseParams);

        expect(triggerToast).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'error',
            }),
        );
        expect(handleAuthSuccess).not.toHaveBeenCalled();
    });
});
