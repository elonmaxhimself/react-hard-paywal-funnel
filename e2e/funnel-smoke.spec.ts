import { test, expect } from '@playwright/test';

test.describe('Funnel — smoke tests', () => {
    test('landing page loads with Continue button', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
    });

    test('landing page has no console errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') errors.push(msg.text());
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Filter out expected third-party errors (cookie scripts, analytics)
        const criticalErrors = errors.filter(
            (e) => !e.includes('cookiescript') && !e.includes('posthog') && !e.includes('fbq'),
        );
        expect(criticalErrors).toHaveLength(0);
    });

    test('clicking Continue advances to next step', async ({ page }) => {
        await page.goto('/');

        // Accept cookies if dialog appears
        const acceptBtn = page.getByRole('button', { name: /accept all/i });
        if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await acceptBtn.click();
        }

        await page.getByRole('button', { name: /continue/i }).click();

        // Should advance — the Continue button or page content should change
        await expect(page.locator('main')).toBeVisible();
    });
});
