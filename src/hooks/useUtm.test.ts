import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useInitUtm } from './useUtm';
import { useUtmStore } from '@/store/states/utm';

describe('useInitUtm', () => {
    beforeEach(() => {
        useUtmStore.getState().reset();
        // Reset URL
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { ...window.location, search: '' },
        });
    });

    it('captures UTM params from URL', () => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { ...window.location, search: '?utm_source=google&utm_medium=cpc&utm_campaign=test' },
        });

        renderHook(() => useInitUtm());

        const { utm } = useUtmStore.getState();
        expect(utm).toEqual({
            utm_source: 'google',
            utm_medium: 'cpc',
            utm_campaign: 'test',
        });
    });

    it('excludes OAuth callback params', () => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { ...window.location, search: '?state=google&code=auth_123&scope=email&utm_source=fb' },
        });

        renderHook(() => useInitUtm());

        const { utm } = useUtmStore.getState();
        // state=google + code present = OAuth redirect → skip entirely
        expect(utm).toEqual({});
    });

    it('excludes known non-UTM params when not OAuth redirect', () => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { ...window.location, search: '?authtoken=jwt123&utm_source=fb&prompt=consent' },
        });

        renderHook(() => useInitUtm());

        const { utm } = useUtmStore.getState();
        expect(utm).toEqual({ utm_source: 'fb' });
        expect(utm).not.toHaveProperty('authtoken');
        expect(utm).not.toHaveProperty('prompt');
    });

    it('does nothing when URL has no params', () => {
        renderHook(() => useInitUtm());
        expect(useUtmStore.getState().utm).toEqual({});
    });

    it('merges with existing UTM data (does not replace)', () => {
        useUtmStore.getState().set({ existing_param: 'keep' });

        Object.defineProperty(window, 'location', {
            writable: true,
            value: { ...window.location, search: '?utm_source=new' },
        });

        renderHook(() => useInitUtm());

        const { utm } = useUtmStore.getState();
        expect(utm.existing_param).toBe('keep');
        expect(utm.utm_source).toBe('new');
    });

    it('captures custom non-UTM params (e.g. gclid, fbclid)', () => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { ...window.location, search: '?gclid=abc123&fbclid=def456' },
        });

        renderHook(() => useInitUtm());

        const { utm } = useUtmStore.getState();
        expect(utm.gclid).toBe('abc123');
        expect(utm.fbclid).toBe('def456');
    });

    describe('initialUrl capture', () => {
        it('captures full landing URL with UTM params', () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    ...window.location,
                    href: 'https://companiondream.com/?utm_source=google&utm_campaign=spring',
                    search: '?utm_source=google&utm_campaign=spring',
                },
            });

            renderHook(() => useInitUtm());

            expect(useUtmStore.getState().initialUrl).toBe(
                'https://companiondream.com/?utm_source=google&utm_campaign=spring',
            );
        });

        it('captures landing URL even without query params', () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    ...window.location,
                    href: 'https://companiondream.com/',
                    search: '',
                },
            });

            renderHook(() => useInitUtm());

            expect(useUtmStore.getState().initialUrl).toBe('https://companiondream.com/');
        });

        it('does NOT capture URL on OAuth callback page', () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    ...window.location,
                    href: 'https://companiondream.com/?state=google&code=auth_code',
                    search: '?state=google&code=auth_code',
                },
            });

            renderHook(() => useInitUtm());

            // OAuth callback — URL should NOT be captured (landing URL was already stored before redirect)
            expect(useUtmStore.getState().initialUrl).toBeNull();
        });

        it('preserves first URL across re-renders (first-win)', () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    ...window.location,
                    href: 'https://companiondream.com/?utm_source=first',
                    search: '?utm_source=first',
                },
            });

            renderHook(() => useInitUtm());

            // Simulate second mount with different URL
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    ...window.location,
                    href: 'https://companiondream.com/?utm_source=second',
                    search: '?utm_source=second',
                },
            });

            renderHook(() => useInitUtm());

            expect(useUtmStore.getState().initialUrl).toBe('https://companiondream.com/?utm_source=first');
        });
    });
});
