-- Cleanup Duplicate Records across tables
-- This fixes the "Cannot coerce result to single JSON object" error
-- Run this in the Supabase SQL Editor

-- 1. Deduplicate Subscriptions (Using ctid internal ID as explicit 'id' column may be missing)
WITH duplicate_subs AS (
  SELECT ctid,
         ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY created_at DESC) as rn
  FROM subscriptions
)
DELETE FROM subscriptions
WHERE ctid IN (
  SELECT ctid FROM duplicate_subs WHERE rn > 1
);

-- 2. Deduplicate Credit Balances (Using ctid)
WITH duplicate_credits AS (
  SELECT ctid,
         ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY updated_at DESC) as rn
  FROM credit_balances
)
DELETE FROM credit_balances
WHERE ctid IN (
  SELECT ctid FROM duplicate_credits WHERE rn > 1
);

-- 3. (Optional) Re-run Company Deduplication just in case
WITH duplicate_companies AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY owner_id ORDER BY created_at DESC) as rn
  FROM companies
)
DELETE FROM companies
WHERE id IN (
  SELECT id FROM duplicate_companies WHERE rn > 1
);
