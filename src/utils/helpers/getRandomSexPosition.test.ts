import { describe, expect, it, vi } from 'vitest';

import { getRandomSexPosition } from './getRandomSexPosition';

describe('getRandomSexPosition', () => {
    const positions = [{ value: 'missionary' }, { value: 'doggy' }, { value: 'cowgirl' }];

    it('returns a value from the array', () => {
        const result = getRandomSexPosition(positions);
        expect(positions.map((p) => p.value)).toContain(result);
    });

    it('returns first element when Math.random returns 0', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getRandomSexPosition(positions)).toBe('missionary');
        vi.restoreAllMocks();
    });

    it('returns last element when Math.random is close to 1', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.9999);
        expect(getRandomSexPosition(positions)).toBe('cowgirl');
        vi.restoreAllMocks();
    });

    it('returns the only element from single-item array', () => {
        expect(getRandomSexPosition([{ value: 'only' }])).toBe('only');
    });
});
