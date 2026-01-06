import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

export interface IFunnelState {
    form: FunnelSchema | null;
    step: number | null;
    pricingVariant: string | null;
    setFormState(form: FunnelSchema): void;
    setStep(step: number): void;
    setPricingVariant(variant: string): void;
    reset(): void;
}

export const useFunnelStore = create<IFunnelState>()(
    persist(
        immer((set) => ({
            form: null,
            step: null,
            pricingVariant: null,
            setFormState: (form) =>
                set((state) => {
                    state.form = form;
                }),
            setStep: (step) =>
                set((state) => {
                    state.step = step;
                }),
            setPricingVariant: (variant) =>
                set((state) => {
                    state.pricingVariant = variant;
                }),
            reset: () =>
                set((state) => {
                    state.form = null;
                    state.step = null;
                    state.pricingVariant = null;
                }),
        })),
        {
            name: "funnel-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                form: state.form,
                step: state.step,
                pricingVariant: state.pricingVariant,
            }),
        },
    ),
);

export const getFunnelStore = () => {
    return useFunnelStore.getState();
};