import { Controller, useFormContext } from "react-hook-form";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import ButtonField from "@/components/funnel/fields/ButtonField";

import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import { preferredRelationship } from "@/constants/preferred-relationship";

export function PreferredRelationshipStep() {
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
                    <h2 className={"text-white text-lg font-bold mb-5 md:mb-[30px] capitalize"}>
                        What do you prefer?
                    </h2>
                    <div className={"w-full flex flex-col gap-[10px]"}>
                        {preferredRelationship.map((relationship) => (
                            <Controller
                                key={relationship.id}
                                name={"preferred_relationship"}
                                control={form.control}
                                render={({ field }) => (
                                    <ButtonField
                                        id={relationship.value}
                                        name={field.name}
                                        label={relationship.label}
                                        description={relationship.description}
                                        checked={field.value === relationship.value}
                                        onCheckedChange={() => {
                                            field.onChange(relationship.value);
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
