'use client'

import { useState } from 'react';
import { applyForJob } from './actions';
import styles from './Job.module.css';

interface Props {
    jobId: string;
    hasApplied: boolean;
    isSeeker: boolean;
}

export function ApplyButton({ jobId, hasApplied, isSeeker }: Props) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(hasApplied ? 'Applied' : null);

    if (!isSeeker) {
        // If not a seeker (guest or hirer), we don't show the easy apply button in the same state
        // or we show a login prompt. Handled in parent mostly, but safety check here.
        return null;
    }

    if (message === 'Applied') {
        return (
            <button className={styles.applyButton} disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>
                APPLIED ✅
            </button>
        );
    }

    const handleApply = async () => {
        if (!confirm('Apply to this job with your FastJob Profile?')) return;

        setLoading(true);
        try {
            const result = await applyForJob(jobId);
            if (result.success) {
                setMessage('Applied');
            } else {
                alert(result.message);
            }
        } catch (e) {
            alert('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleApply}
            disabled={loading}
            className={styles.applyButton}
        >
            {loading ? 'SENDING...' : 'EASY APPLY'}
        </button>
    );
}
