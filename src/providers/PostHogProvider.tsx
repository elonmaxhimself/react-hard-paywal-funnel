import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { env } from '@/config/env';

export function ClientPosthogProvider({ children }: { children: React.ReactNode }) {
    const token = env.posthog.token;

    useEffect(() => {
        if (typeof window === 'undefined' || !token || posthog.__loaded) return;

        posthog.init(token, {
            api_host: env.posthog.host,
            person_profiles: 'always',
            capture_pageview: true,
            autocapture: false,
            capture_performance: false,
            persistence: 'sessionStorage',
            capture_exceptions: {
                capture_unhandled_errors: true,
                capture_unhandled_rejections: true,
                capture_console_errors: false,
            },
            loaded: (posthog) => {
                const authData = localStorage.getItem('auth-storage');
                if (authData) {
                    try {
                        const auth = JSON.parse(authData);
                        const userId = auth?.state?.userId;

                        if (userId) {
                            posthog.identify(String(userId));
                        }
                    } catch (error) {
                        console.error('Error restoring PostHog identify:', error);
                    }
                }

                if (import.meta.env.DEV && !env.posthog.enableDevAnalytics) {
                    posthog.opt_out_capturing();
                }
            },
        });
    }, [token]);

    if (!token) {
        return <>{children}</>;
    }

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
