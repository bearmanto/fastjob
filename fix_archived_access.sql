-- Comprehensive RLS fix for Archived Jobs
-- Run this in Supabase SQL Editor

-- 1. JOBS: Ensure Hirers can VIEW and UPDATE their own jobs (regardless of status)
DROP POLICY IF EXISTS "Hirers can view their own jobs" ON public.jobs;
CREATE POLICY "Hirers can view their own jobs"
ON public.jobs
FOR SELECT
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.companies
    WHERE id = jobs.company_id
  )
);

DROP POLICY IF EXISTS "Hirers can update their own jobs" ON public.jobs;
CREATE POLICY "Hirers can update their own jobs"
ON public.jobs
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.companies
    WHERE id = jobs.company_id
  )
);

-- 2. APPLICATIONS: Ensure Hirers can VIEW applications for their jobs (regardless of job status)
DROP POLICY IF EXISTS "Hirers can view applications for their jobs" ON public.applications;
CREATE POLICY "Hirers can view applications for their jobs"
ON public.applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.companies c ON j.company_id = c.id
    WHERE j.id = applications.job_id
    AND c.owner_id = auth.uid()
  )
);

-- 3. PROFILES: Ensure Hirers can VIEW applicant profiles
-- Note: Profiles are usually public or viewable by authenticated users, but let's ensure it.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- 4. Verify access
GRANT SELECT ON public.jobs TO authenticated;
GRANT SELECT ON public.applications TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
