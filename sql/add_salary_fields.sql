-- Add salary_currency and salary_period to jobs table

ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS salary_period TEXT DEFAULT 'monthly' CHECK (salary_period IN ('monthly', 'annual', 'hourly', 'weekly'));

-- Update existing jobs to have default values if they are null (though default handles new ones, existing rows might need backfill if nullable, but adding column with default backfills automatically in Postgres 11+)
-- Just to be safe and explicit for logic:
UPDATE public.jobs SET salary_currency = 'IDR' WHERE salary_currency = 'USD' AND created_at < NOW(); 
-- Wait, actually, if I set default to USD, all existing rows will get USD. 
-- But existing jobs in this system are likely IDR based on previous context ("IDR 25mn").
-- So I should probably set the default to 'IDR' for *existing* rows? 
-- Or better, I add the column with default 'USD', but then update old records to 'IDR'.
-- Actually, the best approach for this specific project state (where we have IDR jobs) is:

-- 1. Add columns with a safe default for NEW records (or maybe just nullable first)
-- Let's stick to the plan: Default USD is the goal, but we need to respect existing data which is IDR.

ALTER TABLE public.jobs 
    ALTER COLUMN salary_currency SET DEFAULT 'USD';

-- Backfill existing data to IDR since they were all IDR before
UPDATE public.jobs 
SET salary_currency = 'IDR' 
WHERE salary_currency = 'USD'; -- This catches the ones just backfilled by the default if any, wait.

-- Postgres ADD COLUMN with DEFAULT fills existing rows. 
-- So if I run the first command, all rows get 'USD'. 
-- Then I should update them to 'IDR'.

/*
    Refined migration:
*/

-- 1. Add columns
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS salary_period TEXT DEFAULT 'monthly' CHECK (salary_period IN ('monthly', 'annual', 'hourly', 'weekly'));

-- 2. Fix existing data (All previous jobs were IDR monthly)
UPDATE public.jobs 
SET salary_currency = 'IDR', salary_period = 'monthly'
WHERE id IN (SELECT id FROM public.jobs); 
-- logic: Update ALL existing rows to IDR/monthly because that was the hardcoded assumption. 
-- New rows will default to USD/monthly from schema default, but we will override in code.

-- 3. Create index for filtering (optional but good)
CREATE INDEX IF NOT EXISTS idx_jobs_salary_currency ON public.jobs(salary_currency);
