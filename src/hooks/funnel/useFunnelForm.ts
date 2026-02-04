import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePostHog } from 'posthog-js/react';
import { EXPERIMENTS } from '@/configs/experiment.config';

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
    const posthog = usePostHog();
    const [active, setActive] = useState(0);
    const [isExperimentReady, setIsExperimentReady] = useState(false);
    const [isFormReady, setIsFormReady] = useState(false);
    const [startingStep, setStartingStep] = useState(0);

    const form = useForm<FunnelSchema>({
        resolver: zodResolver(funnelV3Schema),
        defaultValues,
    });

    useEffect(() => {
        const token = import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN;
        
        if (!token) {
            setStartingStep(0);
            setIsExperimentReady(true);
            return;
        }

        const timeout = setTimeout(() => {
            console.warn('PostHog initialization timeout - continuing without analytics');
            setStartingStep(0);
            setIsExperimentReady(true);
        }, 5000);

        if (!posthog) {
            return () => clearTimeout(timeout);
        }

        const cleanup = posthog.onFeatureFlags(() => {
            try {
                clearTimeout(timeout);
                
                const variant = posthog.getFeatureFlag(EXPERIMENTS.STARTING_STEP.flagKey);
                const variantKey = (variant as string) || 'control';
                
                const config = EXPERIMENTS.STARTING_STEP.variants[
                    variantKey as keyof typeof EXPERIMENTS.STARTING_STEP.variants
                ] || EXPERIMENTS.STARTING_STEP.variants['control'];
                
                setStartingStep(config.startStep);
                setIsExperimentReady(true);
                
                const pricingVariant = String(posthog.getFeatureFlag(EXPERIMENTS.PRICING.flagKey) || 'control');
                
                posthog.capture('pricing_variant_assigned', {
                    $set_once: {
                        pricing_ab_test_variant: pricingVariant
                    }
                });
                
                
                posthog.capture('funnel_started', {
                    variant: variantKey,
                    starting_step: config.startStep,
                });
            } catch (error) {
                console.error('PostHog feature flag processing error:', error);
                clearTimeout(timeout);
                setStartingStep(0);
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
            } else {
                setActive(startingStep);
            }
        } catch (error) {
            console.error('Form restoration error:', error);
            form.reset(defaultValues);
            setActive(startingStep);
        } finally {
            setIsFormReady(true);
        }
    }, [isExperimentReady, startingStep]);

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

    const prevStep = () => setActive((current) => 
        (current > startingStep ? current - 1 : current)
    );

    return {
        form,
        stepper: {
            value: active,
            onChange: setActive,
            max: STEPS_INDICATOR_COUNT,
            startingStep,
            nextStep,
            prevStep,
        },
        isReady: isExperimentReady && isFormReady,
    };
}