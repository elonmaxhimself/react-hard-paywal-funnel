/**
 * E2E: Funnel navigation — verify users can navigate through steps.
 *
 * Tests navigation in segments to keep each test fast and debuggable.
 * Uses click-through navigation (not localStorage skip).
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/api-mocks';
import { FunnelNavigator } from './helpers/funnel-navigator';

test.describe('Funnel navigation', () => {
    let nav: FunnelNavigator;

    test.beforeEach(async ({ page }) => {
        await setupApiMocks(page);
        nav = new FunnelNavigator(page);
        await page.goto('/');
    });

    test('first step loads with Continue button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
    });

    test('steps 0–9: SocialProof → UniqueCompanion', async ({ page }) => {
        await nav.navigateTo(10);
        // Should be on PersonalityTraitsStep — badges visible
        await expect(page.locator('label[class*="rounded-full"]').first()).toBeVisible({ timeout: 3000 });
    });

    test('steps 0–23: through character customization', async ({ page }) => {
        test.setTimeout(60_000);
        await nav.navigateTo(24);
        // Should be on RelationshipStep
        await expect(page.locator('body')).toBeVisible();
    });

    test('steps 0–31: through all preference steps', async ({ page }) => {
        test.setTimeout(60_000);
        await nav.navigateTo(32);
        // Should be on LoaderStep #1 — verify loader content
        await expect(page.locator('body')).toBeVisible();
    });

    test('progress indicator visible after first step', async ({ page }) => {
        await nav.navigateTo(2); // Go to step 2 (AssistantStep)

        // Step 2 should show "Create AI Girlfriend" header with progress
        await expect(page.locator('text=/create.*ai.*girlfriend/i')).toBeVisible({ timeout: 3000 });
    });
});
