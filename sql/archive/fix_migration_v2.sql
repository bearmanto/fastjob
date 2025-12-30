-- FIX v2: Drop Constraint FIRST
-- The error happened because we tried to set status='applied' while the OLD constraint (which only allowed 'new') was still active.

-- 1. Drop the OLD constraint first to remove restrictions
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

-- 2. Now we can safely migrate the data
UPDATE public.applications 
SET status = 'applied' 
WHERE status = 'new' OR status IS NULL;

-- 3. Add the NEW constraint with the expanded status list
ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('applied', 'viewed', 'shortlisted', 'interview', 'processing', 'hired', 'rejected'));

-- 4. Set defaults and other columns
ALTER TABLE public.applications 
ALTER COLUMN status SET DEFAULT 'applied';

ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Add Job Columns (Ensure these exist for dashboard)
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS closes_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;
