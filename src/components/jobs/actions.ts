'use server';

import { createClient } from '@/utils/supabase/server';
import { JobListing } from './JobStreamItem';

export async function fetchMoreJobs(offset: number, limit: number = 20): Promise<JobListing[]> {
  const supabase = await createClient();

  const { data: jobs } = await supabase
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
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return (jobs || []) as JobListing[];
}
