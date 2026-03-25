import { beforeEach, describe, expect, it } from 'vitest';

import { useFunnelStore, getFunnelStore } from './funnel';
import { createFunnelFormValues } from '../../../test/factories';
import type { FunnelSchema } from '@/hooks/funnel/useFunnelForm';

describe('useFunnelStore', () => {
    beforeEach(() => {
        useFunnelStore.getState().reset();
    });

    describe('initial state', () => {
        it('starts with null form and step', () => {
            const state = useFunnelStore.getState();
            expect(state.form).toBeNull();
            expect(state.step).toBeNull();
        });
    });

    describe('setFormState', () => {
        it('stores form data', () => {
            const formValues = createFunnelFormValues() as FunnelSchema;
            useFunnelStore.getState().setFormState(formValues);

            expect(useFunnelStore.getState().form).toEqual(formValues);
        });

        it('overwrites previous form data', () => {
            const first = createFunnelFormValues({ style: 'anime' }) as FunnelSchema;
            const second = createFunnelFormValues({ style: 'realistic' }) as FunnelSchema;

            useFunnelStore.getState().setFormState(first);
            useFunnelStore.getState().setFormState(second);

            expect(useFunnelStore.getState().form?.style).toBe('realistic');
        });
    });

    describe('setStep', () => {
        it('stores step number', () => {
            useFunnelStore.getState().setStep(15);
            expect(useFunnelStore.getState().step).toBe(15);
        });

        it('can set step to 0', () => {
            useFunnelStore.getState().setStep(0);
            expect(useFunnelStore.getState().step).toBe(0);
        });
    });

    describe('reset', () => {
        it('resets form and step to null', () => {
            useFunnelStore.getState().setFormState(createFunnelFormValues() as FunnelSchema);
            useFunnelStore.getState().setStep(10);
            useFunnelStore.getState().reset();

            const state = useFunnelStore.getState();
            expect(state.form).toBeNull();
            expect(state.step).toBeNull();
        });
    });

    describe('getFunnelStore', () => {
        it('returns current state', () => {
            useFunnelStore.getState().setStep(7);
            expect(getFunnelStore().step).toBe(7);
        });
    });

    describe('persistence', () => {
        it('only persists form and step (partialize)', () => {
            const formValues = createFunnelFormValues() as FunnelSchema;
            useFunnelStore.getState().setFormState(formValues);
            useFunnelStore.getState().setStep(5);

            const stored = JSON.parse(localStorage.getItem('funnel-storage') || '{}');
            expect(stored.state).toHaveProperty('form');
            expect(stored.state).toHaveProperty('step');
            // Actions should not be persisted
            expect(stored.state).not.toHaveProperty('setFormState');
            expect(stored.state).not.toHaveProperty('reset');
        });
    });
});
