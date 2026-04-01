import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useShift4Ready } from './useShift4Ready';

describe('useShift4Ready', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: false });
    });

    afterEach(() => {
        vi.useRealTimers();
        delete (window as Record<string, unknown>).Shift4;
    });

    it('detects Shift4 when immediately available', () => {
        (window as Record<string, unknown>).Shift4 = vi.fn();

        const { result } = renderHook(() => useShift4Ready());

        // First check runs on mount — no timer needed
        expect(result.current.isReady).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('detects Shift4 after delayed load', () => {
        const { result } = renderHook(() => useShift4Ready());
        expect(result.current.isReady).toBe(false);

        // After 3 poll cycles (300ms), make Shift4 available
        act(() => {
            vi.advanceTimersByTime(100);
        }); // attempt 2
        act(() => {
            vi.advanceTimersByTime(100);
        }); // attempt 3

        (window as Record<string, unknown>).Shift4 = vi.fn();

        act(() => {
            vi.advanceTimersByTime(100);
        }); // attempt 4 — finds Shift4

        expect(result.current.isReady).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('sets error after max attempts (50 × 100ms = 5s)', () => {
        const { result } = renderHook(() => useShift4Ready());

        // Advance through all 50 attempts
        for (let i = 0; i < 50; i++) {
            act(() => {
                vi.advanceTimersByTime(100);
            });
        }

        expect(result.current.isReady).toBe(false);
        expect(result.current.error).toBe('Shift4 failed to load within 5 seconds');
    });

    it('does not continue polling after Shift4 is found', () => {
        (window as Record<string, unknown>).Shift4 = vi.fn();

        const { result } = renderHook(() => useShift4Ready());
        expect(result.current.isReady).toBe(true);

        // Further timer advances should not cause issues
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.isReady).toBe(true);
    });
});
