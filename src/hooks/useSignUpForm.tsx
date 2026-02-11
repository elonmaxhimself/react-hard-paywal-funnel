// src/hooks/funnel/useSignUpForm.ts
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { SignUpPayload } from "@/utils/types/auth";

import { voicesMap } from "@/constants/voices-map";
import { useSexPositions } from "@/constants/sex-positions";

import { analyticsService } from "@/services/analytics-service";
import { AnalyticsEventTypeEnum } from "@/utils/enums/analytics-event-types";
import { reportEmailVerified, reportSignUp } from "@/lib/gtag";
import { useUtmStore } from "@/store/states/utm";

const signUpSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(passwordRegex, "Password must include at least one letter and one number"),
    isAdult: z.boolean().refine((val) => val === true, {
        message: "You must confirm that you are 18 years or older.",
    }),
    acceptedTerms: z.boolean().refine((val) => val === true, {
        message: "You must accept the Terms of Service and Privacy Policy.",
    }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpResponse {
    userId: number;
    authToken: string;
}

export function useSignUpForm(posthog?: any) {
    const { mutate: signUp, isPending, error: apiError } = useSignUp();

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
        if (apiError) (apiError as any).message = "";
    };

    const onSubmit = form.handleSubmit((values) => {
        const { productId, ...funnelFormValues } = funnelForm.getValues();

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
                ? "https://funnel-adult-v3.fly.dev"
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
            onSuccess: (data) => {
                const response = data as SignUpResponse;
                
                const fbq = (window as any).fbq;
                fbq?.("track", "Lead", {
                    user_id: response.userId,
                    email: values.email,
                });

                // Google Ads conversions
                reportSignUp();
                reportEmailVerified();

                // GTM / dataLayer event
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: "cd_signup",
                    user_id: String(response.userId),
                    email_domain: values.email.split("@")[1] || "",
                });

                // Mixpanel identify + sign up tracking
                try {
                    analyticsService.identify(String(response.userId));

                    let utmOnRegistration: Record<string, any> | undefined;
                    try {
                        const stored = localStorage.getItem("utm_params");
                        if (stored) utmOnRegistration = JSON.parse(stored);
                    } catch {}

                    analyticsService.trackSignUpEvent(AnalyticsEventTypeEnum.UNVERIFIED_SIGN_UP, {
                        distinct_id: String(response.userId),
                        tid: utmOnRegistration?.deal,
                        utmOnRegistration,
                    });
                } catch (e) {
                    console.warn("Mixpanel sign up tracking failed", e);
                }

                // PostHog identify + account created tracking
                try {
                    if (typeof window !== "undefined" && posthog) {
                        posthog.identify(String(response.userId), {
                            email_domain: values.email.split("@")[1] || "",
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

                setUserId(response.userId);
                setToken(response.authToken);
                setFormState(funnelForm.getValues());
                setStep(activeStep + 1);
                nextStep();
            },
            onError: (error: any) => {
                triggerToast({
                    title: error.response?.data?.messages?.[0] || "Sign up failed",
                    type: toastType.error,
                });
            },
        });
    });

    return { form, onSubmit, onValueReset, isPending, apiError };
}