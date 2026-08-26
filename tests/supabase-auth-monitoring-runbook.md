# JobPick Supabase Authentication Monitoring Runbook

## Configuration completed

Dashboard-based Auth monitoring has been enabled for the production Supabase project. **Authentication → Audit Logs → Write audit logs to the database** is now on. Supabase will retain subsequent audit events in `auth.audit_log_entries` while continuing to expose Auth server logs in the Logs Explorer.[1] [2]

The table was confirmed available immediately after activation. Its initial aggregate count was zero, which is expected because no new audit event was intentionally generated during setup. Review it again after the next normal authentication activity or controlled test.

> This setup is intended for manual investigation and routine dashboard review. It does not send automatic alerts, emails, or notifications.

## What to review

Supabase Auth audit logs track authentication actions such as logins, sign-ups, password events, token refreshes, and logout activity. Use **Logs → Auth Logs** to identify server-side warnings or errors related to failed authentication. Use **Authentication → Audit Logs** as the retained event record.[1] [2]

Do not place email addresses, passwords, one-time codes, Magic Link URLs, session tokens, raw IP addresses, or detailed user-agent strings into saved queries, reports, or analytics events.

## Privacy-safe 24-hour warning trend

Open **Logs → Logs Explorer**, select the `auth_logs` source, and run the following query. It counts warning/error events by hour and severity only.

```sql
select
  toStartOfHour(timestamp) as hour,
  severity_text,
  count() as event_count
from logs
where source = 'auth_logs'
  and timestamp >= now() - INTERVAL 24 HOUR
  and severity_text in ('WARNING', 'ERROR')
group by hour, severity_text
order by hour desc, severity_text
limit 100;
```

At setup, this query ran successfully and returned four warning events across two hourly buckets. It was deliberately aggregated; no user identifiers or request-level attributes were queried.

## Routine review procedure

| Cadence | Action | Escalate when |
| --- | --- | --- |
| After a password-policy test | Run the 24-hour warning trend query and check the test time window in Auth Logs. | A weak password is accepted, an unexpected provider error appears, or repeated warnings occur. |
| Weekly | Review the trend query and the retained Audit Logs page. | Warning/error counts materially increase from the normal baseline. |
| After a suspected auth incident | Narrow the Logs Explorer time range first, then inspect the relevant Auth Log messages inside the Supabase dashboard. | There are repeated failures, unexpected token/session behavior, or a suspected access-control issue. |

## Password-policy test correlation

Run the companion `supabase-password-policy-test.mjs` from a disposable test inbox and follow `supabase-password-policy-test-checklist.md`. Each failed-case test should be rejected by Supabase. After the test, use the trend query above and the Auth Logs time window to confirm the server recorded the outcome. Keep only the timestamp, test case label, HTTP status, and pass/fail result.

## Retained audit-data boundary

`auth.audit_log_entries` contains a JSON payload and an IP-address field, so it is intentionally **not** queried by the privacy-safe trend view. The database retention setting is for controlled incident review within the Supabase dashboard. If SQL access is ever needed for audit data, use aggregation first and apply a narrow time range; do not export user-level audit rows unless there is a legitimate, approved incident-response need.

## Current limitation

The project remains on the Free plan, so Supabase’s leaked-password check cannot be turned on. The current password hardening remains active: a 12-character minimum, lowercase/uppercase/digit/symbol rule, recent-authentication requirement, and current-password requirement. The hosted Supabase dashboard cannot set the password minimum to four characters; its minimum is six.[3]

## References

[1]: https://supabase.com/docs/guides/auth/audit-logs "Supabase — Auth Audit Logs"
[2]: https://supabase.com/docs/guides/monitoring-and-debugging/logs "Supabase — Logging"
[3]: https://supabase.com/docs/guides/auth/password-security "Supabase — Password security"
