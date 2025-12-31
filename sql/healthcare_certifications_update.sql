-- Healthcare Module Certification Update
-- Comprehensive and verified certifications for Phase 1 countries
-- Run this after the initial healthcare_module.sql migration

-- =============================================
-- 1. Clear existing seed data (preserve structure)
-- =============================================
DELETE FROM healthcare_certifications WHERE country_code IN ('SG', 'ID', 'MY', 'PH');
DELETE FROM healthcare_country_config WHERE country_code IN ('SG', 'ID', 'MY', 'PH');

-- =============================================
-- 2. Updated Country Configurations
-- =============================================

INSERT INTO healthcare_country_config (country_code, country_name, regulatory_body, verification_url, license_types, is_active) VALUES
-- Singapore
('SG', 'Singapore', 'Singapore Nursing Board (SNB) / Allied Health Professions Council (AHPC)', 
 'https://www.healthprofessionals.gov.sg/snb', 
 '["RN", "EN", "RNP", "ENP", "RMW", "APN"]'::jsonb, true),

-- Indonesia  
('ID', 'Indonesia', 'Konsil Keperawatan Indonesia / Konsil Kesehatan Indonesia (KKI)', 
 'https://kki.go.id/', 
 '["Ners", "Amd.Kep", "D3 Kep", "Sp.Kep", "Bidan"]'::jsonb, true),

-- Malaysia
('MY', 'Malaysia', 'Malaysian Nursing Board (MNB) / Malaysian Allied Health Professions Council (MAHPC)', 
 'https://nursing.moh.gov.my/', 
 '["RN", "Midwife", "Community Nurse", "Allied Health"]'::jsonb, true),

-- Philippines
('PH', 'Philippines', 'Professional Regulation Commission (PRC) / TESDA', 
 'https://www.prc.gov.ph/', 
 '["RN", "RM", "Caregiver NC II"]'::jsonb, true);

-- =============================================
-- 3. SINGAPORE CERTIFICATIONS (SNB)
-- =============================================

INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
-- Nursing Licenses (All require annual Practising Certificate renewal)
('SG', 'Registered Nurse', 'RN', 'nursing', 'licensed', 'Singapore Nursing Board (SNB)', true, true),
('SG', 'Enrolled Nurse', 'EN', 'nursing', 'entry', 'Singapore Nursing Board (SNB)', true, true),
('SG', 'Registered Nurse (Psychiatric)', 'RNP', 'nursing', 'specialist', 'Singapore Nursing Board (SNB)', true, true),
('SG', 'Enrolled Nurse (Psychiatric)', 'ENP', 'nursing', 'entry', 'Singapore Nursing Board (SNB)', true, true),
('SG', 'Advanced Practice Nurse', 'APN', 'nursing', 'advanced', 'Singapore Nursing Board (SNB)', true, true),
('SG', 'Registered Midwife', 'RMW', 'midwifery', 'licensed', 'Singapore Nursing Board (SNB)', true, true),
('SG', 'SNB Practising Certificate', 'PC', 'nursing', 'licensed', 'Singapore Nursing Board (SNB)', true, true),

-- Allied Health (AHPC regulated)
('SG', 'Registered Physiotherapist', 'PT', 'allied_health', 'licensed', 'Allied Health Professions Council (AHPC)', true, true),
('SG', 'Registered Occupational Therapist', 'OT', 'allied_health', 'licensed', 'Allied Health Professions Council (AHPC)', true, true),
('SG', 'Registered Speech-Language Pathologist', 'SLP', 'allied_health', 'licensed', 'Allied Health Professions Council (AHPC)', true, true),
('SG', 'Registered Diagnostic Radiographer', 'DR', 'allied_health', 'licensed', 'Allied Health Professions Council (AHPC)', true, true),
('SG', 'Registered Radiation Therapist', 'RT', 'allied_health', 'licensed', 'Allied Health Professions Council (AHPC)', true, true),
('SG', 'Medical Laboratory Scientist', 'MLS', 'allied_health', 'licensed', 'Allied Health Professions Council (AHPC)', true, true),
('SG', 'Pharmacist', 'RPh', 'allied_health', 'licensed', 'Singapore Pharmacy Council (SPC)', true, true),

-- Universal Certifications
('SG', 'Basic Cardiac Life Support', 'BCLS', 'universal', 'entry', 'Singapore Heart Foundation / Various', false, true),
('SG', 'Advanced Cardiac Life Support', 'ACLS', 'universal', 'licensed', 'American Heart Association / SRFAC', false, true),
('SG', 'Paediatric Advanced Life Support', 'PALS', 'universal', 'specialist', 'American Heart Association / SRFAC', false, true),
('SG', 'Healthcare Assistant Certification', 'HCA', 'nursing', 'entry', 'SkillsFuture Singapore', false, true);

-- =============================================
-- 4. INDONESIA CERTIFICATIONS (KKI/PPNI)
-- =============================================

INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
-- Core Nursing Registration (STR required for all)
('ID', 'Surat Tanda Registrasi - Perawat', 'STR', 'nursing', 'licensed', 'Konsil Kesehatan Indonesia (KKI)', true, false),
('ID', 'Ners (Registered Nurse / S1 + Profesi)', 'Ners', 'nursing', 'licensed', 'Konsil Keperawatan Indonesia', true, false),
('ID', 'Perawat Vokasi (D3 Keperawatan)', 'Amd.Kep', 'nursing', 'entry', 'Konsil Keperawatan Indonesia', true, false),
('ID', 'Perawat Spesialis', 'Sp.Kep', 'nursing', 'specialist', 'Konsil Keperawatan Indonesia', true, false),
('ID', 'Perawat Gigi', 'Amd.Kep.G', 'nursing', 'licensed', 'Konsil Keperawatan Indonesia', true, false),

-- Midwifery
('ID', 'Bidan (Midwife)', 'Amd.Keb', 'midwifery', 'licensed', 'Ikatan Bidan Indonesia (IBI)', true, false),
('ID', 'Bidan Profesi', 'S.Tr.Keb', 'midwifery', 'licensed', 'Ikatan Bidan Indonesia (IBI)', true, false),

-- Competency Certification
('ID', 'Uji Kompetensi Nasional Indonesia - Keperawatan', 'UKNI', 'universal', 'licensed', 'Kolegium Keperawatan Indonesia', false, false),
('ID', 'Sertifikat Kompetensi Perawat', 'SKP', 'nursing', 'licensed', 'Organisasi Profesi', false, true),

-- Allied Health
('ID', 'Fisioterapis', 'Ftr', 'allied_health', 'licensed', 'Ikatan Fisioterapi Indonesia (IFI)', true, false),
('ID', 'Apoteker', 'Apt', 'allied_health', 'licensed', 'Ikatan Apoteker Indonesia (IAI)', true, false),
('ID', 'Analis Kesehatan / Teknisi Lab Medik', 'A.Md.AK', 'allied_health', 'licensed', 'PATELKI', true, false),
('ID', 'Radiografer', 'A.Md.Rad', 'allied_health', 'licensed', 'PARI', true, false),

-- Universal Certifications
('ID', 'Basic Life Support', 'BLS', 'universal', 'entry', 'PERKI / Various', false, true),
('ID', 'Advanced Cardiovascular Life Support', 'ACLS', 'universal', 'licensed', 'PERKI / Various', false, true),
('ID', 'Basic Trauma Life Support', 'BTLS', 'universal', 'licensed', 'HIPGABI', false, true);

-- =============================================
-- 5. MALAYSIA CERTIFICATIONS (MNB/MAHPC)
-- =============================================

INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
-- Nursing (Malaysian Nursing Board)
('MY', 'Registered Nurse', 'RN', 'nursing', 'licensed', 'Malaysian Nursing Board (LJM)', true, true),
('MY', 'Community Nurse', 'CN', 'nursing', 'licensed', 'Malaysian Nursing Board (LJM)', true, true),
('MY', 'Assistant Nurse', 'AN', 'nursing', 'entry', 'Malaysian Nursing Board (LJM)', true, true),
('MY', 'Nurse Anaesthetist', 'NA', 'nursing', 'specialist', 'Malaysian Nursing Board (LJM)', true, true),
('MY', 'Annual Practising Certificate - Nursing', 'APC', 'nursing', 'licensed', 'Malaysian Nursing Board (LJM)', true, true),

-- Midwifery (Malaysian Midwifery Board)
('MY', 'Registered Midwife', 'RM', 'midwifery', 'licensed', 'Midwifery Board Malaysia (LBM)', true, true),
('MY', 'Advanced Diploma in Midwifery', 'Adv.Dip.Mid', 'midwifery', 'specialist', 'Midwifery Board Malaysia (LBM)', false, true),

-- Allied Health (MAHPC - Act 774)
('MY', 'Registered Physiotherapist', 'PT', 'allied_health', 'licensed', 'Malaysian Allied Health Professions Council (MAHPC)', true, true),
('MY', 'Registered Occupational Therapist', 'OT', 'allied_health', 'licensed', 'Malaysian Allied Health Professions Council (MAHPC)', true, true),
('MY', 'Registered Speech-Language Therapist', 'SLT', 'allied_health', 'licensed', 'Malaysian Allied Health Professions Council (MAHPC)', true, true),
('MY', 'Medical Laboratory Technologist', 'MLT', 'allied_health', 'licensed', 'Malaysian Allied Health Professions Council (MAHPC)', true, true),
('MY', 'Diagnostic Radiographer', 'DR', 'allied_health', 'licensed', 'Malaysian Allied Health Professions Council (MAHPC)', true, true),
('MY', 'Registered Pharmacist', 'RPh', 'allied_health', 'licensed', 'Pharmacy Board Malaysia', true, true),

-- Universal Certifications
('MY', 'Basic Life Support', 'BLS', 'universal', 'entry', 'Various', false, true),
('MY', 'Advanced Cardiovascular Life Support', 'ACLS', 'universal', 'licensed', 'Various', false, true),
('MY', 'Paediatric Advanced Life Support', 'PALS', 'universal', 'specialist', 'Various', false, true),
('MY', 'Neonatal Resuscitation Program', 'NRP', 'universal', 'specialist', 'Various', false, true);

-- =============================================
-- 6. PHILIPPINES CERTIFICATIONS (PRC/TESDA)
-- =============================================

INSERT INTO healthcare_certifications (country_code, name, abbreviation, category, role_level, issuing_body, requires_license_number, requires_expiry) VALUES
-- Nursing (PRC Board of Nursing)
('PH', 'Registered Nurse', 'RN', 'nursing', 'licensed', 'PRC - Board of Nursing', true, true),
('PH', 'Registered Nurse - CPD Completed', 'RN-CPD', 'nursing', 'licensed', 'PRC - Board of Nursing', true, true),
('PH', 'Critical Care Nurse', 'CCN', 'nursing', 'specialist', 'Philippine Nursing Specialty Organizations', false, true),
('PH', 'Emergency Room Nurse', 'ER-RN', 'nursing', 'specialist', 'Philippine Nursing Specialty Organizations', false, true),
('PH', 'Operating Room Nurse', 'OR-RN', 'nursing', 'specialist', 'Philippine Nursing Specialty Organizations', false, true),
('PH', 'Oncology Nurse', 'OCN', 'nursing', 'specialist', 'Philippine Oncology Nurses Association', false, true),

-- Midwifery (PRC Board of Midwifery)
('PH', 'Registered Midwife', 'RM', 'midwifery', 'licensed', 'PRC - Board of Midwifery', true, true),
('PH', 'Diploma in Midwifery', 'Dip.Mid', 'midwifery', 'entry', 'CHED accredited institutions', false, false),

-- Caregiving (TESDA)
('PH', 'Caregiver NC II', 'CG NC II', 'nursing', 'entry', 'TESDA', false, true),
('PH', 'Health Care Services NC II', 'HCS NC II', 'nursing', 'entry', 'TESDA', false, true),
('PH', 'Nursing Aide / Nursing Assistant', 'NA', 'nursing', 'entry', 'TESDA', false, true),

-- Allied Health (PRC)
('PH', 'Registered Pharmacist', 'RPh', 'allied_health', 'licensed', 'PRC - Board of Pharmacy', true, true),
('PH', 'Registered Physical Therapist', 'RPT', 'allied_health', 'licensed', 'PRC - Board of Physical Therapy', true, true),
('PH', 'Registered Occupational Therapist', 'ROT', 'allied_health', 'licensed', 'PRC - Board of Occupational Therapy', true, true),
('PH', 'Registered Medical Technologist', 'RMT', 'allied_health', 'licensed', 'PRC - Board of Medical Technology', true, true),
('PH', 'Registered Radiologic Technologist', 'RRT', 'allied_health', 'licensed', 'PRC - Board of Radiologic Technology', true, true),
('PH', 'Registered Respiratory Therapist', 'RReT', 'allied_health', 'licensed', 'PRC - Board of Respiratory Therapy', true, true),

-- Universal Certifications
('PH', 'Basic Life Support', 'BLS', 'universal', 'entry', 'Philippine Heart Association / AHA', false, true),
('PH', 'Advanced Cardiovascular Life Support', 'ACLS', 'universal', 'licensed', 'Philippine Heart Association / AHA', false, true),
('PH', 'Paediatric Advanced Life Support', 'PALS', 'universal', 'specialist', 'Philippine Heart Association / AHA', false, true),
('PH', 'Neonatal Resuscitation Program', 'NRP', 'universal', 'specialist', 'Philippine Academy of Pediatrics', false, true),
('PH', 'Intravenous Therapy Certification', 'IV Cert', 'universal', 'licensed', 'ANSAP/Various', false, true);

-- =============================================
-- 7. Verification
-- =============================================
DO $$
DECLARE
    country_count INTEGER;
    cert_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO country_count FROM healthcare_country_config WHERE is_active = true;
    SELECT COUNT(*) INTO cert_count FROM healthcare_certifications WHERE is_active = true;
    
    RAISE NOTICE 'Active countries: %, Total certifications: %', country_count, cert_count;
END $$;
