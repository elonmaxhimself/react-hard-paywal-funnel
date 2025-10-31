import { Controller, useFormContext } from "react-hook-form";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import ButtonField from "@/components/funnel/fields/ButtonField";

import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import { ageRange } from "@/constants/age-range";

export function UserAgeStep() {
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
                    <div className={"w-full mb-5 md:mb-[44px]"}>
                        <Stepper.Progress />
                    </div>
                    <h2 className={"text-white text-lg font-bold mb-5 md:mb-[15px] capitalize"}>
                        How old are you?
                    </h2>
                    <p className={"text-white/70 text-sm font-medium text-center mb-[35px]"}>
                        By clicking the button below, you approve that you are at least 18 or adult
                        age in your country
                    </p>
                    <div className={"w-full flex flex-col gap-[10px]"}>
                        {ageRange.map((age) => (
                            <Controller
                                key={age.id}
                                name={"user_age"}
                                control={form.control}
                                render={({ field }) => (
                                    <ButtonField
                                        id={age.value}
                                        name={field.name}
                                        label={age.label}
                                        checked={field.value === age.value}
                                        onCheckedChange={() => {
                                            field.onChange(age.value);
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
