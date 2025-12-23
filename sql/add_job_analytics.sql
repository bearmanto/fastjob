-- Phase 2: Job Analytics
-- Tables for tracking job views and aggregated analytics

-- 1. Raw job views (for detailed tracking)
CREATE TABLE IF NOT EXISTS public.job_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'direct' -- 'direct', 'search', 'homepage', 'external'
);

-- 2. Daily aggregated analytics (for fast querying)
CREATE TABLE IF NOT EXISTS public.job_analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    views INT DEFAULT 0,
    unique_views INT DEFAULT 0,
    UNIQUE(job_id, date)
);

-- 3. Enable RLS
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_analytics_daily ENABLE ROW LEVEL SECURITY;

-- 4. RLS for job_views
-- Anyone can insert (tracking is public)
DROP POLICY IF EXISTS "Anyone can track views" ON public.job_views;
CREATE POLICY "Anyone can track views"
    ON public.job_views FOR INSERT
    WITH CHECK (true);

-- Company owners can view their job analytics
DROP POLICY IF EXISTS "Owners can view job_views" ON public.job_views;
CREATE POLICY "Owners can view job_views"
    ON public.job_views FOR SELECT
    USING (
        job_id IN (
            SELECT j.id FROM public.jobs j
            JOIN public.companies c ON j.company_id = c.id
            WHERE c.owner_id = auth.uid()
        )
    );

-- 5. RLS for job_analytics_daily
DROP POLICY IF EXISTS "Owners can view analytics" ON public.job_analytics_daily;
CREATE POLICY "Owners can view analytics"
    ON public.job_analytics_daily FOR SELECT
    USING (
        job_id IN (
            SELECT j.id FROM public.jobs j
            JOIN public.companies c ON j.company_id = c.id
            WHERE c.owner_id = auth.uid()
        )
    );

-- Allow upserts for aggregation
DROP POLICY IF EXISTS "Service can upsert analytics" ON public.job_analytics_daily;
CREATE POLICY "Service can upsert analytics"
    ON public.job_analytics_daily FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated users can upsert (for tracking API)
DROP POLICY IF EXISTS "Authenticated can upsert analytics" ON public.job_analytics_daily;
CREATE POLICY "Authenticated can upsert analytics"
    ON public.job_analytics_daily FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update analytics" ON public.job_analytics_daily;
CREATE POLICY "Authenticated can update analytics"
    ON public.job_analytics_daily FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 6. Grant access
GRANT ALL ON public.job_views TO authenticated;
GRANT ALL ON public.job_views TO anon;
GRANT ALL ON public.job_analytics_daily TO authenticated;

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_views_job_id ON public.job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_viewed_at ON public.job_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_job_analytics_job_date ON public.job_analytics_daily(job_id, date);
