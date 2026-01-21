import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import BadgeField from "@/components/funnel/fields/BadgeField";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { usePersonalityTraits } from "@/constants/personality-traits";

export function PersonalityTraitsStep() {
    const { t } = useTranslation();
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const personality_traits = form.watch("personality_traits");
    const personalityTraits = usePersonalityTraits();
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
                    <div className={"w-full mb-5 md:mb-11"}>
                        <Stepper.Progress />
                    </div>
                    <h2 className={"text-white text-lg font-bold mb-5 md:mb-[30px] text-center"}>
                        {t('funnel.personalityTraitsStep.title')}
                    </h2>
                    <div className={"w-full flex flex-wrap justify-center gap-[10px]"}>
                        {personalityTraits.map((trait) => (
                            <BadgeField
                                key={trait.id}
                                label={trait.label}
                                checked={personality_traits.includes(trait.value)}
                                onCheckedChange={() => {
                                    const isSelected = personality_traits.includes(trait.value);
                                    const currentValues = [...personality_traits];
                                    if (isSelected) {
                                        form.setValue(
                                            "personality_traits",
                                            currentValues.filter((val) => val !== trait.value),
                                        );
                                    } else {
                                        form.setValue(
                                            "personality_traits",
                                            [...currentValues, trait.value],
                                            { shouldValidate: true },
                                        );
                                    }
                                }}
                            />
                        ))}
                    </div>
                    {form.formState.errors.personality_traits && (
                        <div className={"text-red-500 text-sm font-medium text-center mt-2"}>
                            {form.formState.errors.personality_traits.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-5 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">{t('funnel.personalityTraitsStep.continue')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}