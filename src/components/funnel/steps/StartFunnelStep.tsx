import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import SpriteIcon from "@/components/SpriteIcon";
import { defaultValues, type FunnelSchema } from "../../../hooks/funnel/useFunnelForm";
import { useFormContext } from "react-hook-form";
import { usePostHog } from "posthog-js/react";
import { EXPERIMENTS } from '@/configs/experiment.config';

export function StartFunnelStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const posthog = usePostHog();
    const variant = (posthog?.getFeatureFlag(EXPERIMENTS.STARTING_STEP.flagKey) as string) || 'control';

    const videoUrl = useMemo(() => {
        const config = EXPERIMENTS.STARTING_STEP.variants[
            variant as keyof typeof EXPERIMENTS.STARTING_STEP.variants
        ];
        return config?.videoUrl || '/video/0.mp4';
    }, [variant]);

    const hasReset = useRef(false);

    useEffect(() => {
        if (hasReset.current) return;

        hasReset.current = true;
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("funnel-storage");
        form.reset(defaultValues);
    }, [form]);

    const handleContainerClick = () => {
        if (typeof window !== "undefined") {
            posthog?.capture("character_creation_started");
        }
        nextStep();
    };

    const handleButtonClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (typeof window !== "undefined") {
            posthog?.capture("character_creation_started");
        }
        nextStep();
    };

    return (
        <div className="w-full min-h-dvh box-border py-4 sm:py-6 px-[10px] sm:px-[15px] flex flex-col items-center justify-center overflow-hidden">
            <div className="mb-4">
                <SpriteIcon src="/images/logo-product.svg" targetW={117} targetH={45} center />
            </div>
            <div className="inline-block rounded-[10px] overflow-hidden bg-primary-gradient p-[1.5px]">
                <div
                    onClick={handleContainerClick}
                    className="relative bg-black rounded-[10px] overflow-hidden flex items-center justify-center"
                >
                    <video
                        key={videoUrl}
                        className="block max-h-[calc(100vh-2rem-45px-1rem)] sm:max-h-[calc(100vh-3rem-45px-1.5rem)] max-w-full w-auto object-contain bg-black"
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls={false}
                    >
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute bottom-[30%] z-20 w-full px-5 flex flex-col items-center">
                        <p className="text-white font-bold mb-3 text-center capitalize text-lg">
                            create ai girlfriend for <span className="uppercase">free now</span>
                        </p>
                        <Button
                            onClick={handleButtonClick}
                            className="w-full sm:fit h-[45px] bg-primary-gradient text-white"
                        >
                            <img
                                src="/icons/magic-wand-icon.svg"
                                alt="Magic Wand"
                                width={22}
                                height={22}
                                className="w-[22px] h-[22px] invert brightness-0"
                            />
                            <span className="text-sm font-bold uppercase">Create for free now</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}