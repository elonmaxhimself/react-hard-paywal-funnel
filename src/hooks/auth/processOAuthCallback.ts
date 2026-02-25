import { authService } from "@/services/auth-service";
import { handleAuthSuccess } from "@/utils/auth/handleAuthSuccess";
import { decodeJWT } from "@/utils/auth/jwtDecoder";
import { toastType, triggerToast } from "@/components/AlertToast";
import { FunnelSchema, useFunnelForm } from "@/hooks/funnel/useFunnelForm";
import { UseFormReturn } from "react-hook-form";
import { OAuthProviderType } from "@/constants/oauth";

type FunnelStepper = ReturnType<typeof useFunnelForm>['stepper'];

interface ProcessOAuthCallbackParams {
    code: string;
    state: OAuthProviderType;
    restoreOAuthState: () => { formValues: FunnelSchema | null; step: number };
    clearOAuthState: () => void;
    form: UseFormReturn<FunnelSchema>;
    stepper: FunnelStepper;
    posthog: any;
    setUserId: (userId: number) => void;
    setToken: (token: string) => void;
    setFormState: (state: FunnelSchema) => void;
    setStep: (step: number) => void;
}

export const processOAuthCallback = async ({
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
}: ProcessOAuthCallbackParams): Promise<void> => {
    try {
        const { formValues: restoredFormValues, step: restoredStep } = restoreOAuthState();
        
        if (restoredFormValues) {
            form.reset(restoredFormValues);
        }
        
        const data = await authService.verifyOAuthToken(state, { code });
        
        const decoded = decodeJWT(data.authToken);
        if (!decoded.success) {
            throw new Error("Failed to decode JWT token");
        }
        const { payload } = decoded;
        
        const rawFormValues = restoredFormValues || form.getValues();
        const { productId, ...funnelFormValues } = rawFormValues as any;
        
        const targetStep = restoredStep + 1;
        
        handleAuthSuccess({
            userId: payload.userId,
            email: payload.email ?? '',
            authToken: data.authToken,
            posthog,
            setUserId,
            setToken,
            setFormState,
            setStep,
            nextStep: () => stepper.onChange(targetStep),
            funnelFormValues,
            activeStep: restoredStep,
        });
        
        clearOAuthState();
    } catch (error: any) {
        triggerToast({
            title: error.response?.data?.messages?.[0] || "OAuth verification failed",
            type: toastType.error,
        });
    }
};