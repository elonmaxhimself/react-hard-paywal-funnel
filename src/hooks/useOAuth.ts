import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { authService } from "@/services/auth-service";
import { toastType, triggerToast } from "@/components/AlertToast";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { useAuthStore } from "@/store/states/auth";
import { useFunnelStore } from "@/store/states/funnel";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

type OAuthProviderType = "google" | "twitter" | "discord";

const OAuthProviders = {
    GOOGLE: "google" as const,
    TWITTER: "twitter" as const,
    DISCORD: "discord" as const,
};

export function useOAuth(posthog?: any) {
    const [provider, setProvider] = useState<OAuthProviderType | null>(null);
    const { value: activeStep } = useStepperContext();
    const funnelForm = useFormContext<FunnelSchema>();

    const oauthSignIn = useMutation({
        mutationFn: async (provider: OAuthProviderType) => {
            setProvider(provider);
            const response = await authService.signInWithOAuth(provider);
            return response;
        },
        onSuccess: (data: { url: string }) => {
            console.log('Saving funnel state before redirect...');
            
            const funnelFormValues = funnelForm.getValues();
            
            try {
                localStorage.setItem('oauth_funnel_state', JSON.stringify({
                    formValues: funnelFormValues,
                    step: activeStep,
                    timestamp: Date.now(),
                }));
                
                console.log('Funnel state saved:', { step: activeStep, timestamp: Date.now() });
                
                window.location.href = data.url;
            } catch (error) {
                console.error('Failed to save state:', error);
                triggerToast({
                    title: "Failed to save form state. Please enable cookies.",
                    type: toastType.error,
                });
            }
        },
        onSettled: () => setProvider(null),
        onError: (error: any) => {
            console.error('OAuth sign in error:', error);
            triggerToast({
                title: error.response?.data?.messages?.[0] || "OAuth sign in failed",
                type: toastType.error,
            });
        },
    });

    return {
        signIn: oauthSignIn.mutate,
        isLoading: oauthSignIn.isPending,
        isGoogleLoading: oauthSignIn.isPending && provider === OAuthProviders.GOOGLE,
        isTwitterLoading: oauthSignIn.isPending && provider === OAuthProviders.TWITTER,
        isDiscordLoading: oauthSignIn.isPending && provider === OAuthProviders.DISCORD,
    };
}