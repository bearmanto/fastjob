import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import styles from '@/app/dashboard/Dashboard.module.css';

interface Props {
    profile: any;
    applications: any[];
}

export function SeekerDashboard({ profile, applications }: Props) {
    // If full_name is missing, fallback to 'Job Seeker' (or we could pass email properly)
    // Note: profile might not have email if we didn't select it, but we can assume user context
    const name = profile?.full_name || 'Job Seeker';

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className={styles.heading}>Job Seeker Dashboard</h1>
                <Link href="/profile" className={styles.browseButton} style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Edit My Profile
                </Link>
            </div>

            <div className={styles.welcomeSection}>
                <h2 style={{ marginTop: 0 }}>Welcome, {name}</h2>
                <p>Track your applications and explore new opportunities.</p>

                <div style={{ marginTop: '24px' }}>
                    <h3 className={styles.sectionTitle}>My Applications</h3>

                    {applications && applications.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '8px 0' }}>Job Title</th>
                                    <th style={{ padding: '8px 0' }}>Company</th>
                                    <th style={{ padding: '8px 0' }}>Date Applied</th>
                                    <th style={{ padding: '8px 0' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px 0', fontWeight: 'bold' }}>
                                            <Link href={`/job/${app.job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                {app.job.title}
                                            </Link>
                                        </td>
                                        <td style={{ padding: '12px 0' }}>{app.job.company.name}</td>
                                        <td style={{ padding: '12px 0' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px 0' }}>
                                            <StatusBadge status={app.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ fontStyle: 'italic', color: '#666' }}>You haven't applied to any jobs yet.</p>
                    )}
                </div>

                <div style={{ marginTop: '24px' }}>
                    <Link href="/" className={styles.browseButton}>
                        BROWSE OPEN JOBS
                    </Link>
                </div>
            </div>
        </div>
    );
}
