'use client'

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import tableStyles from '@/app/category/[slug]/Category.module.css';

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
            <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                No applications yet. Share your job listings to attract candidates!
            </div>
        );
    }

    return (
        <div>
            {/* Filter Bar */}
            <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px 16px',
                background: '#fafafa',
                borderBottom: '1px solid #e0e0e0',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: '6px 10px',
                        fontSize: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        width: '160px'
                    }}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '6px 10px',
                        fontSize: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '3px'
                    }}
                >
                    {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                {jobs.length > 0 && (
                    <select
                        value={jobFilter}
                        onChange={(e) => setJobFilter(e.target.value)}
                        style={{
                            padding: '6px 10px',
                            fontSize: '12px',
                            border: '1px solid #ccc',
                            borderRadius: '3px'
                        }}
                    >
                        <option value="">All Jobs</option>
                        {jobs.map(j => (
                            <option key={j.id} value={j.id}>{j.title}</option>
                        ))}
                    </select>
                )}
                <span style={{ fontSize: '12px', color: '#666', marginLeft: 'auto' }}>
                    {filteredApplications.length} of {applications.length} applicants
                </span>
            </div>

            {/* Dense Applicant List */}
            <div style={{ padding: '0' }}>
                {filteredApplications.length > 0 ? filteredApplications.map((app) => (
                    <Link
                        key={app.id}
                        href={`/applicant/${app.id}`}
                        target="_blank"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto auto',
                            gap: '16px',
                            padding: '14px 16px',
                            borderBottom: '1px solid #eee',
                            alignItems: 'start',
                            cursor: 'pointer',
                            transition: 'background 0.1s ease'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* Left: Candidate Info (2 lines) */}
                            <div style={{ minWidth: 0 }}>
                                {/* Line 1: Name + Current Role/Headline */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '4px'
                                }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: 'var(--hunter-green)',
                                        fontSize: '14px'
                                    }}>
                                        {app.applicant?.full_name || 'Anonymous'}
                                    </span>
                                    {app.recentExperience && (
                                        <span style={{ fontSize: '12px', color: '#666' }}>
                                            • {app.recentExperience.title} @ {app.recentExperience.company}
                                        </span>
                                    )}
                                    {!app.recentExperience && app.applicant?.headline && (
                                        <span style={{ fontSize: '12px', color: '#666' }}>
                                            • {app.applicant.headline}
                                        </span>
                                    )}
                                </div>

                                {/* Line 2: Education + Location + Applied For */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '12px',
                                    color: '#888'
                                }}>
                                    {app.recentEducation && (
                                        <span>
                                            🎓 {app.recentEducation.degree} — {app.recentEducation.school}
                                        </span>
                                    )}
                                    {app.applicant?.location && (
                                        <span>📍 {app.applicant.location}</span>
                                    )}
                                    <span style={{ color: '#333' }}>
                                        Applied: <strong>{app.job.title}</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Middle: Date + Status */}
                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                                    {new Date(app.created_at).toLocaleDateString()}
                                </div>
                                <StatusBadge status={app.status} size="small" />
                            </div>

                            {/* Right: Action */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {app.applicant?.resume_url && (
                                    <span
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            window.open(app.applicant?.resume_url || '', '_blank');
                                        }}
                                        style={{
                                            fontSize: '11px',
                                            padding: '4px 8px',
                                            background: '#f5f5f5',
                                            border: '1px solid #ddd',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            color: '#666'
                                        }}
                                    >
                                        📄 CV
                                    </span>
                                )}
                                <span style={{
                                    fontSize: '11px',
                                    background: 'var(--hunter-green)',
                                    padding: '4px 10px',
                                    borderRadius: '3px',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}>
                                    Review →
                                </span>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                        No applicants match your filters.
                    </div>
                )}
            </div>
        </div>
    );
}
