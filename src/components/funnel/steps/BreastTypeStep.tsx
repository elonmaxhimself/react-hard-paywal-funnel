import { useFormContext } from "react-hook-form";

import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";

import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import { breastSizes } from "@/constants/breast_size";
import { breastTypes } from "@/constants/breast-types";

export function BreastTypeStep() {
    const { nextStep } = useStepperContext();

    const form = useFormContext<FunnelSchema>();

    const breast_type = form.watch("breast_type");
    const breast_size = form.watch("breast_size");

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
                    <h2 className={"text-white text-lg font-bold mb-5 md:mb-[30px] capitalize"}>
                        Choose her breast
                    </h2>
                    <div className={"w-full mb-[30px]"}>
                        <h2 className="text-white text-base font-semibold mb-[7px] capitalize">
                            Size
                        </h2>
                        <div className="w-full grid grid-cols-3 gap-[10px]">
                            {breastSizes.map((size) => (
                                <ImageCard
                                    key={size.id}
                                    image={size.image}
                                    isActive={breast_size === size.value}
                                    className="aspect-[110/95] w-full "
                                    onClick={() =>
                                        form.setValue("breast_size", size.value, {
                                            shouldValidate: true,
                                        })
                                    }
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                        {form.formState.errors.breast_size && (
                            <div className={"text-red-500 text-sm font-medium mt-2"}>
                                {form.formState.errors.breast_size.message}
                            </div>
                        )}
                    </div>
                    <div className={"w-full"}>
                        <h2 className={"text-white text-base font-semibold mb-[7px] capitalize"}>
                            Type
                        </h2>
                        <div className="grid grid-cols-3 gap-[10px] w-full">
                            {breastTypes.map((type) => (
                                <ImageCard
                                    key={type.id}
                                    image={type.image}
                                    isActive={breast_type === type.value}
                                    className="aspect-[110/95] w-full"
                                    onClick={() =>
                                        form.setValue("breast_type", type.value, {
                                            shouldValidate: true,
                                        })
                                    }
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                        {form.formState.errors.breast_type && (
                            <div className={"text-red-500 text-sm font-medium mt-2"}>
                                {form.formState.errors.breast_type.message}
                            </div>
                        )}
                    </div>
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
