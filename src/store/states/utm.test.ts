import { beforeEach, describe, expect, it } from 'vitest';

import { useUtmStore, getUtmStore } from './utm';

describe('useUtmStore', () => {
    beforeEach(() => {
        useUtmStore.getState().reset();
    });

    describe('initial state', () => {
        it('starts with empty utm object', () => {
            expect(useUtmStore.getState().utm).toEqual({});
        });
    });

    describe('set', () => {
        it('replaces utm data entirely', () => {
            useUtmStore.getState().set({ utm_source: 'google', utm_medium: 'cpc' });
            expect(useUtmStore.getState().utm).toEqual({ utm_source: 'google', utm_medium: 'cpc' });
        });

        it('overwrites previous values', () => {
            useUtmStore.getState().set({ utm_source: 'google' });
            useUtmStore.getState().set({ utm_source: 'facebook' });
            expect(useUtmStore.getState().utm).toEqual({ utm_source: 'facebook' });
        });
    });

    describe('merge', () => {
        it('merges new params with existing', () => {
            useUtmStore.getState().set({ utm_source: 'google' });
            useUtmStore.getState().merge({ utm_medium: 'cpc' });

            expect(useUtmStore.getState().utm).toEqual({
                utm_source: 'google',
                utm_medium: 'cpc',
            });
        });

        it('overwrites conflicting keys on merge', () => {
            useUtmStore.getState().set({ utm_source: 'google', utm_campaign: 'old' });
            useUtmStore.getState().merge({ utm_campaign: 'new' });

            expect(useUtmStore.getState().utm.utm_campaign).toBe('new');
            expect(useUtmStore.getState().utm.utm_source).toBe('google');
        });
    });

    describe('reset', () => {
        it('clears all utm data', () => {
            useUtmStore.getState().set({ utm_source: 'google', utm_medium: 'cpc' });
            useUtmStore.getState().reset();
            expect(useUtmStore.getState().utm).toEqual({});
        });
    });

    describe('getUtmStore', () => {
        it('returns current state reference', () => {
            useUtmStore.getState().set({ source: 'test' });
            expect(getUtmStore().utm).toEqual({ source: 'test' });
        });
    });

    describe('persistence', () => {
        it('persists utm to localStorage under utm-storage key', () => {
            useUtmStore.getState().set({ utm_source: 'fb' });

            const stored = JSON.parse(localStorage.getItem('utm-storage') || '{}');
            expect(stored.state.utm).toEqual({ utm_source: 'fb' });
        });
    });
});
