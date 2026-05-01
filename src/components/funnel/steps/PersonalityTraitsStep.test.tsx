import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { PersonalityTraitsStep } from './PersonalityTraitsStep';
import { renderWithProviders } from '../../../../test/render-with-providers';

// Mock the constants hook
vi.mock('@/constants/personality-traits', () => ({
    usePersonalityTraits: () => [
        { id: 1, label: 'Funny', value: 'funny' },
        { id: 2, label: 'Kind', value: 'kind' },
        { id: 3, label: 'Bold', value: 'bold' },
        { id: 4, label: 'Shy', value: 'shy' },
    ],
}));

describe('PersonalityTraitsStep', () => {
    it('renders the step title', () => {
        renderWithProviders(<PersonalityTraitsStep />);
        expect(screen.getByText('funnel.personalityTraitsStep.title')).toBeInTheDocument();
    });

    it('renders all personality trait badges', () => {
        renderWithProviders(<PersonalityTraitsStep />);

        expect(screen.getByText('Funny')).toBeInTheDocument();
        expect(screen.getByText('Kind')).toBeInTheDocument();
        expect(screen.getByText('Bold')).toBeInTheDocument();
        expect(screen.getByText('Shy')).toBeInTheDocument();
    });

    it('renders Continue button', () => {
        renderWithProviders(<PersonalityTraitsStep />);
        expect(screen.getByText('funnel.personalityTraitsStep.continue')).toBeInTheDocument();
    });

    it('allows selecting a trait', async () => {
        const { user } = renderWithProviders(<PersonalityTraitsStep />, {
            defaultValues: { personality_traits: [] },
        });

        await user.click(screen.getByText('Funny'));

        // The hidden checkbox in BadgeField should be checked
        const checkboxes = screen.getAllByRole('checkbox', { hidden: true });
        const funnyCheckbox = checkboxes[0];
        expect(funnyCheckbox).toBeChecked();
    });

    it('allows selecting multiple traits', async () => {
        const { user } = renderWithProviders(<PersonalityTraitsStep />, {
            defaultValues: { personality_traits: [] },
        });

        await user.click(screen.getByText('Funny'));
        await user.click(screen.getByText('Kind'));

        const checkboxes = screen.getAllByRole('checkbox', { hidden: true });
        expect(checkboxes[0]).toBeChecked(); // Funny
        expect(checkboxes[1]).toBeChecked(); // Kind
    });

    it('allows deselecting a trait', async () => {
        const { user } = renderWithProviders(<PersonalityTraitsStep />, {
            defaultValues: { personality_traits: ['funny'] },
        });

        const checkboxes = screen.getAllByRole('checkbox', { hidden: true });
        expect(checkboxes[0]).toBeChecked();

        await user.click(screen.getByText('Funny'));
        expect(checkboxes[0]).not.toBeChecked();
    });

    it('pre-selects traits from form default values', () => {
        renderWithProviders(<PersonalityTraitsStep />, {
            defaultValues: { personality_traits: ['kind', 'bold'] },
        });

        const checkboxes = screen.getAllByRole('checkbox', { hidden: true });
        expect(checkboxes[0]).not.toBeChecked(); // Funny
        expect(checkboxes[1]).toBeChecked(); // Kind
        expect(checkboxes[2]).toBeChecked(); // Bold
        expect(checkboxes[3]).not.toBeChecked(); // Shy
    });

    it('calls nextStep when Continue is clicked', async () => {
        const nextStep = vi.fn();
        const { user } = renderWithProviders(<PersonalityTraitsStep />, {
            defaultValues: { personality_traits: ['funny'] },
            nextStep,
        });

        await user.click(screen.getByText('funnel.personalityTraitsStep.continue'));
        expect(nextStep).toHaveBeenCalled();
    });
});
