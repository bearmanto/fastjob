-- Healthcare Doctors Fix & Update
-- 1. Fixes the category CHECK constraint to allow 'medical'
-- 2. Inserts the Medical Practitioner certifications

BEGIN;

-- =============================================
-- 1. Fix Database Constraint
-- =============================================
ALTER TABLE healthcare_certifications 
DROP CONSTRAINT IF EXISTS healthcare_certifications_category_check;

ALTER TABLE healthcare_certifications 
ADD CONSTRAINT healthcare_certifications_category_check 
CHECK (category IN ('nursing', 'allied_health', 'universal', 'midwifery', 'medical'));


-- =============================================
-- 2. Update Country Configs to include Medical Councils
-- =============================================
UPDATE healthcare_country_config 
SET regulatory_body = 'Singapore Medical Council (SMC) / Singapore Nursing Board (SNB)' 
WHERE country_code = 'SG';

UPDATE healthcare_country_config 
SET regulatory_body = 'Konsil Kedokteran Indonesia (KKI) / Konsil Keperawatan' 
WHERE country_code = 'ID';

UPDATE healthcare_country_config 
SET regulatory_body = 'Malaysian Medical Council (MMC) / Malaysian Nursing Board (MNB)' 
WHERE country_code = 'MY';

UPDATE healthcare_country_config 
SET regulatory_body = 'PRC (Board of Medicine / Nursing)' 
WHERE country_code = 'PH';


-- =============================================
-- 3. Insert Medical Practitioner Certifications
-- =============================================

-- SINGAPORE (SMC)
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
('SG', 'Fully Registered Doctor', 'Dr', 'medical', 'licensed', 'Singapore Medical Council (SMC)', true, true),
('SG', 'Conditionally Registered Doctor', 'Dr (Cond)', 'medical', 'entry', 'Singapore Medical Council (SMC)', true, true),
('SG', 'Specialist Accreditation', 'Specialist', 'medical', 'specialist', 'Specialists Accreditation Board (SAB)', true, false),
('SG', 'Family Physician', 'FP', 'medical', 'specialist', 'Family Physicians Accreditation Board', true, true)
ON CONFLICT DO NOTHING;

-- INDONESIA (KKI)
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
('ID', 'STR Dokter Umum', 'STR-DU', 'medical', 'licensed', 'Konsil Kedokteran Indonesia (KKI)', true, true),
('ID', 'STR Dokter Spesialis', 'STR-Sp', 'medical', 'specialist', 'Konsil Kedokteran Indonesia (KKI)', true, true),
('ID', 'STR Dokter Internship', 'STR-Intern', 'medical', 'entry', 'Konsil Kedokteran Indonesia (KKI)', true, true),
('ID', 'Surat Izin Praktik (SIP) - Dokter', 'SIP', 'medical', 'licensed', 'Dinas Kesehatan Kota/Kabupaten', true, true)
ON CONFLICT DO NOTHING;

-- MALAYSIA (MMC)
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
('MY', 'Full Medical Registration', 'MMC-Full', 'medical', 'licensed', 'Malaysian Medical Council (MMC)', true, false),
('MY', 'Annual Practising Certificate - Medical', 'APC', 'medical', 'licensed', 'Malaysian Medical Council (MMC)', true, true),
('MY', 'Provisional Medical Registration', 'MMC-Prov', 'medical', 'entry', 'Malaysian Medical Council (MMC)', true, false),
('MY', 'National Specialist Register', 'NSR', 'medical', 'specialist', 'Malaysian Medical Council (MMC)', true, true)
ON CONFLICT DO NOTHING;

-- PHILIPPINES (PRC)
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
('PH', 'Physician Licensure Exam (Medical Doctor)', 'MD', 'medical', 'licensed', 'PRC - Board of Medicine', true, true),
('PH', 'Diplomate / Fellow (Specialist)', 'Diplomate', 'medical', 'specialist', 'Relevant Specialty Society (e.g., PCP)', false, false),
('PH', 'Certificate of Good Standing - Medical', 'COGS', 'medical', 'licensed', 'PMA / PRC', false, true)
ON CONFLICT DO NOTHING;

COMMIT;
