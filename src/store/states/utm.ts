import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface IUtmState {
    utm: Record<string, string>;
    /** Full landing page URL captured on first visit (includes UTM query params).
     *  Used as `url` field in signup/OAuth payloads to tell the backend where the user came from. */
    initialUrl: string | null;
    set(utm: Record<string, string>): void;
    merge(utm: Record<string, string>): void;
    setInitialUrl(url: string): void;
    reset(): void;
}

export const useUtmStore = create<IUtmState>()(
    persist(
        immer((set) => ({
            utm: {},
            initialUrl: null,
            set: (utm) =>
                set((state) => {
                    state.utm = utm;
                }),
            merge: (utm) =>
                set((state) => {
                    state.utm = {
                        ...state.utm,
                        ...utm,
                    };
                }),
            setInitialUrl: (url) =>
                set((state) => {
                    // First-win: only the first non-empty URL is stored.
                    // Subsequent calls (e.g. page navigations) are no-ops.
                    if (!state.initialUrl && url) {
                        state.initialUrl = url;
                    }
                }),
            reset: () =>
                set((state) => {
                    state.utm = {};
                    state.initialUrl = null;
                }),
        })),
        {
            name: 'utm-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                utm: state.utm,
                initialUrl: state.initialUrl,
            }),
        },
    ),
);

export const getUtmStore = () => {
    return useUtmStore.getState();
};
