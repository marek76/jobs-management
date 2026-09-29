import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { JobItem } from '../../types/types';
import { parseDateInput } from './jobDates';
import { EditJobDialog } from './EditJobDialog';

const openDate = new Date('2026-09-01T00:00:00');
const submissionDate = new Date('2026-09-09T00:00:00');

const job: JobItem = {
    id: 1,
    companyName: 'Acme',
    position: 'Frontend developer',
    description: 'Remote role',
    link: 'https://example.com/jobs/acme',
    openDate,
    submissionDate,
    state: 'new',
};

describe('EditJobDialog', () => {
    it('renders the edit form with existing values', () => {
        render(<EditJobDialog job={job} onCancel={vi.fn()} onUpdate={vi.fn()} />);

        expect(screen.getByRole('dialog', { name: 'Edit job' })).toBeInTheDocument();
        expect(screen.getByLabelText('Company')).toHaveValue('Acme');
        expect(screen.getByLabelText('Position')).toHaveValue('Frontend developer');
        expect(screen.getByLabelText('Description')).toHaveValue('Remote role');
        expect(screen.getByLabelText('Link')).toHaveValue('https://example.com/jobs/acme');
        expect(screen.getByLabelText('Open date')).toHaveValue('2026-09-01');
        expect(screen.getByLabelText('Applied')).toHaveValue('2026-09-09');
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('leaves submission date empty when the job has none', () => {
        render(
            <EditJobDialog
                job={{ ...job, submissionDate: null }}
                onCancel={vi.fn()}
                onUpdate={vi.fn()}
            />,
        );

        expect(screen.getByLabelText('Applied')).toHaveValue('');
    });

    it('does not call onUpdate when required fields are empty', async () => {
        const user = userEvent.setup();
        const onUpdate = vi.fn();

        render(<EditJobDialog job={job} onCancel={vi.fn()} onUpdate={onUpdate} />);

        await user.clear(screen.getByLabelText('Company'));
        await user.clear(screen.getByLabelText('Position'));
        await user.click(screen.getByRole('button', { name: 'Update' }));

        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('calls onUpdate with trimmed values including optional fields', async () => {
        const user = userEvent.setup();
        const onUpdate = vi.fn();

        render(<EditJobDialog job={job} onCancel={vi.fn()} onUpdate={onUpdate} />);

        await user.clear(screen.getByLabelText('Company'));
        await user.type(screen.getByLabelText('Company'), '  Globex  ');
        await user.clear(screen.getByLabelText('Position'));
        await user.type(screen.getByLabelText('Position'), '  Backend developer  ');
        await user.clear(screen.getByLabelText('Description'));
        await user.type(screen.getByLabelText('Description'), '  Onsite  ');
        await user.clear(screen.getByLabelText('Link'));
        await user.type(screen.getByLabelText('Link'), '  https://example.com/jobs/2  ');
        fireEvent.change(screen.getByLabelText('Open date'), { target: { value: '2026-10-01' } });
        fireEvent.change(screen.getByLabelText('Applied'), { target: { value: '2026-10-15' } });
        await user.click(screen.getByRole('button', { name: 'Update' }));

        expect(onUpdate).toHaveBeenCalledOnce();
        expect(onUpdate).toHaveBeenCalledWith({
            companyName: 'Globex',
            position: 'Backend developer',
            description: 'Onsite',
            link: 'https://example.com/jobs/2',
            openDate: parseDateInput('2026-10-01'),
            submissionDate: parseDateInput('2026-10-15'),
        });
    });

    it('allows clearing optional description, link, and submission date', async () => {
        const user = userEvent.setup();
        const onUpdate = vi.fn();

        render(<EditJobDialog job={job} onCancel={vi.fn()} onUpdate={onUpdate} />);

        await user.clear(screen.getByLabelText('Description'));
        await user.clear(screen.getByLabelText('Link'));
        fireEvent.change(screen.getByLabelText('Applied'), { target: { value: '' } });
        await user.click(screen.getByRole('button', { name: 'Update' }));

        expect(onUpdate).toHaveBeenCalledOnce();
        expect(onUpdate).toHaveBeenCalledWith({
            companyName: 'Acme',
            position: 'Frontend developer',
            description: '',
            link: '',
            openDate,
            submissionDate: null,
        });
    });

    it('does not call onUpdate when link is not a valid URL', async () => {
        const user = userEvent.setup();
        const onUpdate = vi.fn();

        render(<EditJobDialog job={job} onCancel={vi.fn()} onUpdate={onUpdate} />);

        await user.clear(screen.getByLabelText('Link'));
        await user.type(screen.getByLabelText('Link'), 'example.com');
        await user.click(screen.getByRole('button', { name: 'Update' }));

        expect(onUpdate).not.toHaveBeenCalled();
        expect(screen.getByRole('alert')).toHaveTextContent(
            'Enter a valid http or https URL.',
        );
    });
});
