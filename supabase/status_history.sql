-- Request status history
-- Sprint 5 status set and transition rules

create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),

  request_id uuid not null
    references public.requests(id)
    on delete cascade,

  from_status text
    check (
      from_status is null or
      from_status in (
        'Drafted',
        'Sent',
        'Acknowledged',
        'Provided',
        'Partial',
        'Refused',
        'No response by deadline',
        'Withdrawn'
      )
    ),

  to_status text not null
    check (
      to_status in (
        'Drafted',
        'Sent',
        'Acknowledged',
        'Provided',
        'Partial',
        'Refused',
        'No response by deadline',
        'Withdrawn'
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

alter table public.status_history enable row level security;

do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'status_history'
  loop
    execute format(
      'drop policy %I on public.status_history',
      policy_name
    );
  end loop;
end
$$;

revoke all on public.status_history from anon;

grant select, insert
  on public.status_history
  to authenticated;

create policy "Authenticated users can read status history"
  on public.status_history
  for select
  to authenticated
  using (true);

create policy "Authenticated users can create status history"
  on public.status_history
  for insert
  to authenticated
  with check (changed_by = auth.uid());

-- Normalize rows that were created without a status.
update public.requests
set status = 'Drafted'
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

-- Automatically create the initial status-history row
-- whenever a new request is created.
create or replace function public.create_initial_status_history()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.status_history (
    request_id,
    from_status,
    to_status,
    changed_by,
    note
  )
  values (
    new.id,
    null,
    coalesce(new.status, 'Drafted'),
    auth.uid(),
    'Request created'
  );

  return new;
end;
$$;

drop trigger if exists requests_initial_status_history
  on public.requests;

create trigger requests_initial_status_history
after insert on public.requests
for each row
execute function public.create_initial_status_history();

-- Remove the old three-argument version so PostgREST does not
-- see two overloaded change_request_status functions.
drop function if exists
  public.change_request_status(uuid, text, text);

drop function if exists
  public.change_request_status(uuid, text, text, date);

-- Change a request's status and record the change atomically.
create function public.change_request_status(
  p_request_id uuid,
  p_new_status text,
  p_note text default null,
  p_sent_date date default null
)
returns public.status_history
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_old_status text;
  v_history public.status_history;
begin
  -- Lock the request while the status change is processed.
  select status
  into v_old_status
  from public.requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found';
  end if;

  -- Enforce Sprint 5 transition rules.
  if not (
    (
      v_old_status = 'Drafted'
      and p_new_status in (
        'Sent',
        'Withdrawn'
      )
    )
    or
    (
      v_old_status = 'Sent'
      and p_new_status in (
        'Acknowledged',
        'Provided',
        'Partial',
        'Refused',
        'No response by deadline',
        'Withdrawn'
      )
    )
    or
    (
      v_old_status = 'Acknowledged'
      and p_new_status in (
        'Provided',
        'Partial',
        'Refused',
        'No response by deadline',
        'Withdrawn'
      )
    )
    or
    (
      v_old_status = 'Partial'
      and p_new_status in (
        'Provided',
        'Refused',
        'No response by deadline',
        'Withdrawn'
      )
    )
  ) then
    raise exception
      'Invalid status transition from % to %',
      v_old_status,
      p_new_status;
  end if;

  -- A request cannot become Sent without its actual sent date.
  if p_new_status = 'Sent'
     and p_sent_date is null then
    raise exception
      'A sent date is required when changing a request to Sent';
  end if;

  -- Update the current status. When moving to Sent,
  -- save the supplied sent date at the same time.
  update public.requests
  set
    status = p_new_status,
    date_sent = case
      when p_new_status = 'Sent'
        then p_sent_date
      else date_sent
    end
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

revoke execute
  on function public.change_request_status(
    uuid,
    text,
    text,
    date
  )
  from public, anon;

grant execute
  on function public.change_request_status(
    uuid,
    text,
    text,
    date
  )
  to authenticated;