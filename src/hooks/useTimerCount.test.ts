import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useTimer } from './useTimerCount';

describe('useTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with the given countdown value', () => {
        const { result } = renderHook(() => useTimer(60));

        expect(result.current.countdown).toBe(60);
        expect(result.current.isTimerActive).toBe(false);
        expect(result.current.formattedTime).toBe('01:00');
    });

    it('starts counting down when startTimer is called', () => {
        const { result } = renderHook(() => useTimer(10));

        act(() => {
            result.current.startTimer();
        });
        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(result.current.countdown).toBe(7);
        expect(result.current.isTimerActive).toBe(true);
    });

    it('stops at 0 and deactivates', () => {
        const { result } = renderHook(() => useTimer(3));

        act(() => {
            result.current.startTimer();
        });
        act(() => {
            vi.advanceTimersByTime(4000);
        });

        expect(result.current.countdown).toBe(0);
        expect(result.current.isTimerActive).toBe(false);
    });

    it('auto-starts when isActive prop is true', () => {
        const { result } = renderHook(() => useTimer(5, true));

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.countdown).toBe(3);
        expect(result.current.isTimerActive).toBe(true);
    });

    it('stopTimer halts countdown', () => {
        const { result } = renderHook(() => useTimer(10));

        act(() => {
            result.current.startTimer();
        });
        act(() => {
            vi.advanceTimersByTime(2000);
        });
        act(() => {
            result.current.stopTimer();
        });
        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(result.current.countdown).toBe(8); // stopped at 8
    });

    it('resetTimer resets to initial value and stops', () => {
        const { result } = renderHook(() => useTimer(10));

        act(() => {
            result.current.startTimer();
        });
        act(() => {
            vi.advanceTimersByTime(3000);
        });
        act(() => {
            result.current.resetTimer();
        });

        expect(result.current.countdown).toBe(10);
        expect(result.current.isTimerActive).toBe(false);
    });

    it('calculates progress correctly', () => {
        const { result } = renderHook(() => useTimer(10));

        act(() => {
            result.current.startTimer();
        });
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(result.current.progress).toBe(50); // (10-5)/10 * 100
    });

    it('progress is 100 when countdown reaches 0', () => {
        const { result } = renderHook(() => useTimer(2));

        act(() => {
            result.current.startTimer();
        });
        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(result.current.progress).toBe(100);
    });

    it('formats time as MM:SS', () => {
        const { result } = renderHook(() => useTimer(125)); // 2:05
        expect(result.current.formattedTime).toBe('02:05');
    });

    it('shouldShowTimer is true when active or completed', () => {
        const { result } = renderHook(() => useTimer(2));

        expect(result.current.shouldShowTimer).toBe(false);

        act(() => {
            result.current.startTimer();
        });
        expect(result.current.shouldShowTimer).toBe(true);

        act(() => {
            vi.advanceTimersByTime(3000);
        });
        // countdown is 0, so shouldShowTimer = true (countdown === 0 condition)
        expect(result.current.shouldShowTimer).toBe(true);
    });
});
