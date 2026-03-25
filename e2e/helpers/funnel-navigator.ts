/**
 * Funnel navigator — helper for stepping through the 44-step funnel.
 *
 * Two strategies:
 *   1. `skipToStep()` — set localStorage directly, instant (for tests that need a specific step)
 *   2. `navigateTo()` — click through steps one by one (for navigation tests)
 */

import { type Page } from '@playwright/test';

// =============================================================================
// Complete form values — represents a fully filled funnel
// =============================================================================

const COMPLETE_FORM_VALUES = {
    style: 'realistic',
    age: '20-25',
    personality_traits: ['funny'],
    interests: ['gaming'],
    ethnicity: 'caucasian',
    your_type: ['cute'],
    body: 'slim',
    breast_type: 'natural',
    breast_size: 'medium',
    butt: 'medium',
    eyes: 'blue',
    hair_style: 'long',
    hair_color: 'blonde',
    character_relationship: 'girlfriend',
    scenario: 'dating',
    characterPrompt: 'A fun companion',
    greeting: 'Hey there!',
    clothes: 'casual',
    turns_of_you: ['humor'],
    want_to_try: ['roleplay'],
    voice: 'seducing',
    connections: ['flirt-and-fun'],
    preferred_age: '20-25',
    user_age: '25-30',
    preferred_relationship: 'casual',
    practiceForeignLanguage: false,
    receiveSpicyContent: true,
    dirtyTalks: true,
    turns_off_in_dating: ['ghosting'],
    experience_filings_of_loneliness: 'sometimes',
    receiveCustomPhotos: true,
    receiveVoiceMessages: true,
    receiveCustomVideos: true,
    receiveVideoCalls: true,
    productId: 105,
};

// =============================================================================
// Step action types for click-through navigation
// =============================================================================

type StepAction =
    | { type: 'continue-btn'; needsSelection?: boolean }
    | { type: 'select-option' }
    | { type: 'auto-loader' }
    | { type: 'skip' }; // auth, subscription, payment — handled separately

/**
 * The 44 funnel steps in order, with the interaction needed to advance.
 */
const STEP_ACTIONS: StepAction[] = [
    /* 0  SocialProofStep */ { type: 'continue-btn' },
    /* 1  ConnectionStep */ { type: 'continue-btn', needsSelection: true },
    /* 2  AssistantStep */ { type: 'continue-btn' },
    /* 3  CharacterStyleStep */ { type: 'select-option' },
    /* 4  PreferredAgeStep */ { type: 'select-option' },
    /* 5  UserAgeStep */ { type: 'select-option' },
    /* 6  HappyUsersStep */ { type: 'continue-btn' },
    /* 7  CharacterAgeStep */ { type: 'select-option' },
    /* 8  PreferredRelationshipStep */ { type: 'select-option' },
    /* 9  UniqueCompanionStep */ { type: 'continue-btn' },
    /* 10 PersonalityTraitsStep */ { type: 'continue-btn', needsSelection: true },
    /* 11 InterestsStep */ { type: 'continue-btn', needsSelection: true },
    /* 12 ForeignLanguageStep */ { type: 'select-option' },
    /* 13 LanguageSupportStep */ { type: 'continue-btn' },
    /* 14 EthnicityStep */ { type: 'continue-btn', needsSelection: true },
    /* 15 YourTypeStep */ { type: 'continue-btn', needsSelection: true },
    /* 16 SpicyCustomContentStep */ { type: 'select-option' },
    /* 17 CompanyContentCommentStep */ { type: 'continue-btn' },
    /* 18 BodyTypeStep */ { type: 'select-option' },
    /* 19 BreastTypeStep */ { type: 'continue-btn', needsSelection: true },
    /* 20 ButtTypeStep */ { type: 'select-option' },
    /* 21 EyesColorStep */ { type: 'select-option' },
    /* 22 HaircutStyleStep */ { type: 'continue-btn', needsSelection: true },
    /* 23 AlmostThereStep */ { type: 'continue-btn' },
    /* 24 RelationshipStep */ { type: 'continue-btn', needsSelection: true },
    /* 25 TurnsOfYouStep */ { type: 'continue-btn', needsSelection: true },
    /* 26 WantToTryStep */ { type: 'continue-btn', needsSelection: true },
    /* 27 DirtyTalksStep */ { type: 'select-option' },
    /* 28 SelectVoiceStep */ { type: 'continue-btn', needsSelection: true },
    /* 29 WhatTurnsOffInDatingStep */ { type: 'continue-btn', needsSelection: true },
    /* 30 LonelinessStep */ { type: 'select-option' },
    /* 31 YourAiPartnerStep */ { type: 'continue-btn' },
    /* 32 LoaderStep #1 */ { type: 'auto-loader' },
    /* 33 ReceivePhotosStep */ { type: 'select-option' },
    /* 34 LoaderStep #2 */ { type: 'auto-loader' },
    /* 35 ReceiveVoiceMessagesStep */ { type: 'select-option' },
    /* 36 LoaderStep #3 */ { type: 'auto-loader' },
    /* 37 ReceiveVideoStep */ { type: 'select-option' },
    /* 38 LoaderStep #4 */ { type: 'auto-loader' },
    /* 39 ReceiveVideoCallsStep */ { type: 'select-option' },
    /* 40 DreamCompanionStep */ { type: 'continue-btn' },
    /* 41 AuthStep */ { type: 'skip' },
    /* 42 SubscriptionStep */ { type: 'skip' },
    /* 43 PaymentFormStep */ { type: 'skip' },
];

// =============================================================================
// FunnelNavigator
// =============================================================================

export class FunnelNavigator {
    private cookieDismissed = false;

    constructor(private page: Page) {}

    // ─── Skip-to methods (instant via localStorage) ─────────────────────

    /**
     * Skip directly to the auth step (step 41) by setting localStorage.
     * Must be called BEFORE page.goto('/').
     */
    async skipToAuth() {
        await this.setFunnelState(41, COMPLETE_FORM_VALUES);
    }

    /**
     * Skip directly to the subscription step (step 42).
     * Sets both funnel state and auth state.
     * Must be called BEFORE page.goto('/').
     */
    async skipToSubscription() {
        const authToken = this.createFakeJwt({ userId: 42, email: 'test@example.com' });
        await this.setFunnelState(42, COMPLETE_FORM_VALUES);
        await this.setAuthState(authToken, 42);
    }

    /**
     * Skip directly to the payment step (step 43).
     * Must be called BEFORE page.goto('/').
     */
    async skipToPayment() {
        const authToken = this.createFakeJwt({ userId: 42, email: 'test@example.com' });
        await this.setFunnelState(43, { ...COMPLETE_FORM_VALUES, productId: 105 });
        await this.setAuthState(authToken, 42);
    }

    // ─── Click-through navigation (for navigation tests) ───────────────

    /**
     * Navigate through funnel steps from `fromStep` to `toStep` (exclusive).
     * Use this only for testing navigation itself — for other tests, use skipTo*.
     */
    async navigateTo(toStep: number, fromStep = 0) {
        await this.dismissCookieBanner();
        for (let i = fromStep; i < toStep; i++) {
            await this.advanceStep(i);
        }
    }

    /**
     * Fill and submit the auth form with valid credentials.
     */
    async completeAuth() {
        const page = this.page;

        await page.getByPlaceholder(/email/i).waitFor({ state: 'visible', timeout: 5000 });
        await page.getByPlaceholder(/email/i).fill('test@example.com');
        await page.getByPlaceholder(/password/i).fill('Password1!');

        // Check both checkboxes (age + terms)
        const checkboxes = page.locator('button[role="checkbox"]');
        const count = await checkboxes.count();
        for (let i = 0; i < count; i++) {
            const cb = checkboxes.nth(i);
            if (!(await cb.getAttribute('data-state'))?.includes('checked')) {
                await cb.click();
            }
        }

        // Submit
        await page.getByRole('button', { name: /join free/i }).click();

        // Wait for auth to complete and step to advance
        await page.waitForTimeout(1000);
    }

    /**
     * Select a subscription plan and click continue.
     */
    async selectPlanAndContinue() {
        const page = this.page;
        const continueBtn = page.getByRole('button', { name: /get.*discount|subscribe/i });
        await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
        await continueBtn.scrollIntoViewIfNeeded();
        await continueBtn.click();
        await page.waitForTimeout(500);
    }

    // ─── Private: localStorage setup ────────────────────────────────────

    private async setFunnelState(step: number, formValues: Record<string, unknown>) {
        const state = { form: formValues, step };
        await this.page.addInitScript(
            (stateJson: string) => {
                localStorage.setItem('funnel-storage', stateJson);
            },
            JSON.stringify({ state, version: 0 }),
        );
    }

    private async setAuthState(authToken: string, userId: number) {
        const state = { authToken, userId, oauthState: null };
        await this.page.addInitScript(
            (stateJson: string) => {
                localStorage.setItem('auth-storage', stateJson);
            },
            JSON.stringify({ state, version: 0 }),
        );
    }

    private createFakeJwt(payload: Record<string, unknown>): string {
        // Base64 encode without Node.js Buffer (works in browser context too)
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const body = btoa(JSON.stringify(payload));
        return `${header}.${body}.fake-e2e-signature`;
    }

    // ─── Private: click-through helpers ─────────────────────────────────

    private async dismissCookieBanner() {
        if (this.cookieDismissed) return;
        const page = this.page;
        const acceptBtn = page.getByRole('button', { name: /accept all/i });
        if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await acceptBtn.click();
            await page.waitForTimeout(300);
        }
        this.cookieDismissed = true;
    }

    private async advanceStep(stepIndex: number) {
        const action = STEP_ACTIONS[stepIndex];
        if (!action) throw new Error(`Unknown step index: ${stepIndex}`);

        switch (action.type) {
            case 'continue-btn':
                await this.handleContinueStep(action.needsSelection ?? false);
                break;
            case 'select-option':
                await this.handleSelectOptionStep();
                break;
            case 'auto-loader':
                await this.waitForLoaderComplete();
                break;
            case 'skip':
                break;
        }
    }

    private async handleContinueStep(needsSelection: boolean) {
        const page = this.page;

        if (needsSelection) {
            await this.selectFirstAvailableOption();
        }

        // Find and click Continue/action button
        const btn = page.getByRole('button', { name: /continue|next|start.*chat|let.*go|got.*it/i });
        await btn.first().waitFor({ state: 'visible', timeout: 5000 });
        await btn.first().scrollIntoViewIfNeeded();
        await btn.first().click();
        await page.waitForTimeout(400);
    }

    private async handleSelectOptionStep() {
        const page = this.page;
        await page.waitForTimeout(400);

        // Strategy: try different selectable element types in order of specificity

        // 1. ButtonField labels (most common auto-advance selector)
        const labels = page.locator('label[class*="cursor-pointer"]');
        if (
            await labels
                .first()
                .isVisible({ timeout: 2000 })
                .catch(() => false)
        ) {
            await labels.first().click();
            await page.waitForTimeout(500);
            return;
        }

        // 2. ImageCard buttons (CharacterStyleStep, ReceiveSteps)
        const imageCards = page.locator('button[class*="rounded-xl"]');
        if (
            await imageCards
                .first()
                .isVisible({ timeout: 2000 })
                .catch(() => false)
        ) {
            await imageCards.first().click();
            await page.waitForTimeout(500);
            return;
        }

        // 3. Fallback: any non-navigation button
        const allButtons = page.locator('button');
        const count = await allButtons.count();
        for (let i = 0; i < count; i++) {
            const btn = allButtons.nth(i);
            const text = (await btn.textContent()) ?? '';
            if (!/continue|next|back|accept|close|select language/i.test(text)) {
                await btn.click();
                await page.waitForTimeout(500);
                return;
            }
        }
    }

    private async selectFirstAvailableOption() {
        const page = this.page;
        await page.waitForTimeout(200);

        // 1. Badge labels (rounded-full, e.g. PersonalityTraitsStep)
        const badges = page.locator('label[class*="rounded-full"][class*="cursor-pointer"]');
        if (
            await badges
                .first()
                .isVisible({ timeout: 1500 })
                .catch(() => false)
        ) {
            await badges.first().click();
            return;
        }

        // 2. Card-style labels (rounded-[10px], e.g. CheckboxField, ButtonField)
        const cardLabels = page.locator('label[class*="cursor-pointer"][class*="rounded"]');
        if (
            await cardLabels
                .first()
                .isVisible({ timeout: 1000 })
                .catch(() => false)
        ) {
            await cardLabels.first().click();
            return;
        }

        // 3. ImageCard buttons (e.g. YourTypeStep, EthnicityStep)
        const imageCards = page.locator('button[class*="rounded-xl"]');
        if (
            await imageCards
                .first()
                .isVisible({ timeout: 1000 })
                .catch(() => false)
        ) {
            await imageCards.first().click();
            return;
        }

        // 4. Checkbox role buttons
        const checkboxes = page.locator('button[role="checkbox"]');
        if (
            await checkboxes
                .first()
                .isVisible({ timeout: 1000 })
                .catch(() => false)
        ) {
            await checkboxes.first().click();
            return;
        }
    }

    private async waitForLoaderComplete() {
        // Loaders auto-advance when progress reaches 100%.
        // Max loader time: ~5s at slowest speed, all run in parallel.
        await this.page.waitForTimeout(10_000);
    }
}
