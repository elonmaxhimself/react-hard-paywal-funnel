import { describe, expect, it } from 'vitest';

import { passwordRegex } from './password-regex';

describe('passwordRegex', () => {
    it.each(['Password1', 'abc12345', 'A1bcdefg', 'myP4ssword!', '12345678a', 'aB3defghijk'])(
        'accepts valid password: "%s"',
        (pw) => {
            expect(passwordRegex.test(pw)).toBe(true);
        },
    );

    it.each([
        ['short1A', 'too short (7 chars)'],
        ['abcdefgh', 'no digits'],
        ['12345678', 'no letters'],
        ['', 'empty string'],
        ['Ab1', 'too short (3 chars)'],
    ])('rejects invalid password: "%s" (%s)', (pw) => {
        expect(passwordRegex.test(pw)).toBe(false);
    });
});
