import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import styles from './page.module.css';
import { CountryFilter } from '@/components/jobs/CountryFilter';
import { HealthcareFilter } from '@/components/jobs/HealthcareFilter';
import { getCountryFlag, getCountryName } from '@/data/countries';
import { formatRelativeTime, isFresh } from '@/utils/date';
import { JobStreamItem } from '@/components/jobs/JobStreamItem';
import { LoadMoreJobs } from '@/components/jobs/LoadMoreJobs';

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
    subscriptions?: {
      plan: string;
      status: string;
    }[] | null;
  }[] | null;
  healthcare_certs_count?: number;
}

interface PageProps {
  searchParams: Promise<{ collection?: string; country?: string; q?: string; certification?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { collection, country, q: searchQuery, certification: certId } = await searchParams;

  // Pre-filter by certification if present
  let filteredJobIds: string[] | null = null;
  if (certId) {
    const { data: certJobs } = await supabase
      .from('job_required_certifications')
      .select('job_id')
      .eq('certification_id', certId);

    if (certJobs) {
      filteredJobIds = certJobs.map(r => r.job_id);
    }
  }

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
      salary_currency,
      salary_period,
      created_at,
      description,
      category_slug,
      workplace_type,
      job_type,
      experience_level,
      company:companies (
          id,
          name,
          verified
      ),
      job_required_certifications(count)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(0, 19); // Initial load of 20

  // Apply Certification Filter
  if (filteredJobIds !== null) {
    // If we have IDs, filter by them. If array is empty, we must filter by empty (return no results)
    if (filteredJobIds.length > 0) {
      query = query.in('id', filteredJobIds);
    } else {
      // No jobs found with this cert
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  }

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

  // Apply Search Query Filter (case-insensitive search on title, company name, location, description)
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }

  const { data: rawJobs, error } = await query;

  // Transform data to match interface (flatten cert count)
  const jobs = rawJobs?.map(job => ({
    ...job,
    healthcare_certs_count: job.job_required_certifications?.[0]?.count || 0
  }));

  if (error) {
    console.error('Error fetching jobs:', error);
  } else {
    // Debug logging
    console.log(`[Home] Fetched ${jobs?.length} jobs`);
    jobs?.forEach((job, i) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const company = (job as any).company;
      if (company) {
        console.log(`[Job ${i}] Company: ${Array.isArray(company) ? company[0]?.name : company?.name}, Sub:`,
          JSON.stringify(Array.isArray(company) ? company[0]?.subscriptions : company?.subscriptions)
        );
      }
    });
  }

  const typedJobs = (jobs || []) as JobListing[];

  return (
    <div className={styles.container}>

      {/* Latest Jobs Stream */}
      <section className={styles.jobsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionHeading}>
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Opportunities'}
          </h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <CountryFilter />
            <HealthcareFilter />
          </div>
        </div>
        <p className={styles.introText}>
          {searchQuery
            ? `Found ${typedJobs.length} jobs matching your search.`
            : 'Fresh jobs added directly from verified employers.'}
          {country && <span className={styles.filterTag}> Showing jobs in {getCountryFlag(country)} {getCountryName(country)}</span>}
        </p>

        <div className={styles.jobStream}>
          {typedJobs.length > 0 ? (
            <>
              {typedJobs.map((job) => (
                <JobStreamItem key={job.id} job={job} />
              ))}
              {typedJobs.length >= 20 && <LoadMoreJobs initialOffset={20} />}
            </>
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
