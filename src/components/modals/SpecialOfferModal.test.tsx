import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SpecialOfferModal from './SpecialOfferModal';
import { store } from '@/store/state';
import { ModalTriggers } from '@/utils/enums/modal-triggers';

// Mock the image import (Vite static imports don't work in test)
vi.mock('@@/images/backgrounds/girl.png', () => ({ default: '/test-girl.png' }));

vi.mock('@/constants/featuresForFree', () => ({
    useFeaturesForFree: () => [
        { title: 'Unlimited Messages', originalPrice: '$9.99', discountPrice: 'FREE' },
        { title: 'AI Photos', originalPrice: '$4.99', discountPrice: 'FREE' },
    ],
}));

describe('SpecialOfferModal', () => {
    beforeEach(() => {
        store.getState().modal.reset();
        store.getState().offer.setIsSpecialOfferOpened(false);
    });

    function openModal() {
        act(() => {
            store.getState().modal.setOpen({
                trigger: ModalTriggers.SPECIAL_OFFER_MODAL,
                title: '50%',
            });
        });
    }

    it('renders when triggered with SPECIAL_OFFER_MODAL', () => {
        render(<SpecialOfferModal />);
        openModal();

        expect(screen.getByText('modals.specialOffer.areYouSure')).toBeInTheDocument();
    });

    it('renders feature list with prices', () => {
        render(<SpecialOfferModal />);
        openModal();

        expect(screen.getByText('Unlimited Messages')).toBeInTheDocument();
        expect(screen.getByText('AI Photos')).toBeInTheDocument();
        expect(screen.getAllByText('FREE')).toHaveLength(2);
    });

    it('renders Claim Now and decline buttons', () => {
        render(<SpecialOfferModal />);
        openModal();

        expect(screen.getByText('modals.specialOffer.claimNow')).toBeInTheDocument();
        expect(screen.getByText('modals.specialOffer.noDiscounts')).toBeInTheDocument();
    });

    it('renders one-time-offer countdown banner', () => {
        render(<SpecialOfferModal />);
        openModal();

        expect(screen.getByText('modals.specialOffer.oneTimeOffer')).toBeInTheDocument();
    });

    it('closes modal when Claim Now is clicked', async () => {
        const user = userEvent.setup();
        render(<SpecialOfferModal />);
        openModal();

        await user.click(screen.getByText('modals.specialOffer.claimNow'));

        expect(store.getState().modal.open).toBe(false);
    });

    it('opens Final Offer when decline is clicked', async () => {
        const user = userEvent.setup();
        render(<SpecialOfferModal />);
        openModal();

        await user.click(screen.getByText('modals.specialOffer.noDiscounts'));

        expect(store.getState().modal.trigger).toBe(ModalTriggers.FINAL_OFFER_UNLOCKED_MODAL);
        expect(store.getState().offer.isSpecialOfferOpened).toBe(true);
    });

    it('does not render when modal is not triggered', () => {
        render(<SpecialOfferModal />);

        expect(screen.queryByText('modals.specialOffer.areYouSure')).not.toBeInTheDocument();
    });
});
