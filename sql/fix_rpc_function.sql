-- FIX RPC FUNCTION
-- The previous version failed because it tried to select 'id' from subscriptions table,
-- but that table uses 'company_id' as the primary key.

DROP FUNCTION IF EXISTS get_subscription_v2(UUID);

CREATE OR REPLACE FUNCTION get_subscription_v2(p_company_id UUID)
RETURNS TABLE (
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

-- Grant permissions again just in case
GRANT EXECUTE ON FUNCTION get_subscription_v2(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_v2(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_subscription_v2(UUID) TO service_role;
