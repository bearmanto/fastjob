import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { COLLECTIONS } from '@/data/collections';
import { Sidebar } from '@/components/layout/Sidebar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BookmarkButton } from '@/components/jobs/BookmarkButton';
import styles from './CollectionDetail.module.css';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
    const { slug } = await params;

    // 1. Find the collection config
    const collection = COLLECTIONS.find(c => c.slug === slug);
    if (!collection) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Build Query dynamically
    let query = supabase
        .from('jobs')
        .select(`
            *,
            company:companies(name, location, logo_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    // Apply specific filters based on collection config
    const { type, value, operator } = collection.filter;

    switch (type) {
        case 'category':
            query = query.eq('category_slug', value);
            break;
        case 'workplace':
            // Case insensitive match for 'Remote', 'Hybrid', etc.
            query = query.ilike('workplace_type', `%${value}%`);
            break;
        case 'job_type':
            query = query.ilike('job_type', `%${value}%`);
            break;
        case 'salary':
            if (operator === 'gte') {
                query = query.gte('salary_min', value);
            }
            break;
    }

    const { data: jobs, error } = await query;

    // 3. Get saved jobs for curr user to show bookmark state
    let savedJobIds = new Set<string>();
    if (user) {
        const { data: saved } = await supabase
            .from('saved_jobs')
            .select('job_id')
            .eq('user_id', user.id);

        if (saved) {
            saved.forEach(s => savedJobIds.add(s.job_id));
        }
    }

    return (
        <div className={styles.pageContainer}>
            <Sidebar />

            <div className={styles.content}>
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Collections', href: '/collections' },
                        { label: collection.title }
                    ]}
                />

                <div className={styles.header}>
                    <div className={styles.headerIcon}>{collection.icon}</div>
                    <div>
                        <h1 className={styles.title}>{collection.title}</h1>
                        <p className={styles.description}>{collection.description}</p>
                    </div>
                </div>

                <div className={styles.jobList}>
                    {jobs && jobs.length > 0 ? (
                        jobs.map((job) => (
                            <div key={job.id} className={styles.jobCard}>
                                <div className={styles.jobMain}>
                                    <Link href={`/job/${job.id}`} className={styles.jobLink}>
                                        <h3 className={styles.jobTitle}>{job.title}</h3>
                                        <div className={styles.companyInfo}>
                                            {job.company?.name} • {job.location}
                                        </div>
                                    </Link>
                                    <div className={styles.tags}>
                                        <span className={styles.tag}>{job.workplace_type}</span>
                                        <span className={styles.tag}>{job.job_type}</span>
                                        {job.salary_min && (
                                            <span className={styles.salaryTag}>
                                                IDR {Math.round(job.salary_min / 1000000)}mn
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.jobActions}>
                                    <span className={styles.date}>
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </span>
                                    {user && (
                                        <BookmarkButton
                                            jobId={job.id}
                                            initialSaved={savedJobIds.has(job.id)}
                                        />
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No active jobs found in this collection right now.</p>
                            <Link href="/collections" className={styles.backLink}>
                                Browse other collections
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
