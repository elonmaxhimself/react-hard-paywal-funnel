import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { BODY_TYPES } from "@/constants/body-types";

export function BodyTypeStep() {
    const { nextStep } = useStepperContext();

    const form = useFormContext<FunnelSchema>();

    const body_type = form.watch("body");

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
                    <h2 className={"text-white text-lg font-bold mb-5 md:mb-[30px]"}>
                        Choose Body Type
                    </h2>
                    <div className="grid grid-cols-2 gap-[10px] w-full">
                        {BODY_TYPES.map((type) => (
                            <ImageCard
                                key={type.id}
                                image={type.image}
                                isActive={body_type === type.value}
                                className="aspect-[159/128] w-full h-full"
                                onClick={() => {
                                    form.setValue("body", type.value);
                                    nextStep();
                                }}
                            >
                                <ImageCard.Image />
                                <ImageCard.Name />
                                <ImageCard.Overlay />
                            </ImageCard>
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
