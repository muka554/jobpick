-- A global one-hour alert cooldown prevents the public pre-authentication endpoint
-- from being used to create a stream of notification emails.

create or replace function public.claim_jobpick_auth_failure_alert()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_global_key text := repeat('0', 64);
  v_last_alert_at timestamptz;
begin
  insert into public.auth_failure_alert_state (subject_hash, window_started_at, attempt_count, last_event_at, last_alert_at)
  values (v_global_key, v_now, 0, v_now, v_now)
  on conflict (subject_hash) do update
  set last_alert_at = case
        when public.auth_failure_alert_state.last_alert_at is null
          or public.auth_failure_alert_state.last_alert_at <= v_now - interval '60 minutes'
        then v_now
        else public.auth_failure_alert_state.last_alert_at
      end,
      updated_at = v_now
  returning last_alert_at into v_last_alert_at;

  return v_last_alert_at = v_now;
end;
$$;

revoke all on function public.claim_jobpick_auth_failure_alert() from public, anon, authenticated;
grant execute on function public.claim_jobpick_auth_failure_alert() to service_role;
