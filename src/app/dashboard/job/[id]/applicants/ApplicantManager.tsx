'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Applicants.module.css';
import {
    shortlistApplicant,
    markProcessing,
    hireApplicant,
    rejectApplicant,
    scheduleInterview
} from '@/app/applicant/[applicationId]/actions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Application = any;

type ApplicationStatus = 'applied' | 'viewed' | 'shortlisted' | 'interview' | 'processing' | 'hired' | 'rejected';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
    applied: 'Applied',
    viewed: 'Viewed',
    shortlisted: 'Shortlisted',
    interview: 'Interview',
    processing: 'Processing',
    hired: 'Hired',
    rejected: 'Rejected'
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
    applied: '#1976d2',
    viewed: '#7b1fa2',
    shortlisted: '#f57c00',
    interview: '#0288d1',
    processing: '#fbc02d',
    hired: '#2e7d32',
    rejected: '#c62828'
};

interface Props {
    jobId: string;
    applications: Application[];
    isPro?: boolean;
}

export function ApplicantManager({ jobId, applications, isPro = false }: Props) {
    const [selectedId, setSelectedId] = useState<string | null>(
        applications[0]?.id || null
    );
    const [loading, setLoading] = useState(false);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Export CSV handler
    const handleExportCSV = async () => {
        if (!isPro) {
            alert('CSV Export requires a Pro subscription. Upgrade to export applicant data.');
            return;
        }

        setExporting(true);
        try {
            const response = await fetch(`/api/export/applicants?jobId=${jobId}`);
            if (!response.ok) {
                const error = await response.json();
                alert(error.error || 'Export failed');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `applicants_${jobId}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const selectedApp = applications.find(a => a.id === selectedId);
    const applicant = selectedApp?.applicant;

    // Helper for simple status updates
    const handleAction = async (action: () => Promise<unknown>) => {
        if (!selectedId) return;
        setLoading(true);
        try {
            await action();
            // In a real app we might want to optimistic update here
            // For now, we rely on Server Actions revalidating. 
            // Since this is a client component consuming props, we might need a router.refresh() 
            // to see new data if the server action doesn't trigger a full page reload.
            window.location.reload(); // Simple brute force refresh to ensure data sync for now
        } catch (err) {
            console.error('Failed to update status', err);
        } finally {
            setLoading(false);
        }
    };

    const isFinalState = selectedApp?.status === 'hired' || selectedApp?.status === 'rejected';

    return (
        <div className={styles.splitView}>
            {/* LEFT: Applicant List */}
            <div className={styles.listPanel}>
                <div className={styles.listHeader}>
                    <span className={styles.listCount}>{applications.length} Applicants</span>
                    <button
                        onClick={handleExportCSV}
                        disabled={exporting}
                        className={`${styles.exportButton} ${!isPro ? styles.locked : ''}`}
                        title={isPro ? 'Export to CSV' : 'Pro feature - Upgrade to export'}
                    >
                        {exporting ? '...' : '📥 Export'}
                        {!isPro && <span className={styles.proTag}>PRO</span>}
                    </button>
                </div>
                {applications.length === 0 ? (
                    <div className={styles.emptyList}>No applicants yet.</div>
                ) : (
                    applications.map(app => (
                        <button
                            key={app.id}
                            onClick={() => setSelectedId(app.id)}
                            className={`${styles.listItem} ${selectedId === app.id ? styles.active : ''}`}
                        >
                            <div className={styles.listItemHeader}>
                                <span className={styles.listName}>
                                    {app.applicant?.full_name || 'Unknown'}
                                </span>
                                <span
                                    className={styles.listStatus}
                                    style={{ color: STATUS_COLORS[app.status as ApplicationStatus] ?? '#666' }}
                                >
                                    {STATUS_LABELS[app.status as ApplicationStatus] ?? app.status}
                                </span>
                            </div>
                            <div className={styles.listMeta}>
                                {app.applicant?.headline || 'No headline'}
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* RIGHT: Detail Panel */}
            <div className={styles.detailPanel}>
                {!selectedApp ? (
                    <div className={styles.emptyDetail}>
                        Select an applicant to view details
                    </div>
                ) : (
                    <>
                        {/* HEADER: Name, Headline, Status Badge */}
                        <div className={styles.detailHeader}>
                            <div className={styles.headerContent}>
                                <div className={styles.headerTopRow}>
                                    <h2 className={styles.detailName}>
                                        {applicant?.full_name || 'Unknown'}
                                    </h2>
                                    <span
                                        className={styles.headerStatusBadge}
                                        style={{
                                            backgroundColor: STATUS_COLORS[selectedApp.status as ApplicationStatus] + '20',
                                            color: STATUS_COLORS[selectedApp.status as ApplicationStatus]
                                        }}
                                    >
                                        {STATUS_LABELS[selectedApp.status as ApplicationStatus] || selectedApp.status}
                                    </span>
                                </div>
                                <p className={styles.detailHeadline}>
                                    {applicant?.headline || 'No headline'}
                                </p>
                            </div>
                        </div>

                        {/* UNIFIED TOOLBAR: Decisions on Left, Reference on Right */}
                        <div className={styles.toolbar}>
                            <div className={styles.decisionActions}>
                                {!isFinalState && (
                                    <>
                                        {(selectedApp.status === 'applied' || selectedApp.status === 'viewed' || selectedApp.status === 'new') && (
                                            <button
                                                className={`${styles.button} ${styles.primary}`}
                                                onClick={() => handleAction(() => shortlistApplicant(selectedApp.id))}
                                                disabled={loading}
                                            >
                                                ⭐ Shortlist
                                            </button>
                                        )}

                                        {selectedApp.status === 'shortlisted' && (
                                            <button
                                                className={`${styles.button} ${styles.primary}`}
                                                onClick={() => setShowInterviewModal(true)}
                                                disabled={loading}
                                            >
                                                📅 Schedule Interview
                                            </button>
                                        )}

                                        {selectedApp.status === 'interview' && (
                                            <button
                                                className={`${styles.button} ${styles.primary}`}
                                                onClick={() => handleAction(() => markProcessing(selectedApp.id))}
                                                disabled={loading}
                                            >
                                                ⏳ Mark Processing
                                            </button>
                                        )}

                                        {selectedApp.status === 'processing' && (
                                            <button
                                                className={`${styles.button} ${styles.success}`}
                                                onClick={() => handleAction(() => hireApplicant(selectedApp.id))}
                                                disabled={loading}
                                            >
                                                ✅ Hire
                                            </button>
                                        )}

                                        <button
                                            className={`${styles.button} ${styles.ghostDanger}`}
                                            onClick={() => handleAction(() => rejectApplicant(selectedApp.id))}
                                            disabled={loading}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className={styles.referenceActions}>
                                {applicant?.resume_url && (
                                    <a
                                        href={applicant.resume_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.iconButton}
                                        title="View Resume"
                                    >
                                        📄 CV
                                    </a>
                                )}
                                <Link
                                    href={`/applicant/${selectedApp.id}`}
                                    className={styles.iconButton}
                                    title="Open Full Profile"
                                >
                                    👤 Profile
                                </Link>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className={styles.infoSection}>
                            <h3 className={styles.sectionTitle}>Contact</h3>
                            <div className={styles.infoGrid}>
                                {applicant?.email && (
                                    <div>
                                        <span className={styles.infoLabel}>Email:</span>
                                        <a href={`mailto:${applicant.email}`}>{applicant.email}</a>
                                    </div>
                                )}
                                {applicant?.phone && (
                                    <div>
                                        <span className={styles.infoLabel}>Phone:</span>
                                        <span>{applicant.phone}</span>
                                    </div>
                                )}
                                {applicant?.linkedin && (
                                    <div>
                                        <span className={styles.infoLabel}>LinkedIn:</span>
                                        <a href={applicant.linkedin} target="_blank" rel="noopener noreferrer">
                                            View Profile
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        {applicant?.summary && (
                            <div className={styles.infoSection}>
                                <h3 className={styles.sectionTitle}>Summary</h3>
                                <p className={styles.summary}>{applicant.summary}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {applicant?.skills?.length > 0 && (
                            <div className={styles.infoSection}>
                                <h3 className={styles.sectionTitle}>Skills</h3>
                                <div className={styles.skillTags}>
                                    {applicant.skills.map((skill: string) => (
                                        <span key={skill} className={styles.skillTag}>{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {selectedApp.recentExperience && (
                            <div className={styles.infoSection}>
                                <h3 className={styles.sectionTitle}>Recent Experience</h3>
                                <div className={styles.expItem}>
                                    <strong>{selectedApp.recentExperience.title}</strong>
                                    <span> @ {selectedApp.recentExperience.company}</span>
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {selectedApp.recentEducation && (
                            <div className={styles.infoSection}>
                                <h3 className={styles.sectionTitle}>Education</h3>
                                <div className={styles.eduItem}>
                                    <strong>{selectedApp.recentEducation.degree}</strong>
                                    <span> — {selectedApp.recentEducation.school}</span>
                                </div>
                            </div>
                        )}

                        {/* Cover Note */}
                        {selectedApp.cover_note && (
                            <div className={styles.infoSection}>
                                <h3 className={styles.sectionTitle}>Cover Note</h3>
                                <p className={styles.coverNote}>{selectedApp.cover_note}</p>
                            </div>
                        )}

                        {/* INTERVIEW MODAL */}
                        {showInterviewModal && (
                            <InterviewModal
                                applicationId={selectedApp.id}
                                onClose={() => setShowInterviewModal(false)}
                                onSuccess={() => {
                                    setShowInterviewModal(false);
                                    window.location.reload();
                                }}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Interview Scheduling Modal (Copied from Review Page)
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
        } catch {
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
                    <div className={styles.errorMessage}>
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
                        <label className={styles.formLabel}>Location (or &quot;Online&quot;)</label>
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
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`${styles.button} ${styles.primary}`}
                        >
                            {loading ? 'Scheduling...' : 'Schedule Interview'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
