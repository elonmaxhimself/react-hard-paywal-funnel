import { Controller, useFormContext } from "react-hook-form";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import ButtonField from "@/components/funnel/fields/ButtonField";

import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";

import { booleanOptions } from "@/constants/boolean-options";

export function ForeignLanguageStep() {
    const { nextStep } = useStepperContext();

    const form = useFormContext<FunnelSchema>();

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
                    <h2 className={"text-white text-lg font-bold mb-5 mb-[30px] text-center"}>
                        Do You Want To Practice Foreign Languages With Your AI Companion?
                    </h2>
                    <div className={"w-full flex flex-col gap-[10px] mb-2"}>
                        {booleanOptions.map((option) => (
                            <Controller
                                key={option.id}
                                name={"practiceForeignLanguage"}
                                control={form.control}
                                render={({ field }) => (
                                    <ButtonField
                                        id={option.id.toString()}
                                        name={field.name}
                                        label={option.label}
                                        checked={field.value === option.value}
                                        onCheckedChange={() => {
                                            field.onChange(option.value);
                                            nextStep();
                                        }}
                                    />
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
