import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { useEthnicity } from "@/constants/ethnicity";

export function EthnicityStep() {
    const { t } = useTranslation();
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const ethnicity = useEthnicity();
    const character_ethnicity = form.watch("ethnicity");

    const onSelectEthnicity = (ethnicityValue: string) => {
        form.setValue("ethnicity", ethnicityValue, { shouldValidate: true });
    };

    return (
        <StepWrapper>
            <div
                className={
                    "max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center"
                }
            >
                <div
                    className={
                        "w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[40px] sm:mb-[30px]"
                    }
                >
                    <div className={"w-full mb-5 md:mb-11"}>
                        <Stepper.Progress />
                    </div>
                    <h2 className={"text-white/70 text-sm font-medium text-center"}>
                        {t('funnel.ethnicityStep.subtitle')}
                    </h2>
                    <p className={"text-white text-[18px] font-bold text-center mb-5 md:mb-[25px]"}>
                        {t('funnel.ethnicityStep.title')}
                    </p>
                    <div className={"w-full px-8 flex flex-col gap-[10px]"}>
                        <div className={"grid grid-cols-2 gap-[10px]"}>
                            {ethnicity.slice(0, 4).map((item) => (
                                <ImageCard
                                    key={item.id}
                                    image={item.image}
                                    isActive={character_ethnicity === item.value}
                                    onClick={() => onSelectEthnicity(item.value)}
                                    className={"w-full h-auto aspect-square"}
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                        <div className={"flex justify-center"}>
                            <div className={"w-1/2"}>
                                {ethnicity.slice(4, 5).map((item) => (
                                    <ImageCard
                                        key={item.id}
                                        image={item.image}
                                        isActive={character_ethnicity === item.value}
                                        onClick={() => onSelectEthnicity(item.value)}
                                        className={"w-full h-auto aspect-square"}
                                    >
                                        <ImageCard.Image />
                                        <ImageCard.Name />
                                        <ImageCard.Overlay />
                                    </ImageCard>
                                ))}
                            </div>
                        </div>
                    </div>
                    {form.formState.errors.ethnicity && (
                        <div className={"text-red-500 text-sm font-medium text-center mt-2"}>
                            {form.formState.errors.ethnicity.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-5 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">{t('funnel.ethnicityStep.continue')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}