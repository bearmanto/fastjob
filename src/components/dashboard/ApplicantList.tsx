'use client'

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import styles from './ApplicantList.module.css';

interface Experience {
    id: string;
    title: string;
    company: string;
    start_date: string;
    end_date?: string;
}

interface Education {
    id: string;
    degree: string;
    school: string;
    field_of_study?: string;
}

interface Application {
    id: string;
    status: string;
    created_at: string;
    applicant: {
        id: string;
        full_name: string | null;
        headline?: string | null;
        location?: string | null;
        resume_url?: string | null;
    };
    job: {
        id: string;
        title: string;
    };
    recentExperience?: Experience | null;
    recentEducation?: Education | null;
}

interface Job {
    id: string;
    title: string;
}

interface Props {
    applications: Application[];
    jobs?: Job[];
}

const STATUSES = [
    { value: '', label: 'All Statuses' },
    { value: 'applied', label: 'Applied' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interview' },
    { value: 'processing', label: 'Processing' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
];

export function ApplicantList({ applications, jobs = [] }: Props) {
    const [statusFilter, setStatusFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter applications
    const filteredApplications = applications.filter(app => {
        if (statusFilter && app.status !== statusFilter) return false;
        if (jobFilter && app.job.id !== jobFilter) return false;
        if (searchQuery) {
            const name = app.applicant?.full_name?.toLowerCase() || '';
            if (!name.includes(searchQuery.toLowerCase())) return false;
        }
        return true;
    });

    if (!applications || applications.length === 0) {
        return (
            <div className={styles.emptyState}>
                No applications yet. Share your job listings to attract candidates!
            </div>
        );
    }

    return (
        <div>
            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.filterInput}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                {jobs.length > 0 && (
                    <select
                        value={jobFilter}
                        onChange={(e) => setJobFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">All Jobs</option>
                        {jobs.map(j => (
                            <option key={j.id} value={j.id}>{j.title}</option>
                        ))}
                    </select>
                )}
                <span className={styles.filterCount}>
                    {filteredApplications.length} of {applications.length} applicants
                </span>
            </div>

            {/* Dense Applicant List */}
            <div>
                {filteredApplications.length > 0 ? filteredApplications.map((app) => (
                    <Link
                        key={app.id}
                        href={`/applicant/${app.id}`}
                        target="_blank"
                        className={styles.applicantLink}
                    >
                        <div className={styles.applicantCard}>
                            {/* Left: Candidate Info (2 lines) */}
                            <div className={styles.candidateInfo}>
                                {/* Line 1: Name + Current Role/Headline */}
                                <div className={styles.candidateLine1}>
                                    <span className={styles.candidateName}>
                                        {app.applicant?.full_name || 'Anonymous'}
                                    </span>
                                    {app.recentExperience && (
                                        <span className={styles.candidateRole}>
                                            • {app.recentExperience.title} @ {app.recentExperience.company}
                                        </span>
                                    )}
                                    {!app.recentExperience && app.applicant?.headline && (
                                        <span className={styles.candidateRole}>
                                            • {app.applicant.headline}
                                        </span>
                                    )}
                                </div>

                                {/* Line 2: Education + Location + Applied For */}
                                <div className={styles.candidateLine2}>
                                    {app.recentEducation && (
                                        <span>
                                            🎓 {app.recentEducation.degree} — {app.recentEducation.school}
                                        </span>
                                    )}
                                    {app.applicant?.location && (
                                        <span>📍 {app.applicant.location}</span>
                                    )}
                                    <span className={styles.appliedFor}>
                                        Applied: <strong>{app.job.title}</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Middle: Date + Status */}
                            <div className={styles.metaColumn}>
                                <div className={styles.applyDate}>
                                    {new Date(app.created_at).toLocaleDateString()}
                                </div>
                                <StatusBadge status={app.status} size="small" />
                            </div>

                            {/* Right: Action */}
                            <div className={styles.actionColumn}>
                                {app.applicant?.resume_url && (
                                    <span
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            window.open(app.applicant?.resume_url || '', '_blank');
                                        }}
                                        className={styles.cvButton}
                                    >
                                        📄 CV
                                    </span>
                                )}
                                <span className={styles.reviewButton}>
                                    Review →
                                </span>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className={styles.emptyState}>
                        No applicants match your filters.
                    </div>
                )}
            </div>
        </div>
    );
}
