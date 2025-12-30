-- UPGRADED RPC FUNCTION
-- Returns full subscription row to satisfy frontend interfaces matches types exactly

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
        s.id,
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_subscription_v2(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_v2(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_subscription_v2(UUID) TO service_role;
