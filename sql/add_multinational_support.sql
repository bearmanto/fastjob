-- Multinational Expansion: Phase A
-- Add country support to companies and jobs

-- 1. Add country_code to companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'ID';

-- 2. Add country_code to jobs (hiring location)
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'ID';

-- 3. Add is_remote flag to jobs
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT false;

-- 4. Create index for country filtering
CREATE INDEX IF NOT EXISTS idx_jobs_country ON public.jobs(country_code);
CREATE INDEX IF NOT EXISTS idx_companies_country ON public.companies(country_code);

-- 5. Set default for existing rows
UPDATE public.companies SET country_code = 'ID' WHERE country_code IS NULL;
UPDATE public.jobs SET country_code = 'ID' WHERE country_code IS NULL;
