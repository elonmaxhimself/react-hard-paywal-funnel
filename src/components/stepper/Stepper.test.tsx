import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Stepper from './index';
import { useStepperContext } from './Stepper.context';

// Helper component that exposes stepper context for testing
function StepInfo() {
    const { value, max } = useStepperContext();
    return <div data-testid="step-info">{`Step ${value} of ${max}`}</div>;
}

function NavButtons() {
    const { nextStep, prevStep } = useStepperContext();
    return (
        <>
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep}>Next</button>
        </>
    );
}

describe('Stepper compound component', () => {
    const defaultProps = {
        value: 0,
        onChange: vi.fn(),
        max: 3,
        nextStep: vi.fn(),
        prevStep: vi.fn(),
    };

    it('renders children', () => {
        render(
            <Stepper {...defaultProps}>
                <div>Step content</div>
            </Stepper>,
        );
        expect(screen.getByText('Step content')).toBeInTheDocument();
    });

    it('provides context to children', () => {
        render(
            <Stepper {...defaultProps} value={2} max={5}>
                <StepInfo />
            </Stepper>,
        );
        expect(screen.getByTestId('step-info')).toHaveTextContent('Step 2 of 5');
    });

    describe('StepperContents — renders correct step', () => {
        it('shows step at current index', () => {
            render(
                <Stepper {...defaultProps} value={1}>
                    <Stepper.Contents>
                        <Stepper.Content>Step 0 content</Stepper.Content>
                        <Stepper.Content>Step 1 content</Stepper.Content>
                        <Stepper.Content>Step 2 content</Stepper.Content>
                    </Stepper.Contents>
                </Stepper>,
            );
            expect(screen.getByText('Step 1 content')).toBeInTheDocument();
            expect(screen.queryByText('Step 0 content')).not.toBeInTheDocument();
            expect(screen.queryByText('Step 2 content')).not.toBeInTheDocument();
        });

        it('shows first step when value is 0', () => {
            render(
                <Stepper {...defaultProps} value={0}>
                    <Stepper.Contents>
                        <Stepper.Content>First step</Stepper.Content>
                        <Stepper.Content>Second step</Stepper.Content>
                    </Stepper.Contents>
                </Stepper>,
            );
            expect(screen.getByText('First step')).toBeInTheDocument();
        });

        it('shows completed content when value exceeds steps', () => {
            render(
                <Stepper {...defaultProps} value={5}>
                    <Stepper.Contents>
                        <Stepper.Content>Step 0</Stepper.Content>
                        <Stepper.Content>Step 1</Stepper.Content>
                        <Stepper.Completed>All done!</Stepper.Completed>
                    </Stepper.Contents>
                </Stepper>,
            );
            expect(screen.getByText('All done!')).toBeInTheDocument();
        });
    });

    describe('navigation callbacks', () => {
        it('calls nextStep when Next button clicked', async () => {
            const nextStep = vi.fn();
            const user = userEvent.setup();

            render(
                <Stepper {...defaultProps} nextStep={nextStep}>
                    <NavButtons />
                </Stepper>,
            );

            await user.click(screen.getByText('Next'));
            expect(nextStep).toHaveBeenCalledTimes(1);
        });

        it('calls prevStep when Back button clicked', async () => {
            const prevStep = vi.fn();
            const user = userEvent.setup();

            render(
                <Stepper {...defaultProps} prevStep={prevStep}>
                    <NavButtons />
                </Stepper>,
            );

            await user.click(screen.getByText('Back'));
            expect(prevStep).toHaveBeenCalledTimes(1);
        });
    });
});
