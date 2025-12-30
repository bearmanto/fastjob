-- COMPLETE STRIPE TABLES FIX
-- This script handles all edge cases
-- Run this in Supabase SQL Editor

-- 1. Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Company owners can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Company owners can view own credits" ON credit_balances;
DROP POLICY IF EXISTS "Company owners can view own transactions" ON credit_transactions;

-- 2. Drop existing triggers
DROP TRIGGER IF EXISTS on_company_verified ON companies;
DROP TRIGGER IF EXISTS on_company_created ON companies;
DROP FUNCTION IF EXISTS initialize_company_credits();

-- 3. Create tables (if not exist)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT CHECK (plan IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
    job_post_credits INT DEFAULT 5,
    talent_search_credits INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    credit_type TEXT CHECK (credit_type IN ('job_post', 'talent_search')) NOT NULL,
    amount INT NOT NULL,
    reason TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_company ON credit_balances(company_id);

-- 5. Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Company owners can view own subscription"
    ON subscriptions FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Company owners can view own credits"
    ON credit_balances FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Company owners can view own transactions"
    ON credit_transactions FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- 7. Insert Enterprise subscription for PT Sumber Sukses Selaras
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
DO UPDATE SET plan = 'enterprise', status = 'active', updated_at = NOW();

-- 8. Insert credits
INSERT INTO credit_balances (company_id, job_post_credits, talent_search_credits)
SELECT 
    id,
    5,
    5
FROM companies
WHERE name = 'PT Sumber Sukses Selaras'
ON CONFLICT (company_id) 
DO UPDATE SET job_post_credits = 5, talent_search_credits = 5, updated_at = NOW();

-- 9. Verify
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
