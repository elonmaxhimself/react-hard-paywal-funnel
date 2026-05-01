import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const initialTime = { hours: 0, minutes: 1, seconds: 30 };

    it('initializes with the given time', () => {
        const { result } = renderHook(() => useCountdown(initialTime, { autoStart: false }));

        expect(result.current.timeLeft).toEqual(initialTime);
        expect(result.current.totalSeconds).toBe(90);
        expect(result.current.formattedTime).toBe('00:01:30');
        expect(result.current.isRunning).toBe(false);
        expect(result.current.isCompleted).toBe(false);
    });

    it('auto-starts when autoStart is true (default)', () => {
        const { result } = renderHook(() => useCountdown(initialTime));
        expect(result.current.isRunning).toBe(true);
    });

    it('counts down each second', () => {
        const { result } = renderHook(() => useCountdown({ hours: 0, minutes: 0, seconds: 3 }));

        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.timeLeft.seconds).toBe(2);

        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.timeLeft.seconds).toBe(1);
    });

    it('rolls over minutes to seconds', () => {
        const { result } = renderHook(() => useCountdown({ hours: 0, minutes: 1, seconds: 0 }));

        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.timeLeft).toEqual({ hours: 0, minutes: 0, seconds: 59 });
    });

    it('rolls over hours to minutes', () => {
        const { result } = renderHook(() => useCountdown({ hours: 1, minutes: 0, seconds: 0 }));

        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.timeLeft).toEqual({ hours: 0, minutes: 59, seconds: 59 });
    });

    it('calls onComplete when timer reaches zero', () => {
        const onComplete = vi.fn();
        const onTick = vi.fn();
        renderHook(() => useCountdown({ hours: 0, minutes: 0, seconds: 2 }, { onComplete, onTick }));

        // Tick 1: 2→1, Tick 2: 1→0, Tick 3: detects all-zero → onComplete
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('reaches zero and stops ticking', () => {
        const onTick = vi.fn();
        const { result } = renderHook(() => useCountdown({ hours: 0, minutes: 0, seconds: 2 }, { onTick }));

        act(() => {
            vi.advanceTimersByTime(1000);
        }); // 2→1
        act(() => {
            vi.advanceTimersByTime(1000);
        }); // 1→0

        expect(result.current.timeLeft).toEqual({ hours: 0, minutes: 0, seconds: 0 });

        // Timer should have stopped — further ticks produce no more onTick calls
        const callCount = onTick.mock.calls.length;
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        expect(onTick.mock.calls.length).toBe(callCount);
    });

    it('calls onTick on each tick', () => {
        const onTick = vi.fn();
        renderHook(() => useCountdown({ hours: 0, minutes: 0, seconds: 3 }, { onTick }));

        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(onTick).toHaveBeenCalledWith({ hours: 0, minutes: 0, seconds: 2 });
    });

    it('pause stops the countdown', () => {
        const { result } = renderHook(() => useCountdown({ hours: 0, minutes: 0, seconds: 10 }));

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(result.current.timeLeft.seconds).toBe(8);

        act(() => {
            result.current.pause();
        });
        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(result.current.timeLeft.seconds).toBe(8); // unchanged
    });

    it('start resumes after pause', () => {
        const { result } = renderHook(() => useCountdown({ hours: 0, minutes: 0, seconds: 10 }));

        act(() => {
            result.current.pause();
        });
        act(() => {
            result.current.start();
        });
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.timeLeft.seconds).toBe(9);
    });

    it('reset restores initial time and state', () => {
        const initial = { hours: 0, minutes: 0, seconds: 5 };
        const { result } = renderHook(() => useCountdown(initial, { autoStart: false }));

        act(() => {
            result.current.start();
        });
        act(() => {
            vi.advanceTimersByTime(3000);
        });
        act(() => {
            result.current.reset();
        });

        expect(result.current.timeLeft).toEqual(initial);
        expect(result.current.isCompleted).toBe(false);
    });

    it('stop resets time and stops', () => {
        const initial = { hours: 0, minutes: 0, seconds: 5 };
        const { result } = renderHook(() => useCountdown(initial));

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        act(() => {
            result.current.stop();
        });

        expect(result.current.timeLeft).toEqual(initial);
        expect(result.current.isRunning).toBe(false);
    });

    it('formatTime pads single digits', () => {
        const { result } = renderHook(() => useCountdown({ hours: 0, minutes: 0, seconds: 5 }, { autoStart: false }));
        expect(result.current.formatTime(5)).toBe('05');
        expect(result.current.formatTime(12)).toBe('12');
        expect(result.current.formatTime(0)).toBe('00');
    });
});
