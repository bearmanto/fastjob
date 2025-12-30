-- FASTJOB PRODUCTION SCHEMA
-- Consolidated Migration Script
-- Run this in the Supabase SQL Editor for the new Production Project

-- ==========================================
-- 1. CORE TABLES (Profiles, Companies, Jobs)
-- ==========================================

-- 1.1 PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('seeker', 'hirer')),
  headline text,
  summary text,
  skills text[],
  resume_url text,
  phone text,
  linkedin text,
  willing_to_relocate boolean default false,
  preferred_countries text[] default '{}',
  country_code text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- 1.2 COMPANIES
create table public.companies (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    location text,
    website text,
    description text,
    industry text,
    country_code text default 'ID',
    verified boolean default false,
    verification_status text default 'unverified' check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
    npwp_number text,
    npwp_url text,
    business_doc_type text,
    business_doc_url text,
    rejection_reason text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.companies enable row level security;

-- 1.3 JOBS
create table public.jobs (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references public.companies(id) on delete cascade not null,
    title text not null,
    category_slug text not null,
    location text,
    country_code text default 'ID',
    is_remote boolean default false,
    
    -- Salary
    salary_min numeric,
    salary_max numeric,
    salary_currency text default 'USD',
    salary_period text default 'monthly' check (salary_period in ('monthly', 'annual', 'hourly', 'weekly')),
    
    -- Details
    description text,
    requirements text,
    description_snippet text,
    job_type text check (job_type in ('full_time', 'part_time', 'contract', 'internship', 'daily')),
    workplace_type text check (workplace_type in ('on_site', 'hybrid', 'remote')),
    skills text[],
    benefits text[],
    
    -- Visa/Eligibility
    visa_sponsorship boolean default false,
    accepts_worldwide boolean default false,
    
    -- Lifecycle
    status text default 'active' check (status in ('active', 'closed', 'draft')),
    closes_at timestamp with time zone,
    closed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.jobs enable row level security;

-- Indexes
create index if not exists idx_jobs_country on public.jobs(country_code);
create index if not exists idx_companies_country on public.companies(country_code);
create index if not exists idx_jobs_salary_currency on public.jobs(salary_currency);
create index if not exists idx_jobs_visa on public.jobs(visa_sponsorship) where visa_sponsorship = true;
create index if not exists idx_jobs_worldwide on public.jobs(accepts_worldwide) where accepts_worldwide = true;
create index if not exists idx_profiles_relocate on public.profiles(willing_to_relocate) where willing_to_relocate = true;
create index if not exists idx_jobs_created_at_status on public.jobs(created_at, status);


-- ==========================================
-- 2. FEATURE TABLES
-- ==========================================

-- 2.1 EXPERIENCE & EDUCATION
create table if not exists public.profile_experience (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    company text not null,
    location text,
    start_date date,
    end_date date,
    is_current boolean default false,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profile_experience enable row level security;

create table if not exists public.profile_education (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    school text not null,
    degree text,
    field_of_study text,
    start_date date,
    end_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profile_education enable row level security;

-- 2.2 APPLICATIONS
create table public.applications (
    id uuid default gen_random_uuid() primary key,
    job_id uuid references public.jobs(id) on delete cascade not null,
    applicant_id uuid references public.profiles(id) on delete cascade not null,
    status text default 'new' check (status in ('new', 'reviewed', 'interview', 'offer', 'rejected', 'hired')),
    cover_note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(job_id, applicant_id)
);
alter table public.applications enable row level security;

-- 2.3 INTERVIEWS
create table if not exists public.interviews (
    id uuid default gen_random_uuid() primary key,
    application_id uuid references public.applications(id) on delete cascade not null,
    company_id uuid references public.companies(id) on delete cascade not null, -- Denormalized for RLS ease
    scheduled_at timestamp with time zone not null,
    location text, -- 'Google Meet' or physical address
    link text,
    notes text,
    status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.interviews enable row level security;

-- 2.4 SAVED JOBS
create table if not exists public.saved_jobs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    job_id uuid references public.jobs(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, job_id)
);
alter table public.saved_jobs enable row level security;
create index idx_saved_jobs_user_id on public.saved_jobs(user_id);

-- 2.5 COMPANY MEMBERS (Team)
create table if not exists public.company_members (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references public.companies(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role text check (role in ('admin', 'recruiter', 'viewer')) default 'recruiter',
    invited_by uuid references public.profiles(id),
    invited_at timestamptz default now(),
    accepted_at timestamptz,
    unique(company_id, user_id)
);
alter table public.company_members enable row level security;
create index if not exists idx_company_members_company on public.company_members(company_id);
create index if not exists idx_company_members_user on public.company_members(user_id);

-- 2.6 JOB ANALYTICS
create table if not exists public.job_views (
    id uuid primary key default gen_random_uuid(),
    job_id uuid references public.jobs(id) on delete cascade not null,
    viewed_at timestamptz default now(),
    source text default 'direct'
);
create table if not exists public.job_analytics_daily (
    id uuid primary key default gen_random_uuid(),
    job_id uuid references public.jobs(id) on delete cascade not null,
    date date not null,
    views int default 0,
    unique_views int default 0,
    unique(job_id, date)
);
alter table public.job_views enable row level security;
alter table public.job_analytics_daily enable row level security;
create index if not exists idx_job_views_job_id on public.job_views(job_id);
create index if not exists idx_job_analytics_job_date on public.job_analytics_daily(job_id, date);

-- 2.7 JOB ALERTS
create table if not exists public.job_alert_preferences (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    keywords text[],
    locations text[],
    categories text[],
    job_types text[],
    workplace_types text[],
    salary_min numeric,
    frequency text default 'daily' check (frequency in ('daily', 'weekly', 'instant', 'off')),
    last_sent_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
create table if not exists public.job_alert_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    job_id uuid references public.jobs(id) on delete cascade not null,
    sent_at timestamp with time zone default now(),
    unique(user_id, job_id)
);
alter table public.job_alert_preferences enable row level security;
alter table public.job_alert_history enable row level security;


-- ==========================================
-- 3. FUNCTIONS & TRIGGERS
-- ==========================================

-- 3.1 Handle New User
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'seeker')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

-- 3.2 Sync Profile Deletion
create or replace function public.delete_user_on_profile_delete()
returns trigger language plpgsql security definer
as $$
begin
  delete from auth.users where id = old.id;
  return old;
end;
$$;

create trigger on_profile_delete
  after delete on public.profiles for each row execute procedure public.delete_user_on_profile_delete();

-- 3.3 Add Company Owner as Admin
create or replace function public.add_owner_as_admin()
returns trigger language plpgsql security definer
as $$
begin
    insert into public.company_members (company_id, user_id, role, accepted_at)
    values (new.id, new.owner_id, 'admin', now())
    on conflict (company_id, user_id) do nothing;
    return new;
end;
$$;

create trigger on_company_created_add_owner
    after insert on public.companies for each row execute function public.add_owner_as_admin();

-- 3.4 Match Jobs for Alerts
create or replace function public.match_jobs_for_alerts(
    p_user_id uuid,
    p_since timestamp with time zone default now() - interval '1 day'
)
returns table (
    job_id uuid,
    title text,
    company_name text,
    location text,
    salary_min numeric,
    salary_max numeric,
    match_score int
)
language plpgsql security definer
as $$
declare
    prefs record;
begin
    select * into prefs from public.job_alert_preferences where user_id = p_user_id;
    if not found then return; end if;
    
    return query
    select 
        j.id as job_id,
        j.title,
        c.name as company_name,
        j.location,
        j.salary_min,
        j.salary_max,
        (
            case when prefs.locations is not null and j.location = any(prefs.locations) then 25 else 0 end +
            case when prefs.categories is not null and j.category_slug = any(prefs.categories) then 25 else 0 end +
            case when prefs.job_types is not null and j.job_type = any(prefs.job_types) then 20 else 0 end +
            case when prefs.workplace_types is not null and j.workplace_type = any(prefs.workplace_types) then 15 else 0 end +
            case when j.salary_min >= coalesce(prefs.salary_min, 0) then 15 else 0 end
        )::int as match_score
    from public.jobs j
    join public.companies c on j.company_id = c.id
    where j.status = 'active'
      and j.created_at > p_since
      and not exists (select 1 from public.job_alert_history h where h.user_id = p_user_id and h.job_id = j.id)
      and (
          (prefs.locations is null or j.location = any(prefs.locations)) or
          (prefs.categories is null or j.category_slug = any(prefs.categories)) or
          (prefs.job_types is null or j.job_type = any(prefs.job_types)) or
          (prefs.workplace_types is null or j.workplace_type = any(prefs.workplace_types))
      )
    order by match_score desc
    limit 10;
end;
$$;
grant execute on function public.match_jobs_for_alerts to authenticated;
grant execute on function public.match_jobs_for_alerts to service_role;


-- ==========================================
-- 4. RLS POLICIES (Simplified)
-- ==========================================

-- PROFILES
create policy "Public profiles viewable" on profiles for select using (true);
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);

-- EXPERIENCE / EDUCATION
create policy "Users manage own exp" on profile_experience for all using (auth.uid() = profile_id);
create policy "Users manage own edu" on profile_education for all using (auth.uid() = profile_id);

-- COMPANIES
create policy "Companies viewable" on companies for select using (true);
create policy "Owners manage companies" on companies for all using (auth.uid() = owner_id);
create policy "Admins view all companies" on companies for select using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins update all companies" on companies for update using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- JOBS
create policy "Active jobs viewable" on jobs for select using (status = 'active');
-- Note: Insert policy requires verified company, handled below
create policy "Verified company owners insert jobs" on jobs for insert with check (
    exists (select 1 from companies where id = jobs.company_id and owner_id = auth.uid() and verified = true)
);
create policy "Company owners update jobs" on jobs for update using (
    exists (select 1 from companies where id = jobs.company_id and owner_id = auth.uid())
);
create policy "Admins manage jobs" on jobs for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- APPLICATIONS
create policy "Seekers apply" on applications for insert with check (auth.uid() = applicant_id);
create policy "Seekers view own" on applications for select using (auth.uid() = applicant_id);
create policy "Hirers view applications" on applications for select using (
    exists (select 1 from jobs join companies on jobs.company_id = companies.id where jobs.id = applications.job_id and companies.owner_id = auth.uid())
);
create policy "Hirers update applications" on applications for update using (
    exists (select 1 from jobs join companies on jobs.company_id = companies.id where jobs.id = applications.job_id and companies.owner_id = auth.uid())
);

-- SAVED JOBS
create policy "Users manage saved jobs" on saved_jobs for all using (auth.uid() = user_id);

-- COMPANY MEMBERS
create policy "Members view team" on company_members for select using (
    user_id = auth.uid() or company_id in (select id from companies where owner_id = auth.uid()) or company_id in (select company_id from company_members where user_id = auth.uid())
);
create policy "Admins manage team" on company_members for all using (
    exists (select 1 from companies where id = company_members.company_id and owner_id = auth.uid()) or
    exists (select 1 from company_members cm where cm.company_id = company_members.company_id and cm.user_id = auth.uid() and cm.role = 'admin')
);

-- INTERVIEWS (Basic)
create policy "Participants view interviews" on public.interviews for select using (
    exists (select 1 from applications a where a.id = interviews.application_id and a.applicant_id = auth.uid()) or
    exists (select 1 from companies c where c.id = interviews.company_id and c.owner_id = auth.uid())
);

-- ANALYTICS & ALERTS
-- (Policies maintained from individual files, simplified here for brevity)
create policy "Users manage alerts" on job_alert_preferences for all using (auth.uid() = user_id);
create policy "Users view alert history" on job_alert_history for select using (auth.uid() = user_id);
grant all on job_views to authenticated, anon;


-- ==========================================
-- 5. STORAGE BUCKETS
-- ==========================================
-- Run this block only if you have Storage permissions, otherwise create manually in Dashboard

insert into storage.buckets (id, name, public) values 
('resumes', 'resumes', false),
('company_documents', 'company_documents', false)
on conflict (id) do nothing;

-- Policies
create policy "Users manage own resumes" on storage.objects for all using (bucket_id = 'resumes' and auth.uid() = (storage.foldername(name))[1]::uuid);
create policy "Hirers read uploaded docs" on storage.objects for select using (bucket_id = 'company_documents' and auth.uid() = (storage.foldername(name))[1]::uuid);
create policy "Hirers upload docs" on storage.objects for insert with check (bucket_id = 'company_documents' and auth.uid() = (storage.foldername(name))[1]::uuid);
