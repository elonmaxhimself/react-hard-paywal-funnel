import { useMemo } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import type { PostHog } from "posthog-js";
import { AxiosError } from "axios";

import { useSignUp } from "@/hooks/queries/useAuth";
import { toastType, triggerToast } from "@/components/AlertToast";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { useAuthStore } from "@/store/states/auth";
import { useFunnelStore } from "@/store/states/funnel";

import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import { getRandomFromRange } from "@/utils/helpers/getRandomFromRange";
import { appendPersonalityTraits } from "@/utils/helpers/appendPersonalityTraits";
import { appendHobbies } from "@/utils/helpers/appendHobbies";
import { getRandomSexPosition } from "@/utils/helpers/getRandomSexPosition";
import { passwordRegex } from "@/utils/helpers/password-regex";
import { AuthResponse, SignUpPayload } from "@/utils/types/auth";

import { voicesMap } from "@/constants/voices-map";
import { useSexPositions } from "@/constants/sex-positions";

import { useUtmStore } from "@/store/states/utm";
import { handleAuthSuccess } from "@/utils/auth/handleAuthSuccess";

export function useSignUpForm(posthog?: PostHog) {
    const { t } = useTranslation();

    const signUpSchema = useMemo(
        () =>
            z.object({
                email: z.string().email(t("hooks.useSignUpForm.emailInvalid")),
                password: z
                    .string()
                    .min(8, t("hooks.useSignUpForm.passwordMin"))
                    .regex(passwordRegex, t("hooks.useSignUpForm.passwordRegex")),
                isAdult: z.boolean().refine((val) => val === true, {
                    message: t("hooks.useSignUpForm.isAdultRequired"),
                }),
                acceptedTerms: z.boolean().refine((val) => val === true, {
                    message: t("hooks.useSignUpForm.acceptedTermsRequired"),
                }),
            }),
        [t],
    );

    type SignUpFormValues = z.infer<typeof signUpSchema>;

    const { mutate: signUp, isPending, error: apiError, reset: resetMutation } = useSignUp();

    const utm = useUtmStore((state) => state.utm);
    const sexPositions = useSexPositions();

    const setUserId = useAuthStore((state) => state.setUserId);
    const setToken = useAuthStore((state) => state.setToken);
    const setStep = useFunnelStore((state) => state.setStep);
    const setFormState = useFunnelStore((state) => state.setFormState);

    const { value: activeStep, nextStep } = useStepperContext();
    const funnelForm = useFormContext<FunnelSchema>();

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            isAdult: false,
            acceptedTerms: false,
        },
    });

    const onValueReset = (field: "email" | "password") => {
        form.resetField(field);
        resetMutation();
    };

    const onSubmit = form.handleSubmit((values) => {
        const { productId: _productId, ...funnelFormValues } = funnelForm.getValues();

        let customCharacterPrompt = funnelFormValues.characterPrompt;
        const customAge = getRandomFromRange(funnelFormValues.age);
        customCharacterPrompt = appendPersonalityTraits(
            customCharacterPrompt,
            funnelFormValues.personality_traits,
        );
        customCharacterPrompt = appendHobbies(customCharacterPrompt, funnelFormValues.interests);
        const customBreast = funnelFormValues.breast_size + "-" + funnelFormValues.breast_type;
        const customKinks = [...funnelFormValues.turns_of_you, ...funnelFormValues.want_to_try];
        const customSexPosition = getRandomSexPosition(sexPositions);

        const url =
            import.meta.env.DEV
                ? "https://mdc-react-funnel-v4-dev.pages.dev/"
                : window.location.href;

        const payload: SignUpPayload = {
            email: values.email,
            password: values.password,
            utmOnRegistration: utm,
            url: url,
            createCharFunnelOptions: {
                funnelOptions: funnelFormValues,
                dtoAdultFannelV3: {
                    character_options: {
                        funnel: "cc_funnel_juicy",
                        character: {
                            age: customAge,
                            sex: "female",
                            body: funnelFormValues.body,
                            butt: funnelFormValues.butt,
                            eyes: funnelFormValues.eyes,
                            kinks: customKinks,
                            style: funnelFormValues.style,
                            voice: voicesMap[funnelFormValues.voice as keyof typeof voicesMap],
                            breast: customBreast,
                            clothes: funnelFormValues.clothes,
                            greeting: funnelFormValues.greeting,
                            scenario: funnelFormValues.scenario,
                            ethnicity: funnelFormValues.ethnicity,
                            hair_color: funnelFormValues.hair_color,
                            hair_style: funnelFormValues.hair_style,
                            sex_position: customSexPosition,
                            characterPrompt: customCharacterPrompt,
                        },
                        funnel_step: activeStep,
                    },
                },
                isCharacterGenerated: false,
            },
        };

        signUp(payload, {
            onSuccess: (data: AuthResponse) => {
                handleAuthSuccess({
                    userId: data.userId,
                    email: values.email,
                    authToken: data.authToken,
                    posthog,
                    setUserId,
                    setToken,
                    setFormState,
                    setStep,
                    nextStep,
                    funnelFormValues,
                    activeStep,
                });
            },
            onError: (error: Error) => {
                const axiosError = error as AxiosError<{ messages?: string[] }>;
                triggerToast({
                    title: axiosError.response?.data?.messages?.[0] || t("hooks.useSignUpForm.signUpFailed"),
                    type: toastType.error,
                });
            },
        });
    });

    return { form, onSubmit, onValueReset, isPending, apiError };
}
