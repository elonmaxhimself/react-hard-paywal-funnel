import { useFormContext } from "react-hook-form";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import ImageCard from "@/components/ImageCard";

import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import { characterStyle } from "@/constants/character-style";

export function CharacterStyleStep() {
    const { nextStep } = useStepperContext();

    const form = useFormContext<FunnelSchema>();

    const character_style = form.watch("style");

    const onSelectStyle = (style: string) => {
        form.setValue("style", style);
        nextStep();
    };

    return (
        <StepWrapper>
            <div
                className={
                    "max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center"
                }
            >
                <div
                    className={
                        "w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]"
                    }
                >
                    <div className={"w-full mb-5 md:mb-[44px]"}>
                        <Stepper.Progress />
                    </div>
                    <h2 className={"text-white text-lg font-bold mb-5 md:mb-[30px]"}>
                        Choose Style
                    </h2>
                    <div className={"w-full flex gap-[10px]"}>
                        {characterStyle.map((style) => (
                            <ImageCard
                                key={style.id}
                                image={style.image}
                                isActive={character_style === style.value}
                                onClick={() => onSelectStyle(style.value)}
                                className={"flex-1 aspect-[160/330]"}
                            >
                                <ImageCard.Image />
                                <ImageCard.Name />
                                <ImageCard.Overlay />
                            </ImageCard>
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
