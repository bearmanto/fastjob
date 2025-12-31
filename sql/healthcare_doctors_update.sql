-- Healthcare Module - Medical Practitioner Update
-- Adds Doctor/Physician certifications to the system
-- Run this AFTER healthcare_certifications_update.sql

-- =============================================
-- 1. Update Country Configs to include Medical Councils
-- =============================================
update healthcare_country_config 
set regulatory_body = 'Singapore Medical Council (SMC) / Singapore Nursing Board (SNB)' 
where country_code = 'SG';

update healthcare_country_config 
set regulatory_body = 'Konsil Kedokteran Indonesia (KKI) / Konsil Keperawatan' 
where country_code = 'ID';

update healthcare_country_config 
set regulatory_body = 'Malaysian Medical Council (MMC) / Malaysian Nursing Board (MNB)' 
where country_code = 'MY';

update healthcare_country_config 
set regulatory_body = 'PRC (Board of Medicine / Nursing)' 
where country_code = 'PH';


-- =============================================
-- 2. SINGAPORE Medical Practitioners (SMC)
-- =============================================
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
('SG', 'Fully Registered Doctor', 'Dr', 'medical', 'licensed', 'Singapore Medical Council (SMC)', true, true),
('SG', 'Conditionally Registered Doctor', 'Dr (Cond)', 'medical', 'entry', 'Singapore Medical Council (SMC)', true, true),
('SG', 'Specialist Accreditation', 'Specialist', 'medical', 'specialist', 'Specialists Accreditation Board (SAB)', true, false),
('SG', 'Family Physician', 'FP', 'medical', 'specialist', 'Family Physicians Accreditation Board', true, true);

-- =============================================
-- 3. INDONESIA Medical Practitioners (KKI)
-- =============================================
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
('ID', 'STR Dokter Umum', 'STR-DU', 'medical', 'licensed', 'Konsil Kedokteran Indonesia (KKI)', true, true),
('ID', 'STR Dokter Spesialis', 'STR-Sp', 'medical', 'specialist', 'Konsil Kedokteran Indonesia (KKI)', true, true),
('ID', 'STR Dokter Internship', 'STR-Intern', 'medical', 'entry', 'Konsil Kedokteran Indonesia (KKI)', true, true),
('ID', 'Surat Izin Praktik (SIP) - Dokter', 'SIP', 'medical', 'licensed', 'Dinas Kesehatan Kota/Kabupaten', true, true);

-- =============================================
-- 4. MALAYSIA Medical Practitioners (MMC)
-- =============================================
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
('MY', 'Full Medical Registration', 'MMC-Full', 'medical', 'licensed', 'Malaysian Medical Council (MMC)', true, false),
('MY', 'Annual Practising Certificate - Medical', 'APC', 'medical', 'licensed', 'Malaysian Medical Council (MMC)', true, true),
('MY', 'Provisional Medical Registration', 'MMC-Prov', 'medical', 'entry', 'Malaysian Medical Council (MMC)', true, false),
('MY', 'National Specialist Register', 'NSR', 'medical', 'specialist', 'Malaysian Medical Council (MMC)', true, true);

-- =============================================
-- 5. PHILIPPINES Medical Practitioners (PRC)
-- =============================================
INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
('PH', 'Physician Licensure Exam (Medical Doctor)', 'MD', 'medical', 'licensed', 'PRC - Board of Medicine', true, true),
('PH', 'Diplomate / Fellow (Specialist)', 'Diplomate', 'medical', 'specialist', 'Relevant Specialty Society (e.g., PCP)', false, false),
('PH', 'Certificate of Good Standing - Medical', 'COGS', 'medical', 'licensed', 'PMA / PRC', false, true);

