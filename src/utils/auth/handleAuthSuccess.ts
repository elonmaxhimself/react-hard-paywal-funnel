import { analyticsService } from "@/services/analytics-service";
import { AnalyticsEventTypeEnum } from "@/utils/enums/analytics-event-types";
import { reportEmailVerified, reportSignUp } from "@/lib/gtag";

interface HandleAuthSuccessParams {
    userId: number;
    email: string;
    authToken: string;
    posthog?: any;
    setUserId: (id: number) => void;
    setToken: (token: string) => void;
    setFormState: (state: any) => void;
    setStep: (step: number) => void;
    nextStep: () => void;
    funnelFormValues: any;
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
    const fbq = (window as any).fbq;
    fbq?.("track", "Lead", {
        user_id: userId,
        email: email,
    });

    // Google Ads conversions
    reportSignUp();
    reportEmailVerified();

    // GTM / dataLayer event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: "cd_signup",
        user_id: String(userId),
        email_domain: email.split("@")[1] || "",
    });

    // Mixpanel identify + sign up tracking
    try {
        analyticsService.identify(String(userId));

        let utmOnRegistration: Record<string, any> | undefined;
        try {
            const stored = localStorage.getItem("utm_params");
            if (stored) utmOnRegistration = JSON.parse(stored);
        } catch {}

        analyticsService.trackSignUpEvent(AnalyticsEventTypeEnum.UNVERIFIED_SIGN_UP, {
            distinct_id: String(userId),
            tid: utmOnRegistration?.deal,
            utmOnRegistration,
        });
    } catch (e) {
        console.warn("Mixpanel sign up tracking failed", e);
    }

    // PostHog identify + account created tracking
    try {
        if (typeof window !== "undefined" && posthog) {
            posthog.identify(String(userId), {
                email_domain: email.split("@")[1] || "",
            });

            //  setTimeout(() => {
            //     posthog.capture("account_created", {
            //         user_id: String(response.userId),
            //         email_domain: values.email.split("@")[1] || "",
            //         auth_method: "email",
            //         source: "hard_paywall_funnel"
            //     });
            // }, 500);
        }
    } catch (e) {
        console.warn("PostHog sign up tracking failed", e);
    }
    setUserId(userId);
    setToken(authToken);
    setFormState(funnelFormValues);
    setStep(activeStep + 1);
    nextStep();
};