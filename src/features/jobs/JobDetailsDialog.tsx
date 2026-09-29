import type { JobItem, JobItemStateKey } from '../../types/types';
import { toDateInputValue } from './jobDates';
import { JobStateSelect } from './JobStateSelect';
import './JobDetailsDialog.css';

type JobDetailsDialogProps = {
    job: JobItem;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSetState: (state: JobItemStateKey) => void;
};

const EMPTY_VALUE = '—';

const textOrEmpty = (value: string): string => {
    const trimmed = value.trim();
    return trimmed === '' ? EMPTY_VALUE : trimmed;
};

export const JobDetailsDialog = ({ job, onClose, onEdit, onDelete, onSetState }: JobDetailsDialogProps) => {
    const link = job.link.trim();

    return (
        <div className="jobDetailsOverlay" role="presentation" onClick={onClose}>
            <div
                className="jobDetailsDialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="job-details-title"
                onClick={(event) => event.stopPropagation()}
            >
                <h3 id="job-details-title" className={`jobDetailsTitle ${job.state}`}>
                    {job.companyName}
                </h3>
                <dl>
                    <dt>Company</dt>
                    <dd>{job.companyName}</dd>
                    <dt>Position</dt>
                    <dd>{job.position}</dd>
                    <dt>Description</dt>
                    <dd>{textOrEmpty(job.description)}</dd>
                    <dt>Link</dt>
                    <dd>
                        {link === '' ? EMPTY_VALUE : (
                            <a href={link} target="_blank" rel="noopener noreferrer">
                                {link}
                            </a>
                        )}
                    </dd>
                    <dt>Open date</dt>
                    <dd>{toDateInputValue(job.openDate)}</dd>
                    <dt>Applied</dt>
                    <dd>
                        {job.submissionDate === null ? EMPTY_VALUE : toDateInputValue(job.submissionDate)}
                    </dd>
                    <dt>Status</dt>
                    <dd>
                        <JobStateSelect
                            companyName={job.companyName}
                            state={job.state}
                            onSelect={onSetState}
                        />
                    </dd>
                </dl>
                <div className="jobDetailsActions">
                    <button type="button" onClick={onClose}>
                        Close
                    </button>
                    <button type="button" onClick={onEdit}>
                        Edit
                    </button>
                    <button type="button" className="isDanger" onClick={onDelete}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
