-- Create RPC function to get credit balance (bypasses RLS issues)
DROP FUNCTION IF EXISTS get_credit_balance(UUID);

CREATE OR REPLACE FUNCTION get_credit_balance(p_company_id UUID)
RETURNS TABLE (
    company_id UUID,
    job_post_credits INTEGER,
    talent_search_credits INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.company_id,
        c.job_post_credits,
        c.talent_search_credits
    FROM credit_balances c
    WHERE c.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_credit_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_credit_balance(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_credit_balance(UUID) TO service_role;
