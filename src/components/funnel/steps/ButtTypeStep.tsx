import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { useButtTypes } from "@/constants/butt-types";

export function ButtTypeStep() {
    const { t } = useTranslation();
    const { nextStep } = useStepperContext();
    const BUTT_TYPES = useButtTypes()
    const form = useFormContext<FunnelSchema>();
    const butt_type = form.watch("butt");

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
                        {t('funnel.buttTypeStep.title')}
                    </h2>
                    <div className="grid grid-cols-2 gap-[10px] w-full">
                        {BUTT_TYPES.map((type) => (
                            <ImageCard
                                key={type.id}
                                image={type.image}
                                isActive={butt_type === type.value}
                                className="aspect-[159/128] w-full"
                                onClick={() => {
                                    form.setValue("butt", type.value);
                                    nextStep();
                                }}
                            >
                                <ImageCard.Image className="object-cover object-[center_79%]" />
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