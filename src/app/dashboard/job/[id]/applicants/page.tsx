import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ApplicantManager } from './ApplicantManager';
import { requirePro } from '@/lib/subscription';
import styles from './Applicants.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ApplicantsPage({ params }: PageProps) {
    const { id: jobId } = await params;
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.log('ApplicantsPage: No user logged in');
        redirect('/login');
    }

    console.log('ApplicantsPage: Fetching job', jobId, 'for user', user.id);

    // Fetch job with company verification
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select(`
            id,
            title,
            status,
            company_id,
            company:companies(id, owner_id, name)
        `)
        .eq('id', jobId)
        .single();

    if (jobError || !job) {
        console.error('ApplicantsPage: Job fetch failed', jobError);
        notFound();
    }

    // Verify ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const companyData = job.company as any;
    const company = Array.isArray(companyData) ? companyData[0] : companyData;

    const ownerId = company?.owner_id;

    console.log('ApplicantsPage: Job Owner ID:', ownerId, 'Current User:', user.id);

    if (!company || ownerId !== user.id) {
        console.log('ApplicantsPage: Ownership check failed');
        notFound();
    }

    // Check subscription status
    const isPro = await requirePro(company.id);

    // Fetch all applicants for this job
    const { data: applications } = await supabase
        .from('applications')
        .select(`
            id,
            status,
            created_at,
            cover_note,
            applicant_id,
            applicant:profiles!applications_applicant_id_fkey (
                id,
                full_name,
                headline,
                email,
                phone,
                linkedin,
                skills,
                summary,
                resume_url,
                country_code
            )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

    // Fetch experience and education for all applicants
    const applicantIds = (applications || []).map(a => a.applicant_id).filter(Boolean);

    let experienceMap: Record<string, unknown> = {};
    let educationMap: Record<string, unknown> = {};

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

    // Enrich applications
    const enrichedApplications = (applications || []).map(app => ({
        ...app,
        recentExperience: experienceMap[app.applicant_id] || null,
        recentEducation: educationMap[app.applicant_id] || null
    }));

    return (
        <div className={styles.container}>
            <Breadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: job.title }
            ]} />

            <div className={styles.header}>
                <h1 className={styles.title}>{job.title}</h1>
                <span className={styles.count}>{enrichedApplications.length} applicants</span>
            </div>

            <ApplicantManager
                jobId={jobId}
                applications={enrichedApplications}
                isPro={isPro}
            />
        </div>
    );
}
