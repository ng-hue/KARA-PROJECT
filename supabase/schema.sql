-- Requests table for the KARA Public Records Tracker.
-- Run this once in the Supabase SQL Editor after the project is created.

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  request_text text not null,
  state text not null,
  target_agency text not null,
  date_sent date not null,
  deadline date,
  status text not null default 'Draft'
    check (status in ('Draft', 'Sent', 'Acknowledged', 'Fulfilled', 'Denied', 'Appealed')),
  created_at timestamptz not null default now()
);

alter table public.requests enable row level security;

do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'requests'
  loop
    execute format('drop policy %I on public.requests', policy_name);
  end loop;
end
$$;

revoke all on public.requests from anon;
grant select, insert, update on public.requests to authenticated;

create policy "Authenticated users can read requests"
  on public.requests for select to authenticated using (true);
create policy "Authenticated users can create requests"
  on public.requests for insert to authenticated with check (true);
create policy "Authenticated users can update requests"
  on public.requests for update to authenticated using (true) with check (true);
