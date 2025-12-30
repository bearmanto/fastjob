'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JobStatusBadge } from '@/components/ui/StatusBadge';
import styles from '@/app/dashboard/Dashboard.module.css';
import tableStyles from '@/components/ui/Table.module.css';
import { Company } from '@/types';

import { VerificationForm } from './VerificationForm';
import { ApplicantList } from './ApplicantList';
import { JobActions } from './JobActions';

// TODO: Define proper types for jobs and applications when API types are stabilized
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Job = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApplicationData = any;

interface Props {
    company: Company | null;
    jobs?: Job[];
    applications?: ApplicationData[];
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

    // Filter applications: Only show applications for ACTIVE jobs in the recent list (limit 10)
    const activeJobIds = new Set(jobs.filter(j => j.status === 'active').map(j => j.id));
    const recentApplications = applications
        .filter(app => activeJobIds.has(app.job?.id))
        .slice(0, 10);

    // Get status badge class
    const getStatusClass = () => {
        if (isVerified) return `${styles.statusBadge} ${styles.verified}`;
        if (isPending) return `${styles.statusBadge} ${styles.pending}`;
        return `${styles.statusBadge} ${styles.unverified}`;
    };

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />

            <div className={styles.headerRow}>
                <h1 className={`${styles.heading} ${styles.headingNoMargin}`}>
                    My Dashboard (Hirer)
                </h1>
                <div className={getStatusClass()}>
                    Status: {company?.verification_status?.toUpperCase() || 'UNVERIFIED'}
                </div>
            </div>

            {/* Verification Warning / Form */}
            {isUnverified && (
                <div className={`${styles.alertBox} ${styles.error}`}>
                    <h3 className={`${styles.alertTitle} ${styles.error}`}>Action Required: Verify Your Company</h3>
                    <p className={styles.alertText}>
                        You cannot post jobs until your company is verified. Please submit your business documents below.
                    </p>
                    <VerificationForm companyId={company?.id || ''} />
                </div>
            )}

            {isPending && (
                <div className={`${styles.alertBox} ${styles.warning}`}>
                    <h3 className={`${styles.alertTitle} ${styles.warning}`}>Verification Pending</h3>
                    <p className={styles.alertText}>
                        We are currently reviewing your documents. This process usually takes 24-48 hours. You will be able to post jobs once approved.
                    </p>
                </div>
            )}

            {/* Company Profile Section */}
            {company && (
                <div className={styles.companyCard}>
                    <div>
                        <h2 className={styles.companyName}>{company.name}</h2>
                        <div className={styles.companyMeta}>
                            {company.location || 'Location not set'} • {company.industry || 'Industry not set'}
                        </div>
                    </div>
                    <div className={styles.companyActions}>
                        <Link href="/dashboard/analytics" className={styles.teamButton}>
                            📊 Analytics
                        </Link>
                        <Link href="/dashboard/team" className={styles.teamButton}>
                            👥 Team
                        </Link>
                        <Link href="/dashboard/billing" className={styles.teamButton}>
                            💳 Billing
                        </Link>
                        <Link href="/company/profile" className={styles.editButton}>
                            Edit Profile
                        </Link>
                    </div>
                </div>
            )}

            {/* Jobs Panel */}
            <div className={styles.panelSection}>
                <div className={styles.panelHeader}>
                    <div className={styles.tabGroup}>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`${styles.tabButton} ${activeTab === 'active' ? styles.active : styles.inactive}`}
                        >
                            Active Jobs
                        </button>
                        <button
                            onClick={() => setActiveTab('closed')}
                            className={`${styles.tabButton} ${activeTab === 'closed' ? styles.active : styles.inactive}`}
                        >
                            Archived Jobs
                        </button>
                    </div>

                    {activeTab === 'active' && (
                        <Link href="/post-job" className={styles.postButton}>
                            + Post New Job
                        </Link>
                    )}
                </div>

                <div className={`${styles.tableContainer} ${styles.tablePanel}`}>
                    <table className={tableStyles.jobTable}>
                        <tbody>
                            <tr className={styles.tableHeaderRow}>
                                <td>Job Title</td>
                                <td>Category</td>
                                <td>Applications</td>
                                <td>Status</td>
                                <td>Action</td>
                            </tr>
                            {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                                <tr key={job.id}>
                                    <td className={tableStyles.jobTitle}>
                                        <Link href={`/job/${job.id}`} className={styles.tableLink}>
                                            {job.title}
                                        </Link>
                                    </td>
                                    <td className={styles.categoryCell}>
                                        {job.category_slug ? job.category_slug.replace('-', ' ') : 'N/A'}
                                    </td>
                                    <td className={styles.applicationsCell}>
                                        {job.applications ? job.applications.length : 0}
                                    </td>
                                    <td className={styles.statusCell}>
                                        <JobStatusBadge status={job.status} />
                                    </td>
                                    <td className={styles.actionCell}>
                                        {activeTab === 'active' ? (
                                            <JobActions jobId={job.id} jobStatus={job.status} />
                                        ) : (
                                            <Link href={`/dashboard/job/${job.id}`} className={styles.historyButton}>
                                                View History
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>
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
                <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>
                        Recent Applications (Active Jobs)
                    </h3>
                </div>
                <div className={`${styles.tableContainer} ${styles.tablePanel}`}>
                    <ApplicantList applications={recentApplications} jobs={jobs} />
                </div>
            </div>
        </div>
    );
}
