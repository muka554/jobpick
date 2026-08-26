-- Server-only state for JobPick direct-password failure alerts.
-- No raw email, IP address, password, or token is stored.

create table if not exists public.auth_failure_alert_state (
  subject_hash text primary key,
  window_started_at timestamptz not null default timezone('utc', now()),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_event_at timestamptz not null default timezone('utc', now()),
  last_alert_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.auth_failure_alert_state is
  'Server-only, HMAC-keyed counters for JobPick direct password sign-in failures. No raw identity data is stored.';

alter table public.auth_failure_alert_state enable row level security;
alter table public.auth_failure_alert_state force row level security;

revoke all on table public.auth_failure_alert_state from anon, authenticated, public;

create or replace function public.record_jobpick_auth_failure(p_subject_hash text)
returns table(should_alert boolean, attempt_count integer, window_started_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_row public.auth_failure_alert_state%rowtype;
  v_should_alert boolean := false;
begin
  if p_subject_hash is null or length(p_subject_hash) <> 64 or p_subject_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid failure event key';
  end if;

  insert into public.auth_failure_alert_state (subject_hash, window_started_at, attempt_count, last_event_at)
  values (p_subject_hash, v_now, 1, v_now)
  on conflict (subject_hash) do update
  set window_started_at = case
        when public.auth_failure_alert_state.window_started_at <= v_now - interval '15 minutes' then v_now
        else public.auth_failure_alert_state.window_started_at
      end,
      attempt_count = case
        when public.auth_failure_alert_state.window_started_at <= v_now - interval '15 minutes' then 1
        else public.auth_failure_alert_state.attempt_count + 1
      end,
      last_event_at = v_now,
      updated_at = v_now
  returning * into v_row;

  v_should_alert := v_row.attempt_count >= 5
    and (v_row.last_alert_at is null or v_row.last_alert_at <= v_now - interval '60 minutes');

  return query select v_should_alert, v_row.attempt_count, v_row.window_started_at;
end;
$$;

create or replace function public.mark_jobpick_auth_failure_alert_sent(p_subject_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_subject_hash is null or length(p_subject_hash) <> 64 or p_subject_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid failure event key';
  end if;

  update public.auth_failure_alert_state
  set last_alert_at = timezone('utc', now()), updated_at = timezone('utc', now())
  where subject_hash = p_subject_hash;
end;
$$;

revoke all on function public.record_jobpick_auth_failure(text) from public, anon, authenticated;
revoke all on function public.mark_jobpick_auth_failure_alert_sent(text) from public, anon, authenticated;
grant execute on function public.record_jobpick_auth_failure(text) to service_role;
grant execute on function public.mark_jobpick_auth_failure_alert_sent(text) to service_role;

create index if not exists auth_failure_alert_state_last_event_idx
  on public.auth_failure_alert_state (last_event_at desc);
