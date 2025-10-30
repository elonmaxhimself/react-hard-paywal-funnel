import { z } from "zod";

export const funnelV3Schema = z.object({
    // Fields that are part of the generation
    style: z.string().trim().min(1, { message: "Please, choose the character style you prefer" }),
    age: z.string().trim().min(1, { message: "Please, select character age" }),
    personality_traits: z
        .array(z.string())
        .min(1, { message: "Please, select at least one personality trait" }),
    interests: z.array(z.string()).min(1, { message: "Please, select at least one hobby" }),
    ethnicity: z
        .string()
        .trim()
        .min(1, { message: "Please, select ethnicity for your AI companion" }),
    your_type: z
        .array(z.string())
        .min(1, { message: "Please, select at least one type that excites you" }),
    body: z.string().trim().min(1, { message: "Please, choose the character body type" }),
    breast_type: z.string().trim().min(1, { message: "Please, choose the character breast type" }),
    breast_size: z.string().trim().min(1, { message: "Please, choose the character breast type" }),
    butt: z.string().trim().min(1, { message: "Please, choose the character butt type" }),
    eyes: z.string().trim().min(1, { message: "Please, choose the character eyes color" }),
    hair_style: z
        .string()
        .trim()
        .min(1, { message: "Please, select preferred companion haircut style" }),
    hair_color: z
        .string()
        .trim()
        .min(1, { message: "Please, select preferred companion haircut color" }),
    character_relationship: z
        .string()
        .trim()
        .min(1, { message: "Please, select preferred relationship" }),
    scenario: z.string().trim().min(1, { message: "Please select a scenario for your companion." }),
    characterPrompt: z
        .string()
        .trim()
        .min(1, { message: "Please describe your companion’s personality or role." }),
    greeting: z
        .string()
        .trim()
        .min(1, { message: "Please enter a greeting your companion will say." }),
    clothes: z
        .string()
        .trim()
        .min(1, { message: "Please choose an outfit or clothing style for your companion." }),
    turns_of_you: z.array(z.string()).min(1, { message: "Please, select preferred turns on you" }),
    want_to_try: z
        .array(z.string())
        .min(1, { message: "Please, select what do you want to try with your AI partner" }),
    voice: z.string().trim().min(1, { message: "Please, choose the character voice" }),

    // Fields for user engagement
    connections: z
        .array(z.string())
        .min(1, { message: "Please, select what connection are you up for" }),
    preferred_age: z
        .string()
        .trim()
        .min(1, { message: "Please, select preferred age range for you" }),
    user_age: z.string().trim().min(1, { message: "Please, select your age" }),
    preferred_relationship: z
        .string()
        .trim()
        .min(1, { message: "Please, select preferred relationship" }),
    practiceForeignLanguage: z.boolean(),
    receiveSpicyContent: z.boolean().refine((val) => val !== undefined, {
        message: "Please, make your choice"
    }),
    dirtyTalks: z.boolean().refine((val) => val !== undefined, {
        message: "Please, make your choice"
    }),
    turns_off_in_dating: z
        .array(z.string())
        .min(1, { message: "Please, select what turns off are you in dating" }),
    experience_filings_of_loneliness: z
        .string()
        .trim()
        .min(1, { message: "Please, choose your experience" }),
    receiveCustomPhotos: z.boolean(),
    receiveVoiceMessages: z.boolean(),
    receiveCustomVideos: z.boolean(),
    receiveVideoCalls: z.boolean(),

    // Fields for making payments
    productId: z.number().nullable(),
});
