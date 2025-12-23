-- Fix Applications RLS for Hirers
-- Run this in Supabase SQL Editor

-- First, check existing policies
-- SELECT * FROM pg_policies WHERE tablename = 'applications';

-- Drop any existing hirer policy that might be wrong
DROP POLICY IF EXISTS "Hirers can view applications for their jobs" ON public.applications;

-- Create correct policy: Hirers can view applications for jobs owned by their company
CREATE POLICY "Hirers can view applications for their jobs"
ON public.applications FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.companies c ON j.company_id = c.id
        WHERE j.id = applications.job_id
        AND c.owner_id = auth.uid()
    )
);

-- Also ensure hirers can update application status
DROP POLICY IF EXISTS "Hirers can update applications for their jobs" ON public.applications;

CREATE POLICY "Hirers can update applications for their jobs"
ON public.applications FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.companies c ON j.company_id = c.id
        WHERE j.id = applications.job_id
        AND c.owner_id = auth.uid()
    )
);

-- Keep existing applicant policy (they can see their own applications)
-- This should already exist but ensuring it does
DROP POLICY IF EXISTS "Applicants can view own applications" ON public.applications;

CREATE POLICY "Applicants can view own applications"
ON public.applications FOR SELECT
USING (applicant_id = auth.uid());

-- Applicants can create applications
DROP POLICY IF EXISTS "Applicants can create applications" ON public.applications;

CREATE POLICY "Applicants can create applications"
ON public.applications FOR INSERT
WITH CHECK (applicant_id = auth.uid());
