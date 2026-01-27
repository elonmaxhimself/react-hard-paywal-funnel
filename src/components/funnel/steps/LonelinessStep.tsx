import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Stepper from "@/components/stepper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import StepWrapper from "@/components/StepWrapper";
import ButtonField from "@/components/funnel/fields/ButtonField";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { useExperienceFilingTypes } from "@/constants/experience-filings-types";

export function LonelinessStep() {
    const { t } = useTranslation();
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const experienceFilingTypes = useExperienceFilingTypes();
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
                            "text-white text-lg font-bold mb-5 md:mb-[30px] text-center capitalize"
                        }
                    >
                        {t('funnel.lonelinessStep.title')}
                    </h2>
                    <div className={"w-full flex flex-col items-center gap-[10px]"}>
                        {experienceFilingTypes.map((experience) => (
                            <Controller
                                key={experience.id}
                                name={"experience_filings_of_loneliness"}
                                control={form.control}
                                render={({ field }) => (
                                    <ButtonField
                                        id={experience.value}
                                        name={field.name}
                                        label={experience.label}
                                        checked={field.value === experience.value}
                                        onCheckedChange={() => field.onChange(experience.value)}
                                    />
                                )}
                            />
                        ))}
                    </div>
                    {form.formState.errors.experience_filings_of_loneliness && (
                        <div className={"text-red-500 text-sm font-medium mt-2"}>
                            {form.formState.errors.experience_filings_of_loneliness.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">{t('funnel.lonelinessStep.continue')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}