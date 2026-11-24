-- Sprint 5 - US2: Private correspondence file storage
-- Run after correspondence.sql in the Supabase SQL Editor. Safe to rerun.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'correspondence-files',
  'correspondence-files',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Correspondence files require authentication"
  on storage.objects;
drop policy if exists "Correspondence files allow authenticated reads"
  on storage.objects;
drop policy if exists "Correspondence files allow authenticated uploads"
  on storage.objects;
drop policy if exists "Correspondence files allow approved extensions"
  on storage.objects;
drop policy if exists "Correspondence files prevent updates"
  on storage.objects;
drop policy if exists "Correspondence files prevent deletes"
  on storage.objects;

drop policy if exists "Correspondence files allow authenticated deletes"
  on storage.objects;

-- A restrictive policy prevents any broader storage policy from making this
-- bucket readable or writable without a signed-in user.
create policy "Correspondence files require authentication"
  on storage.objects
  as restrictive
  for all
  to public
  using (
    bucket_id <> 'correspondence-files'
    or auth.role() = 'authenticated'
  )
  with check (
    bucket_id <> 'correspondence-files'
    or auth.role() = 'authenticated'
  );

create policy "Correspondence files allow authenticated reads"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'correspondence-files');

create policy "Correspondence files allow authenticated uploads"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'correspondence-files');

create policy "Correspondence files allow approved extensions"
  on storage.objects
  as restrictive
  for insert
  to public
  with check (
    bucket_id <> 'correspondence-files'
    or lower(storage.extension(name)) in ('pdf', 'png', 'jpg', 'jpeg', 'docx')
  );

create policy "Correspondence files prevent updates"
  on storage.objects
  as restrictive
  for update
  to public
  using (bucket_id <> 'correspondence-files')
  with check (bucket_id <> 'correspondence-files');

create policy "Correspondence files allow authenticated deletes"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'correspondence-files');
