-- Application Tracking & Job Lifecycle Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. UPDATE APPLICATIONS TABLE
-- ============================================

-- Drop old constraint
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

-- Add new constraint with expanded statuses
ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('applied', 'viewed', 'shortlisted', 'interview', 'processing', 'hired', 'rejected'));

-- Update default status
ALTER TABLE public.applications 
ALTER COLUMN status SET DEFAULT 'applied';

-- Migrate existing 'new' status to 'applied'
UPDATE public.applications SET status = 'applied' WHERE status = 'new';

-- Add timestamp for status changes
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================
-- 2. UPDATE JOBS TABLE
-- ============================================

-- Add closing fields
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS closes_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 3. AUTO-CLOSE FUNCTION (Optional Trigger)
-- ============================================

-- Function to auto-close expired jobs
CREATE OR REPLACE FUNCTION public.auto_close_expired_jobs()
RETURNS void AS $$
BEGIN
    UPDATE public.jobs
    SET status = 'closed', closed_at = NOW()
    WHERE status = 'active'
      AND closes_at IS NOT NULL
      AND closes_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To run this automatically, set up a pg_cron job or Supabase Edge Function
-- Example cron (if pg_cron is enabled):
-- SELECT cron.schedule('auto-close-jobs', '0 * * * *', 'SELECT public.auto_close_expired_jobs()');
