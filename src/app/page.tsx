import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { COLLECTIONS } from '@/data/collections';
import styles from './page.module.css';

// ISR: Regenerate page every 60 seconds
export const revalidate = 60;

interface JobListing {
  id: string;
  title: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  description: string | null;
  category_slug: string;
  company: {
    name: string;
    verified: boolean;
  }[] | null;
}

export default async function Home() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      location,
      salary_min,
      salary_max,
      created_at,
      description,
      category_slug,
      company:companies (
          name,
          verified
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const typedJobs = (jobs || []) as JobListing[];

  return (
    <div className={styles.container}>
      {/* Featured Collections Section */}
      <section className={styles.collectionsSection}>
        <div className={styles.pageHeaderRow}>
          <h1 className={styles.pageTitle}>Featured Collections</h1>
          <Link href="/collections" className={styles.categoryLink}>
            View All &rarr;
          </Link>
        </div>

        <div className={styles.collectionsGrid}>
          {COLLECTIONS.slice(0, 4).map(collection => (
            <Link
              key={collection.slug}
              href={`/collection/${collection.slug}`}
              className={`${styles.collectionCard} ${collection.color.includes('blue') ? styles.bgBlue :
                collection.color.includes('green') ? styles.bgGreen :
                  collection.color.includes('purple') ? styles.bgPurple :
                    collection.color.includes('red') ? styles.bgRed : styles.bgSlate}`}
            >
              <span className={styles.collectionIcon}>{collection.icon}</span>
              <span className={styles.collectionTitle}>{collection.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Jobs Stream */}
      <section className={styles.jobsSection}>
        <h2 className={styles.sectionHeading}>Latest Opportunities</h2>
        <p className={styles.introText}>
          Fresh jobs added directly from verified employers.
        </p>

        <div className={styles.jobStream}>
          {typedJobs.length > 0 ? (
            typedJobs.map((job) => (
              <div key={job.id} className={styles.streamItem}>
                <div className={styles.streamHeader}>
                  <Link href={`/job/${job.id}`} className={styles.streamTitle}>
                    {job.title}
                  </Link>
                  <span className={styles.streamTime}>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <div className={styles.streamCompany}>
                  {job.company?.[0]?.name} {job.company?.[0]?.verified && '✅'} &mdash; {job.location}
                </div>
                <div className={styles.streamMeta}>
                  {job.salary_min && job.salary_max ?
                    `IDR ${(job.salary_min / 1000000).toFixed(0)}mn - ${(job.salary_max / 1000000).toFixed(0)}mn`
                    : 'Salary Disclosed'
                  }
                  <span className={styles.metaSeparator}>•</span>
                  <span className={styles.categorySlug}>{job.category_slug}</span>
                </div>
                <p className={styles.streamSnippet}>
                  {job.description ? job.description.substring(0, 140) + '...' : 'No description.'}
                </p>
              </div>
            ))
          ) : (
            <div className={styles.emptyJobsState}>
              No jobs found. (Did you run the seed script?)
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

