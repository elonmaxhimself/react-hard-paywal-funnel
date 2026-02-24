import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { Button } from "@/components/ui/button";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { useYourType } from "@/constants/your-type";

export function YourTypeStep() {
    const { t } = useTranslation();
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const YOUR_TYPE = useYourType();
    const your_type = form.watch("your_type");

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
                    <div className={"w-full mb-5 md:mb-11"}>
                        <Stepper.Progress />
                    </div>
                    <h2 className={"text-white text-2xl font-bold mb-[10px] text-center"}>
                        {t("funnel.yourTypeStep.title")}
                    </h2>
                    <p className="text-white/70 text-base font-medium text-center mb-5 md:mb-[35px] lowercase first-letter:uppercase">
                        {t("funnel.yourTypeStep.subtitle")}
                    </p>
                    <div className={"w-full grid grid-cols-3 gap-[10px]"}>
                        {YOUR_TYPE.map((type) => (
                            <ImageCard
                                key={type.id}
                                image={type.image}
                                isActive={your_type.includes(type.value)}
                                onClick={() => {
                                    const isSelected = your_type.includes(type.value);
                                    const currentValues = [...your_type];
                                    if (isSelected) {
                                        form.setValue(
                                            "your_type",
                                            currentValues.filter((val) => val !== type.value),
                                        );
                                    } else {
                                        form.setValue("your_type", [...currentValues, type.value], {
                                            shouldValidate: true,
                                        });
                                    }
                                }}
                                className={"w-full aspect-[3/4] capitalize"}
                            >
                                <ImageCard.Image />
                                <ImageCard.Overlay />
                                <ImageCard.Name />
                            </ImageCard>
                        ))}
                    </div>
                    {form.formState.errors.your_type && (
                        <div className={"text-red-500 text-sm font-medium text-center mt-2"}>
                            {form.formState.errors.your_type.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">{t("funnel.yourTypeStep.continue")}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}