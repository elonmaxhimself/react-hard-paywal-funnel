import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useExperimentVariant } from './useExperimentVariant';

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

// Module-level holder so individual tests can swap the value `usePostHog`
// returns — in particular, to `null` which is what happens when
// `<ClientPosthogProvider>` renders without a token and therefore without a
// PostHog context.
let posthogReturnValue: typeof mockPostHog | null = mockPostHog;

vi.mock('posthog-js/react', () => ({
    usePostHog: () => posthogReturnValue,
}));

const FLAG_KEY = 'third-pricing-test';
const STORAGE_KEY = 'mdc_test_pricing';

describe('useExperimentVariant', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockPostHog.getFeatureFlag.mockReset();
        mockPostHog.onFeatureFlags.mockReset();
        mockPostHog.onFeatureFlags.mockImplementation(() => () => {});
        // Default: identified distinct_id matches the userId=1234 used in
        // most tests, so the hook's distinct_id guard accepts the
        // synchronous flag read. Tests covering the "still anonymous"
        // race case override this with a different value.
        mockPostHog.get_distinct_id.mockReset();
        mockPostHog.get_distinct_id.mockReturnValue('1234');
        // Reset `usePostHog` mock to the default mock client. Tests that
        // cover the "no PostHog provider" path should set this to `null`.
        posthogReturnValue = mockPostHog;
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
        // First sync read: flags not yet cached.
        mockPostHog.getFeatureFlag.mockReturnValueOnce(undefined);

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

        // Flags load — `onFeatureFlags` callback fires; the hook re-reads
        // `getFeatureFlag` (which now returns the variant AND emits the
        // exposure event PostHog needs to attribute the user).
        mockPostHog.getFeatureFlag.mockReturnValue('variant4');

        act(() => {
            capturedCallback?.([FLAG_KEY], { [FLAG_KEY]: 'variant4' });
        });

        expect(result.current.variant).toBe('variant4');
        expect(result.current.isReady).toBe(true);
        // getFeatureFlag was called twice: once on mount (returned undefined)
        // and once after the flag-update callback (returned 'variant4').
        // The second call is what emits the single exposure event.
        expect(mockPostHog.getFeatureFlag).toHaveBeenCalledTimes(2);
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

    it('waits for identify before emitting exposure (anonymous → identified)', () => {
        // Simulates the realistic edge case: user returns to the funnel
        // after the sessionStorage-backed PostHog distinct_id has expired.
        // PostHog `init()` creates a fresh anonymous distinct_id and loads
        // flags for it; only later does `loaded()` callback fire and call
        // `identify(userId)`. If `getFeatureFlag` runs between init and
        // identify, the exposure event would be attributed to the
        // anonymous distinct_id — which (without ensure_experience_continuity)
        // can resolve to a different variant than the identified user.

        // Stage 1: SubscriptionStep mounts while PostHog is still on the
        // anonymous distinct_id. The hook must NOT emit an exposure yet.
        mockPostHog.get_distinct_id.mockReturnValue('anon-xxx');
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

        // Hook subscribed for updates but did NOT call getFeatureFlag —
        // distinct_id was anonymous, so reading the flag would emit
        // exposure with the wrong identity.
        expect(result.current.variant).toBeNull();
        expect(mockPostHog.getFeatureFlag).not.toHaveBeenCalled();
        expect(mockPostHog.onFeatureFlags).toHaveBeenCalledTimes(1);

        // Stage 2: PostHog finishes its `loaded` callback and calls
        // identify(1234). Subsequent flag reload triggers `onFeatureFlags`.
        mockPostHog.get_distinct_id.mockReturnValue('1234');
        mockPostHog.getFeatureFlag.mockReturnValue('variant5');

        act(() => {
            capturedCallback?.([FLAG_KEY], { [FLAG_KEY]: 'variant5' });
        });

        // Now the hook resolves — the exposure event is emitted via the
        // `getFeatureFlag` call inside `resolveIfIdentified`, attributed
        // to the identified distinct id.
        expect(result.current.variant).toBe('variant5');
        expect(result.current.isReady).toBe(true);
        expect(mockPostHog.getFeatureFlag).toHaveBeenCalledTimes(1);
        expect(mockPostHog.getFeatureFlag).toHaveBeenCalledWith(FLAG_KEY);
    });

    it('falls back via getFeatureFlag if identify never propagates within timeout', () => {
        // Tail case: PostHog SDK never identifies (e.g. /flags request
        // hangs, network failure). After fallbackMs we must read the flag
        // anyway — better to emit an anonymous-attributed exposure than to
        // strand the user on an indefinite loader.
        mockPostHog.get_distinct_id.mockReturnValue('anon-xxx');
        mockPostHog.getFeatureFlag.mockReturnValue('control');

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                fallbackMs: 3000,
                storageKey: STORAGE_KEY,
            }),
        );

        expect(result.current.variant).toBeNull();
        expect(mockPostHog.getFeatureFlag).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(result.current.variant).toBe('control');
        expect(result.current.isReady).toBe(true);
        // Called once inside the timeout callback.
        expect(mockPostHog.getFeatureFlag).toHaveBeenCalledTimes(1);
    });

    it('falls back immediately when PostHog client is unavailable (no provider)', () => {
        // Scenario: `<ClientPosthogProvider>` rendered without a token
        // (e.g. env var not set on a Cloudflare Pages preview deploy), so
        // `usePostHog()` returns `null`. The hook must still resolve to the
        // fallback variant so the funnel's SubscriptionStep can render.
        posthogReturnValue = null;

        const { result } = renderHook(() =>
            useExperimentVariant(FLAG_KEY, {
                userId: 1234,
                fallbackVariant: 'control',
                fallbackMs: 3000,
                storageKey: STORAGE_KEY,
            }),
        );

        // Fallback is committed immediately — no need to wait for the
        // timeout, because the flag can never resolve without a client.
        expect(result.current.variant).toBe('control');
        expect(result.current.isReady).toBe(true);
        expect(mockPostHog.getFeatureFlag).not.toHaveBeenCalled();
        expect(mockPostHog.onFeatureFlags).not.toHaveBeenCalled();

        // The fallback should be persisted like any other resolution, so a
        // future mount (e.g. after env var is fixed and PostHog is
        // available) still short-circuits via the localStorage cache.
        const raw = localStorage.getItem(`${STORAGE_KEY}:1234`);
        expect(JSON.parse(raw!)).toEqual({
            variant: 'control',
            preselectionApplied: false,
        });
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
