-- Seed Healthcare Jobs & Companies
-- Populates the system with test data for Healthcare Module verification

BEGIN;

-- =============================================
-- 1. Create Healthcare Companies
-- =============================================
-- We need a valid owner_id. We'll pick the first available profile.
DO $$
DECLARE
    v_owner_id UUID;
BEGIN
    SELECT id INTO v_owner_id FROM profiles LIMIT 1;
    
    -- If no profile exists, valid seeding is impossible without bypassing constraints.
    -- We assume at least one user exists.
    IF v_owner_id IS NOT NULL THEN

        -- Singapore Hospital
        INSERT INTO companies (name, description, website, industry, location, country_code, verified, verification_status, owner_id)
        VALUES 
        ('Mount Elizabeth Novena', 'Premier private hospital in Singapore.', 'https://mountelizabeth.com.sg', 'Healthcare', 'Novena, Singapore', 'SG', true, 'verified', v_owner_id)
        ON CONFLICT DO NOTHING;

        -- Indonesia Hospital
        INSERT INTO companies (name, description, website, industry, location, country_code, verified, verification_status, owner_id)
        VALUES 
        ('Siloam Hospitals Group', 'Leading healthcare provider in Indonesia.', 'https://siloamhospitals.com', 'Healthcare', 'Jakarta, Indonesia', 'ID', true, 'verified', v_owner_id)
        ON CONFLICT DO NOTHING;

        -- Malaysia Hospital
        INSERT INTO companies (name, description, website, industry, location, country_code, verified, verification_status, owner_id)
        VALUES 
        ('Gleneagles Kuala Lumpur', 'Top private hospital in Malaysia.', 'https://gleneagles.com.my', 'Healthcare', 'Kuala Lumpur, Malaysia', 'MY', true, 'verified', v_owner_id)
        ON CONFLICT DO NOTHING;

        -- Philippines Hospital
        INSERT INTO companies (name, description, website, industry, location, country_code, verified, verification_status, owner_id)
        VALUES 
        ('St. Luke''s Medical Center', 'World-class healthcare in the Philippines.', 'https://stlukes.com.ph', 'Healthcare', 'Taguig, Metro Manila', 'PH', true, 'verified', v_owner_id)
        ON CONFLICT DO NOTHING;
        
    ELSE
        RAISE NOTICE 'No profile found to assign as company owner. Skipping company creation.';
    END IF;
END $$;


-- =============================================
-- 2. Create Healthcare Jobs with Cert Requirements
-- =============================================

-- ---------------------------------------------
-- JOB 1: Singapore Senior Staff Nurse (RN)
-- ---------------------------------------------
WITH company AS (SELECT id FROM companies WHERE name = 'Mount Elizabeth Novena' LIMIT 1),
     job_ins AS (
        INSERT INTO jobs (company_id, title, location, country_code, description, salary_min, salary_max, salary_currency, salary_period, job_type, workplace_type, experience_level, category_slug, status)
        SELECT id, 'Senior Staff Nurse (ICU)', 'Novena', 'SG', 
        'We are looking for an experienced SSN for our Intensive Care Unit. Must be fully registered with SNB.',
        4500, 6000, 'SGD', 'monthly', 'full_time', 'on_site', 'mid-level', 'healthcare', 'active'
        FROM company
        RETURNING id
     ),
     cert AS (SELECT id FROM healthcare_certifications WHERE abbreviation = 'RN' AND country_code = 'SG' LIMIT 1),
     cert_bcls AS (SELECT id FROM healthcare_certifications WHERE abbreviation = 'BCLS' AND country_code = 'SG' LIMIT 1)
INSERT INTO job_required_certifications (job_id, certification_id, is_required)
SELECT job_ins.id, cert.id, true FROM job_ins, cert
UNION ALL
SELECT job_ins.id, cert_bcls.id, true FROM job_ins, cert_bcls;


-- ---------------------------------------------
-- JOB 2: Singapore Resident Physician
-- ---------------------------------------------
WITH company AS (SELECT id FROM companies WHERE name = 'Mount Elizabeth Novena' LIMIT 1),
     job_ins AS (
        INSERT INTO jobs (company_id, title, location, country_code, description, salary_min, salary_max, salary_currency, salary_period, job_type, workplace_type, experience_level, category_slug, status)
        SELECT id, 'Resident Physician (General Medicine)', 'Novena', 'SG', 
        'Join our medical team. Full Registration with SMC required.',
        12000, 18000, 'SGD', 'monthly', 'full_time', 'on_site', 'senior', 'healthcare', 'active'
        FROM company
        RETURNING id
     ),
     cert AS (SELECT id FROM healthcare_certifications WHERE abbreviation = 'Dr' AND country_code = 'SG' LIMIT 1)
INSERT INTO job_required_certifications (job_id, certification_id, is_required)
SELECT job_ins.id, cert.id, true FROM job_ins, cert;


-- ---------------------------------------------
-- JOB 3: Indonesia General Practitioner
-- ---------------------------------------------
WITH company AS (SELECT id FROM companies WHERE name = 'Siloam Hospitals Group' LIMIT 1),
     job_ins AS (
        INSERT INTO jobs (company_id, title, location, country_code, description, salary_min, salary_max, salary_currency, salary_period, job_type, workplace_type, experience_level, category_slug, status)
        SELECT id, 'Dokter Umum (General Practitioner)', 'Jakarta Selatan', 'ID', 
        'Siloam Hospitals seeking dedicated GPs. Must have active STR and SIP ready.',
        15000000, 25000000, 'IDR', 'monthly', 'full_time', 'on_site', 'entry', 'healthcare', 'active'
        FROM company
        RETURNING id
     ),
     cert_str AS (SELECT id FROM healthcare_certifications WHERE abbreviation = 'STR-DU' AND country_code = 'ID' LIMIT 1),
     cert_sip AS (SELECT id FROM healthcare_certifications WHERE abbreviation = 'SIP' AND country_code = 'ID' LIMIT 1)
INSERT INTO job_required_certifications (job_id, certification_id, is_required)
SELECT job_ins.id, cert_str.id, true FROM job_ins, cert_str
UNION ALL
SELECT job_ins.id, cert_sip.id, true FROM job_ins, cert_sip;


-- ---------------------------------------------
-- JOB 4: Indonesia Nurse (Ners)
-- ---------------------------------------------
WITH company AS (SELECT id FROM companies WHERE name = 'Siloam Hospitals Group' LIMIT 1),
     job_ins AS (
        INSERT INTO jobs (company_id, title, location, country_code, description, salary_min, salary_max, salary_currency, salary_period, job_type, workplace_type, experience_level, category_slug, status)
        SELECT id, 'Perawat Pelaksana (Ners)', 'Lippo Village', 'ID', 
        'Dicari Ners profesional untuk unit Rawat Inap.',
        7000000, 10000000, 'IDR', 'monthly', 'full_time', 'on_site', 'entry', 'healthcare', 'active'
        FROM company
        RETURNING id
     ),
     cert AS (SELECT id FROM healthcare_certifications WHERE abbreviation = 'Ners' AND country_code = 'ID' LIMIT 1)
INSERT INTO job_required_certifications (job_id, certification_id, is_required)
SELECT job_ins.id, cert.id, true FROM job_ins, cert;


-- ---------------------------------------------
-- JOB 5: Malaysia Specialist Doctor
-- ---------------------------------------------
WITH company AS (SELECT id FROM companies WHERE name = 'Gleneagles Kuala Lumpur' LIMIT 1),
     job_ins AS (
        INSERT INTO jobs (company_id, title, location, country_code, description, salary_min, salary_max, salary_currency, salary_period, job_type, workplace_type, experience_level, category_slug, status)
        SELECT id, 'Consultant Cardiologist', 'Kuala Lumpur', 'MY', 
        'Seeking Resident Consultant Cardiologist. Must be on National Specialist Register.',
        30000, 50000, 'MYR', 'monthly', 'full_time', 'on_site', 'specialist', 'healthcare', 'active'
        FROM company
        RETURNING id
     ),
     cert_nsr AS (SELECT id FROM healthcare_certifications WHERE abbreviation = 'NSR' AND country_code = 'MY' LIMIT 1),
     cert_mmc AS (SELECT id FROM healthcare_certifications WHERE abbreviation = 'MMC-Full' AND country_code = 'MY' LIMIT 1)
INSERT INTO job_required_certifications (job_id, certification_id, is_required)
SELECT job_ins.id, cert_nsr.id, true FROM job_ins, cert_nsr
UNION ALL
SELECT job_ins.id, cert_mmc.id, true FROM job_ins, cert_mmc;


-- ---------------------------------------------
-- JOB 6: Philippines Registered Nurse
-- ---------------------------------------------
WITH company AS (SELECT id FROM companies WHERE name = 'St. Luke''s Medical Center' LIMIT 1),
     job_ins AS (
        INSERT INTO jobs (company_id, title, location, country_code, description, salary_min, salary_max, salary_currency, salary_period, job_type, workplace_type, experience_level, category_slug, status)
        SELECT id, 'Staff Nurse (ER)', 'Taguig', 'PH', 
        'Emergency Room Staff Nurse needed. Must have strong clinical skills and valid PRC license.',
        25000, 35000, 'PHP', 'monthly', 'full_time', 'on_site', 'entry', 'healthcare', 'active'
        FROM company
        RETURNING id
     ),
     cert_rn AS (SELECT id FROM healthcare_certifications WHERE abbreviation = 'RN' AND country_code = 'PH' LIMIT 1),
     cert_bls AS (SELECT id FROM healthcare_certifications WHERE abbreviation = 'BLS' AND country_code = 'PH' LIMIT 1)
INSERT INTO job_required_certifications (job_id, certification_id, is_required)
SELECT job_ins.id, cert_rn.id, true FROM job_ins, cert_rn
UNION ALL
SELECT job_ins.id, cert_bls.id, true FROM job_ins, cert_bls;

COMMIT;
