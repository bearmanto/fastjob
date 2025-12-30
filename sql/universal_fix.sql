-- UNIVERSAL FIX SCRIPT
-- This script finds ALL companies with the name "PT Sumber Sukses Selaras"
-- and forces them to have the Enterprise plan and credits.
-- This handles the case where duplicate companies exist with different IDs.

DO $$
DECLARE 
    company_record RECORD;
BEGIN
    -- Loop through ANY company matching the name
    FOR company_record IN 
        SELECT id, name FROM companies WHERE name = 'PT Sumber Sukses Selaras'
    LOOP
        RAISE NOTICE 'Fixing Company: % (ID: %)', company_record.name, company_record.id;

        -- 1. Upsert Subscription
        INSERT INTO subscriptions (company_id, plan, status, created_at, updated_at)
        VALUES (company_record.id, 'enterprise', 'active', NOW(), NOW())
        ON CONFLICT (company_id) 
        DO UPDATE SET 
            plan = 'enterprise', 
            status = 'active', 
            updated_at = NOW();

        -- 2. Upsert Credit Balance
        INSERT INTO credit_balances (company_id, job_post_credits, talent_search_credits, updated_at)
        VALUES (company_record.id, 5, 5, NOW())
        ON CONFLICT (company_id) 
        DO UPDATE SET 
            job_post_credits = 5, 
            talent_search_credits = 5, 
            updated_at = NOW();
            
    END LOOP;
END $$;
