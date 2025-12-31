
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { SeekerDashboard } from '@/components/dashboard/SeekerDashboard';
import { HirerDashboard } from '@/components/dashboard/HirerDashboard';
import { getSavedJobs } from '@/app/actions/savedJobs';
import { getCompanyPlan, isPro } from '@/lib/subscription';

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
        const savedJobs = await getSavedJobs();

        // Seeker: Just fetch applications
        const { data: applications } = await supabase
            .from('applications')
            .select(`
                id,
                status,
                created_at,
                job:jobs (
                    id,
                    title,
                    status,
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

        return <SeekerDashboard profile={profile} applications={applications || []} savedJobs={savedJobs} />;
    }

    // Hirer: Fetch company first
    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    // Fetch Subscription Plan
    let planType = 'free';
    if (company) {
        try {
            planType = await getCompanyPlan(company.id);
        } catch (e) {
            console.error("Plan fetch error:", e);
        }
    }

    if (!company) {
        return <HirerDashboard company={null} jobs={[]} applications={[]} />;
    }

    // Fetch jobs for this company
    const { data: jobs } = await supabase
        .from('jobs')
        .select(`
            id, 
            title, 
            category_slug, 
            status,
            closes_at,
            closed_at,
            created_at,
            applications(id)
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

    const jobIds = (jobs || []).map(j => j.id);

    // Fetch applications using job IDs (reliable filtering)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let applications: any[] = [];
    const experienceMap: Record<string, unknown> = {};
    const educationMap: Record<string, unknown> = {};

    if (jobIds.length > 0) {
        const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select(`
                id,
                status,
                status_updated_at,
                created_at,
                job_id,
                applicant_id,
                applicant:profiles!applications_applicant_id_fkey (
                    id,
                    full_name,
                    headline,
                    location,
                    resume_url
                )
            `)
            .in('job_id', jobIds)
            .order('created_at', { ascending: false });

        if (appsError) {
            // Silent error handling - logged server-side
        }

        // Manually stitch job data (we already have it)
        applications = (appsData || []).map(app => {
            const job = (jobs || []).find(j => j.id === app.job_id);
            return {
                ...app,
                job: {
                    id: job?.id,
                    title: job?.title,
                    status: job?.status
                }
            };
        });

        // Fetch experience and education for all applicants
        const applicantIds = applications
            .map(app => app.applicant_id)
            .filter(Boolean);

        if (applicantIds.length > 0) {
            const [expResult, eduResult] = await Promise.all([
                supabase
                    .from('profile_experience')
                    .select('*')
                    .in('profile_id', applicantIds)
                    .order('start_date', { ascending: false }),
                supabase
                    .from('profile_education')
                    .select('*')
                    .in('profile_id', applicantIds)
                    .order('start_date', { ascending: false })
            ]);

            // Group by profile_id (take most recent)
            (expResult.data || []).forEach(exp => {
                if (!experienceMap[exp.profile_id]) {
                    experienceMap[exp.profile_id] = exp;
                }
            });
            (eduResult.data || []).forEach(edu => {
                if (!educationMap[edu.profile_id]) {
                    educationMap[edu.profile_id] = edu;
                }
            });
        }
    }

    // Enrich applications with experience/education
    const enrichedApplications = applications.map(app => ({
        ...app,
        recentExperience: experienceMap[app.applicant_id] || null,
        recentEducation: educationMap[app.applicant_id] || null
    }));

    return (
        <HirerDashboard
            company={company}
            jobs={jobs || []}
            applications={enrichedApplications}
            planType={planType}
        />
    );
}
