
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { SeekerDashboard } from '@/components/dashboard/SeekerDashboard';
import { HirerDashboard } from '@/components/dashboard/HirerDashboard';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Profile Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

    const role = profile?.role ?? 'seeker';

    if (role === 'seeker') {
        const { data: applications } = await supabase
            .from('applications')
            .select(`
                id,
                status,
                created_at,
                job:jobs (
                    id,
                    title,
                    location,
                    salary_min,
                    salary_max,
                    company:companies (
                        name
                    )
                )
            `)
            .eq('applicant_id', user.id)
            .order('created_at', { ascending: false });

        return <SeekerDashboard profile={profile} applications={applications || []} />;
    }

    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    return <HirerDashboard company={company} />;
}

