-- Phase F: Relocation & Visa Features
-- Add visa sponsorship to jobs and willing to relocate to profiles

-- 1. Add visa_sponsorship to jobs
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS visa_sponsorship BOOLEAN DEFAULT false;

-- 2. Add accepts_worldwide to jobs (if false, only local candidates can apply)
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS accepts_worldwide BOOLEAN DEFAULT false;

-- 3. Add willing_to_relocate to profiles (for job seekers)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS willing_to_relocate BOOLEAN DEFAULT false;

-- 4. Add preferred_countries to profiles (optional: seeker's target countries)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_countries TEXT[] DEFAULT '{}';

-- 5. Add country_code to profiles (for eligibility check)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT NULL;

-- 6. Index for filtering
CREATE INDEX IF NOT EXISTS idx_jobs_visa ON public.jobs(visa_sponsorship) WHERE visa_sponsorship = true;
CREATE INDEX IF NOT EXISTS idx_jobs_worldwide ON public.jobs(accepts_worldwide) WHERE accepts_worldwide = true;
CREATE INDEX IF NOT EXISTS idx_profiles_relocate ON public.profiles(willing_to_relocate) WHERE willing_to_relocate = true;
