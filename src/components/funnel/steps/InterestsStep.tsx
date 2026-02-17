import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import CheckboxField from "@/components/funnel/fields/CheckboxField";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { useInterests } from "@/constants/interests";

export function InterestsStep() {
    const { t } = useTranslation();
    const interests = useInterests();
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const personality_interests = form.watch("interests");

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
                    <div className={"w-full mb-5 md:mb-11"}>
                        <Stepper.Progress />
                    </div>
                    <h2 className={"text-white text-lg font-bold mb-5 md:mb-[30px] text-center"}>
                        {t('funnel.interestsStep.title')}
                    </h2>
                    <div className={"w-full flex flex-col items-center justify-center gap-[10px]"}>
                        {interests.map((interest) => (
                            <CheckboxField
                                key={interest.id}
                                id={interest.value}
                                name={interest.value}
                                label={interest.label}
                                checked={personality_interests.includes(interest.value)}
                                onCheckedChange={() => {
                                    const isSelected = personality_interests.includes(
                                        interest.value,
                                    );
                                    const currentValues = [...personality_interests];
                                    if (isSelected) {
                                        form.setValue(
                                            "interests",
                                            currentValues.filter((val) => val !== interest.value),
                                        );
                                    } else {
                                        form.setValue(
                                            "interests",
                                            [...currentValues, interest.value],
                                            { shouldValidate: true },
                                        );
                                    }
                                }}
                            />
                        ))}
                    </div>
                    {form.formState.errors.interests && (
                        <div className={"text-red-500 text-sm font-medium mt-2"}>
                            {form.formState.errors.interests.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">{t('funnel.interestsStep.continue')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}