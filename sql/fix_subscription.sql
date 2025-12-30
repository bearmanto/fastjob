-- VERIFY AND FIX SUBSCRIPTION DATA
-- Run this in Supabase SQL Editor

-- 1. Check if company exists
SELECT 'Companies' as check_type, count(*) as count FROM companies;

-- 2. Check if subscription exists
SELECT 'Subscriptions' as check_type, count(*) as count FROM subscriptions;

-- 3. See all subscription data
SELECT 
    c.id as company_id,
    c.name as company_name,
    s.plan,
    s.status,
    cb.job_post_credits,
    cb.talent_search_credits
FROM companies c
LEFT JOIN subscriptions s ON s.company_id = c.id
LEFT JOIN credit_balances cb ON cb.company_id = c.id;

-- 4. FORCE INSERT Enterprise subscription for the company
-- (This will work even if previous insert failed)
INSERT INTO subscriptions (company_id, plan, status, created_at, updated_at)
SELECT 
    c.id,
    'enterprise',
    'active',
    NOW(),
    NOW()
FROM companies c
WHERE c.name = 'PT Sumber Sukses Selaras'
ON CONFLICT (company_id) 
DO UPDATE SET 
    plan = 'enterprise', 
    status = 'active',
    updated_at = NOW();

-- 5. FORCE INSERT credits
INSERT INTO credit_balances (company_id, job_post_credits, talent_search_credits)
SELECT 
    c.id,
    5,
    5
FROM companies c
WHERE c.name = 'PT Sumber Sukses Selaras'
ON CONFLICT (company_id) 
DO UPDATE SET 
    job_post_credits = 5,
    talent_search_credits = 5,
    updated_at = NOW();

-- 6. Verify results
SELECT 
    c.name,
    s.plan,
    s.status,
    cb.job_post_credits,
    cb.talent_search_credits
FROM companies c
LEFT JOIN subscriptions s ON s.company_id = c.id
LEFT JOIN credit_balances cb ON cb.company_id = c.id
WHERE c.name = 'PT Sumber Sukses Selaras';
