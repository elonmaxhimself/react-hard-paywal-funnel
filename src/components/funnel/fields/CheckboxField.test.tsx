import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckboxField from './CheckboxField';

describe('CheckboxField', () => {
    const defaultProps = {
        id: 'test-field',
        name: 'test-field',
        label: 'Flirt & Fun',
        checked: false,
        onCheckedChange: vi.fn(),
    };

    it('renders label text', () => {
        render(<CheckboxField {...defaultProps} />);
        expect(screen.getByText('Flirt & Fun')).toBeInTheDocument();
    });

    it('renders unchecked state', () => {
        render(<CheckboxField {...defaultProps} checked={false} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
    });

    it('renders checked state', () => {
        render(<CheckboxField {...defaultProps} checked={true} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    it('calls onCheckedChange when clicked', async () => {
        const onCheckedChange = vi.fn();
        render(<CheckboxField {...defaultProps} onCheckedChange={onCheckedChange} />);

        const user = userEvent.setup();
        await user.click(screen.getByText('Flirt & Fun'));

        expect(onCheckedChange).toHaveBeenCalled();
    });

    it('label is associated with checkbox via htmlFor', () => {
        render(<CheckboxField {...defaultProps} />);
        const label = screen.getByText('Flirt & Fun').closest('label');
        expect(label).toHaveAttribute('for', 'test-field');
    });
});
