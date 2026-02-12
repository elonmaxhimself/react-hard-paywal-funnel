import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { characterAge } from "@/constants/character-age";

export function CharacterAgeStep() {
    const { t } = useTranslation();
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const character_age = form.watch("age");

    const onSelectCharacterAge = (age: string) => {
        form.setValue("age", age);
        nextStep();
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
                        "w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]"
                    }
                >
                    <div className={"w-full mb-5 md:mb-11"}>
                        <Stepper.Progress />
                    </div>
                    <h2
                        className={"text-white text-lg font-bold mb-[10px] md:mb-[15px] capitalize"}
                    >
                        {t('funnel.characterAgeStep.title')}
                    </h2>
                    <p className="text-white/70 text-sm font-medium text-center mb-[35px] first-letter:uppercase">
                        {t('funnel.characterAgeStep.subtitle')}
                    </p>
                    <div className={"w-full grid grid-cols-2 gap-[10px]"}>
                        {characterAge.map((age) => (
                            <ImageCard
                                key={age.id}
                                image={age.image}
                                isActive={character_age === age.value}
                                onClick={() => onSelectCharacterAge(age.value)}
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
        </StepWrapper>
    );
}