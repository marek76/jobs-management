import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JobProvider } from '../../context/JobProvider';
import { JobInput } from './JobInput';
import { todayDateInputValue } from './jobDates';

const STORAGE_KEY = 'job_app_items';

const renderJobInput = () => render(
    <JobProvider>
        <JobInput />
    </JobProvider>,
);

const fillRequiredFields = async () => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Company'), 'Globex');
    await user.type(screen.getByLabelText('Position'), 'Backend developer');
    await user.type(screen.getByLabelText('Description'), 'Remote role');
    fireEvent.change(screen.getByLabelText('Open date'), { target: { value: '2026-09-01' } });
    fireEvent.change(screen.getByLabelText('Applied'), { target: { value: '2026-09-09' } });

    return user;
};

describe('JobInput add action', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('shows the Add Job button and keeps the form closed', () => {
        renderJobInput();

        expect(screen.getByRole('button', { name: 'Add Job' })).toBeInTheDocument();
        expect(screen.queryByRole('dialog', { name: 'Add Job' })).not.toBeInTheDocument();
    });

    it('opens the add form after clicking Add Job', async () => {
        const user = userEvent.setup();

        renderJobInput();

        await user.click(screen.getByRole('button', { name: 'Add Job' }));

        expect(screen.getByRole('dialog', { name: 'Add Job' })).toBeInTheDocument();
        expect(screen.getByLabelText('Open date')).toHaveValue(todayDateInputValue());
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('closes the form without adding a job when Cancel is clicked', async () => {
        const user = userEvent.setup();

        renderJobInput();
        await user.click(screen.getByRole('button', { name: 'Add Job' }));
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.queryByRole('dialog', { name: 'Add Job' })).not.toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([]);
    });

    it('adds a job and closes the form when Add is clicked', async () => {
        renderJobInput();

        const openUser = userEvent.setup();
        await openUser.click(screen.getByRole('button', { name: 'Add Job' }));

        const user = await fillRequiredFields();
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(screen.queryByRole('dialog', { name: 'Add Job' })).not.toBeInTheDocument();

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Array<{
            companyName: string;
            position: string;
            description: string;
            state: string;
        }>;

        expect(saved).toHaveLength(1);
        expect(saved[0]).toMatchObject({
            companyName: 'Globex',
            position: 'Backend developer',
            description: 'Remote role',
            link: '',
            state: 'applied',
        });
    });

    it('adds a job with only company, position, and open date', async () => {
        renderJobInput();

        const openUser = userEvent.setup();
        await openUser.click(screen.getByRole('button', { name: 'Add Job' }));

        const user = userEvent.setup();
        await user.type(screen.getByLabelText('Company'), 'Acme');
        await user.type(screen.getByLabelText('Position'), 'Frontend developer');
        fireEvent.change(screen.getByLabelText('Open date'), { target: { value: '2026-09-01' } });
        await user.click(screen.getByRole('button', { name: 'Add' }));

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Array<{
            companyName: string;
            position: string;
            description: string;
            link: string;
            submissionDate: string | null;
        }>;

        expect(saved).toHaveLength(1);
        expect(saved[0]).toMatchObject({
            companyName: 'Acme',
            position: 'Frontend developer',
            description: '',
            link: '',
            submissionDate: null,
        });
    });
});
