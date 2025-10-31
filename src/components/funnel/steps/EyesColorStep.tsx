import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { EYES_COLORS } from "@/constants/eyes-colors";

export function EyesColorStep() {
    const { nextStep } = useStepperContext();

    const form = useFormContext<FunnelSchema>();

    const eyes_color = form.watch("eyes");

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
                            "text-white text-lg font-bold mb-5 md:mb-[30px] capitalize text-center"
                        }
                    >
                        Choose her eyes color
                    </h2>
                    <div className="grid grid-cols-1 gap-y-[20px] w-full">
                        {EYES_COLORS.map((eyes) => (
                            <ImageCard
                                key={eyes.id}
                                image={eyes.image}
                                isActive={eyes_color === eyes.value}
                                className="aspect-[300/66] w-full"
                                onClick={() => {
                                    form.setValue("eyes", eyes.value);
                                    nextStep();
                                }}
                            >
                                <ImageCard.Image className="rounded-xl scale-[1.04] origin-[100%_100%]" />
                                <ImageCard.Badge />
                            </ImageCard>
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
