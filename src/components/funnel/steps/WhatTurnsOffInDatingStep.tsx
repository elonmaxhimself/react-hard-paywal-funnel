import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import CheckboxField from "@/components/funnel/fields/CheckboxField";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { useTurnsOffInDating } from "@/constants/turns-off-in-dating";

export function WhatTurnsOffInDatingStep() {
    const { t } = useTranslation();
    const turnsOffInDating = useTurnsOffInDating();
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const turns_of_in_dating = form.watch("turns_off_in_dating");

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
                    <h2
                        className={
                            "text-white text-center text-lg font-bold mb-5 md:mb-[30px] capitalize"
                        }
                    >
                        {t('funnel.whatTurnsOffInDatingStep.title')}
                    </h2>
                    <div className={"w-full flex flex-col items-center justify-center gap-[10px]"}>
                        {turnsOffInDating.map((turn) => (
                            <CheckboxField
                                key={turn.id}
                                id={turn.value}
                                name={turn.value}
                                label={turn.label}
                                checked={turns_of_in_dating.includes(turn.value)}
                                onCheckedChange={() => {
                                    const isSelected = turns_of_in_dating.includes(turn.value);
                                    const currentValues = [...turns_of_in_dating];
                                    if (isSelected) {
                                        form.setValue(
                                            "turns_off_in_dating",
                                            currentValues.filter((val) => val !== turn.value),
                                        );
                                    } else {
                                        form.setValue(
                                            "turns_off_in_dating",
                                            [...currentValues, turn.value],
                                            { shouldValidate: true },
                                        );
                                    }
                                }}
                            />
                        ))}
                    </div>
                    {form.formState.errors.turns_off_in_dating && (
                        <div className={"text-red-500 text-sm font-medium mt-2"}>
                            {form.formState.errors.turns_off_in_dating.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">{t('funnel.whatTurnsOffInDatingStep.continue')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}