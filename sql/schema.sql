-- ⚠️ RESET SCRIPT: This will delete all data in jobs, companies, and profiles.

-- 1. Drop existing triggers and functions
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop trigger if exists on_profile_delete on public.profiles;
drop function if exists public.delete_user_on_profile_delete();

-- 2. Drop tables (Order matters due to dependencies)
drop table if exists public.jobs;
drop table if exists public.companies;
drop table if exists public.profile_education;
drop table if exists public.profile_experience;
drop table if exists public.profiles;

-- 3. Create PROFILES with CASCADE DELETE (Allows deleting users in Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('seeker', 'hirer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- EXTEND PROFILES
alter table public.profiles 
add column if not exists headline text,
add column if not exists summary text,
add column if not exists skills text[],
add column if not exists resume_url text,
add column if not exists phone text,
add column if not exists linkedin text;


-- EXPERIENCE Table
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

create policy "Users can view own experience."
  on profile_experience for select
  using ( auth.uid() = profile_id );

create policy "Users can insert own experience."
  on profile_experience for insert
  with check ( auth.uid() = profile_id );

create policy "Users can update own experience."
  on profile_experience for update
  using ( auth.uid() = profile_id );
  
create policy "Users can delete own experience."
  on profile_experience for delete
  using ( auth.uid() = profile_id );


-- EDUCATION Table
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

create policy "Users can view own education."
  on profile_education for select
  using ( auth.uid() = profile_id );

create policy "Users can insert own education."
  on profile_education for insert
  with check ( auth.uid() = profile_id );

create policy "Users can update own education."
  on profile_education for update
  using ( auth.uid() = profile_id );
  
create policy "Users can delete own education."
  on profile_education for delete
  using ( auth.uid() = profile_id );

-- STORAGE BUCKET (Policies must be set in Dashboard or via API, but we can document intent)
-- Bucket name: 'resumes'
-- Public: false
-- RLS: Authenticated users can upload and read their own. Hirers can read if applied.


-- 4. Create Trigger for New User Profile Creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'seeker') -- default to seeker
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 5. Create Trigger for Profile Deletion (Syncs Auth Deletion)
create or replace function public.delete_user_on_profile_delete()
returns trigger
language plpgsql
security definer
as $$
begin
  delete from auth.users where id = old.id;
  return old;
end;
$$;

create trigger on_profile_delete
  after delete on public.profiles
  for each row execute procedure public.delete_user_on_profile_delete();


-- 6. Create COMPANIES with CASCADE DELETE
create table public.companies (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    location text,
    verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.companies enable row level security;

-- Companies Policies
create policy "Companies are viewable by everyone."
  on companies for select
  using ( true );

create policy "Hirers can insert their own company."
  on companies for insert
  with check ( auth.uid() = owner_id );


-- 7. Create JOBS with CASCADE DELETE
create table public.jobs (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references public.companies(id) on delete cascade not null,
    title text not null,
    category_slug text not null,
    location text,
    salary_min numeric,
    salary_max numeric,
    description text,
    requirements text,
    status text default 'active' check (status in ('active', 'closed', 'draft')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.jobs enable row level security;

-- Jobs Policies
create policy "Jobs are viewable by everyone."
  on jobs for select
  using ( status = 'active' );

create policy "Company owners can insert jobs."
  on jobs for insert
  with check ( 
    exists (
      select 1 from companies 
      where id = jobs.company_id 
      and owner_id = auth.uid()
    ) 
  );
