-- FIX: Run Update BEFORE Constraint
-- 1. Migrate Data (Crucial First Step)
UPDATE public.applications 
SET status = 'applied' 
WHERE status = 'new' OR status NOT IN ('applied', 'viewed', 'shortlisted', 'interview', 'processing', 'hired', 'rejected');

-- 2. Drop Old Constraint
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

-- 3. Add New Constraint
ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('applied', 'viewed', 'shortlisted', 'interview', 'processing', 'hired', 'rejected'));

-- 4. Set Defaults
ALTER TABLE public.applications 
ALTER COLUMN status SET DEFAULT 'applied';

ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Add Job Columns (Fixes Dashboard Query)
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS closes_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;
