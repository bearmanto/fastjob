-- Deduplicate Companies Table
-- Keeps the most recently created company for each owner_id and deletes the others.
-- Fixes "Cannot coerce result to single JSON object" error.

WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY owner_id ORDER BY created_at DESC) as rn
  FROM companies
)
DELETE FROM companies
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);
