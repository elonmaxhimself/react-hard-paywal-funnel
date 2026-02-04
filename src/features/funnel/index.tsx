// src/features/funnel/index.tsx
import { FormProvider } from "react-hook-form";

import Stepper from "@/components/stepper";
import { useFunnelForm } from "@/hooks/funnel/useFunnelForm";
import { StartFunnelStep } from "@/components/funnel/steps/StartFunnelStep";
import SocialProofStep from "@/components/funnel/steps/SocialProofStep";
import { ConnectionStep } from "@/components/funnel/steps/ConnectionStep";
import { AssistantStep } from "@/components/funnel/steps/AssistantStep";
import { CharacterStyleStep } from "@/components/funnel/steps/CharacterStyleStep";
import { PreferredAgeStep } from "@/components/funnel/steps/PreferredAgeStep";
import { UserAgeStep } from "@/components/funnel/steps/UserAgeStep";
import { HappyUsersStep } from "@/components/funnel/steps/HappyUserStep";
import { CharacterAgeStep } from "@/components/funnel/steps/CharacterAgeStep";
import { PreferredRelationshipStep } from "@/components/funnel/steps/PreferredRelationshipStep";
import { UniqueCompanionStep } from "@/components/funnel/steps/UniqueCompanionStep";
import { PersonalityTraitsStep } from "@/components/funnel/steps/PersonalityTraitsStep";
import { InterestsStep } from "@/components/funnel/steps/InterestsStep";
import { ForeignLanguageStep } from "@/components/funnel/steps/ForeignLanguageStep";
import { LanguageSupportStep } from "@/components/funnel/steps/LanguageSupportStep";
import { EthnicityStep } from "@/components/funnel/steps/EthnicityStep";
import { YourTypeStep } from "@/components/funnel/steps/YourTypeStep";
import { SpicyCustomContentStep } from "@/components/funnel/steps/SpicyCustomContentStep";
import { CompanyContentCommentStep } from "@/components/funnel/steps/CompanyContentCommentStep";
import { BodyTypeStep } from "@/components/funnel/steps/BodyTypeStep";
import { BreastTypeStep } from "@/components/funnel/steps/BreastTypeStep";
import AlmostThereStep from "@/components/funnel/steps/AlmostThereStep";
import AuthStep from "@/components/funnel/steps/AuthStep";
import { ButtTypeStep } from "@/components/funnel/steps/ButtTypeStep";
import { DirtyTalksStep } from "@/components/funnel/steps/DirtyTalksStep";
import DreamCompanionStep from "@/components/funnel/steps/DreamCompanionStep";
import { EyesColorStep } from "@/components/funnel/steps/EyesColorStep";
import { HaircutStyleStep } from "@/components/funnel/steps/HaircutStyleStep";
import LoaderStep from "@/components/funnel/steps/LoaderStep";
import { LonelinessStep } from "@/components/funnel/steps/LonelinessStep";
import PaymentFormStep from "@/components/funnel/steps/PaymentFormStep";
import ReceivePhotosStep from "@/components/funnel/steps/ReceivePhotosStep";
import { ReceiveVideoCallsStep } from "@/components/funnel/steps/ReceiveVideoCallsStep";
import ReceiveVideoStep from "@/components/funnel/steps/ReceiveVideoStep";
import ReceiveVoiceMessagesStep from "@/components/funnel/steps/ReceiveVoiceMessagesStep";
import { RelationshipStep } from "@/components/funnel/steps/RelationshipStep";
import { SelectVoiceStep } from "@/components/funnel/steps/SelectVoiceStep";
import SubscriptionStep from "@/components/funnel/steps/SubscriptionStep";
import { TurnsOfYouStep } from "@/components/funnel/steps/TurnsOfYouStep";
import { WantToTryStep } from "@/components/funnel/steps/WantToTryStep";
import { WhatTurnsOffInDatingStep } from "@/components/funnel/steps/WhatTurnsOffInDatingStep";
import YourAiPartnerStep from "@/components/funnel/steps/YourAiPartnerStep";
import FinalOfferModal from "@/components/modals/FinalOfferModal";
import FinalOfferUnlockedModal from "@/components/modals/FinalOfferUnlockedModal";
import SecretOfferModal from "@/components/modals/SecretOfferModal";
import ShowVideoModal from "@/components/modals/ShowVideoModal";
import SpecialOfferModal from "@/components/modals/SpecialOfferModal";

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

                        {/* Step 3 */}
                        <Stepper.Content>
                            <ConnectionStep />
                        </Stepper.Content>

                        {/* Step 4 */}
                        <Stepper.Content>
                            <AssistantStep />
                        </Stepper.Content>

                        {/* Step 5 */}
                        <Stepper.Content>
                            <CharacterStyleStep />
                        </Stepper.Content>
                        
                        {/* Step 6 */}
                        <Stepper.Content>
                            <PreferredAgeStep />
                        </Stepper.Content>

                        {/* Step 7 */}
                        <Stepper.Content>
                            <UserAgeStep />
                        </Stepper.Content>

                        {/* Step 8 */}
                        <Stepper.Content>
                            <HappyUsersStep />
                        </Stepper.Content>

                        {/* Step 9 */}
                        <Stepper.Content>
                            <CharacterAgeStep />
                        </Stepper.Content>

                        {/* Step 10 */}
                        <Stepper.Content>
                            <PreferredRelationshipStep />
                        </Stepper.Content>

                        {/* Step 11 */}
                        <Stepper.Content>
                            <UniqueCompanionStep />
                        </Stepper.Content>

                        {/* Step 12 */}
                        <Stepper.Content>
                            <PersonalityTraitsStep />
                        </Stepper.Content>

                        {/* Step 13 */}
                        <Stepper.Content>
                            <InterestsStep />
                        </Stepper.Content>

                        {/* Step 14 */}
                        <Stepper.Content>
                            <ForeignLanguageStep />
                        </Stepper.Content>

                        {/* Step 15 */}
                        <Stepper.Content>
                            <LanguageSupportStep />
                        </Stepper.Content>

                        {/* Step 16 */}
                        <Stepper.Content>
                            <EthnicityStep />
                        </Stepper.Content>

                        {/* Step 17 */}
                        <Stepper.Content>
                            <YourTypeStep />
                        </Stepper.Content>

                        {/* Step 18 */}
                        <Stepper.Content>
                            <SpicyCustomContentStep />
                        </Stepper.Content>

                        {/* Step 19 */}
                        <Stepper.Content>
                            <CompanyContentCommentStep />
                        </Stepper.Content>

                                                {/* Step 20 */}
                                                <Stepper.Content>
                            <BodyTypeStep />
                        </Stepper.Content>

                        {/* Step 21 */}
                        <Stepper.Content>
                            <BreastTypeStep />
                        </Stepper.Content>

                        {/* Step 22 */}
                        <Stepper.Content>
                            <ButtTypeStep />
                        </Stepper.Content>

                        {/* Step 23 */}
                        <Stepper.Content>
                            <EyesColorStep />
                        </Stepper.Content>

                        {/* Step 24 */}
                        <Stepper.Content>
                            <HaircutStyleStep />
                        </Stepper.Content>

                        {/* Step 25 */}
                        <Stepper.Content>
                            <AlmostThereStep />
                        </Stepper.Content>

                        {/* Step 26 */}
                        <Stepper.Content>
                            <RelationshipStep />
                        </Stepper.Content>

                        {/* Step 27 */}
                        <Stepper.Content>
                            <TurnsOfYouStep />
                        </Stepper.Content>

                        {/* Step 28 */}
                        <Stepper.Content>
                            <WantToTryStep />
                        </Stepper.Content>

                        {/* Step 29 */}
                        <Stepper.Content>
                            <DirtyTalksStep />
                        </Stepper.Content>

                        {/* Step 30 */}
                        <Stepper.Content>
                            <SelectVoiceStep />
                        </Stepper.Content>

                        {/* Step 31 */}
                        <Stepper.Content>
                            <WhatTurnsOffInDatingStep />
                        </Stepper.Content>

                        {/* Step 32 */}
                        <Stepper.Content>
                            <LonelinessStep />
                        </Stepper.Content>

                        {/* Step 33 */}
                        <Stepper.Content>
                            <YourAiPartnerStep />
                        </Stepper.Content>

                        {/* Step 34 */}
                        <Stepper.Content>
                            <LoaderStep
                                mainLoaderProps={{
                                    initialCountdown: 0,
                                    maxCountdown: 23,
                                    speed: 85,
                                }}
                                preferencesLoaderProps={{
                                    initialCountdown: 0,
                                    maxCountdown: 50,
                                    speed: 39,
                                }}
                                uncensoredLoaderProps={{
                                    initialCountdown: 0,
                                    maxCountdown: 33,
                                    speed: 60,
                                }}
                                finalLoaderProps={{
                                    initialCountdown: 0,
                                    maxCountdown: 25,
                                    speed: 90,
                                }}
                            />
                        </Stepper.Content>

                        {/* Step 35 */}
                        <Stepper.Content>
                            <ReceivePhotosStep />
                        </Stepper.Content>

                        {/* Step 36 */}
                        <Stepper.Content>
                            <LoaderStep
                                mainLoaderProps={{
                                    initialCountdown: 24,
                                    maxCountdown: 51,
                                    speed: 85,
                                }}
                                preferencesLoaderProps={{
                                    initialCountdown: 50,
                                    maxCountdown: 100,
                                    speed: 39,
                                }}
                                uncensoredLoaderProps={{
                                    initialCountdown: 34,
                                    maxCountdown: 67,
                                    speed: 60,
                                }}
                                finalLoaderProps={{
                                    initialCountdown: 25,
                                    maxCountdown: 51,
                                    speed: 90,
                                }}
                            />
                        </Stepper.Content>

                        {/* Step 37 */}
                        <Stepper.Content>
                            <ReceiveVoiceMessagesStep />
                        </Stepper.Content>

                        {/* Step 38 */}
                        <Stepper.Content>
                            <LoaderStep
                                mainLoaderProps={{
                                    initialCountdown: 52,
                                    maxCountdown: 78,
                                    speed: 80,
                                }}
                                preferencesLoaderProps={{
                                    initialCountdown: 100,
                                    maxCountdown: 100,
                                    speed: 39,
                                }}
                                uncensoredLoaderProps={{
                                    initialCountdown: 68,
                                    maxCountdown: 100,
                                    speed: 60,
                                }}
                                finalLoaderProps={{
                                    initialCountdown: 52,
                                    maxCountdown: 78,
                                    speed: 90,
                                }}
                            />
                        </Stepper.Content>

                        {/* Step 39 */}
                        <Stepper.Content>
                            <ReceiveVideoStep />
                        </Stepper.Content>

                        {/* Step 40 */}
                        <Stepper.Content>
                            <LoaderStep
                                mainLoaderProps={{
                                    initialCountdown: 79,
                                    maxCountdown: 99,
                                    speed: 85,
                                }}
                                preferencesLoaderProps={{
                                    initialCountdown: 100,
                                    maxCountdown: 100,
                                    speed: 39,
                                }}
                                uncensoredLoaderProps={{
                                    initialCountdown: 100,
                                    maxCountdown: 100,
                                    speed: 60,
                                }}
                                finalLoaderProps={{
                                    initialCountdown: 78,
                                    maxCountdown: 100,
                                    speed: 90,
                                }}
                            />
                        </Stepper.Content>

                        {/* Step 41 */}
                        <Stepper.Content>
                            <ReceiveVideoCallsStep />
                        </Stepper.Content>

                        {/* Step 42 */}
                        <Stepper.Content>
                            <DreamCompanionStep />
                        </Stepper.Content>

                        {/* Step 43 */}
                        <Stepper.Content>
                            <AuthStep />
                        </Stepper.Content>

                        {/* Step 44 */}
                        <Stepper.Content>
                            <SubscriptionStep />
                        </Stepper.Content>

                        {/* Step 45 */}
                        <Stepper.Content>
                            <PaymentFormStep />
                        </Stepper.Content>
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