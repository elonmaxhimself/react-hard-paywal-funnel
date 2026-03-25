import { describe, expect, it } from 'vitest';

import { appendPersonalityTraits } from './appendPersonalityTraits';

describe('appendPersonalityTraits', () => {
    it('appends traits sentence to base prompt', () => {
        const result = appendPersonalityTraits('Base prompt.', ['funny', 'kind']);
        expect(result).toBe('Base prompt. She is Funny, Kind.');
    });

    it('capitalizes first character of each trait', () => {
        const result = appendPersonalityTraits('Base.', ['shy']);
        expect(result).toBe('Base. She is Shy.');
    });

    it('returns base prompt unchanged when traits array is empty', () => {
        expect(appendPersonalityTraits('Base.', [])).toBe('Base.');
    });

    it('returns base prompt unchanged when traits is null/undefined', () => {
        expect(appendPersonalityTraits('Base.', null as unknown as string[])).toBe('Base.');
        expect(appendPersonalityTraits('Base.', undefined as unknown as string[])).toBe('Base.');
    });

    it('trims trailing whitespace from base prompt', () => {
        const result = appendPersonalityTraits('Base   ', ['kind']);
        expect(result).toBe('Base She is Kind.');
    });

    it('handles single trait', () => {
        const result = appendPersonalityTraits('Prompt.', ['bold']);
        expect(result).toBe('Prompt. She is Bold.');
    });
});
