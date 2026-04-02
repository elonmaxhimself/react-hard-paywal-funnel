/**
 * E2E: Mobile Continue button clickability.
 *
 * Validates that the fixed-bottom Continue button is visible and clickable
 * on small mobile viewports (iPhone SE 375x667) WITHOUT needing to scroll.
 *
 * Regression test for CU-869cm8cuw: missing z-100 on fixed bottom bar
 * caused the button to be hidden behind content on mobile.
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/api-mocks';
import { FunnelNavigator } from './helpers/funnel-navigator';

test.describe('Mobile: Continue button is clickable without scrolling', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    let nav: FunnelNavigator;

    test.beforeEach(async ({ page }) => {
        await setupApiMocks(page);
        nav = new FunnelNavigator(page);
        await page.goto('/');
    });

    test('step 0 (SocialProofStep): Continue button is visible and clickable', async ({ page }) => {
        const continueBtn = page.getByRole('button', { name: /continue/i });
        await expect(continueBtn).toBeVisible({ timeout: 5000 });

        // Verify the button is within viewport bounds (not hidden behind content)
        const box = await continueBtn.boundingBox();
        expect(box).toBeTruthy();
        expect(box!.y + box!.height).toBeLessThanOrEqual(667);

        // Click advances to next step
        await continueBtn.click();
        // ConnectionStep should now be visible
        await expect(page.locator('text=/connection/i').first()).toBeVisible({ timeout: 3000 });
    });

    test('step 1 (ConnectionStep): Continue button is visible and clickable', async ({ page }) => {
        await nav.navigateTo(1);

        // Select an option first (required for ConnectionStep)
        const firstCheckbox = page.getByRole('checkbox').first();
        await firstCheckbox.click();

        const continueBtn = page.getByRole('button', { name: /continue/i });
        await expect(continueBtn).toBeVisible();

        const box = await continueBtn.boundingBox();
        expect(box).toBeTruthy();
        expect(box!.y + box!.height).toBeLessThanOrEqual(667);

        await continueBtn.click();
        // AssistantStep should now be visible
        await expect(page.locator('text=/assist/i').first()).toBeVisible({ timeout: 3000 });
    });

    test('step 2 (AssistantStep): Continue button is visible and clickable', async ({ page }) => {
        await nav.navigateTo(2);

        const continueBtn = page.getByRole('button', { name: /continue/i });
        await expect(continueBtn).toBeVisible({ timeout: 5000 });

        const box = await continueBtn.boundingBox();
        expect(box).toBeTruthy();
        expect(box!.y + box!.height).toBeLessThanOrEqual(667);

        await continueBtn.click();
        // CharacterStyleStep should now be visible (Choose Style)
        await expect(page.locator('text=/style/i').first()).toBeVisible({ timeout: 3000 });
    });
});
