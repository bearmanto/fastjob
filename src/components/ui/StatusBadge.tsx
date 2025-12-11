'use client'

import React from 'react';

type ApplicationStatus = 'applied' | 'viewed' | 'shortlisted' | 'interview' | 'processing' | 'hired' | 'rejected';

const STATUS_STYLES: Record<ApplicationStatus, { bg: string; color: string; label: string }> = {
    applied: { bg: '#e0e0e0', color: '#333', label: 'Applied' },
    viewed: { bg: '#e3f2fd', color: '#1565c0', label: 'Viewed' },
    shortlisted: { bg: '#fff8e1', color: '#f9a825', label: 'Shortlisted' },
    interview: { bg: '#fff3e0', color: '#ef6c00', label: 'Interview' },
    processing: { bg: '#f3e5f5', color: '#7b1fa2', label: 'Processing' },
    hired: { bg: '#e8f5e9', color: '#2e7d32', label: 'Hired' },
    rejected: { bg: '#ffebee', color: '#c62828', label: 'Rejected' },
};

interface Props {
    status: ApplicationStatus | string;
    size?: 'small' | 'normal';
}

export function StatusBadge({ status, size = 'normal' }: Props) {
    const style = STATUS_STYLES[status as ApplicationStatus] || { bg: '#eee', color: '#666', label: status };

    return (
        <span style={{
            display: 'inline-block',
            padding: size === 'small' ? '2px 6px' : '4px 8px',
            borderRadius: '3px',
            background: style.bg,
            color: style.color,
            textTransform: 'uppercase',
            fontSize: size === 'small' ? '10px' : '11px',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
        }}>
            {style.label}
        </span>
    );
}

// Job Status Badge
type JobStatus = 'active' | 'closed' | 'draft';

const JOB_STATUS_STYLES: Record<JobStatus, { bg: string; color: string; label: string }> = {
    active: { bg: '#e8f5e9', color: '#2e7d32', label: 'Active' },
    closed: { bg: '#ffebee', color: '#c62828', label: 'Closed' },
    draft: { bg: '#e0e0e0', color: '#666', label: 'Draft' },
};

export function JobStatusBadge({ status }: { status: JobStatus | string }) {
    const style = JOB_STATUS_STYLES[status as JobStatus] || { bg: '#eee', color: '#666', label: status };

    return (
        <span style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '3px',
            background: style.bg,
            color: style.color,
            textTransform: 'uppercase',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
        }}>
            {style.label}
        </span>
    );
}
