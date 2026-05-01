/**
 * API mock layer for E2E tests.
 *
 * Uses `page.route()` to intercept all network requests to the backend API
 * and third-party scripts (analytics, Shift4 SDK).
 *
 * This ensures tests are fast, stable, and don't require a running backend.
 */

import { type Page } from '@playwright/test';

// =============================================================================
// Response factories
// =============================================================================

export function createAuthResponse(overrides: Record<string, unknown> = {}) {
    const payload = { userId: 42, email: 'test@example.com' };
    const token = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload))}.fake-sig`;
    return {
        authToken: token,
        userId: 42,
        ...overrides,
    };
}

export function createChargeResponse(overrides: Record<string, unknown> = {}) {
    return {
        status: 'subscription_initiated',
        subscriptionId: 'sub_e2e_123',
        ...overrides,
    };
}

export function createPaymentStatusResponse(overrides: Record<string, unknown> = {}) {
    return {
        subscriptionId: 'sub_e2e_123',
        paid_status: 'paid',
        events: [],
        ...overrides,
    };
}

// =============================================================================
// Mock setup
// =============================================================================

export interface MockApiOptions {
    /** Override auth response */
    authResponse?: Record<string, unknown>;
    /** Override charge response */
    chargeResponse?: Record<string, unknown>;
    /** Override payment status response */
    paymentStatusResponse?: Record<string, unknown>;
    /** Simulate auth error (e.g. 409) */
    authError?: { status: number; body: Record<string, unknown> };
    /** Simulate charge error */
    chargeError?: { status: number; body: Record<string, unknown> };
    /** Simulate payment failure */
    paymentFailed?: { failureMessage?: string };
    /** Number of "pending" polls before "paid" (default: 0 = immediate) */
    pendingPolls?: number;
    /** Override GET /auth/me response (default: isPremium: false) */
    meResponse?: { isPremium: boolean; [key: string]: unknown };
    /** Simulate GET /auth/me error (e.g. 401) */
    meError?: { status: number; body: Record<string, unknown> };
}

/**
 * Sets up all API mocks for the funnel E2E tests.
 * Call this in `test.beforeEach` or at the start of each test.
 */
export async function setupApiMocks(page: Page, options: MockApiOptions = {}) {
    let pollCount = 0;

    // ── Auth: GET /auth/me (premium redirect guard) ─────────────────────
    await page.route('**/auth/me', async (route) => {
        if (route.request().method() !== 'GET') {
            await route.fallback();
            return;
        }
        if (options.meError) {
            await route.fulfill({
                status: options.meError.status,
                contentType: 'application/json',
                body: JSON.stringify(options.meError.body),
            });
        } else {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 42,
                    isPremium: false,
                    ...options.meResponse,
                }),
            });
        }
    });

    // ── Auth: sign-up ───────────────────────────────────────────────────
    await page.route('**/auth/signup/adult/v3', async (route) => {
        if (options.authError) {
            await route.fulfill({
                status: options.authError.status,
                contentType: 'application/json',
                body: JSON.stringify(options.authError.body),
            });
        } else {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify(createAuthResponse(options.authResponse)),
            });
        }
    });

    // ── Auth: OAuth redirect ────────────────────────────────────────────
    await page.route('**/auth/google', async (route) => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ url: 'https://accounts.google.com/o/oauth2/fake' }),
            });
        } else {
            await route.fallback();
        }
    });

    await page.route('**/auth/twitter', async (route) => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ url: 'https://twitter.com/oauth/fake' }),
            });
        } else {
            await route.fallback();
        }
    });

    await page.route('**/auth/discord', async (route) => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ url: 'https://discord.com/oauth/fake' }),
            });
        } else {
            await route.fallback();
        }
    });

    // ── Auth: OAuth token verification (POST /auth/:provider/token) ────
    for (const provider of ['google', 'discord', 'twitter']) {
        await page.route(`**/auth/${provider}/token**`, async (route) => {
            if (options.authError) {
                await route.fulfill({
                    status: options.authError.status,
                    contentType: 'application/json',
                    body: JSON.stringify(options.authError.body),
                });
            } else {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(createAuthResponse(options.authResponse)),
                });
            }
        });
    }

    // ── Payment: charge ─────────────────────────────────────────────────
    await page.route('**/shift4/charge', async (route) => {
        if (options.chargeError) {
            await route.fulfill({
                status: options.chargeError.status,
                contentType: 'application/json',
                body: JSON.stringify(options.chargeError.body),
            });
        } else {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(createChargeResponse(options.chargeResponse)),
            });
        }
    });

    // ── Payment: polling ────────────────────────────────────────────────
    await page.route('**/shift4/payment-status/**', async (route) => {
        const maxPending = options.pendingPolls ?? 0;

        if (options.paymentFailed) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(
                    createPaymentStatusResponse({
                        paid_status: 'failed',
                        failureMessage: options.paymentFailed.failureMessage ?? 'Card declined',
                    }),
                ),
            });
            return;
        }

        if (pollCount < maxPending) {
            pollCount++;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(createPaymentStatusResponse({ paid_status: 'pending' })),
            });
        } else {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(createPaymentStatusResponse(options.paymentStatusResponse)),
            });
        }
    });

    // ── Block third-party scripts (analytics, Shift4 SDK) ───────────────
    await page.route('**/*.posthog.com/**', (route) => route.abort());
    await page.route('**/connect.facebook.net/**', (route) => route.abort());
    await page.route('**/googletagmanager.com/**', (route) => route.abort());
    await page.route('**/google-analytics.com/**', (route) => route.abort());
    await page.route('**/googleads.g.doubleclick.net/**', (route) => route.abort());
    await page.route('**/*cookie*script*/**', (route) => route.abort());
    await page.route('**/*cookiescript*/**', (route) => route.abort());

    // ── Mock Shift4 SDK ─────────────────────────────────────────────────
    // Block the real Shift4 script and inject a mock
    // Matches both js.shift4.com and js.dev.shift4.com
    await page.route('**/*shift4*/**/*.js', (route) => route.abort());
    await page.route('**/js.shift4.com/**', (route) => route.abort());
    await page.route('**/js.dev.shift4.com/**', (route) => route.abort());

    await page.addInitScript(() => {
        // Mock Shift4 SDK — provides createToken, verifyThreeDSecure, createComponentGroup
        (window as Record<string, unknown>).Shift4 = function Shift4(_publicKey: string) {
            return {
                createToken: () => Promise.resolve({ id: 'tok_e2e_test' }),
                verifyThreeDSecure: () => Promise.resolve({ id: 'tok_3ds_e2e' }),
                createComponentGroup: (_options: unknown) => ({
                    automount: (_selector: string) => {
                        // Create placeholder elements so the form looks mounted
                        const container = document.querySelector(_selector);
                        if (container) {
                            const inputs = container.querySelectorAll('[data-shift4]');
                            inputs.forEach((input) => {
                                const el = input as HTMLElement;
                                el.style.minHeight = '50px';
                                el.innerHTML = '<div style="color: #666; padding: 12px;">Mock card input</div>';
                            });
                        }
                    },
                    unmount: () => {},
                }),
            };
        };
    });
}
