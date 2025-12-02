import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStepperContext } from "@/components/stepper/Stepper.context";

export default function StepperProgress() {
    const { prevStep, value, max, startingStep = 0 } = useStepperContext();
    
    const actualSteps = max - startingStep;
    const currentProgress = value - startingStep;
    const percentValue = (currentProgress * 100) / actualSteps;
    
    const isAtStart = value <= startingStep;
    
    return (
        <div className={"w-full"}>
            <div className={"flex items-center gap-2.5"}>
                {!isAtStart && (
                    <Button 
                        className={"size-[34px] bg-white/10 hover:bg-white/20"} 
                        onClick={prevStep}
                    >
                        <ChevronLeft className={"size-6"} />
                    </Button>
                )}
                <div className={"flex-1 flex flex-col items-center justify-center gap-3.5"}>
                    <p className={"text-white/50 text-[13px] font-bold"}>Create AI Girlfriend</p>
                    <Progress value={percentValue} max={100} />
                </div>
            </div>
        </div>
    );
}