-- Fixed Migration: Uses correct lowercase values and exact experience level strings

-- 1. Ensure columns exist (if they failed to create previously)
-- Note: We use 'on_site' (lowercase) default to match constraint
alter table public.jobs 
add column if not exists workplace_type text default 'on_site',
add column if not exists experience_level text default 'Mid Level (2-5 yrs)';

-- 2. Clean up any bad data if partial run happened (e.g. 'On-site' -> 'on_site')
update public.jobs set workplace_type = 'on_site' where workplace_type = 'On-site';
update public.jobs set workplace_type = 'remote' where workplace_type = 'Remote';
update public.jobs set workplace_type = 'hybrid' where workplace_type = 'Hybrid';

-- 3. Seed random data with VALID values
-- Constraint likely requires: 'remote', 'hybrid', 'on_site'
update public.jobs 
set workplace_type = 'remote' 
where id in (select id from public.jobs order by random() limit (select count(*)/3 from public.jobs));

update public.jobs 
set workplace_type = 'hybrid' 
where workplace_type = 'on_site' and id in (select id from public.jobs order by random() limit (select count(*)/3 from public.jobs));

-- Constraint likely requires exact strings from UI: 'Senior (5+ yrs)', 'Managerial', etc.
update public.jobs 
set experience_level = 'Senior (5+ yrs)' 
where id in (select id from public.jobs order by random() limit (select count(*)/3 from public.jobs));

update public.jobs 
set experience_level = 'Managerial' 
where experience_level = 'Mid Level (2-5 yrs)' and id in (select id from public.jobs order by random() limit (select count(*)/5 from public.jobs));

-- 4. Ensure some Fresh jobs (last 24h)
update public.jobs 
set created_at = now() 
where id in (select id from public.jobs order by random() limit 3);
