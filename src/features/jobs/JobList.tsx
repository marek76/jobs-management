import { useState } from 'react';
import { useStore } from '../../context/useStore';
import type { JobFilter, JobItem, JobItemFields, JobItemStateKey } from '../../types/types';
import { JobItemState } from '../../types/types';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { EditJobDialog } from './EditJobDialog';
import { filterJobs } from './filterJobs';
import { toDateInputValue } from './jobDates';
import { JobStateSelect } from './JobStateSelect';
import './JobList.css';

type JobListProps = {
    filter: JobFilter;
};

const JOB_COLUMNS = Object.keys(JobItemState) as JobItemStateKey[];

const EditIcon = () => (
    <svg
        className="jobEditIcon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
        focusable="false"
    >
        <path
            fill="currentColor"
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
        />
    </svg>
);

const TrashIcon = () => (
    <svg
        className="jobDeleteIcon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
        focusable="false"
    >
        <path
            fill="currentColor"
            d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9zm-1 12h12a1 1 0 0 0 1-1V7H5v13a1 1 0 0 0 1 1z"
        />
    </svg>
);

const LinkIcon = () => (
    <svg
        className="jobLinkIcon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
        focusable="false"
    >
        <path
            fill="currentColor"
            d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
        />
    </svg>
);

const CalendarIcon = () => (
    <svg
        className="jobCalendarIcon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
        focusable="false"
    >
        <path
            fill="currentColor"
            d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
        />
    </svg>
);

const formatJobDate = (date: Date): string => toDateInputValue(date);

const formatJobDates = (job: JobItem): string => {
    const parts = [`Open ${formatJobDate(job.openDate)}`];

    if (job.submissionDate !== null) {
        parts.push(`Applied ${formatJobDate(job.submissionDate)}`);
    }

    return parts.join(' · ');
};

type JobListItemProps = {
    job: JobItem;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onSetState: (id: number, state: JobItemStateKey) => void;
};

const JobListItem = ({ job, onEdit, onDelete, onSetState }: JobListItemProps) => {
    const [hovered, setHovered] = useState(false);
    const datesLabel = formatJobDates(job);
    const link = job.link.trim();

    return (
        <li
            className={`jobItem ${job.state}${hovered ? ' jobItemHovered' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={(event) => {
                const nextTarget = event.relatedTarget;
                if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
                    setHovered(false);
                }
            }}
        >
            <div className="jobItemContent">
                <p className="jobItemCompany">{job.companyName}</p>
                <p className="jobItemPosition">{job.position}</p>
                <div className="jobItemMeta">
                    {link ? (
                        <a
                            className="jobItemLink"
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open job link"
                            title={link}
                        >
                            <LinkIcon />
                        </a>
                    ) : null}
                    <span
                        className="jobCalendar"
                        role="img"
                        title={datesLabel}
                        aria-label={datesLabel}
                    >
                        <CalendarIcon />
                    </span>
                    <JobStateSelect
                        companyName={job.companyName}
                        state={job.state}
                        onSelect={(nextState) => onSetState(job.id, nextState)}
                    />
                </div>
            </div>
            <div className="jobItemActions">
                <button
                    type="button"
                    className="jobEdit"
                    aria-label={`Edit ${job.companyName}`}
                    onClick={() => onEdit(job.id)}
                >
                    <EditIcon />
                </button>
                <button
                    type="button"
                    className="jobDelete"
                    aria-label={`Delete ${job.companyName}`}
                    onClick={() => onDelete(job.id)}
                >
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
};

export const JobList = ({ filter }: JobListProps) => {
    const { state, dispatch } = useStore();
    const jobs = filterJobs(state.jobs, filter);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [editingJobId, setEditingJobId] = useState<number | null>(null);

    const editingJob = editingJobId === null
        ? null
        : state.jobs.find((job) => job.id === editingJobId) ?? null;

    const confirmDelete = () => {
        if (pendingDeleteId === null) {
            return;
        }

        dispatch({
            type: 'DELETE_ITEM',
            payload: pendingDeleteId,
        });
        setPendingDeleteId(null);
    };

    const updateJob = (values: JobItemFields) => {
        if (editingJobId === null) {
            return;
        }

        dispatch({
            type: 'UPDATE_ITEM',
            payload: {
                id: editingJobId,
                ...values,
            },
        });
        setEditingJobId(null);
    };

    return (
        <>
            <div className="jobBoard">
                {JOB_COLUMNS.map((columnState) => {
                    if (filter.length > 0 && !filter.includes(columnState)) {
                        return null;
                    }

                    const columnJobs = jobs.filter((job) => job.state === columnState);
                    const titleId = `job-column-${columnState}`;

                    return (
                        <section
                            key={columnState}
                            className={`jobColumn ${columnState}`}
                            aria-labelledby={titleId}
                        >
                            <h3 id={titleId} className="jobColumnTitle">
                                {JobItemState[columnState]}
                            </h3>
                            <ul className="jobList">
                                {columnJobs.map((job) => (
                                    <JobListItem
                                        key={job.id}
                                        job={job}
                                        onEdit={setEditingJobId}
                                        onDelete={setPendingDeleteId}
                                        onSetState={(id, nextState) => dispatch({
                                            type: 'SET_STATE',
                                            payload: {
                                                id,
                                                state: nextState,
                                            },
                                        })}
                                    />
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>
            {pendingDeleteId !== null && (
                <DeleteConfirmDialog
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDeleteId(null)}
                />
            )}
            {editingJob !== null && (
                <EditJobDialog
                    job={editingJob}
                    onCancel={() => setEditingJobId(null)}
                    onUpdate={updateJob}
                />
            )}
        </>
    );
};
