-- Sprint 3 - US5: Request status history
-- Owner: Tommy Nguyen

create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),

  request_id uuid not null
    references public.requests(id)
    on delete cascade,

  from_status text
    check (
      from_status is null or
      from_status in (
        'Draft',
        'Sent',
        'Acknowledged',
        'Fulfilled',
        'Denied',
        'Appealed'
      )
    ),

  to_status text not null
    check (
      to_status in (
        'Draft',
        'Sent',
        'Acknowledged',
        'Fulfilled',
        'Denied',
        'Appealed'
      )
    ),

  changed_at timestamptz not null default now(),

  changed_by uuid references auth.users(id),

  note text
);

create index if not exists status_history_request_id_idx
  on public.status_history(request_id);

create index if not exists status_history_changed_at_idx
  on public.status_history(changed_at desc);

-- Enable row level security.
alter table public.status_history enable row level security;

-- Normalize older rows that were created without a status.
update public.requests
set status = 'Draft'
where status is null;

-- Backfill one creation-history row for every existing request
-- that does not already have a history record.
insert into public.status_history (
  request_id,
  from_status,
  to_status,
  changed_by,
  note
)
select
  r.id,
  null,
  r.status,
  null,
  'Request created'
from public.requests r
where not exists (
  select 1
  from public.status_history h
  where h.request_id = r.id
);

-- Change a request's status and record the change atomically.
create or replace function public.change_request_status(
  p_request_id uuid,
  p_new_status text,
  p_note text default null
)
returns public.status_history
language plpgsql
security invoker
as $$
declare
  v_old_status text;
  v_history public.status_history;
begin
  -- Lock the request while the status change is being processed.
  select status
  into v_old_status
  from public.requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found';
  end if;

  -- Enforce Sprint 3 status transition rules.
  if not (
    (v_old_status = 'Draft' and p_new_status = 'Sent')
    or
    (v_old_status = 'Sent' and p_new_status in ('Acknowledged', 'Fulfilled', 'Denied'))
    or
    (v_old_status = 'Acknowledged' and p_new_status in ('Fulfilled', 'Denied'))
    or
    (v_old_status = 'Denied' and p_new_status = 'Appealed')
  ) then
    raise exception 'Invalid status transition from % to %',
      v_old_status,
      p_new_status;
  end if;

  -- Update the request's current status.
  update public.requests
  set status = p_new_status
  where id = p_request_id;

  -- Record the status change.
  insert into public.status_history (
    request_id,
    from_status,
    to_status,
    changed_by,
    note
  )
  values (
    p_request_id,
    v_old_status,
    p_new_status,
    auth.uid(),
    nullif(trim(p_note), '')
  )
  returning *
  into v_history;

  return v_history;
end;
$$;