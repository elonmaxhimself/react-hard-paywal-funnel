import { describe, expect, it, beforeEach } from 'vitest';

import { getTrackDeskCid } from './getTrackDeskCid';

describe('getTrackDeskCid', () => {
    beforeEach(() => {
        // Clear all cookies
        document.cookie.split(';').forEach((cookie) => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });
    });

    it('returns cid from valid trakdesk_cid cookie', () => {
        const cookieValue = encodeURIComponent(JSON.stringify({ tenantId: 'tenant_1', cid: 'click_abc123' }));
        document.cookie = `trakdesk_cid=${cookieValue}; path=/`;

        expect(getTrackDeskCid()).toBe('click_abc123');
    });

    it('returns null when cookie does not exist', () => {
        expect(getTrackDeskCid()).toBeNull();
    });

    it('returns null when cookie value is invalid JSON', () => {
        document.cookie = 'trakdesk_cid=not-json; path=/';
        expect(getTrackDeskCid()).toBeNull();
    });

    it('returns null when cookie has no cid field', () => {
        const cookieValue = encodeURIComponent(JSON.stringify({ tenantId: 'tenant_1' }));
        document.cookie = `trakdesk_cid=${cookieValue}; path=/`;

        expect(getTrackDeskCid()).toBeNull();
    });

    it('returns null when cid is empty string', () => {
        const cookieValue = encodeURIComponent(JSON.stringify({ tenantId: 'tenant_1', cid: '' }));
        document.cookie = `trakdesk_cid=${cookieValue}; path=/`;

        expect(getTrackDeskCid()).toBeNull();
    });

    it('ignores other cookies and finds trakdesk_cid', () => {
        document.cookie = 'other_cookie=foo; path=/';
        const cookieValue = encodeURIComponent(JSON.stringify({ cid: 'found_it' }));
        document.cookie = `trakdesk_cid=${cookieValue}; path=/`;
        document.cookie = 'another=bar; path=/';

        expect(getTrackDeskCid()).toBe('found_it');
    });
});
