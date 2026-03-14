import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { AxiosError } from 'axios';
import { authService } from '@/services/auth-service';
import { toastType, triggerToast } from '@/components/AlertToast';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { useAuthStore } from '@/store/states/auth';
import { FunnelSchema } from '@/hooks/funnel/useFunnelForm';
import { OAUTH_PROVIDER, OAuthProviderType } from '@/constants/oauth';

export function useOAuth() {
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
        onError: (error: Error) => {
            const axiosError = error as AxiosError<{ messages?: string[] }>;
            triggerToast({
                title: axiosError.response?.data?.messages?.[0] || 'OAuth sign in failed',
                type: toastType.error,
            });
        },
    });

    const isOAuthLoading = oauthSignIn.isPending;

    return {
        signIn: oauthSignIn.mutate,
        isLoading: isOAuthLoading,
        isGoogleLoading: isOAuthLoading && provider === OAUTH_PROVIDER.GOOGLE,
        isTwitterLoading: isOAuthLoading && provider === OAUTH_PROVIDER.TWITTER,
        isDiscordLoading: isOAuthLoading && provider === OAUTH_PROVIDER.DISCORD,
    };
}
