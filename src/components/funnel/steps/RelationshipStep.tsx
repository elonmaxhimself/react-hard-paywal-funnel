import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { characterRelationship } from "@/constants/preferred-relationship";

export function RelationshipStep() {
    const { nextStep } = useStepperContext();

    const form = useFormContext<FunnelSchema>();

    const character_relationship = form.watch("character_relationship");

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
                    <h2 className={"text-white text-lg font-bold mb-5 capitalize"}>
                        Choose Your Relationship
                    </h2>
                    <div className={"w-full flex flex-col items-center gap-2"}>
                        <div className={"w-full grid grid-cols-3 gap-[10px]"}>
                            {characterRelationship.map((relationship) => (
                                <ImageCard
                                    key={relationship.id}
                                    image={relationship.image}
                                    isActive={character_relationship === relationship.value}
                                    onClick={() => {
                                        form.setValue(
                                            "character_relationship",
                                            relationship.value,
                                            { shouldValidate: true },
                                        );
                                        form.setValue("clothes", relationship.clothes);
                                        form.setValue("greeting", relationship.greeting);
                                        form.setValue("scenario", relationship.scenario);
                                        form.setValue(
                                            "characterPrompt",
                                            relationship.characterPrompt,
                                        );
                                    }}
                                    className={"w-full h-auto aspect-square"}
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                    </div>
                    {form.formState.errors.character_relationship && (
                        <div className={"text-red-500 text-sm font-medium mt-2"}>
                            {form.formState.errors.character_relationship.message}
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
