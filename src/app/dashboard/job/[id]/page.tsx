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
    const { data: applications, error: appsError } = await supabase
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

    if (!applications || applications.length === 0) {
        console.log(`[JobHistory] No applications found for job ${jobId}`);
        // Double check raw count without joins to verify if it's RLS or Join issue
        const { count } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', jobId);
        console.log(`[JobHistory] Raw count check: ${count}`);
    } else {
        console.log(`[JobHistory] Found ${applications.length} applications.`);
    }

    // Fetch experience and education manually to avoid Join errors
    let experienceMap: Record<string, any> = {};
    let educationMap: Record<string, any> = {};

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

            <div style={{ marginBottom: '24px' }}>
                <h1 className={styles.heading} style={{ marginBottom: '8px' }}>
                    {job.title}
                </h1>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#666' }}>
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: job.status === 'active' ? '#e6f4ea' : '#f5f5f5',
                        color: job.status === 'active' ? 'green' : '#666',
                        border: '1px solid currentColor',
                        fontWeight: 'bold'
                    }}>
                        {job.status.toUpperCase()}
                    </span>
                    <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                    {job.closed_at && (
                        <span>• Closed: {new Date(job.closed_at).toLocaleDateString()}</span>
                    )}
                </div>
            </div>

            <div style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '4px'
            }}>
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e0e0e0',
                    background: '#f5f5f5',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: '#333'
                }}>
                    Applicant History
                </div>
                <ApplicantList applications={processedApplications} />
            </div>
        </div>
    );
}
