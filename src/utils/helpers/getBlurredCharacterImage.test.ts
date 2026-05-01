import { describe, expect, it } from 'vitest';

import { getBlurredCharacterImage } from './getBlurredCharacterImage';

describe('getBlurredCharacterImage', () => {
    it.each([
        ['caucasian', 'blonde', '/images/blurred-characters/white-blonde.png'],
        ['caucasian', 'brunette', '/images/blurred-characters/white-brunette.png'],
        ['caucasian', 'black', '/images/blurred-characters/white-black.png'],
        ['caucasian', 'ginger', '/images/blurred-characters/white-ginger.png'],
        ['black', 'blonde', '/images/blurred-characters/black-blonde.png'],
        ['black', 'black', '/images/blurred-characters/black-black.png'],
        ['latina', 'brunette', '/images/blurred-characters/black-brunette.png'],
        ['arab', 'blonde', '/images/blurred-characters/white-blonde.png'],
        ['asian', 'black', '/images/blurred-characters/white-black.png'],
    ])('returns correct path for ethnicity="%s" hair="%s"', (ethnicity, hair, expected) => {
        expect(getBlurredCharacterImage(ethnicity, hair)).toBe(expected);
    });

    it('returns null for unknown ethnicity', () => {
        expect(getBlurredCharacterImage('martian', 'blonde')).toBeNull();
    });

    it('returns null for unknown hair color', () => {
        expect(getBlurredCharacterImage('caucasian', 'purple')).toBeNull();
    });

    it('returns null when both are unknown', () => {
        expect(getBlurredCharacterImage('unknown', 'unknown')).toBeNull();
    });

    it('returns null for empty strings', () => {
        expect(getBlurredCharacterImage('', '')).toBeNull();
    });
});
