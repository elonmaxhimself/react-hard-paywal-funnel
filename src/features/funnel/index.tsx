import { FormProvider } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import Stepper from "@/components/stepper";
import { useFunnelForm } from "@/hooks/funnel/useFunnelForm";
import { funnelSteps } from "@/features/funnel/funnelSteps";
import FinalOfferModal from "@/components/modals/FinalOfferModal";
import FinalOfferUnlockedModal from "@/components/modals/FinalOfferUnlockedModal";
import SecretOfferModal from "@/components/modals/SecretOfferModal";
import ShowVideoModal from "@/components/modals/ShowVideoModal";
import SpecialOfferModal from "@/components/modals/SpecialOfferModal";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuthStore } from "@/store/states/auth";
import { useFunnelStore } from "@/store/states/funnel";
import { processOAuthCallback } from "@/hooks/auth/processOAuthCallback";
import { useInitUtm } from "@/hooks/useUtm";
import { OAUTH_PROVIDERS, OAuthProviderType } from "@/constants/oauth";

export default function FunnelView() {
    const { form, stepper, isReady } = useFunnelForm();
    const posthog = usePostHog();
    const setUserId = useAuthStore((state) => state.setUserId);
    const setToken = useAuthStore((state) => state.setToken);
    const restoreOAuthState = useAuthStore((state) => state.restoreOAuthState);
    const clearOAuthState = useAuthStore((state) => state.clearOAuthState);
    const setStep = useFunnelStore((state) => state.setStep);
    const setFormState = useFunnelStore((state) => state.setFormState);
    const hasProcessedOAuth = useRef(false);
useInitUtm()
    const [isProcessingOAuth, setIsProcessingOAuth] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state") as OAuthProviderType | null;
        return !!(code && state && OAUTH_PROVIDERS.includes(state));
    });

    useEffect(() => {
        if (!isReady) return;

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state") as OAuthProviderType | null;

        if (!code || !state || !OAUTH_PROVIDERS.includes(state)) {
            setIsProcessingOAuth(false);
            return;
        }

        if (hasProcessedOAuth.current) return;
        hasProcessedOAuth.current = true;

        const handleOAuth = async () => {
            await processOAuthCallback({
                code,
                state,
                restoreOAuthState,
                clearOAuthState,
                form,
                stepper,
                posthog,
                setUserId,
                setToken,
                setFormState,
                setStep,
            });
            setIsProcessingOAuth(false);
            window.history.replaceState({}, document.title, window.location.pathname);
        };

        handleOAuth();
    }, [isReady, form, stepper, posthog, setUserId, setToken, setFormState, setStep, restoreOAuthState, clearOAuthState]);

    if (!isReady || isProcessingOAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <FormProvider {...form}>
            <div className="w-full flex flex-col min-h-screen">
                <div className="sticky top-0 z-50 flex justify-end px-4 py-3 pointer-events-none">
                    <div className="pointer-events-auto">
                        <LanguageSelector />
                    </div>
                </div>

                <Stepper {...stepper}>
                    <Stepper.Contents>
                        {funnelSteps.map((StepContent, index) => (
                            <Stepper.Content key={index}>
                                {StepContent}
                            </Stepper.Content>
                        ))}
                    </Stepper.Contents>
                    <SecretOfferModal />
                    <FinalOfferModal />
                    <SpecialOfferModal />
                    <FinalOfferUnlockedModal />
                    <ShowVideoModal />
                </Stepper>
            </div>
        </FormProvider>
    );
}