/**
 * Centralized environment configuration.
 *
 * All `import.meta.env.VITE_*` access goes through this module.
 * Typos become compile errors, missing required vars fail at startup.
 *
 * IMPORTANT: Vite replaces `import.meta.env.VITE_*` statically at build time.
 * Dynamic access like `import.meta.env[key]` does NOT work in production.
 * Every env var must be accessed with its full dot-notation expression.
 */

function required(value: string | undefined, name: string): string {
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const env = {
    /** Backend API base URL — required */
    apiBaseUrl: required(import.meta.env.VITE_PUBLIC_API_BASE_URL, 'VITE_PUBLIC_API_BASE_URL'),

    shift4: {
        /** Shift4 publishable key (pk_test_* or pk_live_*) — required */
        publishableKey: required(
            import.meta.env.VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY,
            'VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY',
        ),
        /** Redirect URL after successful payment — defaults to '/' */
        paymentRedirect: import.meta.env.VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT || '/',
    },

    posthog: {
        /** PostHog project token — optional (analytics disabled if missing) */
        token: import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN || '',
        /** PostHog ingest host */
        host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
        /** Enable analytics in dev mode (local only, ignored in production builds) */
        enableDevAnalytics: import.meta.env.VITE_PUBLIC_ENABLE_DEV_ANALYTICS === 'true',
    },
} as const;
