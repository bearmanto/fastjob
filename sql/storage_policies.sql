-- Note: storage.objects usually has RLS enabled by default. 
-- We will skip 'alter table' to avoid permission errors.

-- 1. DROP (Clean slate if you had partial success or existing policies)
drop policy if exists "Users can upload own resume" on storage.objects;
drop policy if exists "Users can update own resume" on storage.objects;
drop policy if exists "Users can read own resume" on storage.objects;
drop policy if exists "Hirers can read all resumes" on storage.objects;

-- 2. CREATE POLICIES

-- Policy: Users can upload their own resume (INSERT)
-- Path must start with their User ID: 'uid/filename.pdf'
create policy "Users can upload own resume"
on storage.objects for insert
with check (
  bucket_id = 'resumes' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own resume (UPDATE)
create policy "Users can update own resume"
on storage.objects for update
using (
  bucket_id = 'resumes' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own resume (SELECT)
create policy "Users can read own resume"
on storage.objects for select
using (
  bucket_id = 'resumes' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Hirers can read all resumes (SELECT)
create policy "Hirers can read all resumes"
on storage.objects for select
using (
  bucket_id = 'resumes' and
  auth.role() = 'authenticated' and
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'hirer'
  )
);
