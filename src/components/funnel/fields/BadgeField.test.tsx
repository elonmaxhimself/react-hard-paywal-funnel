import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BadgeField from './BadgeField';

describe('BadgeField', () => {
    const defaultProps = {
        id: 'badge-1',
        name: 'badge-1',
        label: 'Funny',
        checked: false,
        onCheckedChange: vi.fn(),
    };

    it('renders label text', () => {
        render(<BadgeField {...defaultProps} />);
        expect(screen.getByText('Funny')).toBeInTheDocument();
    });

    it('calls onCheckedChange when clicked', async () => {
        const onCheckedChange = vi.fn();
        render(<BadgeField {...defaultProps} onCheckedChange={onCheckedChange} />);

        const user = userEvent.setup();
        await user.click(screen.getByText('Funny'));

        expect(onCheckedChange).toHaveBeenCalled();
    });

    it('renders checked state', () => {
        render(<BadgeField {...defaultProps} checked={true} />);
        const checkbox = screen.getByRole('checkbox', { hidden: true });
        expect(checkbox).toBeChecked();
    });

    it('renders as pill/badge shape (rounded-full)', () => {
        const { container } = render(<BadgeField {...defaultProps} />);
        const label = container.querySelector('label');
        expect(label?.className).toContain('rounded-full');
    });
});
