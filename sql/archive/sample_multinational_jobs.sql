-- Sample Jobs with Multinational Features
-- Run this AFTER running add_multinational_support.sql and add_visa_relocation.sql

-- Sample Job 1: Singapore Local Only
INSERT INTO public.jobs (
    title,
    company_id,
    category_slug,
    workplace_type,
    job_type,
    country_code,
    location,
    is_remote,
    accepts_worldwide,
    visa_sponsorship,
    salary_min,
    salary_max,
    description,
    description_snippet,
    requirements,
    skills,
    benefits,
    status
) SELECT 
    'Senior Software Engineer',
    id,
    'Technology',
    'hybrid',
    'full_time',
    'SG',
    'Singapore CBD',
    false,
    false,  -- Local only
    false,  -- No visa sponsorship
    8000000,
    15000000,
    'We are looking for a Senior Software Engineer to join our Singapore team. You will work on cutting-edge fintech solutions serving Southeast Asian markets.',
    'Senior Software Engineer role in Singapore fintech...',
    'At least 5 years of experience in software development. Strong TypeScript/Node.js skills.',
    ARRAY['TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    ARRAY['Health Insurance', 'Flexible Hours', '13th Month Bonus'],
    'active'
FROM public.companies LIMIT 1;

-- Sample Job 2: US Remote + Visa Sponsorship (Worldwide)
INSERT INTO public.jobs (
    title,
    company_id,
    category_slug,
    workplace_type,
    job_type,
    country_code,
    location,
    is_remote,
    accepts_worldwide,
    visa_sponsorship,
    salary_min,
    salary_max,
    description,
    description_snippet,
    requirements,
    skills,
    benefits,
    status
) SELECT 
    'Full Stack Developer (Remote - Worldwide)',
    id,
    'Technology',
    'remote',
    'full_time',
    'US',
    'San Francisco, CA',
    true,   -- Remote
    true,   -- Worldwide applicants welcome
    true,   -- Visa sponsorship available
    10000000,
    20000000,
    'Join our distributed team! We are looking for a Full Stack Developer who can work from anywhere in the world. We offer visa sponsorship for exceptional candidates who want to relocate to the US.',
    'Remote Full Stack Developer role with visa sponsorship...',
    'Strong experience with React and Node.js. Good communication skills for async work.',
    ARRAY['React', 'Node.js', 'TypeScript', 'GraphQL'],
    ARRAY['Remote Work', 'Visa Sponsorship', 'Stock Options', 'Unlimited PTO'],
    'active'
FROM public.companies LIMIT 1;

-- Sample Job 3: Indonesia Jakarta (Local)
INSERT INTO public.jobs (
    title,
    company_id,
    category_slug,
    workplace_type,
    job_type,
    country_code,
    location,
    is_remote,
    accepts_worldwide,
    visa_sponsorship,
    salary_min,
    salary_max,
    description,
    description_snippet,
    requirements,
    skills,
    benefits,
    status
) SELECT 
    'Manufacturing Operations Manager',
    id,
    'Manufacturing',
    'on_site',
    'full_time',
    'ID',
    'Jakarta Utara',
    false,
    false,  -- Local only
    false,
    25000000,
    40000000,
    'Seeking an experienced Operations Manager to oversee our manufacturing facility in North Jakarta. Must have strong leadership skills and experience in lean manufacturing.',
    'Operations Manager for manufacturing facility...',
    '7+ years experience in manufacturing operations. Fluent in Bahasa Indonesia.',
    ARRAY['Lean Manufacturing', 'Six Sigma', 'ERP Systems', 'Team Leadership'],
    ARRAY['BPJS Health', 'Transportation Allowance', 'Performance Bonus'],
    'active'
FROM public.companies LIMIT 1;

-- Sample Job 4: UK London + Remote-Friendly
INSERT INTO public.jobs (
    title,
    company_id,
    category_slug,
    workplace_type,
    job_type,
    country_code,
    location,
    is_remote,
    accepts_worldwide,
    visa_sponsorship,
    salary_min,
    salary_max,
    description,
    description_snippet,
    requirements,
    skills,
    benefits,
    status
) SELECT 
    'Product Designer (Hybrid - UK)',
    id,
    'Design',
    'hybrid',
    'full_time',
    'GB',
    'London',
    true,   -- Can work remotely
    true,   -- Worldwide - visa sponsorship
    true,
    7000000,
    12000000,
    'We are hiring a Product Designer to join our London studio. Remote-friendly role with option to relocate. We sponsor Skilled Worker visas for international talent.',
    'Product Designer in London with visa sponsorship...',
    'Portfolio demonstrating strong product design skills. Experience with Figma.',
    ARRAY['Figma', 'UI/UX', 'Design Systems', 'Prototyping'],
    ARRAY['Visa Sponsorship', 'Remote Flexible', 'Annual Learning Budget'],
    'active'
FROM public.companies LIMIT 1;

-- Sample Job 5: Australia (Remote + Local Melbourne)
INSERT INTO public.jobs (
    title,
    company_id,
    category_slug,
    workplace_type,
    job_type,
    country_code,
    location,
    is_remote,
    accepts_worldwide,
    visa_sponsorship,
    salary_min,
    salary_max,
    description,
    description_snippet,
    requirements,
    skills,
    benefits,
    status
) SELECT 
    'DevOps Engineer',
    id,
    'Technology',
    'remote',
    'full_time',
    'AU',
    'Melbourne',
    true,
    false,  -- Local only (must be in Australia)
    false,
    9000000,
    14000000,
    'Looking for a DevOps Engineer to join our Melbourne-based team. Fully remote within Australia. Must have working rights in Australia.',
    'DevOps Engineer for Australian team, remote within AU...',
    'Experience with Kubernetes, Terraform, and cloud platforms.',
    ARRAY['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Docker'],
    ARRAY['Remote Work', 'Health & Dental', 'Superannuation'],
    'active'
FROM public.companies LIMIT 1;
