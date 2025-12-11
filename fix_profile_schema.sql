-- Fix Profile Schema
-- 1. Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;

-- 2. Verify profile_experience and profile_education exist
-- (Run this just to be sure, although actions.ts implies they exist)
CREATE TABLE IF NOT EXISTS public.profile_experience (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profile_education (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    school TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on them if newly created
ALTER TABLE public.profile_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_education ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Experience/Education
-- Public/Hirers can view
CREATE POLICY "Public Read Experience"
ON public.profile_experience FOR SELECT
USING (true);

CREATE POLICY "Public Read Education"
ON public.profile_education FOR SELECT
USING (true);

-- Owners can edit
CREATE POLICY "Owners Edit Experience"
ON public.profile_experience FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Owners Edit Education"
ON public.profile_education FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());
