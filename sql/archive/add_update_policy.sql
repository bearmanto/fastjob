-- Allow hirers to update their own company details
create policy "Hirers can update their own company."
  on companies for update
  using ( auth.uid() = owner_id );
