-- 1. Add is_admin column to profiles
alter table public.profiles
add column if not exists is_admin boolean default false;

-- 2. Admin Policies for Companies
-- Admins can view all companies
create policy "Admins can view all companies"
on companies for select
using ( 
  exists (
    select 1 from profiles
    where id = auth.uid()
    and is_admin = true
  )
);

-- Admins can update all companies (to verify them)
create policy "Admins can update all companies"
on companies for update
using ( 
  exists (
    select 1 from profiles
    where id = auth.uid()
    and is_admin = true
  )
);

-- 3. Admin Policies for Storage (to view uploaded docs)
-- Admins can read company_documents
create policy "Admins can read company docs"
on storage.objects for select
using (
    bucket_id = 'company_documents'
    and exists (
        select 1 from profiles
        where id = auth.uid()
        and is_admin = true
    )
);

-- 4. Admin Policies for Jobs (Moderation)
-- Admins can update/delete jobs
create policy "Admins can update jobs"
on jobs for update
using ( 
  exists (
    select 1 from profiles
    where id = auth.uid()
    and is_admin = true
  )
);

create policy "Admins can delete jobs"
on jobs for delete
using ( 
  exists (
    select 1 from profiles
    where id = auth.uid()
    and is_admin = true
  )
);
