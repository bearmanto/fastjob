import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import styles from './page.module.css';

// ISR: Regenerate page every 60 seconds (cached between requests)
export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  // Fetch latest active jobs (Stream)
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

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Latest Opportunities</h1>
        <Link href="/categories" style={{ fontSize: '14px', textDecoration: 'underline', color: '#005f4b' }}>
          Browse by Category &rarr;
        </Link>
      </div>

      <p className={styles.introText} style={{ marginBottom: '32px' }}>
        Fresh jobs added directly from verified employers.
      </p>

      <div className={styles.jobStream}>
        {jobs && jobs.length > 0 ? (
          jobs.map((job: any) => (
            <div key={job.id} className={styles.streamItem}>
              <div className={styles.streamHeader}>
                <Link href={`/job/${job.id}`} className={styles.streamTitle}>
                  {job.title}
                </Link>
                <span className={styles.streamTime}>{new Date(job.created_at).toLocaleDateString()}</span>
              </div>
              <div className={styles.streamCompany}>
                {job.company?.name} {job.company?.verified && '✅'} &mdash; {job.location}
              </div>
              <div className={styles.streamMeta}>
                {job.salary_min && job.salary_max ?
                  `IDR ${(job.salary_min / 1000000).toFixed(0)}mn - ${(job.salary_max / 1000000).toFixed(0)}mn`
                  : 'Salary Disclosed'
                }
                <span style={{ margin: '0 8px' }}>•</span>
                <span style={{ textTransform: 'capitalize' }}>{job.category_slug}</span>
              </div>
              <p className={styles.streamSnippet}>
                {job.description ? job.description.substring(0, 140) + '...' : 'No description.'}
              </p>
            </div>
          ))
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#f9f9f9' }}>
            No jobs found. (Did you run the seed script?)
          </div>
        )}
      </div>
    </div>
  );
}
