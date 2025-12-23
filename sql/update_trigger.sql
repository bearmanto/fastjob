-- 4. Create Trigger for New User Profile + Company Creation
-- Drop existing trigger/function first
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_profile_id uuid;
  user_role text;
  comp_name text;
begin
  -- Extract variables
  user_role := coalesce(new.raw_user_meta_data ->> 'role', 'seeker');
  comp_name := new.raw_user_meta_data ->> 'company_name';

  -- Insert Profile
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    user_role
  )
  returning id into new_profile_id;

  -- If Hirer AND Company Name provided, Create Company
  if user_role = 'hirer' and comp_name is not null then
      insert into public.companies (owner_id, name, location, verified)
      values (new_profile_id, comp_name, 'Unknown', false);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
