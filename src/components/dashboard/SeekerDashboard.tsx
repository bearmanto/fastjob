import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import styles from '@/app/dashboard/Dashboard.module.css';

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

export function SeekerDashboard({ profile, applications, savedJobs = [] }: Props) {
    const name = profile?.full_name || 'Job Seeker';

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />

            <div className={styles.seekerHeader}>
                <h1 className={styles.heading}>Job Seeker Dashboard</h1>
                <Link href="/profile" className={`${styles.browseButton} ${styles.editProfileButton}`}>
                    Edit My Profile
                </Link>
            </div>

            <div className={styles.welcomeSection}>
                <h2 className={styles.welcomeTitle}>Welcome, {name}</h2>
                <p>Track your applications and explore new opportunities.</p>

                <div className={styles.applicationSection}>
                    <h3 className={styles.sectionTitle}>My Applications</h3>

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
                                        <td className={styles.jobTitle}>
                                            <Link href={`/job/${app.job.id}`} className={styles.jobLink}>
                                                {app.job.title}
                                            </Link>
                                        </td>
                                        <td>{app.job.company.name}</td>
                                        <td>{new Date(app.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <StatusBadge status={app.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyApplications}>You haven&apos;t applied to any jobs yet.</p>
                    )}
                </div>

                {/* Saved Jobs Section */}
                <div className={styles.applicationSection}>
                    <h3 className={styles.sectionTitle}>Saved Jobs</h3>

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
                                        <td className={styles.jobTitle}>
                                            <Link href={`/job/${item.job.id}`} className={styles.jobLink}>
                                                {item.job.title}
                                            </Link>
                                            {item.job.status === 'closed' && (
                                                <span className={styles.closedBadge} style={{ marginLeft: '8px', fontSize: '10px', background: '#ccc', color: '#666', padding: '2px 4px', borderRadius: '2px' }}>CLOSED</span>
                                            )}
                                        </td>
                                        <td>{item.job.company.name}</td>
                                        <td>{item.job.location}</td>
                                        <td style={{ fontSize: '12px' }}>
                                            {item.job.salary_min ? `IDR ${item.job.salary_min.toLocaleString()}` : 'Confidential'}
                                        </td>
                                        <td>
                                            <Link href={`/job/${item.job.id}`} style={{ fontSize: '12px', textDecoration: 'underline', color: '#005f4b' }}>
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyApplications}>No saved jobs yet.</p>
                    )}
                </div>

                <div className={styles.browseSection}>
                    <Link href="/" className={styles.browseButton}>
                        BROWSE OPEN JOBS
                    </Link>
                </div>
            </div>
        </div>
    );
}
