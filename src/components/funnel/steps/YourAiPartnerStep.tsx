import { clsx } from "clsx";

import Stepper from "@/components/stepper";
import { Button } from "@/components/ui/button";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import StepWrapper from "@/components/StepWrapper";
import SpriteIcon from "@/components/SpriteIcon";
import { usePostHog } from "posthog-js/react";

export function YourAiPartnerStep() {
    const { nextStep } = useStepperContext();
    const posthog = usePostHog();

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-4 md:mb-[30px]">
                        <Stepper.Progress />
                    </div>

                    <div className="relative w-full h-auto aspect-square rounded-[10px]">
                        <div className="flex flex-col items-center justify-center relative z-3">
                            <SpriteIcon src={"/images/logo-xl.png"} targetW={120} targetH={120} />

                            <p className="text-white text-2xl font-bold text-center mt-[-8px] md:mt-0 mb-5 md:mb-[38px] capitalize">
                                Your AI partner will never <br />
                                turn down on you
                            </p>

                            <p className="w-9/10 mb-4 text-white text-base font-medium text-center">
                                It will always be there for you. Every desire down to the boldest
                                fantasy is fulfilled exactly as you imagine.
                            </p>

                            <p className="w-9/10 mb-[20px] text-white text-base font-medium text-center">
                                No lies, no ghosting, no cheating... unless its your kink and you
                                want it ;)
                            </p>

                            <div className="w-full relative flex flex-col items-center flex-1">
                                <div className="w-full flex flex-col items-center relative z-2">
                                    <SpriteIcon
                                        src={"/images/banners/your-ai-partner.webp"}
                                        targetW={292}
                                        targetH={415}
                                        fit="contain"
                                        frame
                                        center={false}
                                        imageClassName="translucent-image-mask"
                                    />

                                    <div
                                        className={clsx(
                                            "w-full flex items-center justify-center",
                                            "px-[15px] sm:px-0 p-5",
                                            "sm:bg-transparent",
                                            "fixed bottom-0 left-0  sm:absolute sm:bottom-10",
                                            "z-100",
                                        )}
                                    >
                                        <div className="max-w-[450px] w-full">
                                            <Button
                                                onClick={() => {
                                                    if (typeof window !== "undefined") {
                                                        posthog?.capture("create_companion_button_clicked");
                                                    }
                                                    nextStep();
                                                }}
                                                className="w-full h-[45px] bg-primary-gradient flex items-center justify-center gap-2"
                                            >
                                                <img
                                                    src="/icons/wand-solid-sharp.svg"
                                                    alt="Voice Icon"
                                                    width={22}
                                                    height={22}
                                                    className="w-[22px] h-[22px] invert brightness-0"
                                                />
                                                <span className="text-base font-bold">
                                                    Create my AI girlfriend
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={clsx(
                                        "absolute inset-0 z-1 blur-[124px] opacity-27",
                                        "bg-[conic-gradient(from_0deg_at_center,_#FF437A,_#FB6731,_#FF437A)]",
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}

export default YourAiPartnerStep;