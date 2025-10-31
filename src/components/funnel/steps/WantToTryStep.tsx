import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { WANT_TO_TRY } from "@/constants/want-to-try";

export function WantToTryStep() {
    const { nextStep } = useStepperContext();

    const form = useFormContext<FunnelSchema>();

    const want_to_try = form.watch("want_to_try");

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
                    <h2 className={"text-white text-lg font-bold mb-5 text-center capitalize"}>
                        What do you want to try with your AI partner?
                    </h2>
                    <div className={"w-full flex flex-col items-center gap-2"}>
                        <div className={"w-full grid grid-cols-3 gap-[10px]"}>
                            {WANT_TO_TRY.map((relationship) => (
                                <ImageCard
                                    key={relationship.id}
                                    image={relationship.image}
                                    isActive={want_to_try.includes(relationship.value)}
                                    onClick={() => {
                                        const isSelected = want_to_try.includes(relationship.value);
                                        const currentValues = [...want_to_try];

                                        if (isSelected) {
                                            form.setValue(
                                                "want_to_try",
                                                currentValues.filter(
                                                    (val) => val !== relationship.value,
                                                ),
                                            );
                                        } else {
                                            form.setValue(
                                                "want_to_try",
                                                [...currentValues, relationship.value],
                                                { shouldValidate: true },
                                            );
                                        }
                                    }}
                                    className={"w-full h-auto aspect-[110/115]"}
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                    </div>
                    {form.formState.errors.want_to_try && (
                        <div className={"text-red-500 text-sm font-medium mt-2"}>
                            {form.formState.errors.want_to_try.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">Continue</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
