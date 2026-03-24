import { describe, expect, it, vi } from 'vitest';

import { getRandomFromRange } from './getRandomFromRange';

describe('getRandomFromRange', () => {
    it('returns a number within the specified range', () => {
        const result = getRandomFromRange('20-25');
        expect(result).toBeGreaterThanOrEqual(20);
        expect(result).toBeLessThanOrEqual(25);
    });

    it('returns exact value when min equals max', () => {
        expect(getRandomFromRange('18-18')).toBe(18);
    });

    it('returns min when Math.random returns 0', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getRandomFromRange('10-20')).toBe(10);
        vi.restoreAllMocks();
    });

    it('returns max when Math.random is close to 1', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.9999);
        expect(getRandomFromRange('10-20')).toBe(20);
        vi.restoreAllMocks();
    });

    it('throws on invalid format (no dash)', () => {
        expect(() => getRandomFromRange('abc')).toThrow('Invalid range format');
    });

    it('throws when min > max', () => {
        expect(() => getRandomFromRange('30-20')).toThrow('Invalid range format');
    });

    it('throws on non-numeric values', () => {
        expect(() => getRandomFromRange('abc-def')).toThrow('Invalid range format');
    });

    it('throws on empty string', () => {
        expect(() => getRandomFromRange('')).toThrow('Invalid range format');
    });
});
