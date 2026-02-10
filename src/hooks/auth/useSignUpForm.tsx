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

import { reportEmailVerified, reportSignUp } from "@/lib/gtag";
import { useUtmStore } from "@/store/states/utm";
import { handleAuthSuccess } from "@/utils/auth/handleAuthSuccess";

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
        const customSexPosition = getRandomSexPosition();

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
                
                handleAuthSuccess({
                    userId: response.userId,
                    email: values.email,
                    authToken: response.authToken,
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