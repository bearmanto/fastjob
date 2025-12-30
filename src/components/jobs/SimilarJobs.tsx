import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import styles from './SimilarJobs.module.css';
import { getCountryFlag } from '@/data/countries';

interface SimilarJobsProps {
    currentJobId: string;
    categorySlug: string;
}

export async function SimilarJobs({ currentJobId, categorySlug }: SimilarJobsProps) {
    const supabase = await createClient();

    const { data: jobs } = await supabase
        .from('jobs')
        .select(`
      id,
      title,
      location,
      country_code,
      company:companies(name)
    `)
        .eq('status', 'active')
        .eq('category_slug', categorySlug)
        .neq('id', currentJobId)
        .order('created_at', { ascending: false })
        .limit(3);

    if (!jobs || jobs.length === 0) return null;

    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>Similar Jobs</h3>
            <div className={styles.list}>
                {jobs.map((job) => (
                    <Link key={job.id} href={`/job/${job.id}`} className={styles.item}>
                        <span className={styles.title}>{job.title}</span>
                        <span className={styles.meta}>
                            {(job.company as { name: string }[])?.[0]?.name} · {getCountryFlag(job.country_code)} {job.location}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
