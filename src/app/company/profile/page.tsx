import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CompanyProfileForm } from '@/components/dashboard/CompanyProfileForm';
import styles from '@/app/dashboard/Dashboard.module.css';

export default async function CompanyProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'hirer') {
        redirect('/dashboard');
    }

    // Fetch Company Data
    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Company Profile' }
            ]} />

            <h1 className={styles.heading}>
                My Company Profile
            </h1>

            {company && (
                <CompanyProfileForm company={company} />
            )}
        </div>
    );
}
