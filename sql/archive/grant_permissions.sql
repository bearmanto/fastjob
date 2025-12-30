-- GRANT PERMISSIONS FOR POSTGREST
-- This is required for the Supabase API to see and query the tables

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to subscriptions table
GRANT ALL ON public.subscriptions TO anon, authenticated;
GRANT ALL ON public.subscriptions TO service_role;

-- Grant access to credit_balances table  
GRANT ALL ON public.credit_balances TO anon, authenticated;
GRANT ALL ON public.credit_balances TO service_role;

-- Grant access to credit_transactions table
GRANT ALL ON public.credit_transactions TO anon, authenticated;
GRANT ALL ON public.credit_transactions TO service_role;

-- Verify permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name IN ('subscriptions', 'credit_balances', 'credit_transactions')
ORDER BY table_name, grantee;
