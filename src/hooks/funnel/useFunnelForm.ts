import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { getFunnelStore } from "@/store/states/funnel";

import { funnelV3Schema } from "@/features/funnel/validation";
import { subscriptions } from "@/constants/subscriptions";

export type FunnelSchema = z.infer<typeof funnelV3Schema>;

const triggers: Record<number, keyof FunnelSchema | Array<keyof FunnelSchema>> = {
    2: "connections",
    11: "personality_traits",
    12: "interests",
    15: "ethnicity",
    16: "your_type",
    20: ["breast_size", "breast_type"],
    23: ["hair_style", "hair_color"],
    25: "character_relationship",
    26: "turns_of_you",
    27: "want_to_try",
    29: "voice",
    30: "turns_off_in_dating",
};

export const defaultValues = {
    style: "",
    age: "",
    personality_traits: [],
    interests: [],
    ethnicity: "",
    your_type: [],
    body: "",
    breast_type: "",
    breast_size: "",
    butt: "",
    eyes: "",
    hair_style: "",
    hair_color: "",
    character_relationship: "",
    scenario: "",
    characterPrompt: "",
    greeting: "",
    clothes: "",
    turns_of_you: [],
    want_to_try: [],
    voice: "",

    connections: [],
    preferred_age: "",
    user_age: "",
    preferred_relationship: "",
    practiceForeignLanguage: undefined,
    receiveSpicyContent: undefined,
    dirtyTalks: undefined,
    turns_off_in_dating: [],
    experience_filings_of_loneliness: "",
    receiveCustomPhotos: undefined,
    receiveCustomVideos: undefined,
    receiveVideoCalls: undefined,
    receiveVoiceMessages: undefined,

    productId: subscriptions.find((subscription) => subscription.isBestChoice)?.productId,
};

const STEPS_COUNT = 44;
const STEPS_INDICATOR_COUNT = 32;

export function useFunnelForm() {
    const [active, setActive] = useState(0);
    const [isReady, setIsReady] = useState(false);

    const form = useForm<FunnelSchema>({
        resolver: zodResolver(funnelV3Schema),
        defaultValues,
    });

    useEffect(() => {
        try {
            const savedData = getFunnelStore().form;
            const savedStep = getFunnelStore().step;

            if (savedData) form.reset(savedData);
            if (savedStep) setActive(savedStep);
        } catch {
            form.reset();
            setActive(0);
        } finally {
            setIsReady(true);
        }
    }, [form]);

    const nextStep = () => {
        const trigger = triggers[active as keyof typeof triggers];
        if (trigger) {
            form.trigger(trigger).then((result) => {
                if (result) {
                    form.clearErrors();
                    setActive((current) => (current < STEPS_COUNT ? current + 1 : current));
                }
            });
        } else {
            form.clearErrors();
            setActive((current) => (current < STEPS_COUNT ? current + 1 : current));
        }
    };

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    return {
        form,
        stepper: {
            value: active,
            onChange: setActive,
            max: STEPS_INDICATOR_COUNT,
            nextStep,
            prevStep,
        },
        isReady,
    };
}
