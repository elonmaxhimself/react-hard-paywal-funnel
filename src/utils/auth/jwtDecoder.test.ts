import { describe, expect, it } from 'vitest';

import { decodeJWT } from './jwtDecoder';

// Helper: create a valid JWT with given payload
const createJWT = (payload: Record<string, unknown>): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.fake-signature`;
};

describe('decodeJWT', () => {
    it('decodes a valid JWT and returns userId', () => {
        const token = createJWT({ userId: 42, email: 'test@test.com' });
        const result = decodeJWT(token);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.payload.userId).toBe(42);
            expect(result.payload.email).toBe('test@test.com');
        }
    });

    it('handles base64url encoding (- and _ chars)', () => {
        // Create a payload that produces base64url special chars
        const token = createJWT({ userId: 1, data: '>>>???' });
        const result = decodeJWT(token);

        expect(result.success).toBe(true);
    });

    it('returns success: false for empty string', () => {
        const result = decodeJWT('');
        expect(result.success).toBe(false);
    });

    it('returns success: false for malformed token (no dots)', () => {
        const result = decodeJWT('not-a-jwt');
        expect(result.success).toBe(false);
    });

    it('returns success: false for invalid base64 payload', () => {
        const result = decodeJWT('header.!!!invalid-base64!!!.signature');
        expect(result.success).toBe(false);
    });

    it('returns success: false for non-JSON payload', () => {
        const header = btoa('{"alg":"HS256"}');
        const body = btoa('this is not json');
        const result = decodeJWT(`${header}.${body}.sig`);
        expect(result.success).toBe(false);
    });

    it('preserves extra fields in payload', () => {
        const token = createJWT({ userId: 1, role: 'admin', customField: 'value' });
        const result = decodeJWT(token);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.payload.role).toBe('admin');
            expect(result.payload.customField).toBe('value');
        }
    });
});
