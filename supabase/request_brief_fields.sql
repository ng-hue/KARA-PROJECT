alter table public.requests
  add column if not exists request_type text,
  add column if not exists records_contact text,
  add column if not exists send_method text,
  add column if not exists deadline_rule text;

alter table public.requests drop constraint if exists requests_request_type_check;
alter table public.requests
  add constraint requests_request_type_check
  check (request_type in ('A', 'B'));

alter table public.requests drop constraint if exists requests_send_method_check;
alter table public.requests
  add constraint requests_send_method_check
  check (send_method in ('email', 'web_portal'));