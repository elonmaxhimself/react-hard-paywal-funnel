import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";

import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import { useCharacterHaircutStyle, useCharacterHaircutColor } from "@/constants/character-haircut";

export function HaircutStyleStep() {
    const { t } = useTranslation();
  const CHARACTER_HAIRCUT_STYLE = useCharacterHaircutStyle();
  const CHARACTER_HAIRCUT_COLOR = useCharacterHaircutColor();
    const { nextStep } = useStepperContext();

    const form = useFormContext<FunnelSchema>();

    const character_haircut_style = form.watch("hair_style");
    const character_haircut_color = form.watch("hair_color");

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
                    <h2 className={"text-white text-lg font-bold mb-[20px] capitalize"}>
                        {t('funnel.haircutStyleStep.titleStyle')}
                    </h2>
                    <div className={"w-full flex flex-col items-center gap-2 mb-5 md:mb-10"}>
                        <div className={"w-full grid grid-cols-3 gap-[10px]"}>
                            {CHARACTER_HAIRCUT_STYLE.map((haircut) => (
                                <ImageCard
                                    key={haircut.id}
                                    image={haircut.image}
                                    isActive={character_haircut_style === haircut.value}
                                    onClick={() =>
                                        form.setValue("hair_style", haircut.value, {
                                            shouldValidate: true,
                                        })
                                    }
                                    className={"w-full h-auto aspect-square"}
                                >
                                    <ImageCard.Image className={"object-top"} />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                        {form.formState.errors.hair_style && (
                            <div className={"text-red-500 text-sm font-medium mt-2"}>
                                {form.formState.errors.hair_style.message}
                            </div>
                        )}
                    </div>
                    <h2 className={"text-white text-lg font-bold mb-5 capitalize"}>
                        {t('funnel.haircutStyleStep.titleColor')}
                    </h2>
                    <div className={"w-full flex flex-col items-center gap-2"}>
                        <div className={"w-full grid grid-cols-4 gap-[10px]"}>
                            {CHARACTER_HAIRCUT_COLOR.map((color) => (
                                <ImageCard
                                    key={color.id}
                                    image={color.image}
                                    isActive={character_haircut_color === color.value}
                                    onClick={() =>
                                        form.setValue("hair_color", color.value, {
                                            shouldValidate: true,
                                        })
                                    }
                                    className={"w-full h-auto aspect-square"}
                                >
                                    <ImageCard.Image className={"object-top"} />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                        {form.formState.errors.hair_color && (
                            <div className={"text-red-500 text-sm font-medium mt-2"}>
                                {form.formState.errors.hair_color.message}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">{t('funnel.haircutStyleStep.continue')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}