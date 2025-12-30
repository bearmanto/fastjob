-- FULL DEBUG: Check the actual state

-- 1. List all companies
SELECT id, name, owner_id FROM companies;

-- 2. Count companies
SELECT count(*) as company_count FROM companies;

-- 3. Check if subscriptions table exists with its schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
