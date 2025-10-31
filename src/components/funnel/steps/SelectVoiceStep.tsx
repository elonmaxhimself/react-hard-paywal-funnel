import { useFormContext } from "react-hook-form";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import VoiceField from "@/components/funnel/fields/VoiceField";
import { Button } from "@/components/ui/button";

import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import { characterVoices } from "@/constants/character-voices";

export function SelectVoiceStep() {
    const { nextStep } = useStepperContext();

    const form = useFormContext<FunnelSchema>();

    const character_voice = form.watch("voice");

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
                            "text-white text-lg font-bold mb-5 md:mb-[30px] text-center capitalize"
                        }
                    >
                        How do you want you partner to sound like?
                    </h2>
                    <h2 className={"text-white/70 text-base font-medium mb-[28px] text-center"}>
                        Dream Companion’s cutting-edge voice AI delivers the most lifelike, engaging
                        conversations, letting you dive deep into spicy, immersive chats with your
                        perfect AI partner. Experience every whisper and word crafted to your
                        desires—connection so real, it feels electric.
                    </h2>
                    <div className={"w-full grid grid-cols-2 gap-[10px]"}>
                        {characterVoices.map((voice) => (
                            <VoiceField
                                key={voice.id}
                                id={voice.value}
                                label={voice.label}
                                voiceUrl={voice.voiceUrl}
                                checked={character_voice === voice.value}
                                onCheckedChange={() =>
                                    form.setValue("voice", voice.value, { shouldValidate: true })
                                }
                            />
                        ))}
                    </div>
                    {form.formState.errors.voice && (
                        <div className={"text-red-500 text-sm font-medium mt-2"}>
                            {form.formState.errors.voice.message}
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
