import { clsx } from "clsx";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";

import { reviews } from "@/constants/reviews";
import SpriteIcon from "@/components/SpriteIcon";

export function CompanyContentCommentStep() {
    const { nextStep } = useStepperContext();

    const review = reviews[1];

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
                    <div className={"w-full mb-10 md:mb-[92px]"}>
                        <Stepper.Progress />
                    </div>
                    <div className={"relative w-full rounded-[10px] overflow-hidden"}>
                        <div
                            className={
                                "w-full h-full px-[20px] py-[25px] flex flex-col items-center justify-center relative z-3"
                            }
                        >
                            <p
                                className={
                                    "w-9/10 text-white text-base font-medium text-center mb-[35px]"
                                }
                            >
                                {review.description}
                            </p>
                            <div
                                className={clsx(
                                    "w-full rounded-[10px] pt-[14px] px-[14px] pb-[20px]",
                                    "bg-linear-to-b from-white to-[#ffe3ec]/70",
                                )}
                            >
                                <div className={"flex flex-col gap-[16px]"}>
                                    <div className={"w-full flex items-center gap-[14px]"}>
                                        <SpriteIcon
                                            src={review.avatar}
                                            targetW={50}
                                            targetH={50}
                                            fit="cover"
                                            frame
                                            imageClassName="rounded-full"
                                        />
                                        <div>
                                            <div className={"text-[17px] font-medium"}>
                                                {review.name}
                                            </div>
                                            <div className={"flex"}>
                                                {Array.from({ length: review.rating }).map(
                                                    (_, i) => (
                                                        <img
                                                            key={i}
                                                            src="/icons/rating-star.svg"
                                                            alt="ratingStar"
                                                            width={16}
                                                            height={16}
                                                            className="inline-block"
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={"w-full text-sm text-black-2 font-medium"}>
                                        {review.message}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={"absolute inset-0 z-2 blur-[87px] bg-white/5"} />
                        <div
                            className={clsx(
                                "absolute z-1 top-0 left-0 top-[50%] left-[50%] -translate-[50%]",
                                "w-4/10 h-4/10 blur-[87px] rounded-full",
                                "bg-[conic-gradient(from_0deg_at_center,_#FF437A,_#FB6731,_#FF437A)]",
                            )}
                        />
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