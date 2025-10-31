import { clsx } from "clsx";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import SpriteIcon from "@/components/SpriteIcon";
import { AVATARS_HAPPY_USERS } from "@/constants/avatars-happy-users";

export function HappyUsersStep() {
    const { nextStep } = useStepperContext();

    return (
        <StepWrapper>
            <div className="max-w-[400px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-11">
                        <Stepper.Progress />
                    </div>

                    <h2 className="text-white text-[32px] font-bold mb-[10px] md:mb-[15px]">
                        Great!
                    </h2>

                    <p className="text-white/70 text-sm font-medium text-center mb-[10px] md:mb-[15px]">
                        That's how many happy users in your age use our platform to fulfill their
                        desires
                    </p>

                    <div className="w-full h-auto aspect-square flex flex-col items-center justify-end relative">
                        <img
                            src="/images/backgrounds/happy_users_bg.webp"
                            alt="happy users"
                            width={400}
                            height={400}
                            className="absolute inset-0"
                        />

                        <SpriteIcon
                            src="/images/logo-xl.png"
                            targetW={150}
                            targetH={150}
                            className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[30%] z-[2]"
                        />

                        {AVATARS_HAPPY_USERS.map(({ src, w, h, posClass, imageClass }, i) => (
                            <div
                                key={`${src}-${i}`}
                                className={clsx(
                                    "absolute z-[2] p-[1px] rounded-full bg-white-gradient",
                                    posClass,
                                )}
                            >
                                <SpriteIcon
                                    src={src}
                                    targetW={w}
                                    targetH={h}
                                    fit="cover"
                                    frame
                                    imageClassName={imageClass}
                                />
                            </div>
                        ))}

                        <p className="text-white text-[24px] uppercase font-bold relative mb-[10px] z-[2]">
                            <span className="text-transparent bg-clip-text bg-primary-gradient">
                                3M+
                            </span>{" "}
                            happy users
                        </p>

                        <div
                            className={clsx(
                                "absolute z-1 top-[50%] left-[50%] -translate-[50%]",
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

export default HappyUsersStep;