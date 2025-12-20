-- Smart Job Alerts Schema
-- Phase 1: Create tables for alert preferences and history

-- 1. Create job_alert_preferences table
CREATE TABLE IF NOT EXISTS public.job_alert_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Matching Criteria
    keywords TEXT[],                          -- Job title keywords
    locations TEXT[],                         -- Preferred locations
    categories TEXT[],                        -- Category slugs
    job_types TEXT[],                         -- full_time, part_time, etc.
    workplace_types TEXT[],                   -- remote, hybrid, on_site
    salary_min NUMERIC,                       -- Minimum salary
    
    -- Alert Settings
    frequency TEXT DEFAULT 'daily'            -- daily, weekly, instant, off
        CHECK (frequency IN ('daily', 'weekly', 'instant', 'off')),
    last_sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for job_alert_preferences
ALTER TABLE public.job_alert_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON public.job_alert_preferences;
CREATE POLICY "Users can view own preferences"
    ON public.job_alert_preferences FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.job_alert_preferences;
CREATE POLICY "Users can insert own preferences"
    ON public.job_alert_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.job_alert_preferences;
CREATE POLICY "Users can update own preferences"
    ON public.job_alert_preferences FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own preferences" ON public.job_alert_preferences;
CREATE POLICY "Users can delete own preferences"
    ON public.job_alert_preferences FOR DELETE
    USING (auth.uid() = user_id);

-- Grant access
GRANT ALL ON public.job_alert_preferences TO authenticated;

-- 2. Create job_alert_history table (tracks sent notifications)
CREATE TABLE IF NOT EXISTS public.job_alert_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, job_id)
);

-- RLS for job_alert_history
ALTER TABLE public.job_alert_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own history" ON public.job_alert_history;
CREATE POLICY "Users can view own history"
    ON public.job_alert_history FOR SELECT
    USING (auth.uid() = user_id);

-- Service role needs insert access for cron job
DROP POLICY IF EXISTS "Service can insert history" ON public.job_alert_history;
CREATE POLICY "Service can insert history"
    ON public.job_alert_history FOR INSERT
    WITH CHECK (true);

GRANT ALL ON public.job_alert_history TO authenticated;
GRANT ALL ON public.job_alert_history TO service_role;

-- 3. Create matching function
CREATE OR REPLACE FUNCTION public.match_jobs_for_alerts(
    p_user_id UUID,
    p_since TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '1 day'
)
RETURNS TABLE (
    job_id UUID,
    title TEXT,
    company_name TEXT,
    location TEXT,
    salary_min NUMERIC,
    salary_max NUMERIC,
    match_score INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    prefs RECORD;
BEGIN
    -- Get user preferences
    SELECT * INTO prefs FROM public.job_alert_preferences WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        j.id AS job_id,
        j.title,
        c.name AS company_name,
        j.location,
        j.salary_min,
        j.salary_max,
        (
            -- Calculate match score (0-100)
            CASE WHEN prefs.locations IS NOT NULL AND j.location = ANY(prefs.locations) THEN 25 ELSE 0 END +
            CASE WHEN prefs.categories IS NOT NULL AND j.category_slug = ANY(prefs.categories) THEN 25 ELSE 0 END +
            CASE WHEN prefs.job_types IS NOT NULL AND j.job_type = ANY(prefs.job_types) THEN 20 ELSE 0 END +
            CASE WHEN prefs.workplace_types IS NOT NULL AND j.workplace_type = ANY(prefs.workplace_types) THEN 15 ELSE 0 END +
            CASE WHEN j.salary_min >= COALESCE(prefs.salary_min, 0) THEN 15 ELSE 0 END
        )::INT AS match_score
    FROM public.jobs j
    JOIN public.companies c ON j.company_id = c.id
    WHERE j.status = 'active'
      AND j.created_at > p_since
      AND NOT EXISTS (
          SELECT 1 FROM public.job_alert_history h 
          WHERE h.user_id = p_user_id AND h.job_id = j.id
      )
      AND (
          -- At least one preference matches (or no preferences set = match all)
          (prefs.locations IS NULL OR j.location = ANY(prefs.locations)) OR
          (prefs.categories IS NULL OR j.category_slug = ANY(prefs.categories)) OR
          (prefs.job_types IS NULL OR j.job_type = ANY(prefs.job_types)) OR
          (prefs.workplace_types IS NULL OR j.workplace_type = ANY(prefs.workplace_types))
      )
    ORDER BY match_score DESC
    LIMIT 10;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.match_jobs_for_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_jobs_for_alerts TO service_role;

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_jobs_created_at_status ON public.jobs(created_at, status);
CREATE INDEX IF NOT EXISTS idx_job_alert_history_user_job ON public.job_alert_history(user_id, job_id);
