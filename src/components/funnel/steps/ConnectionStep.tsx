import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Stepper from "@/components/stepper";
import CheckboxField from "@/components/funnel/fields/CheckboxField";
import StepWrapper from "@/components/StepWrapper";
import { Button } from "@/components/ui/button";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import { useConnections } from "@/constants/connections";

export function ConnectionStep() {
    const { t } = useTranslation();
    const connections = useConnections()
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const personality_connections = form.watch("connections");

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
                    <h2 className={"text-white text-lg font-bold mb-5 md:mb-[30px] capitalize"}>
                        {t('funnel.connectionStep.title')}
                    </h2>
                    <div className={"w-full flex flex-col items-center justify-center gap-[10px]"}>
                        {connections.map((connection) => (
                            <CheckboxField
                                key={connection.id}
                                id={connection.value}
                                name={connection.value}
                                label={connection.label}
                                checked={personality_connections.includes(connection.value)}
                                onCheckedChange={() => {
                                    const isSelected = personality_connections.includes(
                                        connection.value,
                                    );
                                    const currentValues = [...personality_connections];
                                    if (isSelected) {
                                        form.setValue(
                                            "connections",
                                            currentValues.filter((val) => val !== connection.value),
                                        );
                                    } else {
                                        form.setValue(
                                            "connections",
                                            [...currentValues, connection.value],
                                            { shouldValidate: true },
                                        );
                                    }
                                }}
                            />
                        ))}
                    </div>
                    {form.formState.errors.connections && (
                        <div className={"text-red-500 text-sm font-medium mt-2"}>
                            {form.formState.errors.connections.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">{t('funnel.connectionStep.continue')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}