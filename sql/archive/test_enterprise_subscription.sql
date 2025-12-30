-- Set PT Sumber Sukses Selaras to Enterprise tier for testing
-- Run this in Supabase SQL Editor

-- First, find the company ID
-- SELECT id, name FROM companies WHERE name ILIKE '%Sumber Sukses%';

-- Insert or update subscription to enterprise
INSERT INTO subscriptions (company_id, plan, status, created_at, updated_at)
SELECT 
    id as company_id,
    'enterprise' as plan,
    'active' as status,
    NOW() as created_at,
    NOW() as updated_at
FROM companies 
WHERE name ILIKE '%Sumber Sukses Selaras%'
ON CONFLICT (company_id) 
DO UPDATE SET 
    plan = 'enterprise',
    status = 'active',
    updated_at = NOW();

-- Also initialize credit balance if not exists
INSERT INTO credit_balances (company_id, job_post_credits, talent_search_credits)
SELECT 
    id as company_id,
    5 as job_post_credits,
    5 as talent_search_credits  -- Enterprise gets 5 talent search credits
FROM companies 
WHERE name ILIKE '%Sumber Sukses Selaras%'
ON CONFLICT (company_id) 
DO UPDATE SET 
    talent_search_credits = 5,
    updated_at = NOW();

-- Verify the update
SELECT 
    c.name as company_name,
    s.plan,
    s.status,
    cb.job_post_credits,
    cb.talent_search_credits
FROM companies c
LEFT JOIN subscriptions s ON s.company_id = c.id
LEFT JOIN credit_balances cb ON cb.company_id = c.id
WHERE c.name ILIKE '%Sumber Sukses Selaras%';
