import { useCallback, useEffect, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';

/**
 * Shape persisted to `localStorage` under `${storageKey}:${userId}`.
 *
 * Keeping the persisted blob user-scoped ensures that a variant assignment
 * is sticky across page refreshes and component remounts for the same
 * identified user, which is critical to avoid sending multiple PostHog
 * exposure events (each with a potentially different variant) and ending
 * up with users attributed to the special `$multiple` bucket.
 */
interface PersistedVariant {
    variant: string;
    preselectionApplied: boolean;
}

interface UseExperimentVariantOptions {
    /** Identified user id. While `null`, the hook waits — no flag is read. */
    userId: number | null;
    /** Variant returned after `fallbackMs` if PostHog never resolves. */
    fallbackVariant: string;
    /** Fallback timeout in ms (default 3000). */
    fallbackMs?: number;
    /** localStorage key prefix, e.g. `"mdc_funnel_pricing_v3"`. */
    storageKey: string;
}

interface UseExperimentVariantResult {
    /** Resolved variant key, or `null` while still loading. */
    variant: string | null;
    /** `true` once a variant is available (from cache, PostHog, or fallback). */
    isReady: boolean;
    /**
     * `true` if the consumer has already applied the variant-driven UI
     * preselection (e.g. set a default product id on a form). Restored from
     * localStorage across remounts so that returning to the same step does
     * not blindly overwrite the user's manual choice.
     */
    hasAppliedPreselection: boolean;
    /** Record that preselection has been applied (persists to localStorage). */
    markPreselectionApplied: () => void;
}

const readPersisted = (key: string): PersistedVariant | null => {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as PersistedVariant;
        if (typeof parsed?.variant !== 'string') return null;
        return {
            variant: parsed.variant,
            preselectionApplied: Boolean(parsed.preselectionApplied),
        };
    } catch {
        return null;
    }
};

const writePersisted = (key: string, value: PersistedVariant): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* localStorage may be unavailable (Safari private mode, quota) — ignore. */
    }
};

/**
 * Resolve a PostHog multivariate experiment variant once per identified user.
 *
 * Design goals:
 * - **One exposure per user.** PostHog's `getFeatureFlag` emits a
 *   `$feature_flag_called` event on every call. Without care this fires on
 *   every remount / refresh and can resolve to different variants (especially
 *   if a call slips in before `identify()` has flushed), producing `$multiple`
 *   bucket attribution and corrupting experiment metrics. This hook caches
 *   the first resolved variant per `userId` in localStorage and short-circuits
 *   subsequent calls.
 * - **Wait for identify.** The hook is a no-op until `userId` is provided,
 *   guaranteeing that the first flag evaluation happens against the
 *   identified distinct id — not an ephemeral anonymous one.
 * - **Graceful fallback.** If PostHog never resolves within `fallbackMs`,
 *   the hook commits `fallbackVariant` so the UI can render.
 */
export function useExperimentVariant(
    flagKey: string,
    options: UseExperimentVariantOptions,
): UseExperimentVariantResult {
    const { userId, fallbackVariant, fallbackMs = 3000, storageKey } = options;
    const posthog = usePostHog();

    const [variant, setVariant] = useState<string | null>(null);
    const [hasAppliedPreselection, setHasAppliedPreselection] = useState(false);
    const resolvedRef = useRef(false);

    useEffect(() => {
        if (resolvedRef.current) return;
        if (userId == null) return;

        const key = `${storageKey}:${userId}`;

        // 1. Replay from localStorage if this user has already resolved.
        //    This is the path taken on every remount/refresh after the first
        //    successful resolution — no exposure event is re-sent.
        const persisted = readPersisted(key);
        if (persisted) {
            resolvedRef.current = true;
            setVariant(persisted.variant);
            setHasAppliedPreselection(persisted.preselectionApplied);
            return;
        }

        const commit = (value: string): void => {
            if (resolvedRef.current) return;
            resolvedRef.current = true;
            writePersisted(key, { variant: value, preselectionApplied: false });
            setVariant(value);
        };

        // 2. If PostHog is unavailable (e.g. VITE_PUBLIC_POSTHOG_TOKEN is not
        //    set so `<ClientPosthogProvider>` rendered without mounting the
        //    PostHog context), fall back to the control variant immediately.
        //    Waiting on a timeout here serves no purpose — the flag can never
        //    resolve without a client, and stalling the UI for 3 s would
        //    strand the user on a loading spinner.
        if (!posthog) {
            commit(fallbackVariant);
            return;
        }

        // 3. Read the flag only once `identify(userId)` has propagated to
        //    the SDK's `distinct_id`. Otherwise the very first exposure
        //    event would be emitted against the anonymous distinct id —
        //    which, without `ensure_experience_continuity` on the flag,
        //    can hash-bucket to a different variant than the identified
        //    user would later receive. `getFeatureFlag` also emits the
        //    exposure event that PostHog needs to attribute the user to
        //    the experiment; `onFeatureFlags` callback does NOT emit on
        //    its own, so we must always route through `getFeatureFlag`.
        const expectedDistinctId = String(userId);
        const resolveIfIdentified = (): boolean => {
            if (resolvedRef.current) return true;
            if (posthog.get_distinct_id() !== expectedDistinctId) return false;
            const v = posthog.getFeatureFlag(flagKey);
            if (typeof v !== 'string') return false;
            commit(v);
            return true;
        };

        // Fast path — identify already flushed and flags already cached.
        if (resolveIfIdentified()) return;

        // Slow path — retry on every flag reload. PostHog triggers a reload
        // after `identify()`, so the callback will fire once the SDK has
        // identified flags for `userId`.
        const unsubscribe = posthog.onFeatureFlags((_flags, _variants, ctx) => {
            if (ctx?.errorsLoading) return;
            resolveIfIdentified();
        });

        // Timeout fallback. If identify never flushes (network failure,
        // PostHog outage, etc.), read the flag anyway after `fallbackMs`
        // so the funnel is never stuck on a loader. We accept that this
        // tail case may emit exposure with an anonymous distinct id.
        const timeoutId = window.setTimeout(() => {
            if (resolvedRef.current) return;
            const v = posthog.getFeatureFlag(flagKey);
            commit(typeof v === 'string' ? v : fallbackVariant);
        }, fallbackMs);

        return () => {
            window.clearTimeout(timeoutId);
            try {
                unsubscribe?.();
            } catch {
                /* ignored */
            }
        };
    }, [userId, storageKey, posthog, flagKey, fallbackVariant, fallbackMs]);

    const markPreselectionApplied = useCallback(() => {
        if (userId == null) return;
        const key = `${storageKey}:${userId}`;
        setHasAppliedPreselection(true);
        const current = readPersisted(key);
        if (!current || current.preselectionApplied) return;
        writePersisted(key, { ...current, preselectionApplied: true });
    }, [userId, storageKey]);

    return {
        variant,
        isReady: variant !== null,
        hasAppliedPreselection,
        markPreselectionApplied,
    };
}
