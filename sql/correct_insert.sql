-- CORRECTED DATA INSERTION
-- Uses dynamic lookup to find the company ID, ensuring no foreign key errors

-- 1. Insert Enterprise Subscription
INSERT INTO subscriptions (company_id, plan, status, created_at, updated_at)
SELECT 
    id,
    'enterprise',
    'active',
    NOW(),
    NOW()
FROM companies 
WHERE name = 'PT Sumber Sukses Selaras'
ON CONFLICT (company_id) 
DO UPDATE SET 
    plan = 'enterprise', 
    status = 'active', 
    updated_at = NOW();

-- 2. Insert Credits
INSERT INTO credit_balances (company_id, job_post_credits, talent_search_credits, updated_at)
SELECT 
    id,
    5,
    5,
    NOW()
FROM companies 
WHERE name = 'PT Sumber Sukses Selaras'
ON CONFLICT (company_id) 
DO UPDATE SET 
    job_post_credits = 5, 
    talent_search_credits = 5, 
    updated_at = NOW();

-- 3. Verify Result
SELECT 
    c.name,
    c.id as company_id,
    s.plan,
    s.status,
    cb.job_post_credits
FROM companies c
LEFT JOIN subscriptions s ON s.company_id = c.id
LEFT JOIN credit_balances cb ON cb.company_id = c.id
WHERE c.name = 'PT Sumber Sukses Selaras';
