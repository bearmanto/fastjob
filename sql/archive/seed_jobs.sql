-- SEED DATA for Jobs (Mock)
-- This facilitates "Easy Apply" development by ensuring jobs exist in the DB.

-- 1. Create a Fake Hirer Profile (if not exists)
insert into auth.users (id, email)
values ('00000000-0000-0000-0000-000000000000', 'mock_hirer@fastjob.io')
on conflict (id) do nothing;

insert into public.profiles (id, email, full_name, role)
values ('00000000-0000-0000-0000-000000000000', 'mock_hirer@fastjob.io', 'Mock Hirer', 'hirer')
on conflict (id) do nothing;

-- 2. Create Companies for the Jobs
insert into public.companies (id, owner_id, name, location, verified)
values 
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'Apex Heavy Industries', 'Jakarta', true),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'Global Mfg Corp', 'Cikarang', true),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'FinTech Fast', 'Remote', true),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'Pump Systems Ltd', 'Surabaya', true),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'ConstructCo', 'Balikpapan', true)
on conflict (id) do nothing;

-- 3. Insert Jobs (Using deterministic UUIDs so we can match frontend)
-- Salary needs to be numeric for DB, but string in frontend. We'll approximate.
insert into public.jobs (id, company_id, title, category_slug, location, salary_min, salary_max, description, requirements, status)
values
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Senior Mechanical Engineer', 'engineering', 'Jakarta', 25000000, 35000000, 'Lead design of hydraulic systems for heavy machinery.', 'Mechanical Engineering Degree, 5+ years exp', 'active'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Production Supervisor', 'manufacturing', 'Cikarang', 12000000, 15000000, 'Oversee shift operations and ensure safety compliance.', 'Experience in manufacturing, leadership skills', 'active'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Backend Developer (Go)', 'it', 'Remote', 30000000, 50000000, 'Build high-performance APIs for payment processing.', 'Go, SQL, Redis expertise', 'active'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Technical Sales Engineer', 'sales', 'Surabaya', 15000000, 20000000, 'Sell industrial pumps to manufacturing clients.', 'Engineering background + Sales experience', 'active'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Safety Officer (K3)', 'construction', 'Balikpapan', 10000000, 12000000, 'Manage site safety and compliance.', 'K3 Certification, Construction experience', 'active')
on conflict (id) do nothing;
