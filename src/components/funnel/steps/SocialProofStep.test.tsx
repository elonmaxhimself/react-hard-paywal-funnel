import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { SocialProofStep } from './SocialProofStep';
import { renderWithProviders } from '../../../../test/render-with-providers';

describe('SocialProofStep', () => {
    it('renders the headline', () => {
        renderWithProviders(<SocialProofStep />);
        expect(screen.getByText('funnel.socialProofStep.millionPeople')).toBeInTheDocument();
    });

    it('renders Continue button', () => {
        renderWithProviders(<SocialProofStep />);
        expect(screen.getByText('funnel.socialProofStep.continue')).toBeInTheDocument();
    });

    it('calls nextStep when Continue is clicked', async () => {
        const nextStep = vi.fn();
        const { user } = renderWithProviders(<SocialProofStep />, { nextStep });

        await user.click(screen.getByText('funnel.socialProofStep.continue'));
        expect(nextStep).toHaveBeenCalledTimes(1);
    });

    it('fixed bottom bar has z-100 class for mobile stacking', () => {
        renderWithProviders(<SocialProofStep />);
        const continueButton = screen.getByText('funnel.socialProofStep.continue');
        // Walk up to the fixed container (button -> div.max-w -> div.fixed)
        const fixedBar = continueButton.closest('.fixed');
        expect(fixedBar).toBeTruthy();
        expect(fixedBar!.className).toContain('z-100');
    });
});
