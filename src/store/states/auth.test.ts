import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from './auth';

type SaveOAuthFormValues = Parameters<ReturnType<typeof useAuthStore.getState>['saveOAuthState']>[0];

describe('useAuthStore', () => {
    beforeEach(() => {
        // Reset store to initial state
        useAuthStore.getState().reset();
    });

    describe('initial state', () => {
        it('starts with null userId and authToken', () => {
            const state = useAuthStore.getState();
            expect(state.userId).toBeNull();
            expect(state.authToken).toBeNull();
            expect(state.oauthState).toBeNull();
        });
    });

    describe('setToken / setUserId', () => {
        it('sets authToken', () => {
            useAuthStore.getState().setToken('jwt-test-token');
            expect(useAuthStore.getState().authToken).toBe('jwt-test-token');
        });

        it('sets userId', () => {
            useAuthStore.getState().setUserId(42);
            expect(useAuthStore.getState().userId).toBe(42);
        });
    });

    describe('OAuth state management', () => {
        const mockFormValues = {
            email: 'test@test.com',
            password: 'Password1',
            productId: 105,
        } as unknown as SaveOAuthFormValues;

        it('saves and restores OAuth state', () => {
            useAuthStore.getState().saveOAuthState(mockFormValues, 5);

            const restored = useAuthStore.getState().restoreOAuthState();
            expect(restored.formValues).toEqual(mockFormValues);
            expect(restored.step).toBe(5);
        });

        it('returns empty state when no OAuth state saved', () => {
            const restored = useAuthStore.getState().restoreOAuthState();
            expect(restored.formValues).toBeNull();
            expect(restored.step).toBe(0);
        });

        it('clears OAuth state', () => {
            useAuthStore.getState().saveOAuthState(mockFormValues, 5);
            useAuthStore.getState().clearOAuthState();

            expect(useAuthStore.getState().oauthState).toBeNull();
            const restored = useAuthStore.getState().restoreOAuthState();
            expect(restored.formValues).toBeNull();
        });
    });

    describe('reset', () => {
        it('resets all state to initial values', () => {
            useAuthStore.getState().setToken('token');
            useAuthStore.getState().setUserId(42);
            useAuthStore.getState().saveOAuthState({} as unknown as SaveOAuthFormValues, 3);

            useAuthStore.getState().reset();

            const state = useAuthStore.getState();
            expect(state.userId).toBeNull();
            expect(state.authToken).toBeNull();
            expect(state.oauthState).toBeNull();
        });
    });
});
