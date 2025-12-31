-- Add Company Size and Founded Year columns
-- Enhances company profile with better data points for candidates

BEGIN;

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS founded_year INTEGER;

COMMENT ON COLUMN companies.company_size IS 'Range of employees (e.g., 1-10, 11-50)';
COMMENT ON COLUMN companies.founded_year IS 'Year the company was established';

COMMIT;
