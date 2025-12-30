-- Check company and subscription for specific email
SELECT 
    u.email,
    c.id as company_id,
    c.name as company_name,
    c.verification_status,
    s.plan,
    s.status as subscription_status,
    cb.job_post_credits,
    cb.talent_search_credits
FROM auth.users u
JOIN companies c ON c.owner_id = u.id
LEFT JOIN subscriptions s ON s.company_id = c.id
LEFT JOIN credit_balances cb ON cb.company_id = c.id
WHERE u.email = 'bennyalternative@gmail.com';
