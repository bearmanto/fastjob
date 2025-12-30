-- Stripe Subscription Integration Schema
-- Run this migration on Supabase

-- Subscriptions table
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

-- Credit balances table
CREATE TABLE IF NOT EXISTS credit_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
    job_post_credits INT DEFAULT 5, -- 5 free on verification
    talent_search_credits INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions (audit log)
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    credit_type TEXT CHECK (credit_type IN ('job_post', 'talent_search')) NOT NULL,
    amount INT NOT NULL, -- positive = add, negative = use
    reason TEXT, -- 'purchase', 'monthly_grant', 'used', 'refund'
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_company ON credit_balances(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_company ON credit_transactions(company_id);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Company owners can view their own subscription
CREATE POLICY "Company owners can view own subscription"
    ON subscriptions FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Company owners can view their own credit balance
CREATE POLICY "Company owners can view own credits"
    ON credit_balances FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Company owners can view their own transactions
CREATE POLICY "Company owners can view own transactions"
    ON credit_transactions FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Service role can manage all (for webhooks)
-- Note: Service role bypasses RLS by default

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
CREATE OR REPLACE TRIGGER on_company_verified
    AFTER UPDATE OF verification_status ON companies
    FOR EACH ROW
    WHEN (NEW.verification_status = 'verified' AND OLD.verification_status != 'verified')
    EXECUTE FUNCTION initialize_company_credits();

-- Also initialize when company is first created (in case already verified)
CREATE OR REPLACE TRIGGER on_company_created
    AFTER INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION initialize_company_credits();
