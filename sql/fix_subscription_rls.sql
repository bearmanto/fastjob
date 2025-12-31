-- Fix RLS for Subscriptions
-- The user is getting [] from the query, meaning RLS is hiding the row.

-- 1. Enable RLS (just in case)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing reading policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own company subscription" ON subscriptions;
DROP POLICY IF EXISTS "Public can view subscriptions" ON subscriptions;

-- 3. Create correct policy
-- Users can see subscriptions where the company belongs to them (owner_id matches auth.uid())
CREATE POLICY "Users can view their own company subscription"
ON subscriptions
FOR SELECT
USING (
  company_id IN (
    SELECT id FROM companies 
    WHERE owner_id = auth.uid()
  )
);

-- 4. Grant access to authenticated users
GRANT SELECT ON subscriptions TO authenticated;
