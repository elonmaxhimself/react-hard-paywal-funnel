/**
 * E2E: Payment flow — plan selection, payment form, charge, polling, redirect.
 *
 * Uses skipToSubscription() / skipToPayment() to jump directly via localStorage.
 * Shift4 SDK is mocked via page.addInitScript() (see api-mocks.ts).
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/api-mocks';
import { FunnelNavigator } from './helpers/funnel-navigator';

test.describe('Payment flow', () => {
    test.describe('subscription step', () => {
        test('displays plan cards after auth', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToSubscription();
            await page.goto('/');

            // Should show plan selection with pricing
            await expect(page.getByRole('button', { name: /get.*discount|subscribe/i })).toBeVisible({ timeout: 5000 });
        });

        test('can select a plan and proceed to payment form', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToSubscription();
            await page.goto('/');

            await nav.selectPlanAndContinue();

            // Should be on PaymentFormStep
            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('payment form', () => {
        test('displays payment form with card inputs', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            // Payment form should be visible
            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });

            // Complete Payment button should be present
            await expect(page.getByRole('button', { name: /complete.*payment|subscribe/i })).toBeVisible();
        });

        test('successful payment disables button (polling in progress)', async ({ page }) => {
            await setupApiMocks(page, { pendingPolls: 2 });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });

            // Wait for Shift4 mock to initialize
            await page.waitForTimeout(1500);

            // Click Complete Payment
            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await payBtn.click();

            // Button should become disabled during payment processing
            await expect(payBtn).toBeDisabled({ timeout: 5000 });
        });

        test('shows error toast when payment fails', async ({ page }) => {
            await setupApiMocks(page, {
                paymentFailed: { failureMessage: 'Your card was declined' },
            });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await payBtn.click();

            // Should show error toast
            await expect(page.locator('text=Your card was declined')).toBeVisible({ timeout: 10_000 });

            // Button should be re-enabled for retry
            await expect(payBtn).not.toBeDisabled({ timeout: 5000 });
        });

        test('shows error when charge returns 409 (already subscribed)', async ({ page }) => {
            await setupApiMocks(page, {
                chargeError: {
                    status: 409,
                    body: { message: 'User already has active subscription' },
                },
            });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await payBtn.click();

            await expect(page.locator('text=User already has active subscription')).toBeVisible({ timeout: 10_000 });
        });

        test('prevents double-click on payment button', async ({ page }) => {
            let chargeCount = 0;
            await setupApiMocks(page, { pendingPolls: 10 });

            // Override charge route to count calls
            await page.route('**/shift4/charge', async (route) => {
                chargeCount++;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'subscription_initiated',
                        subscriptionId: 'sub_e2e_123',
                    }),
                });
            });

            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });

            // Rapid double-click
            await payBtn.click();
            await payBtn.click({ force: true }).catch(() => {});

            await page.waitForTimeout(3000);
            expect(chargeCount).toBe(1);
        });

        test('shows price amount on payment page', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });

            // Should show dollar amount somewhere
            const body = await page.locator('body').textContent();
            expect(body).toMatch(/\$?\d+\.?\d*/);
        });
    });
});
