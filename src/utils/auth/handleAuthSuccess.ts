import type { PostHog } from 'posthog-js';
import { reportEmailVerified, reportSignUp } from '@/lib/gtag';
import { trackTaboola } from '@/lib/taboola';
import type { FunnelSchema } from '@/hooks/funnel/useFunnelForm';

interface HandleAuthSuccessParams {
    userId: number;
    email: string;
    authToken: string;
    posthog?: PostHog;
    setUserId: (id: number) => void;
    setToken: (token: string) => void;
    setFormState: (state: FunnelSchema) => void;
    setStep: (step: number) => void;
    nextStep: () => void;
    funnelFormValues: Omit<FunnelSchema, 'productId'>;
    activeStep: number;
}

export const handleAuthSuccess = ({
    userId,
    email,
    authToken,
    posthog,
    setUserId,
    setToken,
    setFormState,
    setStep,
    nextStep,
    funnelFormValues,
    activeStep,
}: HandleAuthSuccessParams) => {
    const fbq = window.fbq;
    fbq?.('track', 'Lead', {
        user_id: userId,
        email: email,
    });

    // Taboola — Lead
    trackTaboola('lead');

    // Google Ads conversions
    reportSignUp();
    reportEmailVerified();

    // GTM / dataLayer event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'cd_signup',
        user_id: String(userId),
        email_domain: email.split('@')[1] || '',
    });

    // PostHog identify + account created tracking
    try {
        if (typeof window !== 'undefined' && posthog) {
            posthog.identify(String(userId), {
                email_domain: email.split('@')[1] || '',
            });
        }
    } catch (e) {
        console.warn('PostHog sign up tracking failed', e);
    }

    setUserId(userId);
    setToken(authToken);
    setFormState(funnelFormValues as FunnelSchema);
    setStep(activeStep + 1);
    nextStep();
};
