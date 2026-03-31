import { useEffect } from 'react';
import { useUtmStore } from '@/store/states/utm';
import { OAUTH_PROVIDERS, OAuthProviderType } from '@/constants/oauth';

/**
 * OAuth callback and auth-redirect params that should never be captured as UTM/tracking data.
 * All comparisons are case-insensitive (keys are lowered before lookup).
 */
const EXCLUDED_KEYS = new Set([
    // OAuth callback params
    'state',
    'code',
    'scope',
    'authuser',
    'prompt',
    'error',
    'error_description',
    // OpenID Connect (Google OAuth returns these)
    'iss',
    'hd',
    'session_state',
    // Auth redirect
    'authtoken',
]);

/**
 * Detects OAuth redirect callbacks — both successful (has `code`) and failed (has `error`).
 * When detected, the hook skips URL param capture entirely to avoid storing OAuth params as UTM.
 */
function isOAuthRedirect(params: URLSearchParams): boolean {
    const state = params.get('state');
    if (!state || !OAUTH_PROVIDERS.includes(state as OAuthProviderType)) return false;
    return !!(params.get('code') || params.get('error'));
}

export function useInitUtm() {
    const merge = useUtmStore((state) => state.merge);
    const setInitialUrl = useUtmStore((state) => state.setInitialUrl);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        // OAuth callback pages have code/state params — skip both UTM and URL capture.
        // The landing URL was already captured on the initial visit before the OAuth redirect.
        if (isOAuthRedirect(searchParams)) return;

        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            if (!EXCLUDED_KEYS.has(key.toLowerCase())) {
                params[key] = value;
            }
        });

        if (Object.keys(params).length > 0) merge(params);

        // Capture the full landing URL (including UTM query params).
        // First-win semantics in the setter ensure only the first visit's URL is stored.
        setInitialUrl(window.location.href);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only capture
    }, []);
}
