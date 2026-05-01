import axiosInstance from '@/lib/axios';
import { env } from '@/config/env';

/**
 * Redirect user to main app with session transfer.
 *
 * Uses one-time transfer code (secure — no token in URL) with fallback
 * to ?authToken= (legacy — for transition period before backend deploys session-transfer).
 *
 * @param redirectUrl - The target URL on the main platform (e.g. https://mydreamcompanion.com/...)
 * @param authToken - Fallback token from Zustand (used if session transfer fails)
 */
export async function redirectToMainApp(redirectUrl: string, authToken: string | null): Promise<void> {
    // Try session transfer (secure — no token in URL)
    try {
        const { data } = await axiosInstance.post<{ code: string }>('/auth/create-transfer-code');
        const transferUrl =
            `${env.sessionTransferApiUrl}/auth/session-transfer` +
            `?code=${data.code}` +
            `&redirect=${encodeURIComponent(redirectUrl)}`;
        window.location.href = transferUrl;
        return;
    } catch {
        // Fallback to legacy method (token in URL)
        // This works during transition when backend doesn't have session-transfer yet
    }

    if (authToken) {
        window.location.href = `${redirectUrl}?authToken=${authToken}`;
    } else {
        // No token available — redirect without auth, user will need to login
        window.location.href = redirectUrl;
    }
}
