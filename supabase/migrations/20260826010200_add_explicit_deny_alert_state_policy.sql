-- Explicitly documents and enforces that browser roles have no direct access to alert state.
-- The Edge Function uses the service role; service-role operations bypass RLS.

create policy "deny direct access to auth failure alert state"
on public.auth_failure_alert_state
as restrictive
for all
to public
using (false)
with check (false);
