import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { VerificationQueue } from './VerificationQueue';
import styles from './Admin.module.css';

export default async function AdminDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Admin Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        redirect('/'); // Redirect non-admins to home
    }

    // Fetch Stats
    const [
        { count: totalUsers },
        { count: totalCompanies },
        { count: totalJobs },
        { count: totalApplications },
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
    ]);

    // Fetch Pending Verifications
    const { data: pendingCompanies } = await supabase
        .from('companies')
        .select('*')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

    const pendingCount = pendingCompanies?.length || 0;

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Admin Dashboard' }]} />

            <div className={styles.header}>
                <h1 className={styles.heading}>
                    Admin Dashboard
                    <span className={styles.adminBadge}>Moderator</span>
                </h1>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{totalUsers || 0}</span>
                    <span className={styles.statLabel}>Total Users</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{totalCompanies || 0}</span>
                    <span className={styles.statLabel}>Companies</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{totalJobs || 0}</span>
                    <span className={styles.statLabel}>Active Jobs</span>
                </div>
                <a href="/admin/healthcare" className={`${styles.statCard} ${styles.interactiveCard}`} style={{ textDecoration: 'none', border: '1px solid #166534' }}>
                    <span className={styles.statNumber} style={{ color: '#166534' }}>🏥</span>
                    <span className={styles.statLabel} style={{ color: '#166534', fontWeight: 600 }}>Healthcare Dashboard &rarr;</span>
                </a>
            </div>

            {/* Verification Queue */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>⏳ Pending Verifications</h3>
                    <span className={`${styles.sectionCount} ${pendingCount === 0 ? styles.sectionCountZero : ''}`}>
                        {pendingCount}
                    </span>
                </div>

                {pendingCompanies && pendingCompanies.length > 0 ? (
                    <VerificationQueue companies={pendingCompanies} />
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>✅</div>
                        <div className={styles.emptyTitle}>All caught up!</div>
                        <p className={styles.emptyText}>No companies waiting for verification.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
