-- Add new columns to companies table for profile editing
alter table public.companies 
add column if not exists website text,
add column if not exists industry text,
add column if not exists description text,
add column if not exists logo_url text;
