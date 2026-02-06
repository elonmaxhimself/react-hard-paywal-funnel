import { FormProvider } from "react-hook-form";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import Stepper from "@/components/stepper";
import { useFunnelForm } from "@/hooks/funnel/useFunnelForm";
import { funnelSteps } from "@/features/funnel/funnelSteps";
import FinalOfferModal from "@/components/modals/FinalOfferModal";
import FinalOfferUnlockedModal from "@/components/modals/FinalOfferUnlockedModal";
import SecretOfferModal from "@/components/modals/SecretOfferModal";
import ShowVideoModal from "@/components/modals/ShowVideoModal";
import SpecialOfferModal from "@/components/modals/SpecialOfferModal";
import { authService } from "@/services/auth-service";
import { handleAuthSuccess } from "@/utils/auth/handleAuthSuccess";
import { useAuthStore } from "@/store/states/auth";
import { useFunnelStore } from "@/store/states/funnel";
import { toastType, triggerToast } from "@/components/AlertToast";

export default function FunnelView() {
    const { form, stepper, isReady } = useFunnelForm();
    const posthog = usePostHog();
    
    const setUserId = useAuthStore((state) => state.setUserId);
    const setToken = useAuthStore((state) => state.setToken);
    const setStep = useFunnelStore((state) => state.setStep);
    const setFormState = useFunnelStore((state) => state.setFormState);

    const [isProcessingOAuth, setIsProcessingOAuth] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.has("code") && params.has("state");
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        
        if (!isReady || !code || !state || !(state === "google" || state === "twitter" || state === "discord")) {
            return;
        }
        
        console.log('OAuth callback detected, restoring state...');
        
        const savedState = localStorage.getItem('oauth_funnel_state');
        let restoredFormValues = null;
        let restoredStep = 0;
        
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                restoredFormValues = parsed.formValues;
                restoredStep = parsed.step;
                
                console.log('Restored funnel state:', { 
                    step: restoredStep,
                    timestamp: parsed.timestamp,
                });
                
                form.reset(restoredFormValues);
                localStorage.removeItem('oauth_funnel_state');
            } catch (error) {
                console.error('Failed to restore state:', error);
            }
        }
        
        authService.verifyOAuthToken(state as any, { code })
            .then((data: any) => {
                console.log('OAuth verification successful:', data);
                
                try {
                    const payload = JSON.parse(atob(data.authToken.split('.')[1]));
                    console.log('JWT payload:', payload);
                    
                    const funnelFormValues = restoredFormValues || form.getValues();
                    const targetStep = restoredStep + 1;
                    
                    setTimeout(() => {
                        console.log('Calling handleAuthSuccess with step:', restoredStep);
                        
                        handleAuthSuccess({
                            userId: payload.userId,
                            email: payload.email,
                            authToken: data.authToken,
                            posthog,
                            setUserId,
                            setToken,
                            setFormState,
                            setStep,
                            nextStep: () => {
                                console.log('OAuth: setting stepper to:', targetStep);
                                stepper.onChange(targetStep);
                            },
                            funnelFormValues,
                            activeStep: restoredStep,
                        });
                        
                        setIsProcessingOAuth(false);
                    }, 100);
                } catch (decodeError) {
                    console.error('Failed to decode JWT:', decodeError);
                    setIsProcessingOAuth(false);
                    triggerToast({
                        title: "Failed to process authentication",
                        type: toastType.error,
                    });
                }
            })
            .catch((error: any) => {
                console.error('OAuth verification error:', error);
                setIsProcessingOAuth(false);
                triggerToast({
                    title: error.response?.data?.messages?.[0] || "OAuth verification failed",
                    type: toastType.error,
                });
            });
        
        window.history.replaceState({}, document.title, window.location.pathname);
    }, [isReady, form, stepper, posthog, setUserId, setToken, setFormState, setStep]);

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
            <div className="w-full">
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