import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { usePostHog } from 'posthog-js/react';
import { EXPERIMENTS } from '@/configs/experiment.config';

import { getFunnelStore } from "@/store/states/funnel";

import { createFunnelSchema } from "@/features/funnel/validation";
import { useSubscriptions } from "@/constants/subscriptions";

export type FunnelSchema = z.infer<ReturnType<typeof createFunnelSchema>>;

const triggers: Record<number, keyof FunnelSchema | Array<keyof FunnelSchema>> = {
    1: "connections",
    10: "personality_traits",
    11: "interests",
    14: "ethnicity",
    15: "your_type",
    19: ["breast_size", "breast_type"],
    22: ["hair_style", "hair_color"],
    24: "character_relationship",
    25: "turns_of_you",
    26: "want_to_try",
    28: "voice",
    29: "turns_off_in_dating",
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

    productId: undefined as number | undefined,
};

const STEPS_COUNT = 43;
const STEPS_INDICATOR_COUNT = 31;

export function useFunnelForm() {
    const { t } = useTranslation();
    const posthog = usePostHog();
    const subscriptions = useSubscriptions();
    const [active, setActive] = useState(0);
    const [isExperimentReady, setIsExperimentReady] = useState(false);
    const [isFormReady, setIsFormReady] = useState(false);

    const funnelSchema = useMemo(() => createFunnelSchema(t), [t]);

    // Дополняем defaultValues значением productId из локализованных subscriptions
    const formDefaultValues = useMemo(() => ({
        ...defaultValues,
        productId: subscriptions.find((subscription) => subscription.isBestChoice)?.productId,
    }), [subscriptions]);

    const form = useForm<FunnelSchema>({
        resolver: zodResolver(funnelSchema),
        defaultValues: formDefaultValues,
    });

    useEffect(() => {
        const token = import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN;
        
        if (!token) {
            setIsExperimentReady(true);
            return;
        }

        const timeout = setTimeout(() => {
            console.warn('PostHog initialization timeout - continuing without analytics');
            setIsExperimentReady(true);
        }, 5000);

        if (!posthog) {
            return () => clearTimeout(timeout);
        }

        const cleanup = posthog.onFeatureFlags(() => {
            try {
                clearTimeout(timeout);
                
                const pricingVariant = String(posthog.getFeatureFlag(EXPERIMENTS.PRICING.flagKey) || 'control');
                
                posthog.capture('pricing_variant_assigned', {
                    $set_once: {
                        pricing_ab_test_variant: pricingVariant
                    }
                });
                
                posthog.capture('funnel_started');
                
                setIsExperimentReady(true);
            } catch (error) {
                console.error('PostHog feature flag processing error:', error);
                clearTimeout(timeout);
                setIsExperimentReady(true);
            }
        });

        return () => {
            clearTimeout(timeout);
            if (cleanup) cleanup();
        };
    }, [posthog]);

    useEffect(() => {
        if (!isExperimentReady) return;

        try {
            const savedData = getFunnelStore().form;
            const savedStep = getFunnelStore().step;
            
            if (savedData) form.reset(savedData);
            if (savedStep !== undefined && savedStep !== null) {
                setActive(savedStep);
            }
        } catch (error) {
            console.error('Form restoration error:', error);
            form.reset(formDefaultValues);
            setActive(0);
        } finally {
            setIsFormReady(true);
        }
    }, [isExperimentReady]);

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
        isReady: isExperimentReady && isFormReady,
    };
}