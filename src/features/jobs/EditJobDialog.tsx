import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { JobItem, JobItemFields } from '../../types/types';
import { parseDateInput, toDateInputValue } from './jobDates';
import { isValidJobLink } from './jobLink';
import './EditJobDialog.css';

type EditJobDialogProps = {
    job: JobItem;
    onCancel: () => void;
    onUpdate: (values: JobItemFields) => void;
};

type EditJobFormData = {
    companyName: string;
    position: string;
    description: string;
    link: string;
    openDate: string;
    submissionDate: string;
};

export const EditJobDialog = ({ job, onCancel, onUpdate }: EditJobDialogProps) => {
    const [formData, setFormData] = useState<EditJobFormData>({
        companyName: job.companyName,
        position: job.position,
        description: job.description,
        link: job.link,
        openDate: toDateInputValue(job.openDate),
        submissionDate: job.submissionDate === null ? '' : toDateInputValue(job.submissionDate),
    });
    const [linkError, setLinkError] = useState<string | null>(null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsedOpenDate = parseDateInput(formData.openDate);
        const trimmedLink = formData.link.trim();
        if (!formData.companyName.trim() || !formData.position.trim() || parsedOpenDate === null) {
            return;
        }

        if (!isValidJobLink(trimmedLink)) {
            setLinkError('Enter a valid http or https URL.');
            return;
        }

        setLinkError(null);
        onUpdate({
            companyName: formData.companyName.trim(),
            position: formData.position.trim(),
            description: formData.description.trim(),
            link: trimmedLink,
            openDate: parsedOpenDate,
            submissionDate: parseDateInput(formData.submissionDate),
        });
    };

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        if (name === 'link' && linkError !== null) {
            setLinkError(null);
        }
    };

    return (
        <div className="editJobOverlay" role="presentation" onClick={onCancel}>
            <div
                className="editJobDialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-job-title"
                onClick={(event) => event.stopPropagation()}
            >
                <h3 id="edit-job-title">Edit job</h3>
                <form onSubmit={handleSubmit} noValidate>
                    <label htmlFor="edit-job-company">Company</label>
                    <input
                        id="edit-job-company"
                        name="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={handleChange}
                        autoFocus
                        required
                    />

                    <label htmlFor="edit-job-position">Position</label>
                    <input
                        id="edit-job-position"
                        name="position"
                        type="text"
                        value={formData.position}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="edit-job-description">Description</label>
                    <textarea
                        id="edit-job-description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                    />

                    <label htmlFor="edit-job-link">Link</label>
                    <input
                        id="edit-job-link"
                        name="link"
                        type="url"
                        value={formData.link}
                        onChange={handleChange}
                        placeholder="https://"
                        aria-invalid={linkError !== null}
                        aria-describedby={linkError !== null ? 'edit-job-link-error' : undefined}
                    />
                    {linkError !== null ? (
                        <p id="edit-job-link-error" className="fieldError" role="alert">
                            {linkError}
                        </p>
                    ) : null}

                    <label htmlFor="edit-job-open-date">Open date</label>
                    <input
                        id="edit-job-open-date"
                        name="openDate"
                        type="date"
                        value={formData.openDate}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="edit-job-submission-date">Applied</label>
                    <input
                        id="edit-job-submission-date"
                        name="submissionDate"
                        type="date"
                        value={formData.submissionDate}
                        onChange={handleChange}
                    />

                    <div className="editJobActions">
                        <button type="button" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit">
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
