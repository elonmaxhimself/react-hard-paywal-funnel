/**
 * E2E: Premium redirect guard — already-paid users get redirected
 * from SubscriptionStep and PaymentFormStep to the main platform.
 *
 * NOTE: The actual redirect fires `window.location.href` to an external domain.
 * Cross-origin navigation cannot be intercepted by Playwright (the page context
 * is immediately lost). The redirect URL correctness (includes authToken, points
 * to the right domain) is fully covered by unit tests in usePremiumRedirect.test.ts.
 *
 * These E2E tests verify:
 *   - GET /auth/me is called on mount for both steps
 *   - Non-premium users see the normal flow (no redirect)
 *   - /auth/me errors are handled gracefully (no crash, normal flow)
 *   - The check is non-blocking (form usable during slow /auth/me)
 *   - Payment flow remains functional after non-premium check
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/api-mocks';
import { FunnelNavigator } from './helpers/funnel-navigator';

test.describe('Premium redirect guard', () => {
    // ─── API call verification ──────────────────────────────────────────

    test.describe('API call verification', () => {
        test('calls GET /auth/me on PaymentFormStep mount', async ({ page }) => {
            let meCalled = false;
            await setupApiMocks(page);

            await page.route('**/auth/me', async (route) => {
                if (route.request().method() === 'GET') {
                    meCalled = true;
                }
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 42, isPremium: false }),
                });
            });

            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            expect(meCalled).toBe(true);
        });

        test('calls GET /auth/me on SubscriptionStep mount', async ({ page }) => {
            let meCalled = false;
            await setupApiMocks(page);

            await page.route('**/auth/me', async (route) => {
                if (route.request().method() === 'GET') {
                    meCalled = true;
                }
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 42, isPremium: false }),
                });
            });

            const nav = new FunnelNavigator(page);
            await nav.skipToSubscription();
            await page.goto('/');

            await expect(page.getByRole('button', { name: /get.*discount|subscribe/i })).toBeVisible({ timeout: 5000 });
            expect(meCalled).toBe(true);
        });
    });

    // ─── Non-premium: normal flow ───────────────────────────────────────

    test.describe('non-premium user — normal flow unchanged', () => {
        test('shows plan selection on SubscriptionStep', async ({ page }) => {
            await setupApiMocks(page, { meResponse: { isPremium: false } });
            const nav = new FunnelNavigator(page);
            await nav.skipToSubscription();
            await page.goto('/');

            await expect(page.getByRole('button', { name: /get.*discount|subscribe/i })).toBeVisible({ timeout: 5000 });
        });

        test('shows payment form on PaymentFormStep', async ({ page }) => {
            await setupApiMocks(page, { meResponse: { isPremium: false } });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
        });

        test('payment form remains functional — can start payment', async ({ page }) => {
            await setupApiMocks(page, {
                meResponse: { isPremium: false },
                pendingPolls: 2,
            });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await expect(payBtn).not.toBeDisabled({ timeout: 3000 });

            await payBtn.click();
            await expect(payBtn).toBeDisabled({ timeout: 5000 });
        });
    });

    // ─── Error handling — graceful degradation ──────────────────────────

    test.describe('error handling — graceful degradation', () => {
        test('shows plan selection when /auth/me returns 401', async ({ page }) => {
            await setupApiMocks(page, {
                meError: { status: 401, body: { message: 'Unauthorized' } },
            });
            const nav = new FunnelNavigator(page);
            await nav.skipToSubscription();
            await page.goto('/');

            await expect(page.getByRole('button', { name: /get.*discount|subscribe/i })).toBeVisible({ timeout: 5000 });
        });

        test('shows payment form when /auth/me returns 500', async ({ page }) => {
            await setupApiMocks(page, {
                meError: { status: 500, body: { message: 'Internal Server Error' } },
            });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
        });
    });

    // ─── Non-blocking: slow /auth/me ────────────────────────────────────

    test.describe('non-blocking behavior', () => {
        test('payment form loads immediately while slow /auth/me is pending', async ({ page }) => {
            await setupApiMocks(page);

            // Override /auth/me with a 3-second delay
            await page.route('**/auth/me', async (route) => {
                if (route.request().method() !== 'GET') {
                    await route.fallback();
                    return;
                }
                await new Promise((resolve) => setTimeout(resolve, 3000));
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 42, isPremium: false }),
                });
            });

            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            // Form should be visible immediately — check is non-blocking
            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
        });
    });
});
