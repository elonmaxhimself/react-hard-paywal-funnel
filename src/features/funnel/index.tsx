import { FormProvider } from "react-hook-form";

import Stepper from "@/components/stepper";
import { useFunnelForm } from "@/hooks/funnel/useFunnelForm";
import { funnelSteps } from "@/features/funnel/funnelSteps";
import FinalOfferModal from "@/components/modals/FinalOfferModal";
import FinalOfferUnlockedModal from "@/components/modals/FinalOfferUnlockedModal";
import SecretOfferModal from "@/components/modals/SecretOfferModal";
import ShowVideoModal from "@/components/modals/ShowVideoModal";
import SpecialOfferModal from "@/components/modals/SpecialOfferModal";
import LanguageSelector from "@/components/LanguageSelector";

export default function FunnelView() {
    const { form, stepper, isReady } = useFunnelForm();

    if (!isReady) return null;

    return (
        <FormProvider {...form}>
            <div className="w-full">
                <div className="absolute top-4 right-4 z-50">
                    <LanguageSelector />
                </div>

                <Stepper {...stepper}>
                    <Stepper.Contents>
                        {funnelSteps.map((StepContent, index) => (
                            <Stepper.Content key={index}>
                                {StepContent}
                            </Stepper.Content>
                        ))}
                    </Stepper.Contents>

                    {/* Modals */}
                    <SecretOfferModal />
                    <FinalOfferModal />
                    <SpecialOfferModal />
                    <FinalOfferUnlockedModal />
                    <ShowVideoModal />
                    
                </Stepper>
            </div>
        </FormProvider>
    );
}