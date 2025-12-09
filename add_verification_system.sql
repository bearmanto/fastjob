-- 1. Add Verification Columns to Companies
alter table public.companies
add column if not exists verification_status text default 'unverified' check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
add column if not exists npwp_number text,
add column if not exists npwp_url text, -- Path to storage
add column if not exists business_doc_type text,
add column if not exists business_doc_url text, -- Path to storage
add column if not exists rejection_reason text;

-- 2. Create Storage Bucket for Company Documents (if not exists)
insert into storage.buckets (id, name, public)
values ('company_documents', 'company_documents', false)
on conflict (id) do nothing;

-- 3. Storage Policies for Company Documents
-- Allow authenticated users (hirers) to upload their own docs
create policy "Hirers can upload verification docs"
on storage.objects for insert
with check (
    bucket_id = 'company_documents' 
    and auth.uid() = (storage.foldername(name))[1]::uuid -- Structure: user_id/filename
);

create policy "Hirers can read their own docs"
on storage.objects for select
using (
    bucket_id = 'company_documents' 
    and auth.uid() = (storage.foldername(name))[1]::uuid
);

create policy "Hirers can update their own docs"
on storage.objects for update
using (
    bucket_id = 'company_documents' 
    and auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 4. Update JOB INSERT Policy to require Verification
-- Drop existing policy first to be safe
drop policy if exists "Company owners can insert jobs." on public.jobs;

create policy "Verified company owners can insert jobs."
  on jobs for insert
  with check ( 
    exists (
      select 1 from companies 
      where id = jobs.company_id 
      and owner_id = auth.uid()
      and verified = true -- CRITICAL: Must be verified
    ) 
  );
