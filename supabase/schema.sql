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

-- Temporary for Sprint 2: anyone with the anon key can read and add requests.
-- Replace when roles and access (EPIC E4) are built.
create policy "Sprint 2 read" on public.requests for select to anon using (true);
create policy "Sprint 2 insert" on public.requests for insert to anon with check (true);
