import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { authService } from "@/services/auth-service";
import { toastType, triggerToast } from "@/components/AlertToast";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { useAuthStore } from "@/store/states/auth";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { OAUTH_PROVIDERS, OAuthProviderType } from "@/constants/oauth";

export function useOAuth(posthog?: any) {
    const [provider, setProvider] = useState<OAuthProviderType | null>(null);
    const { value: activeStep } = useStepperContext();
    const funnelForm = useFormContext<FunnelSchema>();
    const saveOAuthState = useAuthStore((state) => state.saveOAuthState);

    const oauthSignIn = useMutation({
        mutationFn: async (provider: OAuthProviderType) => {
            setProvider(provider);
            return await authService.signInWithOAuth(provider);
        },
        onSuccess: (data: { url: string }) => {
            saveOAuthState(funnelForm.getValues(), activeStep);
            window.location.href = data.url;
        },
        onSettled: () => setProvider(null),
        onError: (error: any) => {
            triggerToast({
                title: error.response?.data?.messages?.[0] || "OAuth sign in failed",
                type: toastType.error,
            });
        },
    });

    const isOAuthLoading = oauthSignIn.isPending;

    return {
        signIn: oauthSignIn.mutate,
        isLoading: isOAuthLoading,
        isGoogleLoading: isOAuthLoading && provider === OAUTH_PROVIDERS[0],
        isTwitterLoading: isOAuthLoading && provider === OAUTH_PROVIDERS[1],
        isDiscordLoading: isOAuthLoading && provider === OAUTH_PROVIDERS[2],
    };
}