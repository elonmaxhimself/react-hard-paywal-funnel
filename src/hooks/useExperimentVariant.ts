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

        if (!posthog) return;

        const commit = (value: string): void => {
            if (resolvedRef.current) return;
            resolvedRef.current = true;
            writePersisted(key, { variant: value, preselectionApplied: false });
            setVariant(value);
        };

        // 2. Try a synchronous read. If PostHog already has the flags loaded,
        //    this returns the variant string and emits exactly one exposure
        //    event with the identified distinct id.
        const immediate = posthog.getFeatureFlag(flagKey);
        if (typeof immediate === 'string') {
            commit(immediate);
            return;
        }

        // 3. Flags not yet loaded — subscribe for resolution, and set a
        //    fallback timeout so the UI never stalls.
        const unsubscribe = posthog.onFeatureFlags((_flags, variants, ctx) => {
            if (resolvedRef.current) return;
            if (ctx?.errorsLoading) return;
            const v = variants?.[flagKey];
            if (typeof v !== 'string') return;
            commit(v);
        });

        const timeoutId = window.setTimeout(() => {
            if (resolvedRef.current) return;
            commit(fallbackVariant);
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
