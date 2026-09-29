import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseDateInput } from './jobDates';
import { AddJobDialog } from './AddJobDialog';

const fillRequiredFields = async () => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Company'), '  Acme  ');
    await user.type(screen.getByLabelText('Position'), '  Frontend developer  ');
    fireEvent.change(screen.getByLabelText('Open date'), { target: { value: '2026-09-01' } });

    return user;
};

describe('AddJobDialog', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the add form with Cancel and Add actions', () => {
        render(<AddJobDialog onCancel={vi.fn()} onAdd={vi.fn()} />);

        expect(screen.getByRole('dialog', { name: 'Add Job' })).toBeInTheDocument();
        expect(screen.getByLabelText('Company')).toBeInTheDocument();
        expect(screen.getByLabelText('Position')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Link')).toBeInTheDocument();
        expect(screen.getByLabelText('Open date')).toBeInTheDocument();
        expect(screen.getByLabelText('Applied')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('prefills open date with today', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 8, 9, 8, 0, 0));

        render(<AddJobDialog onCancel={vi.fn()} onAdd={vi.fn()} />);

        expect(screen.getByLabelText('Open date')).toHaveValue('2026-09-09');
        expect(screen.getByLabelText('Applied')).toHaveValue('');
    });

    it('calls onCancel when Cancel is clicked', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();

        render(<AddJobDialog onCancel={onCancel} onAdd={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onCancel).toHaveBeenCalledOnce();
    });

    it('calls onCancel when the overlay is clicked', () => {
        const onCancel = vi.fn();

        render(<AddJobDialog onCancel={onCancel} onAdd={vi.fn()} />);

        fireEvent.click(screen.getByRole('presentation'));

        expect(onCancel).toHaveBeenCalledOnce();
    });

    it('does not call onCancel when the dialog is clicked', () => {
        const onCancel = vi.fn();

        render(<AddJobDialog onCancel={onCancel} onAdd={vi.fn()} />);

        fireEvent.click(screen.getByRole('dialog'));

        expect(onCancel).not.toHaveBeenCalled();
    });

    it('does not call onAdd when required fields are empty', async () => {
        const user = userEvent.setup();
        const onAdd = vi.fn();

        render(<AddJobDialog onCancel={vi.fn()} onAdd={onAdd} />);

        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(onAdd).not.toHaveBeenCalled();
    });

    it('calls onAdd with only required fields when optional fields are empty', async () => {
        const onAdd = vi.fn();

        render(<AddJobDialog onCancel={vi.fn()} onAdd={onAdd} />);

        const user = await fillRequiredFields();
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(onAdd).toHaveBeenCalledOnce();
        expect(onAdd).toHaveBeenCalledWith({
            companyName: 'Acme',
            position: 'Frontend developer',
            description: '',
            link: '',
            openDate: parseDateInput('2026-09-01'),
            submissionDate: null,
        });
    });

    it('calls onAdd with trimmed values and parsed dates', async () => {
        const onAdd = vi.fn();

        render(<AddJobDialog onCancel={vi.fn()} onAdd={onAdd} />);

        const user = await fillRequiredFields();
        await user.type(screen.getByLabelText('Description'), '  Remote role  ');
        await user.type(screen.getByLabelText('Link'), '  https://example.com/jobs/1  ');
        fireEvent.change(screen.getByLabelText('Applied'), { target: { value: '2026-09-09' } });
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(onAdd).toHaveBeenCalledOnce();
        expect(onAdd).toHaveBeenCalledWith({
            companyName: 'Acme',
            position: 'Frontend developer',
            description: 'Remote role',
            link: 'https://example.com/jobs/1',
            openDate: parseDateInput('2026-09-01'),
            submissionDate: parseDateInput('2026-09-09'),
        });
    });

    it('does not call onAdd when link is not a valid URL', async () => {
        const onAdd = vi.fn();

        render(<AddJobDialog onCancel={vi.fn()} onAdd={onAdd} />);

        const user = await fillRequiredFields();
        await user.type(screen.getByLabelText('Link'), 'not-a-url');
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(onAdd).not.toHaveBeenCalled();
        expect(screen.getByRole('alert')).toHaveTextContent(
            'Enter a valid http or https URL.',
        );
    });
});
