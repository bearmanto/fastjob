-- DEBUG: Check what's in the subscription tables

-- 1. Check subscriptions table
SELECT 'subscriptions' as table_name, count(*) FROM subscriptions;

-- 2. Check credit_balances table  
SELECT 'credit_balances' as table_name, count(*) FROM credit_balances;

-- 3. Show all subscriptions
SELECT * FROM subscriptions;

-- 4. Show all credit_balances
SELECT * FROM credit_balances;

-- 5. Get company ID to use
SELECT id, name FROM companies WHERE name = 'PT Sumber Sukses Selaras';

-- 6. If empty, INSERT the subscription now
INSERT INTO subscriptions (company_id, plan, status, created_at, updated_at)
VALUES ('248f8a51-fc8e-4894-a454-8c1f657e8caf', 'enterprise', 'active', NOW(), NOW())
ON CONFLICT (company_id) DO UPDATE SET plan = 'enterprise', status = 'active';

-- 7. INSERT credits
INSERT INTO credit_balances (company_id, job_post_credits, talent_search_credits)
VALUES ('248f8a51-fc8e-4894-a454-8c1f657e8caf', 5, 5)
ON CONFLICT (company_id) DO UPDATE SET job_post_credits = 5, talent_search_credits = 5;

-- 8. Verify with RPC function
SELECT * FROM get_company_subscription('248f8a51-fc8e-4894-a454-8c1f657e8caf');
