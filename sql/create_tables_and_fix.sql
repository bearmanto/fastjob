-- CONSOLIDATED FIX SCRIPT
-- Run this in the SQL Editor for Project: zcacqexycsfcbtxkgepp

-- 1. Ensure Tables Exist
CREATE TABLE IF NOT EXISTS public.subscriptions (
    company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    plan text NOT NULL DEFAULT 'free',
    status text NOT NULL DEFAULT 'incomplete',
    stripe_customer_id text,
    stripe_subscription_id text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.credit_balances (
    company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    job_post_credits integer NOT NULL DEFAULT 0,
    talent_search_credits integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    credit_type text NOT NULL,
    amount integer NOT NULL,
    reason text,
    stripe_payment_intent_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 3. Create RPC Function (v2)
CREATE OR REPLACE FUNCTION get_subscription_v2(p_company_id UUID)
RETURNS TABLE (
    id UUID,
    company_id UUID,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT,
    status TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id, -- Use explicit alias to avoid ambiguity
        s.company_id,
        s.stripe_customer_id,
        s.stripe_subscription_id,
        s.plan,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.created_at,
        s.updated_at
    FROM subscriptions s
    WHERE s.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_subscription_v2(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_v2(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_subscription_v2(UUID) TO service_role;

-- 4. Grant Table Permissions
GRANT ALL ON public.subscriptions TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT SELECT ON public.subscriptions TO anon;

GRANT ALL ON public.credit_balances TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_balances TO authenticated;
GRANT SELECT ON public.credit_balances TO anon;

GRANT ALL ON public.credit_transactions TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_transactions TO authenticated;
GRANT SELECT ON public.credit_transactions TO anon;

-- 5. Universal Data Fix (Finds ANY matching company name and updates it)
DO $$
DECLARE 
    company_record RECORD;
BEGIN
    FOR company_record IN 
        SELECT id, name FROM companies WHERE name ILIKE '%Sumber Sukses%'
    LOOP
        RAISE NOTICE 'Fixing Company: % (ID: %)', company_record.name, company_record.id;

        -- Upsert Subscription
        INSERT INTO subscriptions (company_id, plan, status, created_at, updated_at)
        VALUES (company_record.id, 'enterprise', 'active', NOW(), NOW())
        ON CONFLICT (company_id) 
        DO UPDATE SET plan = 'enterprise', status = 'active', updated_at = NOW();

        -- Upsert Credits
        INSERT INTO credit_balances (company_id, job_post_credits, talent_search_credits, updated_at)
        VALUES (company_record.id, 5, 5, NOW())
        ON CONFLICT (company_id) 
        DO UPDATE SET job_post_credits = 5, talent_search_credits = 5, updated_at = NOW();
    END LOOP;
END $$;
