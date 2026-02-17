import type { ReactNode } from "react";

import AuthStep from "@/components/funnel/steps/AuthStep";
import { AssistantStep } from "@/components/funnel/steps/AssistantStep";
import AlmostThereStep from "@/components/funnel/steps/AlmostThereStep";
import { BodyTypeStep } from "@/components/funnel/steps/BodyTypeStep";
import { BreastTypeStep } from "@/components/funnel/steps/BreastTypeStep";
import { ButtTypeStep } from "@/components/funnel/steps/ButtTypeStep";
import { CharacterAgeStep } from "@/components/funnel/steps/CharacterAgeStep";
import { CharacterStyleStep } from "@/components/funnel/steps/CharacterStyleStep";
import { CompanyContentCommentStep } from "@/components/funnel/steps/CompanyContentCommentStep";
import { ConnectionStep } from "@/components/funnel/steps/ConnectionStep";
import { DirtyTalksStep } from "@/components/funnel/steps/DirtyTalksStep";
import DreamCompanionStep from "@/components/funnel/steps/DreamCompanionStep";
import { EthnicityStep } from "@/components/funnel/steps/EthnicityStep";
import { EyesColorStep } from "@/components/funnel/steps/EyesColorStep";
import { ForeignLanguageStep } from "@/components/funnel/steps/ForeignLanguageStep";
import { HaircutStyleStep } from "@/components/funnel/steps/HaircutStyleStep";
import { HappyUsersStep } from "@/components/funnel/steps/HappyUserStep";
import { InterestsStep } from "@/components/funnel/steps/InterestsStep";
import { LanguageSupportStep } from "@/components/funnel/steps/LanguageSupportStep";
import LoaderStep from "@/components/funnel/steps/LoaderStep";
import { LonelinessStep } from "@/components/funnel/steps/LonelinessStep";
import PaymentFormStep from "@/components/funnel/steps/PaymentFormStep";
import { PersonalityTraitsStep } from "@/components/funnel/steps/PersonalityTraitsStep";
import { PreferredAgeStep } from "@/components/funnel/steps/PreferredAgeStep";
import { PreferredRelationshipStep } from "@/components/funnel/steps/PreferredRelationshipStep";
import ReceivePhotosStep from "@/components/funnel/steps/ReceivePhotosStep";
import { ReceiveVideoCallsStep } from "@/components/funnel/steps/ReceiveVideoCallsStep";
import ReceiveVideoStep from "@/components/funnel/steps/ReceiveVideoStep";
import ReceiveVoiceMessagesStep from "@/components/funnel/steps/ReceiveVoiceMessagesStep";
import { RelationshipStep } from "@/components/funnel/steps/RelationshipStep";
import { SelectVoiceStep } from "@/components/funnel/steps/SelectVoiceStep";
import SocialProofStep from "@/components/funnel/steps/SocialProofStep";
import { SpicyCustomContentStep } from "@/components/funnel/steps/SpicyCustomContentStep";
import SubscriptionStep from "@/components/funnel/steps/SubscriptionStep";
import { TurnsOfYouStep } from "@/components/funnel/steps/TurnsOfYouStep";
import { UniqueCompanionStep } from "@/components/funnel/steps/UniqueCompanionStep";
import { UserAgeStep } from "@/components/funnel/steps/UserAgeStep";
import { WantToTryStep } from "@/components/funnel/steps/WantToTryStep";
import { WhatTurnsOffInDatingStep } from "@/components/funnel/steps/WhatTurnsOffInDatingStep";
import { YourTypeStep } from "@/components/funnel/steps/YourTypeStep";
import YourAiPartnerStep from "@/components/funnel/steps/YourAiPartnerStep";

export const funnelSteps: ReactNode[] = [
    <SocialProofStep />,
    <ConnectionStep />,
    <AssistantStep />,
    <CharacterStyleStep />,
    <PreferredAgeStep />,
    <UserAgeStep />,
    <HappyUsersStep />,
    <CharacterAgeStep />,
    <PreferredRelationshipStep />,
    <UniqueCompanionStep />,
    <PersonalityTraitsStep />,
    <InterestsStep />,
    <ForeignLanguageStep />,
    <LanguageSupportStep />,
    <EthnicityStep />,
    <YourTypeStep />,
    <SpicyCustomContentStep />,
    <CompanyContentCommentStep />,
    <BodyTypeStep />,
    <BreastTypeStep />,
    <ButtTypeStep />,
    <EyesColorStep />,
    <HaircutStyleStep />,
    <AlmostThereStep />,
    <RelationshipStep />,
    <TurnsOfYouStep />,
    <WantToTryStep />,
    <DirtyTalksStep />,
    <SelectVoiceStep />,
    <WhatTurnsOffInDatingStep />,
    <LonelinessStep />,
    <YourAiPartnerStep />,
    (
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
    ),
    <ReceivePhotosStep />,
    (
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
    ),
    <ReceiveVoiceMessagesStep />,
    (
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
    ),
    <ReceiveVideoStep />,
    (
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
    ),
    <ReceiveVideoCallsStep />,
    <DreamCompanionStep />,
    <AuthStep />,
    <SubscriptionStep />,
    <PaymentFormStep />,
];

