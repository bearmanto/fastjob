import { notFound } from 'next/navigation';
import { JOBS } from '@/data/mockData';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import styles from './Job.module.css';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { ApplyButton } from './ApplyButton';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function JobPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // PARALLELIZE: Fetch user and job at the same time
    const [userResult, jobResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase
            .from('jobs')
            .select(`
                *,
                company:companies(name, location)
            `)
            .eq('id', id)
            .single()
    ]);

    const user = userResult.data?.user;
    const jobRaw = jobResult.data;

    // Fallback to Mock
    const mockJob = JOBS.find((j) => j.id === id);

    if (!jobRaw && !mockJob) {
        notFound();
    }

    // Normalize Data
    const job = jobRaw ? {
        id: jobRaw.id,
        title: jobRaw.title,
        company: jobRaw.company?.name || 'Unknown Company',
        location: jobRaw.location,
        categorySlug: jobRaw.category_slug,
        salary: (jobRaw.salary_min && jobRaw.salary_max)
            ? `IDR ${jobRaw.salary_min.toLocaleString()} - ${jobRaw.salary_max.toLocaleString()}`
            : 'Salary confidential',
        jobType: jobRaw.job_type ? jobRaw.job_type.replace('_', ' ').toUpperCase() : 'FULL TIME',
        workplaceType: jobRaw.workplace_type ? jobRaw.workplace_type.replace('_', ' ').toUpperCase() : 'ON-SITE',
        postedAt: new Date(jobRaw.created_at).toLocaleDateString(),
        skills: jobRaw.skills || [],
        benefits: jobRaw.benefits || [],
        description: jobRaw.description,
        requirements: jobRaw.requirements,
        descriptionSnippet: jobRaw.description_snippet
    } : {
        ...mockJob!,
        jobType: mockJob!.jobType || 'Full Time',
        workplaceType: mockJob!.workplaceType || 'On-site',
        description: null,
        requirements: null
    };

    // Check Application Status - PARALLELIZE these too
    let isSeeker = false;
    let hasApplied = false;
    let resumeUrl: string | null = null;

    if (user) {
        // Fetch profile and application status in parallel
        const [profileResult, applicationResult] = await Promise.all([
            supabase.from('profiles').select('role, resume_url').eq('id', user.id).single(),
            jobRaw
                ? supabase.from('applications').select('id').eq('job_id', id).eq('applicant_id', user.id).single()
                : Promise.resolve({ data: null })
        ]);

        isSeeker = profileResult.data?.role === 'seeker';
        resumeUrl = profileResult.data?.resume_url || null;
        hasApplied = !!applicationResult.data;
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainColumn}>
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Category', href: `/category/${job.categorySlug}` },
                        { label: job.title }
                    ]}
                />

                <h1 className={styles.title}>{job.title}</h1>
                <div className={styles.company}>{job.company} — {job.location}</div>

                <h3 className={styles.sectionHeader}>Job Specifications</h3>
                <table className={styles.specTable}>
                    <tbody>
                        <tr>
                            <td className={styles.specLabel}>Position ID</td>
                            <td>#{job.id.substring(0, 8)}...</td>
                        </tr>
                        <tr>
                            <td className={styles.specLabel}>Location</td>
                            <td>{job.location} <span style={{ color: '#666' }}>({job.workplaceType})</span></td>
                        </tr>
                        <tr>
                            <td className={styles.specLabel}>Salary</td>
                            <td>{job.salary}</td>
                        </tr>
                        <tr>
                            <td className={styles.specLabel}>Job Type</td>
                            <td>{job.jobType}</td>
                        </tr>
                        <tr>
                            <td className={styles.specLabel}>Posted</td>
                            <td>{job.postedAt}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Skills & Benefits */}
                <div style={{ margin: '24px 0' }}>
                    <h3 className={styles.sectionHeader} style={{ marginBottom: '12px' }}>Required Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                        {job.skills && job.skills.length > 0 ? job.skills.map((s: string) => (
                            <span key={s} style={{
                                background: '#f5f5f5',
                                padding: '6px 10px',
                                fontSize: '12px',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0',
                                color: '#333',
                                fontWeight: 500
                            }}>
                                {s}
                            </span>
                        )) : <span style={{ fontSize: '13px', color: '#999' }}>No specific skills listed.</span>}
                    </div>

                    <h3 className={styles.sectionHeader} style={{ marginBottom: '12px' }}>Benefits</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {job.benefits && job.benefits.length > 0 ? job.benefits.map((b: string) => (
                            <span key={b} style={{
                                background: '#e8f5e9',
                                padding: '6px 10px',
                                fontSize: '12px',
                                borderRadius: '4px',
                                border: '1px solid #c8e6c9',
                                color: '#2e7d32',
                                fontWeight: 500
                            }}>
                                {b}
                            </span>
                        )) : <span style={{ fontSize: '13px', color: '#999' }}>No specific benefits listed.</span>}
                    </div>
                </div>

                <div className={styles.descriptionSection}>
                    <h3 className={styles.sectionHeader}>Full Description</h3>
                    <div className={styles.descriptionContent}>
                        {job.description ? (
                            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '20px' }}>{job.description}</div>
                        ) : (
                            <p>{job.descriptionSnippet}</p>
                        )}

                        {job.requirements && (
                            <>
                                <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Requirements</h4>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</div>
                            </>
                        )}

                        {!jobRaw && !job.description && (
                            <div style={{ marginTop: '20px', color: '#666', fontStyle: 'italic' }}>
                                (Mock Job: Description snippet shown above.)
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.sideColumn}>
                <div className={styles.applyBox}>
                    <div className={styles.applyHeader}>To Apply</div>

                    {isSeeker ? (
                        <>
                            <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                                Use your FastJob Profile.
                            </p>
                            <ApplyButton jobId={id} hasApplied={hasApplied} isSeeker={isSeeker} resumeUrl={resumeUrl} />
                        </>
                    ) : (
                        <>
                            {!user ? (
                                <Link href="/login" className={styles.applyButton} style={{ textAlign: 'center', display: 'block' }}>
                                    LOGIN TO APPLY
                                </Link>
                            ) : (
                                <p style={{ fontSize: '12px' }}>Hirer Account - View Only</p>
                            )}
                        </>
                    )}

                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#666', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
                        Reference: FJ-{job.id.substring(0, 8)}<br />
                        Verified Employer ✅
                    </div>
                </div>
            </div>
        </div>
    );
}
