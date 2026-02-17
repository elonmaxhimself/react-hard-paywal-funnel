import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import SpriteIcon from "@/components/SpriteIcon";

export function AssistantStep() {
    const { t } = useTranslation();
    const { nextStep } = useStepperContext();

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className={"w-full mb-[92px]"}>
                        <Stepper.Progress />
                    </div>
                    <div
                        className={
                            "relative w-full h-auto aspect-square rounded-[10px] overflow-hidden"
                        }
                    >
                        <div
                            className={
                                "w-full h-full flex flex-col items-center justify-center relative z-3"
                            }
                        >
                            <SpriteIcon
                                src="/images/logo-xl.png"
                                targetW={80}
                                targetH={80}
                                center
                            />
                            <p
                                className={
                                    "text-white text-lg font-bold text-center mb-[25px] capitalize"
                                }
                            >
                                {t('funnel.assistantStep.title')}
                            </p>
                            <p
                                className={
                                    "w-9/10 text-white text-base font-medium text-center capitalize"
                                }
                            >
                                {t('funnel.assistantStep.subtitle')}
                            </p>
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
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">{t('funnel.assistantStep.continue')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}

export default AssistantStep;