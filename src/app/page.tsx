import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import styles from './page.module.css';
import { CountryFilter } from './CountryFilter';
import { getCountryFlag, getCountryName } from '@/data/countries';

// ISR: Regenerate page every 60 seconds
export const revalidate = 60;

interface JobListing {
  id: string;
  title: string;
  location: string;
  country_code: string;
  is_remote: boolean;
  visa_sponsorship: boolean;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  description: string | null;
  category_slug: string;
  workplace_type: string;
  experience_level: string;
  company: {
    name: string;
    verified: boolean;
  }[] | null;
}

interface PageProps {
  searchParams: Promise<{ collection?: string; country?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { collection, country } = await searchParams;

  let query = supabase
    .from('jobs')
    .select(`
      id,
      title,
      location,
      country_code,
      is_remote,
      visa_sponsorship,
      salary_min,
      salary_max,
      created_at,
      description,
      category_slug,
      workplace_type,
      experience_level,
      company:companies (
          name,
          verified
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Apply Collection Filters
  if (collection === 'fresh') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query.gte('created_at', sevenDaysAgo.toISOString());
  } else if (collection === 'remote') {
    query = query.eq('is_remote', true);
  } else if (collection === 'senior') {
    query = query.or('experience_level.ilike.%Senior%,experience_level.ilike.%Manager%');
  }

  // Apply Country Filter
  if (country) {
    query = query.eq('country_code', country);
  }

  const { data: jobs } = await query;
  const typedJobs = (jobs || []) as JobListing[];

  return (
    <div className={styles.container}>

      {/* Latest Jobs Stream */}
      <section className={styles.jobsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionHeading}>Latest Opportunities</h2>
          <CountryFilter />
        </div>
        <p className={styles.introText}>
          Fresh jobs added directly from verified employers.
          {country && <span className={styles.filterTag}> Showing jobs in {getCountryFlag(country)} {getCountryName(country)}</span>}
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
                  {job.company?.[0]?.name} {job.company?.[0]?.verified && '✅'} &mdash;
                  {getCountryFlag(job.country_code)} {job.location || getCountryName(job.country_code)}
                  {job.is_remote && <span className={styles.remoteTag}>🌍 Remote</span>}
                  {job.visa_sponsorship && <span className={styles.visaTag}>✈️ Visa Sponsorship</span>}
                </div>
                <div className={styles.streamMeta}>
                  {job.salary_min && job.salary_max ?
                    `IDR ${(job.salary_min / 1000000).toFixed(0)}mn - ${(job.salary_max / 1000000).toFixed(0)}mn`
                    : 'Salary Disclosed'
                  }
                  <span className={styles.metaSeparator}>•</span>
                  <span className={styles.categorySlug}>{job.category_slug}</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span className={styles.tag}>{job.workplace_type}</span>
                </div>
                <p className={styles.streamSnippet}>
                  {job.description ? job.description.substring(0, 140) + '...' : 'No description.'}
                </p>
              </div>
            ))
          ) : (
            <div className={styles.emptyJobsState}>
              No jobs found matching your filters.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
