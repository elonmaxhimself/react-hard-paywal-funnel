import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { useTurnsOfYou } from "@/constants/turns-of-you";

export function TurnsOfYouStep() {
    const { t } = useTranslation();
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const TURNS_OF_YOU = useTurnsOfYou();
    const turns_of_you = form.watch("turns_of_you");

    return (
        <StepWrapper>
            <div
                className={
                    "max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center"
                }
            >
                <div
                    className={
                        "w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[50px] sm:mb-[70px]"
                    }
                >
                    <div className={"w-full mb-5 md:mb-[44px]"}>
                        <Stepper.Progress />
                    </div>
                    <h2 className={"text-white text-lg font-bold mb-5 capitalize"}>
                        {t('funnel.turnsOfYouStep.title')}
                    </h2>
                    <div className={"w-full flex flex-col items-center gap-2"}>
                        <div className={"w-full grid grid-cols-3 gap-[10px]"}>
                            {TURNS_OF_YOU.map((turn) => (
                                <ImageCard
                                    key={turn.id}
                                    image={turn.image}
                                    isActive={turns_of_you.includes(turn.value)}
                                    onClick={() => {
                                        const isSelected = turns_of_you.includes(turn.value);
                                        const currentValues = [...turns_of_you];
                                        if (isSelected) {
                                            form.setValue(
                                                "turns_of_you",
                                                currentValues.filter((val) => val !== turn.value),
                                            );
                                        } else {
                                            form.setValue(
                                                "turns_of_you",
                                                [...currentValues, turn.value],
                                                { shouldValidate: true },
                                            );
                                        }
                                    }}
                                    className={"w-full h-auto aspect-[110/158]"}
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                    </div>
                    {form.formState.errors.turns_of_you && (
                        <div className={"text-red-500 text-sm font-medium mt-2"}>
                            {form.formState.errors.turns_of_you.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">{t('funnel.turnsOfYouStep.continue')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}