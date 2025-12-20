'use client'

import { useState } from 'react';
import Link from 'next/link';
import { closeJob } from '@/app/dashboard/actions';
import styles from './JobActions.module.css';

interface Props {
    jobId: string;
    jobStatus: string;
}

function Modal({ title, children, actions }: { title: string, children: React.ReactNode, actions: React.ReactNode }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalTitle}>
                    {title}
                </div>
                <div className={styles.modalBody}>
                    {children}
                </div>
                <div className={styles.modalActions}>
                    {actions}
                </div>
            </div>
        </div>
    )
}

export function JobActions({ jobId, jobStatus }: Props) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClose = async () => {
        setLoading(true);
        try {
            const result = await closeJob(jobId);
            if (!result.success) {
                alert(result.message || 'Failed to close job.');
            } else {
                setShowConfirm(false);
            }
        } catch {
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const isClosed = jobStatus === 'closed';

    return (
        <>
            {showConfirm && (
                <Modal
                    title="Close Job Posting?"
                    actions={
                        <>
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                className={styles.dangerButton}
                            >
                                {loading ? 'Closing...' : 'Close Job'}
                            </button>
                        </>
                    }
                >
                    This action cannot be undone. The job will be removed from public listings and you will not be able to reopen it.
                </Modal>
            )}

            <div className={styles.actionGroup}>
                <Link href={`/job/${jobId}`} className={styles.viewButton}>
                    View
                </Link>

                {!isClosed && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className={styles.closeButton}
                    >
                        Close
                    </button>
                )}
            </div>
        </>
    );
}
