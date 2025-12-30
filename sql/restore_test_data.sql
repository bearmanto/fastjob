-- MINIMAL RESTORE TEST DATA
-- Uses only guaranteed base schema columns
-- Run this in Supabase SQL Editor

-- 1. Restore Profile for bennyalternative@gmail.com
INSERT INTO public.profiles (id, email, full_name, role, created_at)
SELECT 
    id,
    email,
    'Benny Hirer',
    'hirer',
    NOW()
FROM auth.users
WHERE email = 'bennyalternative@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'hirer';

-- 2. Restore Company (minimal columns)
INSERT INTO public.companies (
    owner_id, 
    name, 
    location, 
    verified
)
SELECT 
    u.id,
    'PT Sumber Sukses Selaras',
    'Jakarta, Indonesia',
    true
FROM auth.users u
WHERE u.email = 'bennyalternative@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.companies c WHERE c.owner_id = u.id
);

-- 3. Restore a Job (minimal columns from base schema)
INSERT INTO public.jobs (
    company_id,
    title,
    category_slug,
    location,
    salary_min,
    salary_max,
    description,
    requirements,
    status
)
SELECT 
    c.id,
    'Digital Strategist',
    'marketing',
    'Jakarta, Indonesia',
    12000000,
    18000000,
    'We are looking for a Digital Strategist to join our dynamic team.',
    'Experience in Digital Marketing, project management skills.',
    'active'
FROM public.companies c
JOIN auth.users u ON c.owner_id = u.id
WHERE u.email = 'bennyalternative@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.jobs j WHERE j.company_id = c.id AND j.title = 'Digital Strategist'
);

-- 4. Set up Enterprise Subscription
INSERT INTO subscriptions (company_id, plan, status, created_at, updated_at)
SELECT 
    c.id,
    'enterprise',
    'active',
    NOW(),
    NOW()
FROM public.companies c
JOIN auth.users u ON c.owner_id = u.id
WHERE u.email = 'bennyalternative@gmail.com'
ON CONFLICT (company_id) 
DO UPDATE SET plan = 'enterprise', status = 'active';

-- 5. Initialize Credits
INSERT INTO credit_balances (company_id, job_post_credits, talent_search_credits)
SELECT 
    c.id,
    5,
    5
FROM public.companies c
JOIN auth.users u ON c.owner_id = u.id
WHERE u.email = 'bennyalternative@gmail.com'
ON CONFLICT (company_id) 
DO UPDATE SET talent_search_credits = 5;

-- Verify results
SELECT 
    c.name as company_name,
    c.verified,
    s.plan,
    j.title as job_title
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id
LEFT JOIN jobs j ON c.id = j.company_id
WHERE c.name = 'PT Sumber Sukses Selaras';
