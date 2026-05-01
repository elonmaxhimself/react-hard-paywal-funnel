import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockPost = vi.fn();
vi.mock('@/lib/axios', () => ({
    default: { post: mockPost },
}));

vi.mock('@/config/env', () => ({
    env: {
        sessionTransferApiUrl: 'https://api.mydreamcompanion.com',
    },
}));

// Mock window.location.href
const originalLocation = window.location;

describe('redirectToMainApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.location to capture href assignments
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { ...originalLocation, href: '' },
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: originalLocation,
        });
    });

    it('should use session transfer when create-transfer-code succeeds', async () => {
        mockPost.mockResolvedValue({ data: { code: 'abc-123' } });

        const { redirectToMainApp } = await import('./redirectToMainApp');
        await redirectToMainApp('https://mydreamcompanion.com/companion/1', 'old-token');

        expect(mockPost).toHaveBeenCalledWith('/auth/create-transfer-code');
        expect(window.location.href).toContain('api.mydreamcompanion.com/auth/session-transfer');
        expect(window.location.href).toContain('code=abc-123');
        expect(window.location.href).toContain(
            'redirect=' + encodeURIComponent('https://mydreamcompanion.com/companion/1'),
        );
        // Should NOT contain authToken in URL
        expect(window.location.href).not.toContain('authToken=');
    });

    it('should fall back to ?authToken= when create-transfer-code fails', async () => {
        mockPost.mockRejectedValue(new Error('Network error'));

        const { redirectToMainApp } = await import('./redirectToMainApp');
        await redirectToMainApp('https://mydreamcompanion.com', 'my-jwt-token');

        expect(window.location.href).toBe('https://mydreamcompanion.com?authToken=my-jwt-token');
    });

    it('should redirect without auth when both transfer code and token unavailable', async () => {
        mockPost.mockRejectedValue(new Error('Network error'));

        const { redirectToMainApp } = await import('./redirectToMainApp');
        await redirectToMainApp('https://mydreamcompanion.com', null);

        expect(window.location.href).toBe('https://mydreamcompanion.com');
    });

    it('should use session transfer API URL from env config', async () => {
        mockPost.mockResolvedValue({ data: { code: 'xyz-789' } });

        const { redirectToMainApp } = await import('./redirectToMainApp');
        await redirectToMainApp('https://mydreamcompanion.com', null);

        expect(window.location.href).toMatch(/^https:\/\/api\.mydreamcompanion\.com\/auth\/session-transfer/);
    });
});
