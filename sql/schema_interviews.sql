-- Interviews Table for Scheduling
-- Run this in Supabase SQL Editor

-- 1. Create Interviews Table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    meeting_link TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Hirers can view interviews for their company's job applications
CREATE POLICY "Hirers can view interviews for their jobs"
ON public.interviews FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.companies c ON j.company_id = c.id
        WHERE a.id = interviews.application_id
        AND c.owner_id = auth.uid()
    )
);

-- Hirers can create interviews for their company's job applications
CREATE POLICY "Hirers can create interviews"
ON public.interviews FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.companies c ON j.company_id = c.id
        WHERE a.id = application_id
        AND c.owner_id = auth.uid()
    )
);

-- Hirers can update their interviews
CREATE POLICY "Hirers can update interviews"
ON public.interviews FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.companies c ON j.company_id = c.id
        WHERE a.id = interviews.application_id
        AND c.owner_id = auth.uid()
    )
);

-- Applicants can view their own interview details
CREATE POLICY "Applicants can view own interviews"
ON public.interviews FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = interviews.application_id
        AND a.applicant_id = auth.uid()
    )
);
