-- MINIMAL TABLE CREATION - No policies, just tables
-- Run this FIRST in Supabase SQL Editor

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create credit_balances table
CREATE TABLE IF NOT EXISTS public.credit_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
    job_post_credits INT DEFAULT 5,
    talent_search_credits INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    credit_type TEXT NOT NULL,
    amount INT NOT NULL,
    reason TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Enterprise subscription
INSERT INTO subscriptions (company_id, plan, status)
SELECT id, 'enterprise', 'active'
FROM companies WHERE name = 'PT Sumber Sukses Selaras'
ON CONFLICT (company_id) DO UPDATE SET plan = 'enterprise', status = 'active';

-- Insert credits
INSERT INTO credit_balances (company_id, job_post_credits, talent_search_credits)
SELECT id, 5, 5
FROM companies WHERE name = 'PT Sumber Sukses Selaras'
ON CONFLICT (company_id) DO UPDATE SET job_post_credits = 5, talent_search_credits = 5;

-- Verify
SELECT 'DONE - Check billing page now!' as message;
