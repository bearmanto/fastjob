import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

import { ApplicantActions } from './ApplicantActions';
import { ViewTracker } from './ViewTracker';
import styles from './Applicant.module.css';

interface PageProps {
    params: Promise<{ applicationId: string }>;
}

// Helper to mask email
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const masked = local[0] + '***';
    return `${masked}@${domain}`;
}

export default async function ApplicantProfilePage({ params }: PageProps) {
    const { applicationId } = await params;
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 2. Fetch application with all related data
    const { data: application, error } = await supabase
        .from('applications')
        .select(`
            id,
            status,
            status_updated_at,
            created_at,
            applicant_id,
            job:jobs!inner (
                id,
                title,
                company:companies!inner (
                    id,
                    name,
                    owner_id
                )
            ),
            applicant:profiles!applications_applicant_id_fkey (
                id,
                full_name,
                email,
                headline,
                summary,
                location,
                resume_url
            )
        `)
        .eq('id', applicationId)
        .single();

    if (error || !application) {
        notFound();
    }

    // Cast nested relations (Supabase returns single objects for !inner joins but types as arrays)
    const job = application.job as unknown as { id: string; title: string; company: { id: string; name: string; owner_id: string } };
    const applicant = application.applicant as unknown as { id: string; full_name: string | null; email: string; headline: string | null; summary: string | null; location: string | null; resume_url: string | null } | null;

    // Get applicant ID for experience/education queries
    const applicantId = application.applicant_id;

    // 3. Verify hirer owns this job
    if (job?.company?.owner_id !== user.id) {
        redirect('/dashboard');
    }

    // 4. Auto-mark as viewed


    // 5. Fetch experience and education using applicantId directly (more reliable)
    const [expResult, eduResult] = await Promise.all([
        supabase
            .from('profile_experience')
            .select('*')
            .eq('profile_id', applicantId)
            .order('start_date', { ascending: false }),
        supabase
            .from('profile_education')
            .select('*')
            .eq('profile_id', applicantId)
            .order('start_date', { ascending: false })
    ]);

    const experiences = expResult.data;
    const education = eduResult.data;

    // 6. Fetch interview if scheduled
    const { data: interview } = await supabase
        .from('interviews')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.name}>{applicant?.full_name || 'Anonymous Candidate'}</h1>
                    <p className={styles.headline}>{applicant?.headline || 'Job Seeker'}</p>
                    <p className={styles.email}>
                        {applicant?.email ? maskEmail(applicant.email) : 'Email hidden'}
                        {applicant?.location && <> • 📍 {applicant.location}</>}
                    </p>
                </div>
                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Applied for:</span>
                        <span className={styles.metaValue}>{job?.title}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Applied:</span>
                        <span className={styles.metaValue}>{new Date(application.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <ApplicantActions
                applicationId={applicationId}
                currentStatus={application.status}
                resumeUrl={applicant?.resume_url}
                interview={interview}
            // Pass auto-mark flag if needed, or handle in component
            />
            {/* Auto-mark viewed component */}
            <ViewTracker applicationId={applicationId} status={application.status} />

            {/* Summary */}
            {applicant?.summary && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Summary</h2>
                    <p className={styles.summaryText}>{applicant.summary}</p>
                </section>
            )}

            {/* Experience */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Work Experience</h2>
                {experiences && experiences.length > 0 ? (
                    <div className={styles.timeline}>
                        {experiences.map((exp: any) => (
                            <div key={exp.id} className={styles.timelineItem}>
                                <div className={styles.timelineHeader}>
                                    <strong>{exp.title}</strong> at {exp.company}
                                </div>
                                <div className={styles.timelineDate}>
                                    {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    {' — '}
                                    {exp.end_date
                                        ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                        : 'Present'
                                    }
                                </div>
                                {exp.description && <p className={styles.timelineDesc}>{exp.description}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyState}>No work experience listed.</p>
                )}
            </section>

            {/* Education */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Education</h2>
                {education && education.length > 0 ? (
                    <div className={styles.timeline}>
                        {education.map((edu: any) => (
                            <div key={edu.id} className={styles.timelineItem}>
                                <div className={styles.timelineHeader}>
                                    <strong>{edu.degree}</strong> — {edu.school}
                                </div>
                                <div className={styles.timelineDate}>
                                    {edu.field_of_study && <span>{edu.field_of_study} • </span>}
                                    {new Date(edu.start_date).getFullYear()}
                                    {edu.end_date && ` — ${new Date(edu.end_date).getFullYear()}`}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyState}>No education listed.</p>
                )}
            </section>
        </div>
    );
}
