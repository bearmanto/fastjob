import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { VerificationQueue } from './VerificationQueue';
import styles from '@/app/dashboard/Dashboard.module.css';

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

    // Fetch Pending Verifications
    const { data: pendingCompanies } = await supabase
        .from('companies')
        .select('*')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Admin Dashboard' }]} />

            <h1 className={styles.heading} style={{ color: '#d32f2f' }}>
                Admin Dashboard (Moderator)
            </h1>

            <div style={{ marginBottom: '40px' }}>
                <h3 className={styles.subHeading}>
                    Pending Verifications ({pendingCompanies?.length || 0})
                </h3>

                {pendingCompanies && pendingCompanies.length > 0 ? (
                    <VerificationQueue companies={pendingCompanies} />
                ) : (
                    <div style={{ padding: '20px', background: '#f5f5f5', color: '#666', fontStyle: 'italic' }}>
                        No pending verifications. Good job!
                    </div>
                )}
            </div>
        </div>
    );
}
