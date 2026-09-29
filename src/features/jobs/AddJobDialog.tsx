import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { JobItemFields } from '../../types/types';
import { parseDateInput, todayDateInputValue } from './jobDates';
import { isValidJobLink } from './jobLink';
import './AddJobDialog.css';

type AddJobDialogProps = {
    onCancel: () => void;
    onAdd: (values: JobItemFields) => void;
};

type AddJobFormData = {
    companyName: string;
    position: string;
    description: string;
    link: string;
    openDate: string;
    submissionDate: string;
};

export const AddJobDialog = ({ onCancel, onAdd }: AddJobDialogProps) => {
    const [formData, setFormData] = useState<AddJobFormData>({
        companyName: '',
        position: '',
        description: '',
        link: '',
        openDate: todayDateInputValue(),
        submissionDate: '',
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
        onAdd({
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
        <div className="addJobOverlay" role="presentation" onClick={onCancel}>
            <div
                className="addJobDialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-job-title"
                onClick={(event) => event.stopPropagation()}
            >
                <h3 id="add-job-title">Add Job</h3>
                <form onSubmit={handleSubmit} noValidate>
                    <label htmlFor="add-job-company">Company</label>
                    <input
                        id="add-job-company"
                        name="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={handleChange}
                        autoFocus
                        required
                    />

                    <label htmlFor="add-job-position">Position</label>
                    <input
                        id="add-job-position"
                        name="position"
                        type="text"
                        value={formData.position}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="add-job-description">Description</label>
                    <textarea
                        id="add-job-description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                    />

                    <label htmlFor="add-job-link">Link</label>
                    <input
                        id="add-job-link"
                        name="link"
                        type="url"
                        value={formData.link}
                        onChange={handleChange}
                        placeholder="https://"
                        aria-invalid={linkError !== null}
                        aria-describedby={linkError !== null ? 'add-job-link-error' : undefined}
                    />
                    {linkError !== null ? (
                        <p id="add-job-link-error" className="fieldError" role="alert">
                            {linkError}
                        </p>
                    ) : null}

                    <label htmlFor="add-job-open-date">Open date</label>
                    <input
                        id="add-job-open-date"
                        name="openDate"
                        type="date"
                        value={formData.openDate}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="add-job-submission-date">Applied</label>
                    <input
                        id="add-job-submission-date"
                        name="submissionDate"
                        type="date"
                        value={formData.submissionDate}
                        onChange={handleChange}
                    />

                    <div className="addJobActions">
                        <button type="button" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit">
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
