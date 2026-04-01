import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AxiosResponse } from 'axios';

import { authService } from './auth-service';
import { createAuthResponse } from '../../test/factories';

vi.mock('@/lib/axios', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

// Mock store getters used by verifyOAuthToken
vi.mock('@/store/states/utm', () => ({
    getUtmStore: () => ({
        utm: { utm_source: 'test' },
        initialUrl: 'https://companiondream.com/?utm_source=test&utm_campaign=spring',
    }),
}));

vi.mock('@/store/states/auth', () => ({
    getAuthStore: () => ({ oauthState: { referrer: 'https://referrer.com' } }),
}));

vi.mock('@/utils/helpers/getTrackDeskCid', () => ({
    getTrackDeskCid: () => 'track_123',
}));

import axios from '@/lib/axios';

const mockAxios = vi.mocked(axios);

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getMe', () => {
        it('calls GET /auth/me and returns response data', async () => {
            mockAxios.get.mockResolvedValue({
                data: { id: 42, isPremium: true },
            } as AxiosResponse);

            const result = await authService.getMe();

            expect(mockAxios.get).toHaveBeenCalledWith('/auth/me');
            expect(result.id).toBe(42);
            expect(result.isPremium).toBe(true);
        });

        it('propagates API errors (e.g. 401 Unauthorized)', async () => {
            mockAxios.get.mockRejectedValue({
                response: { status: 401, data: { message: 'Unauthorized' } },
            });

            await expect(authService.getMe()).rejects.toMatchObject({
                response: { status: 401 },
            });
        });
    });

    describe('signUp', () => {
        it('calls POST /auth/signup/adult/v3 with payload', async () => {
            const authResponse = createAuthResponse();
            mockAxios.post.mockResolvedValue({ data: authResponse } as AxiosResponse);

            const result = await authService.signUp({
                email: 'test@test.com',
                password: 'Password1',
                utmOnRegistration: {},
                url: 'https://test.com',
                createCharFunnelOptions: {} as never,
            });

            expect(mockAxios.post).toHaveBeenCalledWith(
                '/auth/signup/adult/v3',
                expect.objectContaining({
                    email: 'test@test.com',
                    password: 'Password1',
                }),
            );
            expect(result.authToken).toBe(authResponse.authToken);
            expect(result.userId).toBe(42);
        });

        it('propagates API errors', async () => {
            mockAxios.post.mockRejectedValue({
                response: { status: 409, data: { messages: ['Email already exists'] } },
            });

            await expect(
                authService.signUp({
                    email: 'dup@test.com',
                    password: 'Password1',
                    utmOnRegistration: {},
                    url: 'https://test.com',
                    createCharFunnelOptions: {} as never,
                }),
            ).rejects.toMatchObject({
                response: { status: 409 },
            });
        });
    });

    describe('signInWithOAuth', () => {
        it('calls GET /auth/:provider with redirectUrl', async () => {
            mockAxios.get.mockResolvedValue({ data: { url: 'https://google.com/oauth' } } as AxiosResponse);

            const result = await authService.signInWithOAuth('google');

            expect(mockAxios.get).toHaveBeenCalledWith('/auth/google', {
                params: { redirectUrl: expect.any(String) },
            });
            expect(result.url).toBe('https://google.com/oauth');
        });

        it('works for all providers', async () => {
            for (const provider of ['google', 'twitter', 'discord'] as const) {
                mockAxios.get.mockResolvedValue({ data: { url: `https://${provider}.com` } } as AxiosResponse);
                await authService.signInWithOAuth(provider);

                expect(mockAxios.get).toHaveBeenCalledWith(`/auth/${provider}`, expect.any(Object));
            }
        });
    });

    describe('verifyOAuthToken', () => {
        it('calls POST /auth/:provider/token with code, utm, referrer, trackDeskCid', async () => {
            const authResponse = createAuthResponse();
            mockAxios.post.mockResolvedValue({ data: authResponse } as AxiosResponse);

            const result = await authService.verifyOAuthToken('google', { code: 'auth_code_123' });

            expect(mockAxios.post).toHaveBeenCalledWith(
                '/auth/google/token',
                expect.objectContaining({
                    code: 'auth_code_123',
                    utmOnRegistration: { utm_source: 'test' },
                    referrer: 'https://referrer.com',
                    trackDeskCid: 'track_123',
                }),
                expect.objectContaining({
                    params: { redirectUrl: expect.any(String) },
                }),
            );
            expect(result.authToken).toBe(authResponse.authToken);
        });

        it('sends initialUrl (with UTM) as the url field, not the OAuth callback URL', async () => {
            const authResponse = createAuthResponse();
            mockAxios.post.mockResolvedValue({ data: authResponse } as AxiosResponse);

            await authService.verifyOAuthToken('google', { code: 'auth_code_123' });

            const payload = mockAxios.post.mock.calls[0][1];
            // url should be the landing URL from the store (with UTM), not origin+pathname
            expect(payload.url).toBe('https://companiondream.com/?utm_source=test&utm_campaign=spring');
            // It should NOT be the OAuth callback URL
            expect(payload.url).not.toContain('code=');
            expect(payload.url).not.toContain('state=');
        });
    });
});
