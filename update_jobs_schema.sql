-- Add new columns for enhanced job details
alter table jobs 
add column if not exists job_type text check (job_type in ('full_time', 'part_time', 'contract', 'internship', 'daily')),
add column if not exists workplace_type text check (workplace_type in ('on_site', 'hybrid', 'remote')),
add column if not exists skills text[], -- Array of strings
add column if not exists benefits text[], -- Array of strings
add column if not exists description text,
add column if not exists description_snippet text,
add column if not exists requirements text;

-- Update RLS if needed (existing policies likely cover UPDATE if owner)
-- Ensure array columns default to empty array if null is not desired, but null is fine here.
