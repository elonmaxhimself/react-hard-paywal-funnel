import { z } from "zod";
import type { TFunction } from "i18next";

export const createFunnelSchema = (t: TFunction) =>
    z.object({
        // Fields that are part of the generation
        style: z.string().trim().min(1, { message: t("validation.funnel.style") }),
        age: z.string().trim().min(1, { message: t("validation.funnel.age") }),
        personality_traits: z
            .array(z.string())
            .min(1, { message: t("validation.funnel.personalityTraits") }),
        interests: z.array(z.string()).min(1, { message: t("validation.funnel.interests") }),
        ethnicity: z
            .string()
            .trim()
            .min(1, { message: t("validation.funnel.ethnicity") }),
        your_type: z
            .array(z.string())
            .min(1, { message: t("validation.funnel.yourType") }),
        body: z.string().trim().min(1, { message: t("validation.funnel.body") }),
        breast_type: z.string().trim().min(1, { message: t("validation.funnel.breastType") }),
        breast_size: z.string().trim().min(1, { message: t("validation.funnel.breastSize") }),
        butt: z.string().trim().min(1, { message: t("validation.funnel.butt") }),
        eyes: z.string().trim().min(1, { message: t("validation.funnel.eyes") }),
        hair_style: z
            .string()
            .trim()
            .min(1, { message: t("validation.funnel.hairStyle") }),
        hair_color: z
            .string()
            .trim()
            .min(1, { message: t("validation.funnel.hairColor") }),
        character_relationship: z
            .string()
            .trim()
            .min(1, { message: t("validation.funnel.characterRelationship") }),
        scenario: z.string().trim().min(1, { message: t("validation.funnel.scenario") }),
        characterPrompt: z
            .string()
            .trim()
            .min(1, { message: t("validation.funnel.characterPrompt") }),
        greeting: z
            .string()
            .trim()
            .min(1, { message: t("validation.funnel.greeting") }),
        clothes: z
            .string()
            .trim()
            .min(1, { message: t("validation.funnel.clothes") }),
        turns_of_you: z
            .array(z.string())
            .min(1, { message: t("validation.funnel.turnsOfYou") }),
        want_to_try: z
            .array(z.string())
            .min(1, { message: t("validation.funnel.wantToTry") }),
        voice: z.string().trim().min(1, { message: t("validation.funnel.voice") }),

        // Fields for user engagement
        connections: z
            .array(z.string())
            .min(1, { message: t("validation.funnel.connections") }),
        preferred_age: z
            .string()
            .trim()
            .min(1, { message: t("validation.funnel.preferredAge") }),
        user_age: z.string().trim().min(1, { message: t("validation.funnel.userAge") }),
        preferred_relationship: z
            .string()
            .trim()
            .min(1, { message: t("validation.funnel.preferredRelationship") }),
        practiceForeignLanguage: z.boolean(),
        receiveSpicyContent: z.boolean().refine((val) => val !== undefined, {
            message: t("validation.funnel.makeYourChoice"),
        }),
        dirtyTalks: z.boolean().refine((val) => val !== undefined, {
            message: t("validation.funnel.makeYourChoice"),
        }),
        turns_off_in_dating: z
            .array(z.string())
            .min(1, { message: t("validation.funnel.turnsOffInDating") }),
        experience_filings_of_loneliness: z
            .string()
            .trim()
            .min(1, { message: t("validation.funnel.experienceLoneliness") }),
        receiveCustomPhotos: z.boolean(),
        receiveVoiceMessages: z.boolean(),
        receiveCustomVideos: z.boolean(),
        receiveVideoCalls: z.boolean(),

        // Fields for making payments
        productId: z.number().nullable(),
    });
