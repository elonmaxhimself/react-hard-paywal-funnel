/**
 * E2E: Auth flow — sign-up with email, validation, API errors, OAuth buttons.
 *
 * Uses skipToAuth() to jump directly to the AuthStep via localStorage,
 * so tests are fast (~2-3s each) and don't depend on navigation through 41 steps.
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/api-mocks';
import { FunnelNavigator } from './helpers/funnel-navigator';

test.describe('Auth flow', () => {
    test.describe('email sign-up', () => {
        test('successful sign-up advances to subscription step', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToAuth();
            await page.goto('/');

            // Verify we're on the auth step
            await expect(page.getByPlaceholder(/email/i)).toBeVisible({ timeout: 5000 });

            // Fill form
            await page.getByPlaceholder(/email/i).fill('user@test.com');
            await page.getByPlaceholder(/password/i).fill('StrongPass1!');

            // Check all checkboxes
            const checkboxes = page.locator('button[role="checkbox"]');
            const count = await checkboxes.count();
            for (let i = 0; i < count; i++) {
                await checkboxes.nth(i).click();
            }

            // Submit
            await page.getByRole('button', { name: /join free/i }).click();

            // Should advance to subscription step — verify plan-related content
            await expect(page.getByRole('button', { name: /get.*discount|subscribe/i })).toBeVisible({ timeout: 5000 });
        });

        test('shows validation errors for empty form submit', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToAuth();
            await page.goto('/');

            await expect(page.getByPlaceholder(/email/i)).toBeVisible({ timeout: 5000 });

            // Submit without filling anything
            await page.getByRole('button', { name: /join free/i }).click();

            // Should show validation errors
            await expect(page.locator('.text-red-500').first()).toBeVisible({ timeout: 3000 });
        });

        test('shows validation error for invalid email', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToAuth();
            await page.goto('/');

            await expect(page.getByPlaceholder(/email/i)).toBeVisible({ timeout: 5000 });
            // Use email that passes HTML5 validation but fails Zod
            await page.getByPlaceholder(/email/i).fill('test@x');
            await page.getByPlaceholder(/password/i).fill('StrongPass1!');

            const checkboxes = page.locator('button[role="checkbox"]');
            const count = await checkboxes.count();
            for (let i = 0; i < count; i++) {
                await checkboxes.nth(i).click();
            }

            await page.getByRole('button', { name: /join free/i }).click();

            await expect(page.locator('.text-red-500').first()).toBeVisible({ timeout: 3000 });
        });

        test('shows validation error for short password', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToAuth();
            await page.goto('/');

            await expect(page.getByPlaceholder(/email/i)).toBeVisible({ timeout: 5000 });
            await page.getByPlaceholder(/email/i).fill('user@test.com');
            await page.getByPlaceholder(/password/i).fill('short');

            const checkboxes = page.locator('button[role="checkbox"]');
            const count = await checkboxes.count();
            for (let i = 0; i < count; i++) {
                await checkboxes.nth(i).click();
            }

            await page.getByRole('button', { name: /join free/i }).click();

            await expect(page.locator('.text-red-500').first()).toBeVisible({ timeout: 3000 });
        });

        test('shows API error when email already exists (409)', async ({ page }) => {
            await setupApiMocks(page, {
                authError: {
                    status: 409,
                    body: { messages: ['Email already registered'] },
                },
            });
            const nav = new FunnelNavigator(page);
            await nav.skipToAuth();
            await page.goto('/');

            await expect(page.getByPlaceholder(/email/i)).toBeVisible({ timeout: 5000 });
            await page.getByPlaceholder(/email/i).fill('existing@test.com');
            await page.getByPlaceholder(/password/i).fill('StrongPass1!');

            const checkboxes = page.locator('button[role="checkbox"]');
            const count = await checkboxes.count();
            for (let i = 0; i < count; i++) {
                await checkboxes.nth(i).click();
            }

            await page.getByRole('button', { name: /join free/i }).click();

            // Should show toast with backend error message
            await expect(page.locator('text=Email already registered')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('OAuth', () => {
        test('renders all OAuth buttons (Google, Twitter, Discord)', async ({ page }) => {
            await setupApiMocks(page);
            const nav = new FunnelNavigator(page);
            await nav.skipToAuth();
            await page.goto('/');

            await expect(page.getByPlaceholder(/email/i)).toBeVisible({ timeout: 5000 });
            await expect(page.getByAltText('Google')).toBeVisible();
            await expect(page.getByAltText('Twitter')).toBeVisible();
            await expect(page.getByAltText('Discord')).toBeVisible();
        });
    });
});
