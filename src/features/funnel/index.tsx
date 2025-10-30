// src/features/funnel/index.tsx
import { FormProvider } from "react-hook-form";

import Stepper from "@/components/stepper";
import { useFunnelForm } from "@/features/funnel/hooks/useFunnelForm";
import { StartFunnelStep } from "./components/steps/StartFunnelStep";
import SocialProofStep from "./components/steps/SocialProofStep";

export default function FunnelView() {
    const { form, stepper, isReady } = useFunnelForm();

    if (!isReady) return null;

    return (
        <FormProvider {...form}>
            <div className="w-full">
                <Stepper {...stepper}>
                    <Stepper.Contents>
                        {/* Step 1 */}
                        <Stepper.Content>
                            <StartFunnelStep />
                        </Stepper.Content>
                        
                        {/* Step 2 */}
                        <Stepper.Content>
                            <SocialProofStep />
                        </Stepper.Content>
                    </Stepper.Contents>
                </Stepper>
            </div>
        </FormProvider>
    );
}