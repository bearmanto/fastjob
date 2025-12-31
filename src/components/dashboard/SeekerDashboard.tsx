import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import styles from './SeekerDashboard.module.css';

// TODO: Define proper types when API types are stabilized
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Profile = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Application = any;

interface Props {
    profile: Profile | null;
    applications: Application[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    savedJobs?: any[]; // TODO: Define proper type
}

function getStatusClassName(status: string): string {
    const statusMap: Record<string, string> = {
        pending: styles.statusPending,
        applied: styles.statusApplied,
        reviewing: styles.statusReviewing,
        shortlisted: styles.statusShortlisted,
        rejected: styles.statusRejected,
        hired: styles.statusHired,
    };
    return statusMap[status?.toLowerCase()] || styles.statusApplied;
}

export function SeekerDashboard({ profile, applications, savedJobs = [] }: Props) {
    const name = profile?.full_name || 'Job Seeker';

    // Calculate stats
    const totalApplications = applications?.length || 0;
    const shortlisted = applications?.filter(a => a.status?.toLowerCase() === 'shortlisted').length || 0;
    const savedCount = savedJobs?.length || 0;

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />

            <div className={styles.headerRow}>
                <h1 className={styles.heading}>My Dashboard</h1>
                <Link href="/profile" className={styles.editProfileButton}>
                    ✏️ Edit Profile
                </Link>
            </div>

            {/* Welcome Card */}
            <div className={styles.welcomeCard}>
                <h2 className={styles.welcomeTitle}>Welcome back, {name}!</h2>
                <p className={styles.welcomeSubtitle}>Track your applications and discover new opportunities.</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{totalApplications}</span>
                    <span className={styles.statLabel}>Applications</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{shortlisted}</span>
                    <span className={styles.statLabel}>Shortlisted</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{savedCount}</span>
                    <span className={styles.statLabel}>Saved Jobs</span>
                </div>
            </div>

            {/* My Applications Section */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>My Applications</h3>
                    <span className={styles.sectionCount}>{totalApplications}</span>
                </div>

                {applications && applications.length > 0 ? (
                    <table className={styles.applicationsTable}>
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Date Applied</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id}>
                                    <td>
                                        <Link href={`/job/${app.job.id}`} className={styles.jobLink}>
                                            {app.job.title}
                                        </Link>
                                    </td>
                                    <td>{app.job.company.name}</td>
                                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${getStatusClassName(app.status)}`}>
                                            {app.status?.toUpperCase() || 'APPLIED'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📄</div>
                        <div className={styles.emptyTitle}>No applications yet</div>
                        <p className={styles.emptyText}>Start applying to jobs to track your progress here.</p>
                        <Link href="/" className={styles.emptyButton}>
                            Browse Jobs
                        </Link>
                    </div>
                )}
            </div>

            {/* Saved Jobs Section */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Saved Jobs</h3>
                    <span className={styles.sectionCount}>{savedCount}</span>
                </div>

                {savedJobs && savedJobs.length > 0 ? (
                    <table className={styles.applicationsTable}>
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Location</th>
                                <th>Salary</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedJobs.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <Link href={`/job/${item.job.id}`} className={styles.jobLink}>
                                            {item.job.title}
                                        </Link>
                                        {item.job.status === 'closed' && (
                                            <span className={styles.closedBadge}>CLOSED</span>
                                        )}
                                    </td>
                                    <td>{item.job.company.name}</td>
                                    <td>{item.job.location}</td>
                                    <td>
                                        {item.job.salary_min
                                            ? `IDR ${item.job.salary_min.toLocaleString()}`
                                            : 'Confidential'}
                                    </td>
                                    <td>
                                        <Link href={`/job/${item.job.id}`} className={styles.viewLink}>
                                            View →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>💼</div>
                        <div className={styles.emptyTitle}>No saved jobs</div>
                        <p className={styles.emptyText}>Save jobs you&apos;re interested in for easy access later.</p>
                    </div>
                )}
            </div>

            {/* Browse Section */}
            <div className={styles.browseSection}>
                <Link href="/" className={styles.browseButton}>
                    🔍 Browse Open Jobs
                </Link>
            </div>
        </div>
    );
}
