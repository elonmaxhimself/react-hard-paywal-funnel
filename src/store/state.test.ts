import { describe, expect, it } from 'vitest';

import { store, getStore } from './state';

describe('combined store (modal + offer)', () => {
    describe('modal', () => {
        it('starts closed', () => {
            expect(getStore().modal.open).toBe(false);
        });

        it('opens with properties', () => {
            store.getState().modal.setOpen({
                trigger: 'test-trigger',
                type: 'special',
                title: 'Test Title',
                payload: { foo: 'bar' },
            });

            const modal = getStore().modal;
            expect(modal.open).toBe(true);
            expect(modal.trigger).toBe('test-trigger');
            expect(modal.type).toBe('special');
            expect(modal.title).toBe('Test Title');
            expect(modal.payload).toEqual({ foo: 'bar' });
        });

        it('closes via setClose', () => {
            store.getState().modal.setOpen({ trigger: 'x' });
            store.getState().modal.setClose();

            expect(getStore().modal.open).toBe(false);
        });

        it('toggles via setOpenChange', () => {
            store.getState().modal.setOpenChange(true);
            expect(getStore().modal.open).toBe(true);

            store.getState().modal.setOpenChange(false);
            expect(getStore().modal.open).toBe(false);
        });

        it('resets to initial values', () => {
            store.getState().modal.setOpen({
                trigger: 'test',
                type: 'special',
                title: 'Modal',
                payload: { data: true },
            });
            store.getState().modal.reset();

            const modal = getStore().modal;
            expect(modal.open).toBe(false);
            expect(modal.trigger).toBe('');
            expect(modal.type).toBe('create');
            expect(modal.title).toBe('');
            expect(modal.payload).toBeNull();
        });
    });

    describe('offer', () => {
        it('starts with isSpecialOfferOpened = false', () => {
            expect(getStore().offer.isSpecialOfferOpened).toBe(false);
        });

        it('sets special offer opened', () => {
            store.getState().offer.setIsSpecialOfferOpened(true);
            expect(getStore().offer.isSpecialOfferOpened).toBe(true);
        });

        it('can toggle back to false', () => {
            store.getState().offer.setIsSpecialOfferOpened(true);
            store.getState().offer.setIsSpecialOfferOpened(false);
            expect(getStore().offer.isSpecialOfferOpened).toBe(false);
        });
    });

    describe('cross-slice isolation', () => {
        it('modal changes do not affect offer', () => {
            store.getState().offer.setIsSpecialOfferOpened(true);
            store.getState().modal.setOpen({ trigger: 'test' });

            expect(getStore().offer.isSpecialOfferOpened).toBe(true);
        });
    });
});
