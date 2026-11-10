-- Sprint 4 - US2: Correspondence entries (SCRUM-198, SCRUM-209)
-- Owner: Daniel Anderson
--
-- One row per letter, email, or response file exchanged with an agency about
-- a request. Fields follow docs/correspondence-entry-design-note.md.
-- The Master Fields List check (SCRUM-208) is still pending; if it renames a
-- field, rename it here, in the entry form, and in the seed script together.
--
-- Run after schema.sql and status_history.sql. Safe to rerun.

create table if not exists public.correspondence (
  id uuid primary key default gen_random_uuid(),

  request_id uuid not null
    references public.requests(id)
    on delete cascade,

  direction text not null
    check (direction in ('outgoing', 'incoming')),

  -- The date on the message itself, not the date it was entered.
  correspondence_date date not null,

  sender text not null
    check (length(trim(sender)) > 0),

  -- The proposed 600 character cap awaits sponsor sign-off, so it is
  -- enforced in the entry form only and can change without a migration.
  summary text not null
    check (length(trim(summary)) > 0),

  -- Points to where the file is stored (S4 US3). Holds a path, not the file.
  attachment_ref text,

  -- Matches status_history.changed_by. Null for seeded rows.
  created_by uuid
    references auth.users(id)
    default auth.uid(),

  created_at timestamptz not null default now()
);

-- Serves both lookups by request and the detail page order
-- (newest correspondence_date first, created_at as the tiebreaker).
create index if not exists correspondence_request_date_idx
  on public.correspondence(request_id, correspondence_date desc, created_at desc);

-- Enable row level security.
alter table public.correspondence enable row level security;

-- Match the authenticated-only access model from US2.
do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'correspondence'
  loop
    execute format(
      'drop policy %I on public.correspondence',
      policy_name
    );
  end loop;
end
$$;

revoke all on public.correspondence from anon;
grant select, insert on public.correspondence to authenticated;

create policy "Authenticated users can read correspondence"
  on public.correspondence
  for select
  to authenticated
  using (true);

create policy "Authenticated users can create correspondence"
  on public.correspondence
  for insert
  to authenticated
  with check (created_by = auth.uid());
