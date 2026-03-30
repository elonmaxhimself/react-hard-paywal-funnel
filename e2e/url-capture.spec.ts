/**
 * E2E: URL capture in signup payloads.
 *
 * Verifies that the landing page URL (including UTM query params) is correctly
 * captured and sent to the backend in both email and OAuth signup flows.
 *
 * These tests intercept API calls and inspect the request payload — no real
 * users are created, no backend is needed.
 */

import { test, expect, type Page } from '@playwright/test';
import { setupApiMocks, createAuthResponse } from './helpers/api-mocks';
import { FunnelNavigator } from './helpers/funnel-navigator';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Set utm-storage in localStorage before page loads (simulates prior visit). */
async function presetUtmStorage(page: Page, data: { utm?: Record<string, string>; initialUrl?: string }) {
    const state = {
        utm: data.utm ?? {},
        initialUrl: data.initialUrl ?? null,
    };
    await page.addInitScript(
        (json: string) => localStorage.setItem('utm-storage', json),
        JSON.stringify({ state, version: 0 }),
    );
}

/** Wait for utm-storage to appear in localStorage with a non-null initialUrl. */
async function waitForInitialUrl(page: Page): Promise<void> {
    await page.waitForFunction(
        () => {
            const raw = localStorage.getItem('utm-storage');
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            return !!parsed?.state?.initialUrl;
        },
        { timeout: 5000 },
    );
}

/** Read initialUrl from localStorage. */
async function getStoredInitialUrl(page: Page): Promise<string | null> {
    return page.evaluate(() => {
        const raw = localStorage.getItem('utm-storage');
        if (!raw) return null;
        return JSON.parse(raw)?.state?.initialUrl ?? null;
    });
}

/** Intercept email signup and capture the request body. */
function interceptEmailSignup(page: Page): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
        page.route('**/auth/signup/adult/v3', async (route) => {
            const body = route.request().postDataJSON();
            resolve(body);
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify(createAuthResponse()),
            });
        });
    });
}

/** Intercept OAuth token call and capture the request body. */
function interceptOAuthToken(page: Page, provider: string): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
        page.route(`**/auth/${provider}/token**`, async (route) => {
            const body = route.request().postDataJSON();
            resolve(body);
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(createAuthResponse()),
            });
        });
    });
}

// ── Tests ──────────────────────────────────────────────────────────────────

test.describe('URL capture — localStorage persistence', () => {
    test('captures full landing URL with UTM on first visit', async ({ page }) => {
        await setupApiMocks(page);
        await page.goto('/?utm_source=google&utm_campaign=spring');

        await waitForInitialUrl(page);
        const stored = await getStoredInitialUrl(page);

        expect(stored).toContain('utm_source=google');
        expect(stored).toContain('utm_campaign=spring');
    });

    test('captures landing URL without UTM params', async ({ page }) => {
        await setupApiMocks(page);
        await page.goto('/');

        await waitForInitialUrl(page);
        const stored = await getStoredInitialUrl(page);

        expect(stored).not.toBeNull();
        expect(stored).toContain('localhost'); // dev server
    });

    test('does NOT overwrite URL on OAuth callback page', async ({ page }) => {
        // Pre-populate with a landing URL (simulates first visit before OAuth redirect)
        await presetUtmStorage(page, {
            utm: { utm_source: 'test' },
            initialUrl: 'https://companiondream.com/?utm_source=test',
        });

        await setupApiMocks(page);
        // Simulate return from Google OAuth
        await page.goto('/?state=google&code=fake_code');

        // Wait for page to process
        await page.waitForTimeout(1000);

        const stored = await getStoredInitialUrl(page);

        // Should still be the original landing URL, not the OAuth callback URL
        expect(stored).toBe('https://companiondream.com/?utm_source=test');
        expect(stored).not.toContain('code=');
    });
});

test.describe('URL capture — email signup payload', () => {
    test('sends initialUrl (with UTM) in email signup payload', async ({ page }) => {
        // 1. Visit with UTM — URL gets captured
        await setupApiMocks(page);
        await page.goto('/?utm_source=email_test&utm_medium=e2e');
        await waitForInitialUrl(page);

        // 2. Navigate to auth step and sign up
        const nav = new FunnelNavigator(page);
        await nav.skipToAuth();

        const bodyPromise = interceptEmailSignup(page);
        await page.goto('/');
        await expect(page.getByPlaceholder(/email/i)).toBeVisible({ timeout: 5000 });
        await page.getByPlaceholder(/email/i).fill('url-test@example.com');
        await page.getByPlaceholder(/password/i).fill('StrongPass1!');

        const checkboxes = page.locator('button[role="checkbox"]');
        const count = await checkboxes.count();
        for (let i = 0; i < count; i++) {
            await checkboxes.nth(i).click();
        }

        await page.getByRole('button', { name: /join free/i }).click();
        const body = await bodyPromise;

        // 3. Verify
        expect(body.url).toContain('utm_source=email_test');
        expect(body.url).toContain('utm_medium=e2e');
        expect(body.utmOnRegistration).toHaveProperty('utm_source', 'email_test');
    });

    test('sends clean funnel URL when no UTM', async ({ page }) => {
        await setupApiMocks(page);
        await page.goto('/');
        await waitForInitialUrl(page);

        const nav = new FunnelNavigator(page);
        await nav.skipToAuth();

        const bodyPromise = interceptEmailSignup(page);
        await page.goto('/');
        await expect(page.getByPlaceholder(/email/i)).toBeVisible({ timeout: 5000 });
        await page.getByPlaceholder(/email/i).fill('no-utm@example.com');
        await page.getByPlaceholder(/password/i).fill('StrongPass1!');

        const checkboxes = page.locator('button[role="checkbox"]');
        const count = await checkboxes.count();
        for (let i = 0; i < count; i++) {
            await checkboxes.nth(i).click();
        }

        await page.getByRole('button', { name: /join free/i }).click();
        const body = await bodyPromise;

        expect(body.url).toBeDefined();
        expect(body.url).not.toContain('utm_source');
    });
});

test.describe('URL capture — OAuth signup payload', () => {
    test('Google OAuth sends landing URL with UTM (not callback URL)', async ({ page }) => {
        // 1. Pre-populate utm-storage as if user visited with UTM before OAuth redirect
        await presetUtmStorage(page, {
            utm: { utm_source: 'google_test', utm_campaign: 'oauth_e2e' },
            initialUrl: 'https://companiondream.com/?utm_source=google_test&utm_campaign=oauth_e2e',
        });

        // 2. Set up funnel state at auth step (simulates restored OAuth state)
        const nav = new FunnelNavigator(page);
        await nav.skipToAuth();

        // 3. Set up auth store with OAuth state (simulates saveOAuthState before redirect)
        await page.addInitScript(() => {
            const state = {
                authToken: null,
                userId: null,
                oauthState: {
                    formValues: null,
                    step: 41,
                    referrer: 'https://google.com/search',
                    timestamp: Date.now(),
                },
            };
            localStorage.setItem('auth-storage', JSON.stringify({ state, version: 0 }));
        });

        await setupApiMocks(page);

        // 4. Intercept the OAuth token API call
        const bodyPromise = interceptOAuthToken(page, 'google');

        // 5. Navigate as if returning from Google (with OAuth callback params)
        await page.goto('/?state=google&code=fake_google_code');

        const body = await bodyPromise;

        // 6. Verify: url should be the landing URL with UTM, NOT the callback URL
        expect(body.url).toBe('https://companiondream.com/?utm_source=google_test&utm_campaign=oauth_e2e');
        expect(body.url).not.toContain('code=');
        expect(body.url).not.toContain('state=google');
        expect(body.utmOnRegistration).toHaveProperty('utm_source', 'google_test');
    });

    test('Discord OAuth sends landing URL without UTM when none present', async ({ page }) => {
        await presetUtmStorage(page, {
            initialUrl: 'https://companiondream.com/',
        });

        const nav = new FunnelNavigator(page);
        await nav.skipToAuth();

        await page.addInitScript(() => {
            const state = {
                authToken: null,
                userId: null,
                oauthState: { formValues: null, step: 41, timestamp: Date.now() },
            };
            localStorage.setItem('auth-storage', JSON.stringify({ state, version: 0 }));
        });

        await setupApiMocks(page);
        const bodyPromise = interceptOAuthToken(page, 'discord');

        await page.goto('/?state=discord&code=fake_discord_code');

        const body = await bodyPromise;

        expect(body.url).toBe('https://companiondream.com/');
        expect(body.url).not.toContain('code=');
    });
});
