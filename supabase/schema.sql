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

drop policy if exists "Sprint 2 read" on public.requests;
drop policy if exists "Sprint 2 insert" on public.requests;
drop policy if exists "Authenticated users can read requests" on public.requests;
drop policy if exists "Authenticated users can create requests" on public.requests;
drop policy if exists "Authenticated users can update requests" on public.requests;

create policy "Authenticated users can read requests"
  on public.requests for select to authenticated using (true);
create policy "Authenticated users can create requests"
  on public.requests for insert to authenticated with check (true);
create policy "Authenticated users can update requests"
  on public.requests for update to authenticated using (true) with check (true);
