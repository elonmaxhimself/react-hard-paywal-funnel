"use client";

import { clsx } from "clsx";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import SpriteIcon from "@/components/SpriteIcon";
import { FLAGS_LANGUAGE_SUPPORT } from "@/constants/flagsLanguageSupport";

export function LanguageSupportStep() {
    const { nextStep } = useStepperContext();

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center">
                    <div className="w-full mb-5 md:mb-[60px]">
                        <Stepper.Progress />
                    </div>

                    <h2 className="text-white text-[24px] font-bold mb-[15px] text-center">
                        Our AI Supports 20+ Languages
                    </h2>
                    <p className="text-white/70 text-sm font-medium text-center mb-[15px] first-letter:uppercase">
                        millions of users around the globe use it to improve their communication
                        skills and foreign languages in real life
                    </p>

                    <div className="w-full h-auto aspect-square flex flex-col items-center justify-end relative">
                        <SpriteIcon
                            src={"/images/backgrounds/Ellipse.svg"}
                            targetW={286}
                            targetH={286}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[0]"
                            fit="contain"
                            frame
                        />
                        <SpriteIcon
                            src={"/images/backgrounds/Ellipse.svg"}
                            targetW={202}
                            targetH={202}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[0]"
                            fit="contain"
                            frame
                        />

                        <SpriteIcon
                            src={"/images/logo-xl.png"}
                            targetW={130}
                            targetH={130}
                            className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-[2]"
                            fit="cover"
                            frame
                        />

                        {FLAGS_LANGUAGE_SUPPORT.map(({ src, w, h, posClass }, i) => (
                            <div key={i} className={`absolute z-[2] ${posClass}`}>
                                <SpriteIcon
                                    src={src}
                                    targetW={w}
                                    targetH={h}
                                    fit="cover"
                                    frame
                                    imageClassName="rounded-full"
                                />
                            </div>
                        ))}

                        <div
                            className={clsx(
                                "absolute z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                                "w-4/10 h-4/10 blur-[87px] rounded-full",
                                "bg-[conic-gradient(from_0deg_at_center,_#FF437A,_#FB6731,_#FF437A)]",
                            )}
                        />
                    </div>
                </div>

                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 sm:static fixed bottom-0 left-0 z-100">
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

export default LanguageSupportStep;
