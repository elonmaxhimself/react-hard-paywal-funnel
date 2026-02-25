import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

interface OAuthState {
    formValues: FunnelSchema | null;
    step: number;
    referrer?: string;
    timestamp: number;
}

export interface IAuthState {
    userId: number | null;
    authToken: string | null;
    oauthState: OAuthState | null;

    setToken(token: string): void;
    setUserId(userId: number): void;

    saveOAuthState(formValues: FunnelSchema, step: number): void;
    restoreOAuthState(): { formValues: FunnelSchema | null; step: number };
    clearOAuthState(): void;

    reset(): void;
}

export const useAuthStore = create<IAuthState>()(
    persist(
        immer((set, get) => ({
            userId: null,
            authToken: null,
            oauthState: null,

            setToken: (token) =>
                set((state) => {
                    state.authToken = token;
                }),
            setUserId: (user) =>
                set((state) => {
                    state.userId = user;
                }),

            saveOAuthState: (formValues, step) =>
                set((state) => {
                    state.oauthState = {
                        formValues,
                        step,
                        referrer: document.referrer || undefined,
                        timestamp: Date.now(),
                    };
                }),

            restoreOAuthState: () => {
                const { oauthState } = get();

                if (!oauthState) {
                    return { formValues: null, step: 0 };
                }

                return {
                    formValues: oauthState.formValues,
                    step: oauthState.step,
                };
            },

            clearOAuthState: () =>
                set((state) => {
                    state.oauthState = null;
                }),

            reset: () =>
                set((state) => {
                    state.userId = null;
                    state.authToken = null;
                    state.oauthState = null;
                }),
        })),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                userId: state.userId,
                authToken: state.authToken,
                oauthState: state.oauthState,
            }),
        },
    ),
);

export const getAuthStore = () => {
    return useAuthStore.getState();
};