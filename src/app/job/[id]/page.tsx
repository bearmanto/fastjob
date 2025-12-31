import { notFound } from 'next/navigation';
import { JOBS } from '@/data/mockData';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import styles from './Job.module.css';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { ApplyButton } from './ApplyButton';
import { checkIsJobSaved } from '@/app/actions/savedJobs';
import { BookmarkButton } from '@/components/jobs/BookmarkButton';
import { ViewTracker } from '@/components/analytics/ViewTracker';
import { getCountryFlag, getCountryName } from '@/data/countries';
import { ShareButton } from '@/components/jobs/ShareButton';
import { SimilarJobs } from '@/components/jobs/SimilarJobs';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function JobPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // PARALLELIZE: Fetch user, job, saved status, and healthcare certs
    const [userResult, jobResult, isSaved, certsResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase
            .from('jobs')
            .select(`
                *,
                company:companies(name, location)
            `)
            .eq('id', id)
            .single(),
        checkIsJobSaved(id),
        supabase
            .from('job_required_certifications')
            .select(`
                *,
                certification:healthcare_certifications(name, abbreviation, category)
            `)
            .eq('job_id', id)
    ]);

    const user = userResult.data?.user;
    const jobRaw = jobResult.data;
    const healthcareCerts = certsResult.data || [];

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
        countryCode: jobRaw.country_code || 'ID',
        isRemote: jobRaw.is_remote || false,
        acceptsWorldwide: jobRaw.accepts_worldwide || false,
        visaSponsorship: jobRaw.visa_sponsorship || false,
        categorySlug: jobRaw.category_slug,
        salary: (jobRaw.salary_min && jobRaw.salary_max)
            ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: jobRaw.salary_currency || 'IDR', maximumFractionDigits: 0 }).format(jobRaw.salary_min)} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: jobRaw.salary_currency || 'IDR', maximumFractionDigits: 0 }).format(jobRaw.salary_max)} / ${(jobRaw.salary_period || 'monthly').replace('monthly', 'mo').replace('annual', 'yr')}`
            : 'Salary confidential',
        jobType: jobRaw.job_type ? jobRaw.job_type.replace('_', ' ').toUpperCase() : 'FULL TIME',
        workplaceType: jobRaw.workplace_type ? jobRaw.workplace_type.replace('_', ' ').toUpperCase() : 'ON-SITE',
        postedAt: new Date(jobRaw.created_at).toLocaleDateString(),
        skills: jobRaw.skills || [],
        benefits: jobRaw.benefits || [],
        description: jobRaw.description || 'No description provided.',
        requirements: jobRaw.requirements,
        descriptionSnippet: jobRaw.description_snippet,
        owner_id: jobRaw.owner_id,
        healthcareCerts: healthcareCerts
    } : {
        ...mockJob!,
        countryCode: 'ID',
        isRemote: false,
        acceptsWorldwide: false,
        visaSponsorship: false,
        jobType: mockJob!.jobType || 'Full Time',
        workplaceType: mockJob!.workplaceType || 'On-site',
        description: null,
        requirements: null,
        skills: ['React', 'TypeScript', 'Next.js'],
        benefits: ['Health Insurance', 'Remote Work'],
        categorySlug: 'engineering',
        healthcareCerts: []
    };

    // Check Application Status
    let hasApplied = false;
    let resumeUrl: string | null = null;
    let isSeeker = false;
    let seekerCountryCode: string | null = null;

    if (user) {
        // Fetch profile and application status in parallel
        const [profileResult, applicationResult] = await Promise.all([
            supabase.from('profiles').select('role, resume_url, country_code').eq('id', user.id).single(),
            supabase.from('applications').select('id').eq('job_id', id).eq('applicant_id', user.id).single()
        ]);

        isSeeker = profileResult.data?.role === 'seeker';
        resumeUrl = profileResult.data?.resume_url || null;
        seekerCountryCode = profileResult.data?.country_code || null;
        hasApplied = !!applicationResult.data;
    }

    // Determine if user can apply (seeker only, and not owner)
    const isOwner = user?.id === job.owner_id;
    // user && !isOwner is handled by isSeeker check above, but for safety:
    if (isOwner) isSeeker = false; // Override if owner

    return (
        <div className={styles.container}>
            <ViewTracker jobId={job.id} source="direct" />
            <div className={styles.mainColumn}>
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'All Jobs', href: `/` },
                        { label: job.title }
                    ]}
                />

                <h1 className={styles.title}>{job.title}</h1>
                <div className={styles.company}>
                    {job.company} — {getCountryFlag(job.countryCode)} {job.location || getCountryName(job.countryCode)}

                    {/* Dynamic Workplace Badge */}
                    {(() => {
                        const type = (job.workplaceType || 'on_site').toLowerCase().replace('-', '_'); // Handle on-site/on_site
                        if (type.includes('remote')) return <span className={styles.remoteBadge}>🌍 Remote</span>;
                        if (type.includes('hybrid')) return <span className={styles.hybridBadge}>🏡 Hybrid</span>;
                        return <span className={styles.onSiteBadge}>🏢 On-site</span>;
                    })()}

                    {/* Job Type Badge */}
                    {(() => {
                        const type = (job.jobType || 'FULL TIME').toLowerCase().replace(' ', '_');

                        if (type.includes('full')) return <span className={styles.fullTimeBadge}>Full Time</span>;
                        if (type.includes('part')) return <span className={styles.partTimeBadge}>Part Time</span>;
                        if (type.includes('contract')) return <span className={styles.contractBadge}>Contract</span>;
                        if (type.includes('intern')) return <span className={styles.internshipBadge}>Internship</span>;
                        if (type.includes('daily')) return <span className={styles.dailyBadge}>Daily</span>;

                        // Fallback that tries to look like a badge if we have a value but it didn't match
                        return job.jobType ? <span className={styles.fullTimeBadge}>{job.jobType}</span> : null;
                    })()}

                    {job.visaSponsorship && <span className={styles.visaBadge}>✈️ Visa Sponsorship</span>}
                </div>

                {/* Removed BookmarkButton from here */}

                <h3 className={styles.sectionHeader}>Job Specifications</h3>
                <table className={styles.specTable}>
                    <tbody>
                        <tr>
                            <td className={styles.specLabel}>Position ID</td>
                            <td>#{job.id.substring(0, 8)}...</td>
                        </tr>
                        <tr>
                            <td className={styles.specLabel}>Location</td>
                            <td>
                                {getCountryFlag(job.countryCode)} {job.location || getCountryName(job.countryCode)}
                            </td>
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
                <div className={styles.skillSection}>
                    <h3 className={`${styles.sectionHeader} ${styles.sectionHeaderMargin}`}>Required Skills</h3>
                    <div className={styles.tagContainer}>
                        {job.skills && job.skills.length > 0 ? job.skills.map((s: string) => (
                            <span key={s} className={styles.skillTag}>
                                {s}
                            </span>
                        )) : <span className={styles.emptyTags}>No specific skills listed.</span>}
                    </div>

                    <h3 className={`${styles.sectionHeader} ${styles.sectionHeaderMargin}`}>Benefits</h3>
                    <div className={styles.tagContainer}>
                        {job.benefits && job.benefits.length > 0 ? job.benefits.map((b: string) => (
                            <span key={b} className={styles.benefitTag}>
                                {b}
                            </span>
                        )) : <span className={styles.emptyTags}>No specific benefits listed.</span>}
                    </div>

                    {/* Healthcare Certifications */}
                    {job.healthcareCerts && job.healthcareCerts.length > 0 && (
                        <>
                            <h3 className={`${styles.sectionHeader} ${styles.sectionHeaderMargin}`}>
                                🏥 Required Healthcare Credentials
                            </h3>
                            <div className={styles.tagContainer}>
                                {job.healthcareCerts.map((cert: { id: string; is_required: boolean; certification: { name: string; abbreviation: string | null; category: string } | null }) => (
                                    <span
                                        key={cert.id}
                                        className={`${styles.credentialTag} ${cert.is_required ? styles.requiredCred : styles.preferredCred}`}
                                    >
                                        {cert.certification?.abbreviation || cert.certification?.name}
                                        {cert.is_required && <span className={styles.requiredLabel}>Required</span>}
                                        {!cert.is_required && <span className={styles.preferredLabel}>Preferred</span>}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.descriptionSection}>
                    <h3 className={styles.sectionHeader}>Full Description</h3>
                    <div className={styles.descriptionContent}>
                        {job.description ? (
                            <div className={styles.descriptionText}>{job.description}</div>
                        ) : (
                            <p>{job.descriptionSnippet}</p>
                        )}

                        {job.requirements && (
                            <>
                                <h4 className={styles.requirementsTitle}>Requirements</h4>
                                <div className={styles.requirementsText}>{job.requirements}</div>
                            </>
                        )}

                        {!jobRaw && !job.description && (
                            <div className={styles.mockNote}>
                                (Mock Job: Description snippet shown above.)
                            </div>
                        )}
                    </div>
                </div>

                {/* Similar Jobs */}
                <SimilarJobs currentJobId={job.id} categorySlug={job.categorySlug} />
            </div>

            <div className={styles.sideColumn}>
                <div className={styles.applyBox}>
                    <div className={styles.applyHeader}>To Apply</div>

                    {isSeeker ? (
                        <>
                            <p className={styles.applyText}>
                                Use your FastJob Profile.
                            </p>
                            <ApplyButton
                                jobId={job.id}
                                hasApplied={hasApplied}
                                isSeeker={!!isSeeker}
                                resumeUrl={resumeUrl}
                                jobCountryCode={job.countryCode}
                                acceptsWorldwide={job.acceptsWorldwide}
                                seekerCountryCode={seekerCountryCode}
                            />

                            {/* Saved Job Button - Sidebar */}
                            <BookmarkButton
                                jobId={job.id}
                                initialSaved={isSaved}
                                withText={true}
                                className={styles.savedJobButton}
                            />

                            {/* Share Button */}
                            <ShareButton jobTitle={job.title} />
                        </>
                    ) : (
                        <>
                            {!user ? (
                                <Link href="/login" className={styles.applyButton}>
                                    LOGIN TO APPLY
                                </Link>
                            ) : (
                                <p className={styles.applyText}>Hirer Account - View Only</p>
                            )}
                        </>
                    )}

                    <div className={styles.applyMeta}>
                        Reference: FJ-{job.id.substring(0, 8)}<br />
                        Verified Employer ✅
                    </div>
                </div>
            </div>
        </div>
    );
}
