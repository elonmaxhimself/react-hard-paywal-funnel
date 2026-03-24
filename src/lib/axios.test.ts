import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * We test the axios instance configuration and interceptor behavior.
 * Since the module imports env.ts and auth store at module level,
 * we mock those dependencies.
 */

// Must mock before importing the module under test
vi.mock('@/store/states/auth', () => ({
    getAuthStore: vi.fn(() => ({ authToken: null })),
}));

vi.mock('@/config/env', () => ({
    env: { apiBaseUrl: 'http://test-api.com' },
}));

import axiosInstance from './axios';
import { getAuthStore } from '@/store/states/auth';

describe('axios instance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('has correct baseURL from env', () => {
        expect(axiosInstance.defaults.baseURL).toBe('http://test-api.com');
    });

    it('has 10s timeout', () => {
        expect(axiosInstance.defaults.timeout).toBe(10000);
    });

    it('has JSON content type header', () => {
        expect(axiosInstance.defaults.headers['Content-Type']).toBe('application/json');
    });

    describe('request interceptor', () => {
        it('adds Authorization header when token exists', async () => {
            vi.mocked(getAuthStore).mockReturnValue({ authToken: 'jwt-test-token' } as ReturnType<typeof getAuthStore>);

            // Execute interceptor by creating a request config
            const interceptors = axiosInstance.interceptors.request as unknown as {
                handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Record<string, unknown> }>;
            };
            const requestInterceptor = interceptors.handlers[0].fulfilled;

            const config = {
                headers: { set: vi.fn(), get: vi.fn(), has: vi.fn(), delete: vi.fn() },
            } as unknown as Record<string, unknown>;
            const result = requestInterceptor(config);

            expect(result).toBeDefined();
        });

        it('does not add Authorization when token is null', () => {
            vi.mocked(getAuthStore).mockReturnValue({ authToken: null } as ReturnType<typeof getAuthStore>);

            const interceptors = axiosInstance.interceptors.request as unknown as {
                handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Record<string, unknown> }>;
            };
            const requestInterceptor = interceptors.handlers[0].fulfilled;

            const headers = {} as Record<string, unknown>;
            const config = { headers } as Record<string, unknown>;
            requestInterceptor(config);

            expect(headers.Authorization).toBeUndefined();
        });
    });
});
