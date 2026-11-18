-- Sprint 5 migration:
-- new request status set, nullable date_sent,
-- and sent-date-aware status transitions.
--
-- IMPORTANT:
-- The new CHECK constraints are added NOT VALID first.
-- This lets the existing Sprint 4 seeded rows remain temporarily
-- until scripts/seed.cjs replaces their old status values.

begin;

-- Drafted requests have not been sent yet, so date_sent must be nullable.
alter table public.requests
  alter column date_sent drop not null;

-- New requests begin as Drafted.
alter table public.requests
  alter column status set default 'Drafted';

-- Replace the old requests status constraint.
alter table public.requests
  drop constraint if exists requests_status_check;

alter table public.requests
  add constraint requests_status_check
  check (
    status in (
      'Drafted',
      'Sent',
      'Acknowledged',
      'Provided',
      'Partial',
      'Refused',
      'No response by deadline',
      'Withdrawn'
    )
  )
  not valid;

-- Replace the old status-history constraints.
alter table public.status_history
  drop constraint if exists status_history_from_status_check;

alter table public.status_history
  drop constraint if exists status_history_to_status_check;

alter table public.status_history
  add constraint status_history_from_status_check
  check (
    from_status is null
    or from_status in (
      'Drafted',
      'Sent',
      'Acknowledged',
      'Provided',
      'Partial',
      'Refused',
      'No response by deadline',
      'Withdrawn'
    )
  )
  not valid;

alter table public.status_history
  add constraint status_history_to_status_check
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
  )
  not valid;

-- Remove the Sprint 3/4 RPC signature.
drop function if exists
  public.change_request_status(uuid, text, text);

drop function if exists
  public.change_request_status(uuid, text, text, date);

-- Sprint 5 RPC.
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
  select status
  into v_old_status
  from public.requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found';
  end if;

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

  if p_new_status = 'Sent'
     and p_sent_date is null then
    raise exception
      'A sent date is required when changing a request to Sent';
  end if;

  update public.requests
  set
    status = p_new_status,
    date_sent = case
      when p_new_status = 'Sent'
        then p_sent_date
      else date_sent
    end
  where id = p_request_id;

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

commit;