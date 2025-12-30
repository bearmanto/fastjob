-- VERIFY SUBSCRIPTION DATA
-- Check if the subscription actually exists for the specific company

SELECT 
    c.name, 
    c.id as company_id, 
    s.id as subscription_id, 
    s.plan, 
    s.status,
    cb.job_post_credits
FROM companies c
LEFT JOIN subscriptions s ON s.company_id = c.id
LEFT JOIN credit_balances cb ON cb.company_id = c.id
WHERE c.name = 'PT Sumber Sukses Selaras';
