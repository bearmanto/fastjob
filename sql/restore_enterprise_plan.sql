-- Restore Enterprise Plan for PT Sumber Sukses Selaras
-- This script manually assigns the Enterprise plan to the company.
-- Useful if the subscription was lost during deduplication.

-- 1. Remove any existing (potentially broken/free) subscriptions for this company
DELETE FROM subscriptions 
WHERE company_id IN (
    SELECT id FROM companies WHERE name = 'PT Sumber Sukses Selaras'
);

-- 2. Insert a fresh Enterprise subscription
INSERT INTO subscriptions (
    company_id, 
    plan, 
    status, 
    current_period_start, 
    current_period_end,
    created_at,
    updated_at
)
SELECT 
    id, 
    'enterprise', 
    'active', 
    NOW(), 
    NOW() + INTERVAL '1 year',
    NOW(),
    NOW()
FROM companies
WHERE name = 'PT Sumber Sukses Selaras'
LIMIT 1;

-- 3. Verify
SELECT c.name, s.plan, s.status 
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id
WHERE c.name = 'PT Sumber Sukses Selaras';
