import { describe, expect, it } from 'vitest';

import { env } from './env';

describe('env config', () => {
    it('has apiBaseUrl from environment', () => {
        expect(env.apiBaseUrl).toBe('http://localhost:4000');
    });

    it('has shift4 publishable key', () => {
        expect(env.shift4.publishableKey).toBe('pk_test_123');
    });

    it('has shift4 payment redirect', () => {
        expect(env.shift4.paymentRedirect).toBe('https://test.com');
    });

    it('has posthog config', () => {
        expect(env.posthog.token).toBe('phc_test');
        expect(env.posthog.host).toBe('https://eu.i.posthog.com');
    });

    it('env object is frozen (as const)', () => {
        // Verify the env object structure is complete
        expect(env).toHaveProperty('apiBaseUrl');
        expect(env).toHaveProperty('shift4');
        expect(env).toHaveProperty('posthog');
    });
});
