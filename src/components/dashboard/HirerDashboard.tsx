'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JobStatusBadge } from '@/components/ui/StatusBadge';
import styles from '@/app/dashboard/Dashboard.module.css';
import tableStyles from '@/app/category/[slug]/Category.module.css';
import { Company } from '@/types';

import { VerificationForm } from './VerificationForm';
import { ApplicantList } from './ApplicantList';
import { JobActions } from './JobActions';

interface Props {
    company: Company | null;
    jobs?: any[];
    applications?: any[];
}

export function HirerDashboard({ company, jobs = [], applications = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');

    const isVerified = company?.verification_status === 'verified';
    const isPending = company?.verification_status === 'pending';
    const isUnverified = !company?.verification_status || company?.verification_status === 'unverified' || company?.verification_status === 'rejected';

    // Filter jobs based on Active Tab
    const filteredJobs = jobs.filter(job => {
        if (activeTab === 'active') return job.status === 'active';
        if (activeTab === 'closed') return job.status === 'closed';
        return false;
    });

    // Filter applications: Only show applications for ACTIVE jobs in the recent list
    const activeJobIds = new Set(jobs.filter(j => j.status === 'active').map(j => j.id));
    const recentApplications = applications.filter(app => activeJobIds.has(app.job?.id));

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className={styles.heading} style={{ marginBottom: 0 }}>
                    My Dashboard (Hirer)
                </h1>
                {/* Status Badge */}
                <div style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    background: isVerified ? '#e6f4ea' : isPending ? '#fff8e1' : '#fce8e6',
                    color: isVerified ? 'green' : isPending ? '#f57f17' : '#c62828',
                    border: '1px solid currentColor'
                }}>
                    Status: {company?.verification_status?.toUpperCase() || 'UNVERIFIED'}
                </div>
            </div>

            {/* Verification Warning / Form */}
            {isUnverified && (
                <div style={{ marginBottom: '40px', border: '1px solid #c62828', padding: '20px', borderRadius: '4px', background: '#fff' }}>
                    <h3 style={{ color: '#c62828', marginTop: 0 }}>Action Required: Verify Your Company</h3>
                    <p style={{ fontSize: '13px', marginBottom: '16px' }}>
                        You cannot post jobs until your company is verified. Please submit your business documents below.
                    </p>
                    <VerificationForm companyId={company?.id || ''} />
                </div>
            )}

            {isPending && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '4px' }}>
                    <h3 style={{ marginTop: 0, color: '#f57f17' }}>Verification Pending</h3>
                    <p style={{ fontSize: '13px', margin: 0 }}>
                        We are currently reviewing your documents. This process usually takes 24-48 hours. You will be able to post jobs once approved.
                    </p>
                </div>
            )}

            {/* Company Profile Section */}
            {company && (
                <div style={{
                    marginBottom: '40px',
                    padding: '24px',
                    border: '1px solid #ddd',
                    background: '#f9f9f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--hunter-green)' }}>{company.name}</h2>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                            {company.location || 'Location not set'} • {company.industry || 'Industry not set'}
                        </div>
                    </div>
                    <Link href="/company/profile" style={{
                        textDecoration: 'none',
                        background: '#fff',
                        border: '1px solid #ccc',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#333'
                    }}>
                        Edit Profile
                    </Link>
                </div>
            )}

            {/* Jobs Panel */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f5f5f5',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px 4px 0 0'
                }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <button
                            onClick={() => setActiveTab('active')}
                            style={{
                                margin: 0,
                                fontSize: '15px',
                                fontWeight: 'bold',
                                color: activeTab === 'active' ? '#333' : '#999',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                textDecoration: activeTab === 'active' ? 'underline' : 'none',
                                textUnderlineOffset: '4px'
                            }}>
                            Active Jobs
                        </button>
                        <button
                            onClick={() => setActiveTab('closed')}
                            style={{
                                margin: 0,
                                fontSize: '15px',
                                fontWeight: 'bold',
                                color: activeTab === 'closed' ? '#333' : '#999',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                textDecoration: activeTab === 'closed' ? 'underline' : 'none',
                                textUnderlineOffset: '4px'
                            }}>
                            Archived Jobs
                        </button>
                    </div>

                    {activeTab === 'active' && (
                        <Link href="/post-job" style={{
                            textDecoration: 'none',
                            fontSize: '12px',
                            background: '#005f4b',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontWeight: 600
                        }}>
                            + Post New Job
                        </Link>
                    )}
                </div>

                <div className={styles.tableContainer} style={{
                    marginTop: 0,
                    marginBottom: 0,
                    border: '1px solid #e0e0e0',
                    borderTop: 'none',
                    borderRadius: '0 0 4px 4px'
                }}>
                    <table className={tableStyles.jobTable} style={{ margin: 0 }}>
                        <tbody style={{ display: 'table-row-group' }}>
                            <tr style={{ borderTop: 'none', background: '#fafafa', fontSize: '12px', fontWeight: 'bold', color: '#666', borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>Job Title</td>
                                <td style={{ padding: '12px' }}>Category</td>
                                <td style={{ padding: '12px' }}>Applications</td>
                                <td style={{ padding: '12px' }}>Status</td>
                                <td style={{ padding: '12px' }}>Action</td>
                            </tr>
                            {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                                <tr key={job.id}>
                                    <td className={tableStyles.jobTitle}>
                                        <Link href={`/job/${job.id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>
                                            {job.title}
                                        </Link>
                                    </td>
                                    <td style={{ textTransform: 'capitalize' }}>
                                        {job.category_slug ? job.category_slug.replace('-', ' ') : 'N/A'}
                                    </td>
                                    <td>{job.applications ? job.applications.length : 0}</td>
                                    <td>
                                        <JobStatusBadge status={job.status} />
                                    </td>
                                    <td>
                                        {activeTab === 'active' ? (
                                            <JobActions jobId={job.id} jobStatus={job.status} />
                                        ) : (
                                            <Link href={`/dashboard/job/${job.id}`} style={{
                                                fontSize: '11px',
                                                background: '#f5f5f5',
                                                padding: '4px 8px',
                                                borderRadius: '3px',
                                                textDecoration: 'none',
                                                color: '#333',
                                                border: '1px solid #ddd',
                                                fontWeight: 'bold'
                                            }}>
                                                View History
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#666', fontSize: '13px' }}>
                                        {activeTab === 'active'
                                            ? 'No active jobs found. Click "Post New Job" to create one.'
                                            : 'No archived jobs found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Applications Panel */}
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f5f5f5',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px 4px 0 0'
                }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#333' }}>
                        Recent Applications (Active Jobs)
                    </h3>
                </div>
                <div className={styles.tableContainer} style={{
                    marginTop: 0,
                    marginBottom: 0,
                    border: '1px solid #e0e0e0',
                    borderTop: 'none',
                    borderRadius: '0 0 4px 4px'
                }}>
                    <ApplicantList applications={recentApplications} jobs={jobs} />
                </div>
            </div>
        </div>
    );
}
