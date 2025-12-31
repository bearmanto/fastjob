import Link from 'next/link';
import styles from '@/app/page.module.css';
import { getCountryFlag, getCountryName } from '@/data/countries';
import { formatRelativeTime, isFresh } from '@/utils/date';

export interface JobListing {
    id: string;
    title: string;
    location: string;
    country_code: string;
    is_remote: boolean;
    visa_sponsorship: boolean;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    salary_period: string;
    created_at: string;
    description: string | null;
    category_slug: string;
    workplace_type: string;
    job_type: string;
    experience_level: string;
    company: {
        id: string;
        name: string;
        verified: boolean;
    }[] | null;
    // Healthcare fields (optional for backward compat)
    healthcare_certs_count?: number;
}

export function JobStreamItem({ job }: { job: JobListing }) {
    // Salary formatter
    const formatSalary = () => {
        if (!job.salary_min || !job.salary_max) return 'Salary Disclosed';

        const currency = job.salary_currency || 'IDR';
        const period = job.salary_period || 'monthly';

        const formatCompact = (val: number, cur: string) => {
            if (cur === 'IDR' && val >= 1000000) return `${(val / 1000000).toFixed(0)}mn`;
            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
            return val.toString();
        };

        const min = formatCompact(job.salary_min, currency);
        const max = formatCompact(job.salary_max, currency);
        const currencySymbol = currency === 'USD' ? '$' : (currency === 'IDR' ? 'IDR ' : currency + ' ');
        const periodShort = period === 'monthly' ? '/mo' : (period === 'annual' ? '/yr' : '/' + period);

        return `${currencySymbol}${min} - ${max}${periodShort}`;
    };

    return (
        <div className={styles.streamItem}>
            <div className={styles.streamHeader}>
                <Link href={`/job/${job.id}`} className={styles.streamTitle}>
                    {job.title}
                </Link>
                <span className={styles.streamTime}>
                    {isFresh(job.created_at) && <span className={styles.freshBadge}>🔥 New</span>}
                    {formatRelativeTime(job.created_at)}
                </span>
            </div>
            <div className={styles.streamCompany}>
                {job.company?.[0]?.name} {job.company?.[0]?.verified && '✅'} &mdash;
                {getCountryFlag(job.country_code)} {job.location || getCountryName(job.country_code)}

                {/* Workplace Type Badge */}
                {(() => {
                    const type = (job.workplace_type || 'on_site').toLowerCase();
                    if (type === 'remote') return <span className={styles.remoteTag}>🌍 Remote</span>;
                    if (type === 'hybrid') return <span className={styles.hybridTag}>🏡 Hybrid</span>;
                    return <span className={styles.onSiteTag}>🏢 On-site</span>;
                })()}

                {/* Job Type Badge */}
                {(() => {
                    const type = (job.job_type || 'full_time').toLowerCase();
                    if (type === 'full_time' || type === 'full time') return <span className={styles.fullTimeTag}>Full Time</span>;
                    if (type === 'part_time' || type === 'part time') return <span className={styles.partTimeTag}>Part Time</span>;
                    if (type === 'contract') return <span className={styles.contractTag}>Contract</span>;
                    if (type === 'internship') return <span className={styles.internshipTag}>Internship</span>;
                    if (type === 'daily') return <span className={styles.dailyTag}>Daily</span>;
                    return null;
                })()}

                {job.visa_sponsorship && <span className={styles.visaTag}>✈️ Visa Sponsorship</span>}

                {/* Healthcare Badge */}
                {(job.healthcare_certs_count || 0) > 0 && (
                    <span className={styles.healthcareTag}>🏥 Healthcare</span>
                )}
            </div>
            <div className={styles.streamMeta}>
                {formatSalary()}
                <span className={styles.metaSeparator}>•</span>
                <span className={styles.categorySlug}>{job.category_slug}</span>
            </div>
            <p className={styles.streamSnippet}>
                {job.description ? job.description.substring(0, 140) + '...' : 'No description.'}
            </p>
        </div>
    );
}

