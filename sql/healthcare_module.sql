-- Healthcare Module Database Schema
-- Run this migration to add healthcare credential management tables

-- =============================================
-- 1. Country Configuration Table
-- =============================================
CREATE TABLE IF NOT EXISTS healthcare_country_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code TEXT NOT NULL UNIQUE,
    country_name TEXT NOT NULL,
    regulatory_body TEXT,
    verification_url TEXT,
    license_types JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. Healthcare Certifications Master Table
-- =============================================
CREATE TABLE IF NOT EXISTS healthcare_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code TEXT NOT NULL REFERENCES healthcare_country_config(country_code) ON DELETE CASCADE,
    name TEXT NOT NULL,
    abbreviation TEXT,
    category TEXT NOT NULL CHECK (category IN ('nursing', 'allied_health', 'universal', 'midwifery')),
    role_level TEXT CHECK (role_level IN ('entry', 'licensed', 'advanced', 'specialist')),
    issuing_body TEXT,
    requires_license_number BOOLEAN DEFAULT true,
    requires_expiry BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 3. Profile Certifications (Job Seeker Credentials)
-- =============================================
CREATE TABLE IF NOT EXISTS profile_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES healthcare_certifications(id) ON DELETE CASCADE,
    license_number TEXT,
    issue_date DATE,
    expiry_date DATE,
    state_or_region TEXT,
    document_url TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'expired', 'rejected')),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Prevent duplicate certifications for same profile
    UNIQUE(profile_id, certification_id)
);

-- =============================================
-- 4. Job Required Certifications
-- =============================================
CREATE TABLE IF NOT EXISTS job_required_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES healthcare_certifications(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Prevent duplicate requirements for same job
    UNIQUE(job_id, certification_id)
);

-- =============================================
-- 5. Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_healthcare_certs_country ON healthcare_certifications(country_code);
CREATE INDEX IF NOT EXISTS idx_healthcare_certs_category ON healthcare_certifications(category);
CREATE INDEX IF NOT EXISTS idx_profile_certs_profile ON profile_certifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_certs_expiry ON profile_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_profile_certs_status ON profile_certifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_job_certs_job ON job_required_certifications(job_id);

-- =============================================
-- 6. Row Level Security
-- =============================================
ALTER TABLE healthcare_country_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_required_certifications ENABLE ROW LEVEL SECURITY;

-- Country config: readable by all authenticated users
CREATE POLICY "healthcare_country_config_read" ON healthcare_country_config
    FOR SELECT TO authenticated USING (is_active = true);

-- Certifications: readable by all authenticated users
CREATE POLICY "healthcare_certifications_read" ON healthcare_certifications
    FOR SELECT TO authenticated USING (is_active = true);

-- Profile certifications: users can manage their own
CREATE POLICY "profile_certifications_select" ON profile_certifications
    FOR SELECT TO authenticated USING (
        profile_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hirer'))
    );

CREATE POLICY "profile_certifications_insert" ON profile_certifications
    FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

CREATE POLICY "profile_certifications_update" ON profile_certifications
    FOR UPDATE TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "profile_certifications_delete" ON profile_certifications
    FOR DELETE TO authenticated USING (profile_id = auth.uid());

-- Job required certifications: hirers can manage for their jobs
CREATE POLICY "job_certs_select" ON job_required_certifications
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "job_certs_insert" ON job_required_certifications
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        ))
    );

CREATE POLICY "job_certs_delete" ON job_required_certifications
    FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        ))
    );

-- =============================================
-- 7. Seed Data: Phase 1 Countries
-- =============================================

-- Country configurations
INSERT INTO healthcare_country_config (country_code, country_name, regulatory_body, verification_url, license_types, is_active)
VALUES 
    ('SG', 'Singapore', 'Singapore Nursing Board (SNB)', 'https://www.healthprofessionals.gov.sg/snb', '["RN", "EN", "Midwife", "APRN"]', true),
    ('ID', 'Indonesia', 'Konsil Keperawatan Indonesia', 'https://ktki.kemkes.go.id/', '["Perawat", "Bidan", "Perawat Spesialis"]', true),
    ('MY', 'Malaysia', 'Malaysian Nursing Board (MNB)', 'https://nursing.moh.gov.my/', '["RN", "Community Nurse", "Midwife"]', true),
    ('PH', 'Philippines', 'Professional Regulation Commission (PRC)', 'https://www.prc.gov.ph/', '["RN", "Midwife", "Nursing Aide"]', true)
ON CONFLICT (country_code) DO NOTHING;

-- Singapore Certifications
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry)
VALUES
    ('SG', 'Registered Nurse', 'RN', 'nursing', 'licensed', 'Singapore Nursing Board', true, true),
    ('SG', 'Enrolled Nurse', 'EN', 'nursing', 'entry', 'Singapore Nursing Board', true, true),
    ('SG', 'Advanced Practice Nurse', 'APN', 'nursing', 'advanced', 'Singapore Nursing Board', true, true),
    ('SG', 'Registered Midwife', 'RM', 'midwifery', 'licensed', 'Singapore Nursing Board', true, true),
    ('SG', 'Healthcare Assistant', 'HCA', 'nursing', 'entry', 'SkillsFuture Singapore', false, false),
    ('SG', 'Basic Life Support', 'BLS', 'universal', 'entry', 'Various', false, true),
    ('SG', 'Advanced Cardiovascular Life Support', 'ACLS', 'universal', 'licensed', 'Various', false, true)
ON CONFLICT DO NOTHING;

-- Indonesia Certifications
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry)
VALUES
    ('ID', 'Perawat (Registered Nurse)', 'Ners', 'nursing', 'licensed', 'Konsil Keperawatan Indonesia', true, true),
    ('ID', 'Perawat Vokasi', 'Amd.Kep', 'nursing', 'entry', 'Konsil Keperawatan Indonesia', true, true),
    ('ID', 'Perawat Spesialis', 'Sp.Kep', 'nursing', 'specialist', 'Konsil Keperawatan Indonesia', true, true),
    ('ID', 'Bidan (Midwife)', 'Amd.Keb', 'midwifery', 'licensed', 'Ikatan Bidan Indonesia', true, true),
    ('ID', 'Surat Tanda Registrasi', 'STR', 'universal', 'licensed', 'Kemenkes RI', true, true),
    ('ID', 'Basic Life Support', 'BLS', 'universal', 'entry', 'Various', false, true),
    ('ID', 'Advanced Cardiovascular Life Support', 'ACLS', 'universal', 'licensed', 'Various', false, true)
ON CONFLICT DO NOTHING;

-- Malaysia Certifications
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry)
VALUES
    ('MY', 'Registered Nurse', 'RN', 'nursing', 'licensed', 'Malaysian Nursing Board', true, true),
    ('MY', 'Community Nurse', 'CN', 'nursing', 'licensed', 'Malaysian Nursing Board', true, true),
    ('MY', 'Registered Midwife', 'RM', 'midwifery', 'licensed', 'Malaysian Nursing Board', true, true),
    ('MY', 'Assistant Nurse', 'AN', 'nursing', 'entry', 'Malaysian Nursing Board', true, true),
    ('MY', 'Annual Practising Certificate', 'APC', 'universal', 'licensed', 'Malaysian Nursing Board', true, true),
    ('MY', 'Basic Life Support', 'BLS', 'universal', 'entry', 'Various', false, true),
    ('MY', 'Advanced Cardiovascular Life Support', 'ACLS', 'universal', 'licensed', 'Various', false, true)
ON CONFLICT DO NOTHING;

-- Philippines Certifications
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry)
VALUES
    ('PH', 'Registered Nurse', 'RN', 'nursing', 'licensed', 'Professional Regulation Commission', true, true),
    ('PH', 'Registered Midwife', 'RM', 'midwifery', 'licensed', 'Professional Regulation Commission', true, true),
    ('PH', 'Nursing Aide/Caregiver', 'NA', 'nursing', 'entry', 'TESDA', false, true),
    ('PH', 'Critical Care Nurse', 'CCN', 'nursing', 'specialist', 'Philippine Nursing Specialty Organizations', true, true),
    ('PH', 'Basic Life Support', 'BLS', 'universal', 'entry', 'Various', false, true),
    ('PH', 'Advanced Cardiovascular Life Support', 'ACLS', 'universal', 'licensed', 'Various', false, true),
    ('PH', 'Pediatric Advanced Life Support', 'PALS', 'universal', 'specialist', 'Various', false, true)
ON CONFLICT DO NOTHING;
