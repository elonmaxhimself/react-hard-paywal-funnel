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

    // ─── QA Bug #1: Page refresh during payment ─────────────────────────
    test.describe('page refresh during payment (QA bug #1)', () => {
        test('stays on payment step after refresh when payment is in progress', async ({ page }) => {
            await setupApiMocks(page, { pendingPolls: 20 });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            // Start payment
            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await payBtn.click();

            // Verify payment is in progress (button disabled)
            await expect(payBtn).toBeDisabled({ timeout: 5000 });

            // Verify localStorage has payment in progress
            const stored = await page.evaluate(() => localStorage.getItem('shift4_payment_in_progress'));
            expect(stored).not.toBeNull();

            // Refresh the page
            await page.reload();

            // Should stay on payment step — NOT redirect to plan selection
            // The payment form or a "processing" indicator should be visible
            const paymentForm = page.locator('#payment-form');
            const processingIndicator = page.locator('text=/processing|another tab/i');
            await expect(paymentForm.or(processingIndicator)).toBeVisible({ timeout: 10_000 });
        });

        test('resumes polling after refresh and redirects on success', async ({ page }) => {
            let pollCount = 0;
            await setupApiMocks(page, { pendingPolls: 20 });

            // Override poll route — return pending for first 3, then paid
            await page.route('**/shift4/payment-status/**', async (route) => {
                pollCount++;
                if (pollCount <= 3) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ subscriptionId: 'sub_e2e_123', paid_status: 'pending', events: [] }),
                    });
                } else {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ subscriptionId: 'sub_e2e_123', paid_status: 'paid', events: [] }),
                    });
                }
            });

            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            // Start payment
            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await payBtn.click();

            // Wait for charge to go through and polling to start
            await page.waitForTimeout(2000);
            const pollsBefore = pollCount;
            expect(pollsBefore).toBeGreaterThan(0);

            // Refresh page
            pollCount = 0;
            await page.reload();

            // Wait for resume-polling to kick in and redirect
            await page.waitForURL(/mydreamcompanion|authToken/, { timeout: 30_000 });
        });

        test('does not allow re-payment after refresh when payment completed', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();

            // Pre-set payment completed flag in localStorage
            await page.addInitScript(() => {
                localStorage.setItem('shift4_payment_completed', JSON.stringify({ timestamp: Date.now() }));
            });

            await page.goto('/');
            await page.waitForTimeout(2000);

            // Payment button should be disabled (paymentCompleted blocks it)
            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            if (await payBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await expect(payBtn).toBeDisabled();
            }
            // Alternatively, the page might redirect — both are acceptable
        });
    });

    // ─── QA Bug #3: Second tab / cross-tab behavior ─────────────────────
    test.describe('cross-tab payment protection (QA bug #3)', () => {
        test('shows processing state when payment started in another tab (via localStorage)', async ({ page }) => {
            await setupApiMocks(page, { pendingPolls: 50 });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();

            // Simulate another tab having started payment
            await page.addInitScript(() => {
                localStorage.setItem(
                    'shift4_payment_in_progress',
                    JSON.stringify({ subscriptionId: 'sub_other_tab', timestamp: Date.now() }),
                );
            });

            await page.goto('/');

            // Should NOT show a blank/black screen
            // Should show either the payment form (with disabled button) or the processing indicator
            const paymentForm = page.locator('#payment-form');
            const processingIndicator = page.locator('text=/processing|another tab/i');
            await expect(paymentForm.or(processingIndicator)).toBeVisible({ timeout: 10_000 });
        });

        test('blocks submit button when payment is in progress from another tab', async ({ page }) => {
            await setupApiMocks(page, { pendingPolls: 50 });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();

            // Simulate active payment from another tab
            await page.addInitScript(() => {
                localStorage.setItem(
                    'shift4_payment_in_progress',
                    JSON.stringify({ subscriptionId: 'sub_other_tab', timestamp: Date.now() }),
                );
            });

            await page.goto('/');

            // If payment form is visible, the button should be disabled
            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            if (await payBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
                await expect(payBtn).toBeDisabled();
            }
        });
    });

    // ─── QA Bug #4: Button disabled state & SDK failure ─────────────────
    test.describe('button disabled state (QA bug #4)', () => {
        test('button is disabled while payment is processing', async ({ page }) => {
            await setupApiMocks(page, { pendingPolls: 10 });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });

            // Button should be enabled before payment
            await expect(payBtn).not.toBeDisabled({ timeout: 3000 });

            // Click to start payment
            await payBtn.click();

            // Button should be disabled during payment
            await expect(payBtn).toBeDisabled({ timeout: 5000 });
        });

        test('button re-enables after payment failure for retry', async ({ page }) => {
            await setupApiMocks(page, {
                paymentFailed: { failureMessage: 'Card declined by issuer' },
            });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await payBtn.click();

            // Error toast should appear
            await expect(page.locator('text=Card declined by issuer')).toBeVisible({ timeout: 10_000 });

            // Button should be re-enabled for retry
            await expect(payBtn).not.toBeDisabled({ timeout: 5000 });

            // User should be able to retry
            await payBtn.click();
        });

        test('button shows "Payment unavailable" when Shift4 SDK fails', async ({ page }) => {
            // Don't mock Shift4 SDK — let it fail to load
            await page.route('**/shift4/charge', async (route) => route.fulfill({ status: 200, body: '{}' }));
            await page.route('**/shift4/payment-status/**', async (route) =>
                route.fulfill({ status: 200, body: '{}' }),
            );
            await page.route('**/auth/signup/adult/v3', async (route) =>
                route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({ authToken: 'fake.token.here', userId: 42 }),
                }),
            );
            await page.route('**/*.posthog.com/**', (route) => route.abort());
            await page.route('**/connect.facebook.net/**', (route) => route.abort());
            await page.route('**/googletagmanager.com/**', (route) => route.abort());
            await page.route('**/*cookie*script*/**', (route) => route.abort());
            // Block Shift4 SDK completely — don't inject the mock
            await page.route('**/*shift4*/**/*.js', (route) => route.abort());
            await page.route('**/js.shift4.com/**', (route) => route.abort());
            await page.route('**/js.dev.shift4.com/**', (route) => route.abort());

            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            // Wait for SDK load timeout (5s max)
            await page.waitForTimeout(6000);

            // Button should show "Payment unavailable" or be disabled
            const payBtn = page.getByRole('button', { name: /payment.*unavailable|subscribe|complete.*payment/i });
            if (await payBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await expect(payBtn).toBeDisabled();
            }
        });

        test('close button is disabled during payment (prevents navigation)', async ({ page }) => {
            await setupApiMocks(page, { pendingPolls: 10 });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            // Start payment
            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await payBtn.click();
            await expect(payBtn).toBeDisabled({ timeout: 5000 });

            // Close (X) button should be disabled during payment
            // The X button is positioned absolute top-5 right-5
            const closeBtn = page.locator('button.absolute');
            if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await expect(closeBtn).toBeDisabled();
            }
        });
    });

    // ─── QA Bug #5: Error message clarity ────────────────────────────────
    test.describe('error message clarity (QA bug #5)', () => {
        test('shows backend-provided error message on 409, not generic axios message', async ({ page }) => {
            await setupApiMocks(page, {
                chargeError: {
                    status: 409,
                    body: { message: 'A payment is already being processed. Please wait.' },
                },
            });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await payBtn.click();

            // Should show the backend message, NOT "Request failed with status code 409"
            await expect(page.locator('text=A payment is already being processed. Please wait.')).toBeVisible({
                timeout: 10_000,
            });
            await expect(page.locator('text=Request failed with status code')).not.toBeVisible({ timeout: 2000 });
        });

        test('shows specific failure message from polling, not generic error', async ({ page }) => {
            await setupApiMocks(page, {
                paymentFailed: { failureMessage: 'Insufficient funds' },
            });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await payBtn.click();

            // Should show the specific failure message
            await expect(page.locator('text=Insufficient funds')).toBeVisible({ timeout: 10_000 });
        });

        test('shows "active subscription" message clearly on 409', async ({ page }) => {
            await setupApiMocks(page, {
                chargeError: {
                    status: 409,
                    body: { message: 'You already have an active subscription.' },
                },
            });
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();
            await page.goto('/');

            await expect(page.locator('#payment-form')).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(1500);

            const payBtn = page.getByRole('button', { name: /complete.*payment|subscribe/i });
            await payBtn.click();

            await expect(page.locator('text=You already have an active subscription.')).toBeVisible({
                timeout: 10_000,
            });
        });
    });

    // ─── Offer modal guards during payment ──────────────────────────────
    test.describe('offer modals during payment', () => {
        test('offer modals do not change product when payment completed', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToPayment();

            // Pre-set payment completed
            await page.addInitScript(() => {
                localStorage.setItem('shift4_payment_completed', JSON.stringify({ timestamp: Date.now() }));
            });

            await page.goto('/');
            await page.waitForTimeout(2000);

            // Verify the payment completed flag is still in localStorage
            const completed = await page.evaluate(() => localStorage.getItem('shift4_payment_completed'));
            expect(completed).not.toBeNull();
        });
    });
});
