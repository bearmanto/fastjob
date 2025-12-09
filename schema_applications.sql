-- APPLICATIONS Table
-- Connects a Job Seeker (Profile) to a Job.

create table public.applications (
    id uuid default gen_random_uuid() primary key,
    job_id uuid references public.jobs(id) on delete cascade not null,
    applicant_id uuid references public.profiles(id) on delete cascade not null,
    status text default 'new' check (status in ('new', 'reviewed', 'interview', 'offer', 'rejected', 'hired')),
    cover_note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(job_id, applicant_id) -- Prevent duplicate applications
);

-- Enable RLS
alter table public.applications enable row level security;

-- Policies

-- 1. Applicant can create an application
create policy "Seekers can apply"
  on applications for insert
  with check ( auth.uid() = applicant_id );

-- 2. Applicant can view their own applications
create policy "Seekers can view own applications"
  on applications for select
  using ( auth.uid() = applicant_id );

-- 3. Hirer can view applications for their jobs
create policy "Hirers can view applications for their jobs"
  on applications for select
  using (
    exists (
      select 1 from public.jobs
      join public.companies on jobs.company_id = companies.id
      where jobs.id = applications.job_id
      and companies.owner_id = auth.uid()
    )
  );

-- 4. Hirer can update status of applications for their jobs
create policy "Hirers can update application status"
  on applications for update
  using (
    exists (
      select 1 from public.jobs
      join public.companies on jobs.company_id = companies.id
      where jobs.id = applications.job_id
      and companies.owner_id = auth.uid()
    )
  );
