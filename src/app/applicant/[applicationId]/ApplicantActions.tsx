'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    shortlistApplicant,
    scheduleInterview,
    markProcessing,
    hireApplicant,
    rejectApplicant
} from './actions';
import styles from './Applicant.module.css';

interface Interview {
    id: string;
    scheduled_at: string;
    location?: string;
    meeting_link?: string;
    description?: string;
}

interface Props {
    applicationId: string;
    currentStatus: string;
    resumeUrl?: string | null;
    interview?: Interview | null;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    applied: { bg: '#e0e0e0', color: '#333' },
    viewed: { bg: '#e3f2fd', color: '#1565c0' },
    shortlisted: { bg: '#fff8e1', color: '#f9a825' },
    interview: { bg: '#fff3e0', color: '#ef6c00' },
    processing: { bg: '#f3e5f5', color: '#7b1fa2' },
    hired: { bg: '#e8f5e9', color: '#2e7d32' },
    rejected: { bg: '#ffebee', color: '#c62828' },
};

export function ApplicantActions({ applicationId, currentStatus, resumeUrl, interview }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showInterviewModal, setShowInterviewModal] = useState(false);

    const handleAction = async (action: () => Promise<any>) => {
        setLoading(true);
        try {
            await action();
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    const statusStyle = STATUS_COLORS[currentStatus] || STATUS_COLORS.applied;
    const isFinalState = currentStatus === 'hired' || currentStatus === 'rejected';

    return (
        <>
            <div className={styles.actionsBar}>
                {/* Current Status Badge */}
                <span
                    className={styles.statusBadge}
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                    {currentStatus}
                </span>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Resume Download */}
                {resumeUrl && (
                    <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionButton}
                    >
                        📄 Download CV
                    </a>
                )}

                {/* Action Buttons based on status */}
                {!isFinalState && (
                    <>
                        {currentStatus === 'viewed' && (
                            <button
                                className={`${styles.actionButton} ${styles.primary}`}
                                onClick={() => handleAction(() => shortlistApplicant(applicationId))}
                                disabled={loading}
                            >
                                ⭐ Shortlist
                            </button>
                        )}

                        {currentStatus === 'shortlisted' && (
                            <button
                                className={`${styles.actionButton} ${styles.primary}`}
                                onClick={() => setShowInterviewModal(true)}
                                disabled={loading}
                            >
                                📅 Schedule Interview
                            </button>
                        )}

                        {currentStatus === 'interview' && (
                            <button
                                className={`${styles.actionButton} ${styles.primary}`}
                                onClick={() => handleAction(() => markProcessing(applicationId))}
                                disabled={loading}
                            >
                                ⏳ Mark Processing
                            </button>
                        )}

                        {currentStatus === 'processing' && (
                            <button
                                className={`${styles.actionButton} ${styles.success}`}
                                onClick={() => handleAction(() => hireApplicant(applicationId))}
                                disabled={loading}
                            >
                                ✅ Hire
                            </button>
                        )}

                        {/* Reject always available (except final states) */}
                        <button
                            className={`${styles.actionButton} ${styles.danger}`}
                            onClick={() => handleAction(() => rejectApplicant(applicationId))}
                            disabled={loading}
                        >
                            ❌ Reject
                        </button>
                    </>
                )}
            </div>

            {/* Interview Info */}
            {interview && (
                <div className={styles.interviewInfo}>
                    <strong>Interview Scheduled:</strong>{' '}
                    {new Date(interview.scheduled_at).toLocaleString()}
                    {interview.location && <> • 📍 {interview.location}</>}
                    {interview.meeting_link && (
                        <> • <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">Join Meeting</a></>
                    )}
                </div>
            )}

            {/* Interview Modal */}
            {showInterviewModal && (
                <InterviewModal
                    applicationId={applicationId}
                    onClose={() => setShowInterviewModal(false)}
                    onSuccess={() => {
                        setShowInterviewModal(false);
                        router.refresh();
                    }}
                />
            )}
        </>
    );
}

// Interview Scheduling Modal
function InterviewModal({
    applicationId,
    onClose,
    onSuccess
}: {
    applicationId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const form = e.currentTarget;
        const formData = new FormData(form);

        const date = formData.get('date') as string;
        const time = formData.get('time') as string;

        if (!date || !time) {
            setError('Please select date and time');
            setLoading(false);
            return;
        }

        const scheduledAt = new Date(`${date}T${time}`).toISOString();

        try {
            const result = await scheduleInterview(applicationId, {
                scheduledAt,
                location: formData.get('location') as string || undefined,
                meetingLink: formData.get('meetingLink') as string || undefined,
                description: formData.get('description') as string || undefined,
            });

            if (result.success) {
                onSuccess();
            } else {
                setError(result.message || 'Failed to schedule interview');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h3 className={styles.modalTitle}>📅 Schedule Interview</h3>

                {error && (
                    <div style={{ color: '#c62828', marginBottom: '16px', fontSize: '13px' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Date *</label>
                        <input
                            type="date"
                            name="date"
                            className={styles.formInput}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Time *</label>
                        <input
                            type="time"
                            name="time"
                            className={styles.formInput}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Location (or "Online")</label>
                        <input
                            type="text"
                            name="location"
                            className={styles.formInput}
                            placeholder="e.g. Office Floor 3, or Online"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Meeting Link</label>
                        <input
                            type="url"
                            name="meetingLink"
                            className={styles.formInput}
                            placeholder="https://zoom.us/j/..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Notes for Candidate</label>
                        <textarea
                            name="description"
                            className={styles.formTextarea}
                            placeholder="Any preparation instructions, what to bring, etc."
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`${styles.actionButton} ${styles.primary}`}
                        >
                            {loading ? 'Scheduling...' : 'Schedule Interview'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
