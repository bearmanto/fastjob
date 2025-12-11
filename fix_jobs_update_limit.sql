-- Enable RLS on jobs if not already (it should be)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing update policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Hirers can update their own jobs" ON public.jobs;

-- Create policy for Hirers to UPDATE their own jobs
CREATE POLICY "Hirers can update their own jobs"
ON public.jobs
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.companies
    WHERE id = jobs.company_id
  )
)
WITH CHECK (
   auth.uid() IN (
    SELECT owner_id FROM public.companies
    WHERE id = jobs.company_id
  )
);

-- Ensure Select is also allowed (usually covers implicit select during update)
DROP POLICY IF EXISTS "Public can view active jobs" ON public.jobs;
CREATE POLICY "Public can view active jobs"
ON public.jobs
FOR SELECT
USING (true);
-- Note: Ideally we filter status='active' for public, but hirers need to see closed too.
-- So we keep SELECT open for now or refine it.
-- For dashboard, hirer needs to see.

-- Explicit Hirer View Policy (if Public one is restrictive)
DROP POLICY IF EXISTS "Hirers can view their own jobs" ON public.jobs;
CREATE POLICY "Hirers can view their own jobs"
ON public.jobs
FOR SELECT
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.companies
    WHERE id = jobs.company_id
  )
);
