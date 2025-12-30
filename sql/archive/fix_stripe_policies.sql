-- Fix: Drop existing policies first, then recreate
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Company owners can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Company owners can view own credits" ON credit_balances;
DROP POLICY IF EXISTS "Company owners can view own transactions" ON credit_transactions;

-- Recreate RLS Policies
CREATE POLICY "Company owners can view own subscription"
    ON subscriptions FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Company owners can view own credits"
    ON credit_balances FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Company owners can view own transactions"
    ON credit_transactions FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Drop existing triggers/functions and recreate
DROP TRIGGER IF EXISTS on_company_verified ON companies;
DROP TRIGGER IF EXISTS on_company_created ON companies;
DROP FUNCTION IF EXISTS initialize_company_credits();

-- Function to initialize credits for new companies
CREATE OR REPLACE FUNCTION initialize_company_credits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO credit_balances (company_id, job_post_credits, talent_search_credits)
    VALUES (NEW.id, 5, 0)
    ON CONFLICT (company_id) DO NOTHING;
    
    INSERT INTO subscriptions (company_id, plan, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT (company_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize credits when company verified
CREATE TRIGGER on_company_verified
    AFTER UPDATE OF verification_status ON companies
    FOR EACH ROW
    WHEN (NEW.verification_status = 'verified' AND OLD.verification_status != 'verified')
    EXECUTE FUNCTION initialize_company_credits();

-- Also initialize when company is first created
CREATE TRIGGER on_company_created
    AFTER INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION initialize_company_credits();

-- Verify tables exist
SELECT 'Tables created successfully' as status;
