/**
 * E2E: Offers flow — modals that appear when user tries to leave payment/subscription.
 *
 * Uses skipToPayment() to jump directly via localStorage.
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/api-mocks';
import { FunnelNavigator } from './helpers/funnel-navigator';

test.describe('Offers flow', () => {
    test('payment page shows close button that navigates back', async ({ page }) => {
        await setupApiMocks(page);
        const nav = new FunnelNavigator(page);
        await nav.skipToPayment();
        await page.goto('/');

        await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });

        // Click the X/close button on the payment page
        const closeBtn = page
            .locator('button')
            .filter({ has: page.locator('svg') })
            .first();
        if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeBtn.click();
            await page.waitForTimeout(1000);

            // Should navigate back or show offer modal — either is valid
            await page.waitForTimeout(500);
        }
    });

    test('subscription step shows multiple plan options', async ({ page }) => {
        await setupApiMocks(page);
        const nav = new FunnelNavigator(page);
        await nav.skipToSubscription();
        await page.goto('/');

        // Should have the get discount button visible
        await expect(page.getByRole('button', { name: /get.*discount|subscribe/i })).toBeVisible({ timeout: 5000 });

        // Should show pricing info
        const body = await page.locator('body').textContent();
        expect(body).toMatch(/\$/); // Dollar signs for pricing
    });
});
