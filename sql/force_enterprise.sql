-- FORCE update to Enterprise Plan
-- This script deletes ALL logic/records regarding subscription for this company and inserts a fresh one.
-- It ensures that even if 'created_at' sorting was weird, there is only ONE record.

-- 1. Get Company ID
DO $$
DECLARE
    target_company_id uuid;
BEGIN
    SELECT id INTO target_company_id FROM companies WHERE name = 'PT Sumber Sukses Selaras';

    IF target_company_id IS NULL THEN
        RAISE NOTICE 'Company not found!';
        RETURN;
    END IF;

    -- 2. Delete ALL existing subscriptions
    DELETE FROM subscriptions WHERE company_id = target_company_id;

    -- 3. Insert specific Enterprise plan
    INSERT INTO subscriptions (
        company_id,
        plan,
        status,
        current_period_start,
        current_period_end,
        created_at,
        updated_at
    ) VALUES (
        target_company_id,
        'enterprise',
        'active', -- lowercase 'active'
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Enterprise plan forced for company %', target_company_id;
END $$;
