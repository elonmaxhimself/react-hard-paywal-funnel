import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ButtonField from './ButtonField';

describe('ButtonField', () => {
    const defaultProps = {
        id: 'btn-field',
        name: 'btn-field',
        label: 'Girlfriend',
        checked: false,
        onCheckedChange: vi.fn(),
    };

    it('renders label text', () => {
        render(<ButtonField {...defaultProps} />);
        expect(screen.getByText('Girlfriend')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
        render(<ButtonField {...defaultProps} description="Best choice for you" />);
        expect(screen.getByText('Best choice for you')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
        const { container } = render(<ButtonField {...defaultProps} />);
        // Only label text, no description div
        expect(container.querySelectorAll('.text-white\\/70')).toHaveLength(0);
    });

    it('calls onCheckedChange when clicked', async () => {
        const onCheckedChange = vi.fn();
        render(<ButtonField {...defaultProps} onCheckedChange={onCheckedChange} />);

        const user = userEvent.setup();
        await user.click(screen.getByText('Girlfriend'));

        expect(onCheckedChange).toHaveBeenCalled();
    });

    it('renders checked state', () => {
        render(<ButtonField {...defaultProps} checked={true} />);
        // The hidden checkbox should be checked
        const checkbox = screen.getByRole('checkbox', { hidden: true });
        expect(checkbox).toBeChecked();
    });
});
