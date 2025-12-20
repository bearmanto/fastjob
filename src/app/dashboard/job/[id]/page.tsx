import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ApplicantList } from '@/components/dashboard/ApplicantList';
import styles from '@/app/dashboard/Dashboard.module.css';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function JobHistoryPage({ params }: Props) {
    const { id: jobId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Job Details (Verify ownership)
    const { data: job } = await supabase
        .from('jobs')
        .select(`
            id,
            title,
            status,
            created_at,
            closes_at,
            closed_at,
            company_id,
            company:companies(owner_id)
        `)
        .eq('id', jobId)
        .single();

    if (!job) {
        return <div className={styles.dashboardContainer}>Job not found.</div>;
    }

    // Ownership Check
    const companyData = Array.isArray(job.company) ? job.company[0] : job.company;
    if (companyData?.owner_id !== user.id) {
        redirect('/dashboard');
    }

    // Fetch Applications for this job
    // We fetch ALL applications regardless of status
    const { data: applications } = await supabase
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
            ),
            job:jobs (
                id,
                title
            )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

    // Fetch experience and education manually to avoid Join errors
    const experienceMap: Record<string, unknown> = {};
    const educationMap: Record<string, unknown> = {};

    if (applications && applications.length > 0) {
        const applicantIds = applications.map((app: any) => app.applicant_id).filter(Boolean);

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

            (expResult.data || []).forEach((exp: any) => {
                if (!experienceMap[exp.profile_id]) experienceMap[exp.profile_id] = exp;
            });
            (eduResult.data || []).forEach((edu: any) => {
                if (!educationMap[edu.profile_id]) educationMap[edu.profile_id] = edu;
            });
        }
    }

    // Process applications to attach single recent experience/education
    const processedApplications = (applications || []).map((app: any) => ({
        ...app,
        recentExperience: experienceMap[app.applicant_id] || null,
        recentEducation: educationMap[app.applicant_id] || null
    }));

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: `Job: ${job.title}` }
            ]} />

            <div className={styles.jobHistoryHeader}>
                <h1 className={`${styles.heading} ${styles.jobHistoryTitle}`}>
                    {job.title}
                </h1>
                <div className={styles.jobHistoryMeta}>
                    <span className={`${styles.jobStatusTag} ${job.status === 'active' ? styles.active : styles.closed}`}>
                        {job.status.toUpperCase()}
                    </span>
                    <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                    {job.closed_at && (
                        <span>• Closed: {new Date(job.closed_at).toLocaleDateString()}</span>
                    )}
                </div>
            </div>

            <div className={styles.applicantPanel}>
                <div className={styles.applicantPanelHeader}>
                    Applicant History
                </div>
                <ApplicantList applications={processedApplications} />
            </div>
        </div>
    );
}
