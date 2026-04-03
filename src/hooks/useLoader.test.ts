import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useLoader } from './useLoader';

describe('useLoader', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with initialCountdown', () => {
        const { result } = renderHook(() => useLoader(0, 100, 50));
        expect(result.current.progress).toBe(0);
    });

    it('increments progress on start until maxCountdown', async () => {
        const { result } = renderHook(() => useLoader(0, 5, 100));

        let resolved = false;
        act(() => {
            result.current.start().then(() => {
                resolved = true;
            });
        });

        // Advance 6 intervals to ensure we reach 5 (0→1→2→3→4→5)
        for (let i = 0; i < 6; i++) {
            await act(async () => {
                vi.advanceTimersByTime(100);
            });
        }

        expect(result.current.progress).toBe(5);
        expect(resolved).toBe(true);
    });

    it('resolves immediately when initialCountdown >= maxCountdown', async () => {
        const { result } = renderHook(() => useLoader(10, 5, 100));

        let resolved = false;
        await act(async () => {
            await result.current.start().then(() => {
                resolved = true;
            });
        });

        expect(resolved).toBe(true);
    });

    it('uses correct speed interval', () => {
        const { result } = renderHook(() => useLoader(0, 3, 200));

        act(() => {
            result.current.start();
        });

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(result.current.progress).toBe(1);

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(result.current.progress).toBe(2);
    });
});
