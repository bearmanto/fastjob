-- Healthcare Jobs Helper Function
-- Creates a function to get healthcare certification count per job
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. Create a function to get jobs with healthcare cert count
-- =============================================
CREATE OR REPLACE FUNCTION get_jobs_with_healthcare_count(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    location TEXT,
    country_code TEXT,
    is_remote BOOLEAN,
    visa_sponsorship BOOLEAN,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT,
    salary_period TEXT,
    created_at TIMESTAMPTZ,
    description TEXT,
    category_slug TEXT,
    workplace_type TEXT,
    job_type TEXT,
    experience_level TEXT,
    company_id UUID,
    company_name TEXT,
    company_verified BOOLEAN,
    healthcare_certs_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.location,
        j.country_code,
        j.is_remote,
        j.visa_sponsorship,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.salary_period,
        j.created_at,
        j.description,
        j.category_slug,
        j.workplace_type,
        j.job_type,
        j.experience_level,
        c.id AS company_id,
        c.name AS company_name,
        c.verified AS company_verified,
        COALESCE((
            SELECT COUNT(*) 
            FROM job_required_certifications jrc 
            WHERE jrc.job_id = j.id
        ), 0) AS healthcare_certs_count
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE j.status = 'active'
    ORDER BY j.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. Grant execute permission
-- =============================================
GRANT EXECUTE ON FUNCTION get_jobs_with_healthcare_count TO anon, authenticated;

-- =============================================
-- 3. Create a simpler view approach (alternative)
-- =============================================
CREATE OR REPLACE VIEW jobs_with_healthcare_count AS
SELECT 
    j.*,
    COALESCE((
        SELECT COUNT(*) 
        FROM job_required_certifications jrc 
        WHERE jrc.job_id = j.id
    ), 0) AS healthcare_certs_count
FROM jobs j;

-- Grant access to the view
GRANT SELECT ON jobs_with_healthcare_count TO anon, authenticated;

-- =============================================
-- 4. Add index for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_job_required_certs_job_id 
ON job_required_certifications(job_id);
