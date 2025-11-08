import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

export interface IFunnelState {
    form: FunnelSchema | null;
    step: number | null;
    startingStep: number | null;
    variant: string | null;
    setFormState(form: FunnelSchema): void;
    setStep(step: number): void;
    setStartingStep(step: number): void;
    setVariant(variant: string): void;
    reset(): void;
}

export const useFunnelStore = create<IFunnelState>()(
    persist(
        immer((set) => ({
            form: null,
            step: null,
            startingStep: null,
            variant: null,
            setFormState: (form) =>
                set((state) => {
                    state.form = form;
                }),
            setStep: (step) =>
                set((state) => {
                    state.step = step;
                }),
            setStartingStep: (step) =>
                set((state) => {
                    state.startingStep = step;
                }),
            setVariant: (variant) =>
                set((state) => {
                    state.variant = variant;
                }),
            reset: () =>
                set((state) => {
                    state.form = null;
                    state.step = null;
                    state.startingStep = null;
                    state.variant = null;
                }),
        })),
        {
            name: "funnel-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                form: state.form,
                step: state.step,
                startingStep: state.startingStep,
                variant: state.variant,
            }),
        },
    ),
);

export const getFunnelStore = () => {
    return useFunnelStore.getState();
};