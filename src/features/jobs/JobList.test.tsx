import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JobProvider } from '../../context/JobProvider';
import { JobList } from './JobList';
import { todayDateInputValue } from './jobDates';

const STORAGE_KEY = 'job_app_items';

const renderJobList = () => render(
    <JobProvider>
        <JobList filter={[]} />
    </JobProvider>,
);

describe('JobList', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('displays jobs in four status columns', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: null,
                state: 'new',
            },
            {
                id: 2,
                companyName: 'Globex',
                position: 'Backend developer',
                description: '',
                openDate: '2026-09-02T00:00:00',
                submissionDate: '2026-09-03T00:00:00',
                state: 'applied',
            },
            {
                id: 3,
                companyName: 'Initech',
                position: 'Full stack developer',
                description: '',
                openDate: '2026-09-04T00:00:00',
                submissionDate: '2026-09-05T00:00:00',
                state: 'accepted',
            },
            {
                id: 4,
                companyName: 'Umbrella',
                position: 'QA engineer',
                description: '',
                openDate: '2026-09-06T00:00:00',
                submissionDate: '2026-09-07T00:00:00',
                state: 'rejected',
            },
        ]));

        renderJobList();

        const newColumn = screen.getByRole('region', { name: 'New' });
        const appliedColumn = screen.getByRole('region', { name: 'Applied' });
        const acceptedColumn = screen.getByRole('region', { name: 'Accepted' });
        const rejectedColumn = screen.getByRole('region', { name: 'Rejected' });

        expect(within(newColumn).getByText('Acme')).toBeInTheDocument();
        expect(within(appliedColumn).getByText('Globex')).toBeInTheDocument();
        expect(within(acceptedColumn).getByText('Initech')).toBeInTheDocument();
        expect(within(rejectedColumn).getByText('Umbrella')).toBeInTheDocument();
    });

    it('keeps empty status columns visible', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: null,
                state: 'new',
            },
            {
                id: 2,
                companyName: 'Globex',
                position: 'Backend developer',
                description: '',
                openDate: '2026-09-02T00:00:00',
                submissionDate: '2026-09-03T00:00:00',
                state: 'applied',
            },
        ]));

        renderJobList();

        expect(screen.getByRole('region', { name: 'New' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Applied' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Accepted' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Rejected' })).toBeInTheDocument();
    });

    it('hides filtered-out status columns', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: null,
                state: 'new',
            },
            {
                id: 2,
                companyName: 'Globex',
                position: 'Backend developer',
                description: '',
                openDate: '2026-09-02T00:00:00',
                submissionDate: '2026-09-03T00:00:00',
                state: 'applied',
            },
            {
                id: 3,
                companyName: 'Initech',
                position: 'Full stack developer',
                description: '',
                openDate: '2026-09-04T00:00:00',
                submissionDate: '2026-09-05T00:00:00',
                state: 'accepted',
            },
        ]));

        render(
            <JobProvider>
                <JobList filter={['new']} />
            </JobProvider>,
        );

        expect(screen.getByRole('region', { name: 'New' })).toBeInTheDocument();
        expect(within(screen.getByRole('region', { name: 'New' })).getByText('Acme')).toBeInTheDocument();
        expect(screen.queryByRole('region', { name: 'Applied' })).not.toBeInTheDocument();
        expect(screen.queryByRole('region', { name: 'Accepted' })).not.toBeInTheDocument();
        expect(screen.queryByRole('region', { name: 'Rejected' })).not.toBeInTheDocument();
    });

    it('shows open date only in the calendar tooltip when the applied date is missing', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: null,
                state: 'new',
            },
        ]));

        renderJobList();

        expect(screen.getByText('Acme')).toBeInTheDocument();
        expect(screen.getByText('Frontend developer')).toBeInTheDocument();
        expect(screen.queryByText(/Open /)).not.toBeInTheDocument();
        expect(screen.queryByText(/Applied \d/)).not.toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Open 2026-09-01' })).toHaveAttribute('title', 'Open 2026-09-01');
    });

    it('shows the applied date in the calendar tooltip when it is present', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: '2026-09-09T00:00:00',
                state: 'new',
            },
        ]));

        renderJobList();

        const calendar = screen.getByRole('img', { name: 'Open 2026-09-01 · Applied 2026-09-09' });
        expect(calendar).toHaveAttribute('title', 'Open 2026-09-01 · Applied 2026-09-09');
        expect(screen.queryByText(/Open 2026-09-01/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Applied 2026-09-09/)).not.toBeInTheDocument();
    });

    it('changes a new job to applied and sets the submission date to today', async () => {
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: null,
                state: 'new',
            },
        ]));

        renderJobList();

        await user.click(screen.getByRole('button', { name: 'Set status of Acme' }));
        await user.click(screen.getByRole('menuitem', { name: 'Applied' }));

        expect(screen.getByRole('button', { name: 'Set status of Acme' })).toHaveTextContent('Applied');
        expect(screen.getByRole('img', { name: `Open 2026-09-01 · Applied ${todayDateInputValue()}` })).toHaveAttribute(
            'title',
            `Open 2026-09-01 · Applied ${todayDateInputValue()}`,
        );
        expect(screen.queryByText(new RegExp(`Applied ${todayDateInputValue()}`))).not.toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')[0]).toMatchObject({
            state: 'applied',
        });
        expect(within(screen.getByRole('region', { name: 'Applied' })).getByText('Acme')).toBeInTheDocument();
    });

    it('lets an applied job change to accepted or rejected', async () => {
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: '2026-09-09T00:00:00',
                state: 'applied',
            },
        ]));

        renderJobList();

        await user.click(screen.getByRole('button', { name: 'Set status of Acme' }));

        expect(screen.getByRole('menuitem', { name: 'Rejected' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Accepted' })).toBeInTheDocument();

        await user.click(screen.getByRole('menuitem', { name: 'Accepted' }));

        expect(screen.getByRole('button', { name: 'Set status of Acme' })).toHaveTextContent('Accepted');
    });

    it('lets an accepted job change to rejected', async () => {
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: '2026-09-09T00:00:00',
                state: 'accepted',
            },
        ]));

        renderJobList();

        await user.click(screen.getByRole('button', { name: 'Set status of Acme' }));
        await user.click(screen.getByRole('menuitem', { name: 'Rejected' }));

        expect(within(screen.getByRole('region', { name: 'Rejected' })).getByText('Acme')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Set status of Acme' })).not.toBeInTheDocument();
    });

    it('renders a separator between jobs', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: null,
                state: 'new',
            },
            {
                id: 2,
                companyName: 'Globex',
                position: 'Backend developer',
                description: '',
                openDate: '2026-09-02T00:00:00',
                submissionDate: null,
                state: 'new',
            },
        ]));

        const { container } = renderJobList();
        const items = container.querySelectorAll('.jobItem');

        expect(items).toHaveLength(2);
        expect(getComputedStyle(items[1]).borderTopWidth).not.toBe('0px');
    });

    it('renders a clickable job link that opens in a new window', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: 'Great team',
                link: 'https://example.com/jobs/acme',
                openDate: '2026-09-01T00:00:00',
                submissionDate: null,
                state: 'new',
            },
        ]));

        renderJobList();

        const link = screen.getByRole('link', { name: 'Open job link' });
        const calendar = screen.getByRole('img', { name: /Open / });
        const status = screen.getByRole('button', { name: 'Set status of Acme' });

        expect(link).toHaveAttribute('href', 'https://example.com/jobs/acme');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(screen.queryByText('https://example.com/jobs/acme')).not.toBeInTheDocument();
        expect(screen.queryByText('Great team')).not.toBeInTheDocument();
        expect(link.compareDocumentPosition(calendar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(calendar.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('hides the job link when it is empty', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                link: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: null,
                state: 'new',
            },
        ]));

        renderJobList();

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByRole('img', { name: /Open / })).toBeInTheDocument();
    });

    it('hides edit and delete until the job item is hovered', async () => {
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            {
                id: 1,
                companyName: 'Acme',
                position: 'Frontend developer',
                description: '',
                openDate: '2026-09-01T00:00:00',
                submissionDate: null,
                state: 'new',
            },
        ]));

        renderJobList();

        const edit = screen.getByRole('button', { name: 'Edit Acme' });
        const remove = screen.getByRole('button', { name: 'Delete Acme' });
        const item = edit.closest('.jobItem');
        const actions = edit.parentElement;

        expect(actions).toHaveClass('jobItemActions');
        expect(actions).toContainElement(remove);
        expect(item).toContainElement(actions);
        expect(item).not.toHaveClass('jobItemHovered');

        await user.hover(screen.getByText('Acme'));

        expect(item).toHaveClass('jobItemHovered');

        await user.unhover(screen.getByText('Acme'));

        expect(item).not.toHaveClass('jobItemHovered');
    });
});
