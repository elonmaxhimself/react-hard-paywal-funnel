import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { AuthStep } from './AuthStep';
import { renderWithProviders } from '../../../../test/render-with-providers';

// Mock useSignUpForm to return a real react-hook-form instance via the provider
vi.mock('@/hooks/auth/useSignUpForm', async () => {
    const { useForm } = await import('react-hook-form');

    return {
        useSignUpForm: () => {
            const form = useForm({
                defaultValues: { email: '', password: '', isAdult: false, acceptedTerms: false },
            });

            return {
                form,
                onSubmit: vi.fn((e?: React.BaseSyntheticEvent) => e?.preventDefault()),
                onValueReset: vi.fn(),
                isPending: false,
                apiError: null,
            };
        },
    };
});

vi.mock('@/hooks/auth/useOAuth', () => ({
    useOAuth: () => ({
        signIn: vi.fn(),
        isLoading: false,
        isGoogleLoading: false,
        isTwitterLoading: false,
        isDiscordLoading: false,
    }),
}));

vi.mock('@/constants/auth-checkboxes', () => ({
    useCheckboxes: () => [
        { name: 'isAdult' as const, id: 'isAdult', label: 'I am 18+' },
        { name: 'acceptedTerms' as const, id: 'acceptedTerms', label: 'I accept terms' },
    ],
}));

describe('AuthStep', () => {
    it('renders sign-up form with email and password inputs', () => {
        renderWithProviders(<AuthStep />);

        expect(screen.getByPlaceholderText('funnel.authStep.emailPlaceholder')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('funnel.authStep.passwordPlaceholder')).toBeInTheDocument();
    });

    it('renders OAuth buttons (Google, Twitter, Discord)', () => {
        renderWithProviders(<AuthStep />);

        expect(screen.getByAltText('Google')).toBeInTheDocument();
        expect(screen.getByAltText('Twitter')).toBeInTheDocument();
        expect(screen.getByAltText('Discord')).toBeInTheDocument();
    });

    it('renders "Continue with Google" text', () => {
        renderWithProviders(<AuthStep />);
        expect(screen.getByText('funnel.authStep.continueWithGoogle')).toBeInTheDocument();
    });

    it('renders checkbox fields (age confirmation, terms)', () => {
        renderWithProviders(<AuthStep />);

        expect(screen.getByText('I am 18+')).toBeInTheDocument();
        expect(screen.getByText('I accept terms')).toBeInTheDocument();
    });

    it('renders Join Free submit button', () => {
        renderWithProviders(<AuthStep />);
        expect(screen.getByText('funnel.authStep.joinFree')).toBeInTheDocument();
    });

    it('renders OR divider between OAuth and email form', () => {
        renderWithProviders(<AuthStep />);
        expect(screen.getByText('funnel.authStep.orContinueWithEmail')).toBeInTheDocument();
    });

    it('renders happy users badge with 3M+', () => {
        renderWithProviders(<AuthStep />);
        expect(screen.getByText('3M+')).toBeInTheDocument();
    });
});
