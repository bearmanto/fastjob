-- CREATE RPC FUNCTION TO BYPASS SCHEMA CACHE
-- This function can be called via supabase.rpc() and doesn't need schema cache

CREATE OR REPLACE FUNCTION get_company_subscription(p_company_id UUID)
RETURNS TABLE (
    plan TEXT,
    status TEXT,
    job_post_credits INT,
    talent_search_credits INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.plan,
        s.status,
        cb.job_post_credits,
        cb.talent_search_credits
    FROM subscriptions s
    LEFT JOIN credit_balances cb ON cb.company_id = s.company_id
    WHERE s.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_company_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_company_subscription(UUID) TO anon;

-- Test it
SELECT * FROM get_company_subscription('248f8a51-fc8e-4894-a454-8c1f657e8caf');
