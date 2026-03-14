/**
 * Centralized environment configuration.
 *
 * All `import.meta.env.VITE_*` access goes through this module.
 * Typos become compile errors, missing required vars fail at startup.
 */

function required(key: string): string {
    const value = import.meta.env[key] as string | undefined;
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function optional(key: string, fallback: string): string {
    return (import.meta.env[key] as string | undefined) || fallback;
}

export const env = {
    /** Backend API base URL — required */
    apiBaseUrl: required('VITE_PUBLIC_API_BASE_URL'),

    shift4: {
        /** Shift4 publishable key (pk_test_* or pk_live_*) — required */
        publishableKey: required('VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY'),
        /** Redirect URL after successful payment — defaults to '/' */
        paymentRedirect: optional('VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT', '/'),
    },

    posthog: {
        /** PostHog project token — optional (analytics disabled if missing) */
        token: (import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN as string | undefined) || '',
        /** PostHog ingest host */
        host: optional('VITE_PUBLIC_POSTHOG_HOST', 'https://eu.i.posthog.com'),
        /** Enable analytics in dev mode (local only, ignored in production builds) */
        enableDevAnalytics: import.meta.env.VITE_PUBLIC_ENABLE_DEV_ANALYTICS === 'true',
    },
} as const;
