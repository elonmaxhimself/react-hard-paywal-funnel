import { describe, expect, it } from 'vitest';

import { appendHobbies } from './appendHobbies';

describe('appendHobbies', () => {
    it('appends hobbies sentence to base prompt', () => {
        const result = appendHobbies('She is funny.', ['Gaming', 'Reading']);
        expect(result).toBe('She is funny. Her hobbies are gaming, reading.');
    });

    it('lowercases first character of each hobby', () => {
        const result = appendHobbies('Base.', ['Swimming']);
        expect(result).toBe('Base. Her hobbies are swimming.');
    });

    it('returns base prompt unchanged when hobbies array is empty', () => {
        expect(appendHobbies('Base prompt.', [])).toBe('Base prompt.');
    });

    it('returns base prompt unchanged when hobbies is null/undefined', () => {
        expect(appendHobbies('Base.', null as unknown as string[])).toBe('Base.');
        expect(appendHobbies('Base.', undefined as unknown as string[])).toBe('Base.');
    });

    it('trims trailing whitespace from base prompt before appending', () => {
        const result = appendHobbies('Base   ', ['Gaming']);
        expect(result).toBe('Base Her hobbies are gaming.');
    });

    it('handles single hobby', () => {
        const result = appendHobbies('Prompt.', ['Art']);
        expect(result).toBe('Prompt. Her hobbies are art.');
    });
});
