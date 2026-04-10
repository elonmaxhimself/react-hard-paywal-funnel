import { env } from '@/config/env';

const accountId = Number(env.taboola?.accountId);

export function trackTaboola(name: string, options?: Record<string, unknown>) {
    if (!window._tfa || !accountId) return;
    window._tfa.push({ notify: 'event', name, id: accountId, ...options });
}
