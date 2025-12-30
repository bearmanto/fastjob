import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BillingClient } from './BillingClient';
import styles from '@/app/dashboard/Dashboard.module.css';
import { getSubscription, getCreditBalance } from '@/lib/subscription';

export default async function BillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get company
    const { data: company } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

    if (!company) {
        redirect('/dashboard');
    }

    // Get subscription and credits using helper (with RPC fallback)
    const subscription = await getSubscription(company.id);
    const credits = await getCreditBalance(company.id);

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Billing' }
            ]} />

            <h1 className={styles.heading}>Billing & Subscription</h1>

            <BillingClient
                subscription={subscription}
                credits={credits}
                companyName={company.name}
            />
        </div>
    );
}
