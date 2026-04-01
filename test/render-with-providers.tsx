/* eslint-disable react-refresh/only-export-components */
/**
 * Test wrapper that provides all the contexts funnel components need:
 * - FormProvider (react-hook-form) with FunnelSchema
 * - StepperContextProvider (custom stepper navigation)
 * - QueryClientProvider (react-query)
 *
 * Usage:
 *   const { user } = renderWithProviders(<ConnectionStep />, {
 *       defaultValues: { connections: ['emotional'] },
 *       stepperValue: 1,
 *   });
 */

import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mock } from 'vitest';

import { StepperContextProvider } from '@/components/stepper/Stepper.context';
import { defaultValues, type FunnelSchema } from '@/hooks/funnel/useFunnelForm';

interface ProviderOptions {
    /** Override form default values */
    defaultValues?: Partial<FunnelSchema>;
    /** Current stepper step index */
    stepperValue?: number;
    /** Max stepper steps */
    stepperMax?: number;
    /** Override nextStep mock */
    nextStep?: Mock;
    /** Override prevStep mock */
    prevStep?: Mock;
    /** Override onChange mock */
    onChange?: Mock;
}

function FormWrapper({
    children,
    formDefaultValues,
}: {
    children: React.ReactNode;
    formDefaultValues: Partial<FunnelSchema>;
}) {
    const form = useForm<FunnelSchema>({
        defaultValues: { ...defaultValues, ...formDefaultValues } as FunnelSchema,
    });

    return <FormProvider {...form}>{children}</FormProvider>;
}

function AllProviders({ children, options = {} }: { children: React.ReactNode; options?: ProviderOptions }) {
    const {
        defaultValues: formDefaults = {},
        stepperValue = 0,
        stepperMax = 31,
        nextStep = vi.fn(),
        prevStep = vi.fn(),
        onChange = vi.fn(),
    } = options;

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <FormWrapper formDefaultValues={formDefaults}>
                <StepperContextProvider
                    value={stepperValue}
                    onChange={onChange}
                    max={stepperMax}
                    nextStep={nextStep}
                    prevStep={prevStep}
                >
                    {children}
                </StepperContextProvider>
            </FormWrapper>
        </QueryClientProvider>
    );
}

export function renderWithProviders(
    ui: React.ReactElement,
    options?: ProviderOptions & { renderOptions?: Omit<RenderOptions, 'wrapper'> },
) {
    const { renderOptions, ...providerOptions } = options || {};

    const result = render(ui, {
        wrapper: ({ children }) => <AllProviders options={providerOptions}>{children}</AllProviders>,
        ...renderOptions,
    });

    return {
        ...result,
        user: userEvent.setup(),
    };
}
