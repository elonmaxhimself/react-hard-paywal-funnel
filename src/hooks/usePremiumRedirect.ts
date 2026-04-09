import { useEffect, useRef, useState } from 'react';

import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/states/auth';
import { env } from '@/config/env';
import { redirectToMainApp } from '@/utils/auth/redirectToMainApp';

/**
 * Checks whether the current user already has an active subscription (isPremium)
 * and redirects them to the main platform if so.
 *
 * This is a safety net for cases where payment succeeded but the client-side
 * redirect failed (tab closed during polling, 3DS popup blocked, polling timeout,
 * browser blocked `window.location.href`, etc.).
 *
 * The check is **non-blocking**: the UI renders normally while the request is
 * in flight. If the user is premium, they get redirected; if not (or if the
 * request fails), nothing happens.
 */
export function usePremiumRedirect(): { isRedirecting: boolean } {
    const authToken = useAuthStore((state) => state.authToken);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const checkedRef = useRef(false);

    useEffect(() => {
        if (!authToken || checkedRef.current) return;
        checkedRef.current = true;

        let cancelled = false;

        authService
            .getMe()
            .then((user) => {
                if (cancelled) return;

                if (user.isPremium) {
                    setIsRedirecting(true);

                    // Schedule redirect in the next macrotask so React can
                    // render the "redirecting" UI before navigation fires.
                    setTimeout(() => {
                        const redirectUrl = env.shift4.paymentRedirect;
                        void redirectToMainApp(redirectUrl, authToken);
                    }, 100);
                }
            })
            .catch(() => {
                // Non-blocking — if the check fails (network error, expired token, etc.),
                // proceed with the normal flow. The user can still pay or retry.
            });

        return () => {
            cancelled = true;
        };
    }, [authToken]);

    return { isRedirecting };
}
