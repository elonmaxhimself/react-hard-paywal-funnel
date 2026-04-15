import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useExperimentVariant } from './use-experiment-variant';

type FeatureFlagCallback = (
    flags: string[],
    variants: Record<string, string | boolean>,
    ctx?: { errorsLoading?: boolean },
) => void;

const mockPostHog = {
    getFeatureFlag: vi.fn<(flagKey: string) => string | boolean | undefined>(),
    onFeatureFlags: vi.fn<(cb: FeatureFlagCallback) => () => void>(),
    get_distinct_id: vi.fn<() => string>(() => 'distinct-1'),
    capture: vi.fn(),
    identify: vi.fn(),
};

let posthogInstance: typeof mockPostHog | null = mockPostHog;

vi.mock('posthog-js/react', () => ({
    usePostHog: () => posthogInstance,
}));

const FLAG_KEY = 'third-pricing-test';
const STORAGE_KEY = 'mdc_test_pricing';

describe('useExperimentVariant', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        posthogInstance = mockPostHog;
        mockPostHog.getFeatureFlag.mockReset();
        mockPostHog.onFeatureFlags.mockReset();
        mockPostHog.onFeatureFlags.mockImplementation(() => () => {});
    });

    it('waits while userId is null and never calls PostHog', () => {
        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: null,
                fallbackVariant: 'control',
                storageKey: STORAGE_KEY,
            }),
        );

        expect(result.current.variant).toBeNull();
        expect(result.current.isReady).toBe(false);
        expect(mockPostHog.getFeatureFlag).not.toHaveBeenCalled();
        expect(mockPostHog.onFeatureFlags).not.toHaveBeenCalled();
    });

    it('returns variant synchronously when PostHog has flags loaded', () => {
        mockPostHog.getFeatureFlag.mockReturnValue('variant5');

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                storageKey: STORAGE_KEY,
            }),
        );

        expect(result.current.variant).toBe('variant5');
        expect(result.current.isReady).toBe(true);
        expect(result.current.hasAppliedPreselection).toBe(false);
        expect(mockPostHog.getFeatureFlag).toHaveBeenCalledTimes(1);
        expect(mockPostHog.getFeatureFlag).toHaveBeenCalledWith(FLAG_KEY);

        // Persisted for next mount.
        const raw = localStorage.getItem(`${STORAGE_KEY}:1234`);
        expect(raw).not.toBeNull();
        expect(JSON.parse(raw!)).toEqual({
            variant: 'variant5',
            preselectionApplied: false,
        });
    });

    it('replays persisted variant without calling getFeatureFlag (no exposure)', () => {
        localStorage.setItem(`${STORAGE_KEY}:1234`, JSON.stringify({ variant: 'variant3', preselectionApplied: true }));

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                storageKey: STORAGE_KEY,
            }),
        );

        expect(result.current.variant).toBe('variant3');
        expect(result.current.isReady).toBe(true);
        expect(result.current.hasAppliedPreselection).toBe(true);
        expect(mockPostHog.getFeatureFlag).not.toHaveBeenCalled();
        expect(mockPostHog.onFeatureFlags).not.toHaveBeenCalled();
    });

    it('resolves via onFeatureFlags when flags load asynchronously', () => {
        mockPostHog.getFeatureFlag.mockReturnValue(undefined);

        let capturedCallback: FeatureFlagCallback | null = null;
        mockPostHog.onFeatureFlags.mockImplementation((cb) => {
            capturedCallback = cb;
            return () => {};
        });

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                storageKey: STORAGE_KEY,
            }),
        );

        expect(result.current.variant).toBeNull();
        expect(mockPostHog.onFeatureFlags).toHaveBeenCalledTimes(1);

        act(() => {
            capturedCallback?.([FLAG_KEY], { [FLAG_KEY]: 'variant4' });
        });

        expect(result.current.variant).toBe('variant4');
        expect(result.current.isReady).toBe(true);
    });

    it('ignores callback fires with errorsLoading', () => {
        mockPostHog.getFeatureFlag.mockReturnValue(undefined);

        let capturedCallback: FeatureFlagCallback | null = null;
        mockPostHog.onFeatureFlags.mockImplementation((cb) => {
            capturedCallback = cb;
            return () => {};
        });

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                storageKey: STORAGE_KEY,
            }),
        );

        act(() => {
            capturedCallback?.([FLAG_KEY], { [FLAG_KEY]: 'variant4' }, { errorsLoading: true });
        });

        expect(result.current.variant).toBeNull();
    });

    it('falls back to fallbackVariant after fallbackMs', () => {
        mockPostHog.getFeatureFlag.mockReturnValue(undefined);
        mockPostHog.onFeatureFlags.mockImplementation(() => () => {});

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                fallbackMs: 2000,
                storageKey: STORAGE_KEY,
            }),
        );

        expect(result.current.variant).toBeNull();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.variant).toBe('control');
        expect(result.current.isReady).toBe(true);

        const raw = localStorage.getItem(`${STORAGE_KEY}:1234`);
        expect(JSON.parse(raw!)).toEqual({
            variant: 'control',
            preselectionApplied: false,
        });
    });

    it('falls back when PostHog provider is absent', () => {
        posthogInstance = null;

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                fallbackMs: 2000,
                storageKey: STORAGE_KEY,
            }),
        );

        expect(result.current.variant).toBeNull();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.variant).toBe('control');
        expect(result.current.isReady).toBe(true);
        expect(mockPostHog.getFeatureFlag).not.toHaveBeenCalled();
        expect(mockPostHog.onFeatureFlags).not.toHaveBeenCalled();
    });

    it('does not fallback if a variant resolved first', () => {
        mockPostHog.getFeatureFlag.mockReturnValue('variant2');

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                fallbackMs: 2000,
                storageKey: STORAGE_KEY,
            }),
        );

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(result.current.variant).toBe('variant2');
    });

    it('does not re-resolve when userId changes (lock after first resolution)', () => {
        mockPostHog.getFeatureFlag.mockReturnValue('variant1');

        const { result, rerender } = renderHook(
            ({ userId }: { userId: number }) =>
                useExperimentVariant(FLAG_KEY, {
                    userId,
                    fallbackVariant: 'control',
                    storageKey: STORAGE_KEY,
                }),
            { initialProps: { userId: 1234 } },
        );

        expect(result.current.variant).toBe('variant1');
        expect(mockPostHog.getFeatureFlag).toHaveBeenCalledTimes(1);

        rerender({ userId: 9999 });

        // Variant sticks to the first-resolved value; we don't re-read.
        expect(result.current.variant).toBe('variant1');
        expect(mockPostHog.getFeatureFlag).toHaveBeenCalledTimes(1);
    });

    it('persists preselectionApplied via markPreselectionApplied', () => {
        mockPostHog.getFeatureFlag.mockReturnValue('variant5');

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                storageKey: STORAGE_KEY,
            }),
        );

        expect(result.current.hasAppliedPreselection).toBe(false);

        act(() => {
            result.current.markPreselectionApplied();
        });

        expect(result.current.hasAppliedPreselection).toBe(true);

        const raw = localStorage.getItem(`${STORAGE_KEY}:1234`);
        expect(JSON.parse(raw!)).toEqual({
            variant: 'variant5',
            preselectionApplied: true,
        });
    });

    it('markPreselectionApplied is a no-op when userId is null', () => {
        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: null,
                fallbackVariant: 'control',
                storageKey: STORAGE_KEY,
            }),
        );

        act(() => {
            result.current.markPreselectionApplied();
        });

        expect(result.current.hasAppliedPreselection).toBe(false);
    });

    it('tolerates corrupted localStorage payload and re-resolves from PostHog', () => {
        localStorage.setItem(`${STORAGE_KEY}:1234`, '{not json');
        mockPostHog.getFeatureFlag.mockReturnValue('variant6');

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                storageKey: STORAGE_KEY,
            }),
        );

        expect(result.current.variant).toBe('variant6');
        expect(mockPostHog.getFeatureFlag).toHaveBeenCalledTimes(1);
    });

    it('ignores non-string variant values (e.g. boolean flag accidentally used)', () => {
        mockPostHog.getFeatureFlag.mockReturnValue(true);
        mockPostHog.onFeatureFlags.mockImplementation(() => () => {});

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                fallbackMs: 1000,
                storageKey: STORAGE_KEY,
            }),
        );

        // Boolean flag is not a valid variant; wait for fallback.
        expect(result.current.variant).toBeNull();

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.variant).toBe('control');
    });
});
