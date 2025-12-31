import { getComplianceStats, getPendingCertifications } from '@/lib/healthcare/admin-actions';
import { CertificationVerificationRow } from '@/components/admin/CertificationVerificationRow';
import styles from '@/components/admin/AdminHealthcare.module.css';

export const revalidate = 0; // Dynamic

export default async function AdminHealthcarePage() {
    // Fetch data in parallel
    const [stats, pendingCerts] = await Promise.all([
        getComplianceStats(),
        getPendingCertifications()
    ]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Healthcare Compliance Dashboard</h1>
                <p className={styles.subtitle}>
                    Monitor verification status and process pending healthcare credentials.
                </p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.total}</div>
                    <div className={styles.statLabel}>Total Credentials</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: '#d97706' }}>
                        {stats.pending}
                    </div>
                    <div className={styles.statLabel}>Pending Verification</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: '#166534' }}>
                        {stats.verified}
                    </div>
                    <div className={styles.statLabel}>Verified</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {(stats.pending > 0 ? (stats.verified / stats.total * 100).toFixed(1) : 100)}%
                    </div>
                    <div className={styles.statLabel}>Compliance Rate</div>
                </div>
            </div>

            <section className={styles.pendingSection}>
                <div className={styles.tableHeader}>
                    <h2 className={styles.tableTitle}>Pending Request Review</h2>
                    {/* Add filters here later if needed */}
                </div>

                {pendingCerts.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Credential</th>
                                <th>Details</th>
                                <th>Proof</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCerts.map((cert) => (
                                <CertificationVerificationRow key={cert.id} cert={cert} />
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No pending certifications to review. All caught up! 🎉</p>
                    </div>
                )}
            </section>
        </div>
    );
}
