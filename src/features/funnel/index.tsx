// src/features/funnel/index.tsx
import { FormProvider } from "react-hook-form";

import Stepper from "@/components/stepper";
import { useFunnelForm } from "@/features/funnel/hooks/useFunnelForm";
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
                    </Stepper.Contents>
                </Stepper>
            </div>
        </FormProvider>
    );
}