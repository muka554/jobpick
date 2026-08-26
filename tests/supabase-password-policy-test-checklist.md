# Supabase Password-Policy Verification Checklist

## Effective configuration and the four-character request

JobPick’s Email provider is currently configured with a **12-character minimum** and requires a lowercase letter, uppercase letter, digit, and symbol for any new or changed password. It also requires recent authentication and the existing password before a password update.

Supabase enforces a dashboard minimum of **six characters**. A password length of **four characters cannot be saved** in this hosted configuration. Reducing the current setting to four would also weaken the available protection; Supabase recommends no fewer than eight characters.[1]

> JobPick itself continues to use passwordless Magic Links. These password-policy tests verify the Supabase Auth provider setting only; they do not require adding a password form to the public site.

## Automated negative-policy test

Use the included `supabase-password-policy-test.mjs` file with a disposable inbox that supports plus-addressing. The script uses the **publishable** key only. Do not use a service-role key, personal password, production user email, or real job-search terms.

```bash
cd /path/to/jobpick
export SUPABASE_URL='https://your-project.supabase.co'
export SUPABASE_PUBLISHABLE_KEY='sb_publishable_...'
export AUTH_TEST_EMAIL='your-disposable-inbox@example.com'
node tests/supabase-password-policy-test.mjs
```

The default run tests only expected failures. It does not intentionally create a valid Auth user. A result of `PASS` means Supabase rejected each weak case.

| Case | Candidate structure | Expected result |
| --- | --- | --- |
| Four characters | `aA1!` | Rejected; it violates both the six-character platform minimum and the active 12-character policy. |
| Eleven characters | Strong character mix but length 11 | Rejected; it violates the active 12-character policy. |
| Missing lowercase | 12+ characters without lowercase | Rejected. |
| Missing uppercase | 12+ characters without uppercase | Rejected. |
| Missing digit | 12+ characters without a digit | Rejected. |
| Missing symbol | 12+ characters without a symbol | Rejected. |

The script never prints the configured email, publishable key, or password values. If a weak case is unexpectedly accepted, stop testing, remove that disposable user under **Authentication → Users**, and recheck the Email provider settings.

## Optional positive test

Run the same harness with `--allow-create` only when you are ready to receive an email at the disposable inbox:

```bash
node tests/supabase-password-policy-test.mjs --allow-create
```

This adds a positive control using a compliant test password. It may create one disposable Auth user and send a confirmation message. Confirm that this case passes, then delete the disposable user in the Supabase dashboard after the test.

## Manual update-protection test

This test is relevant only if JobPick later exposes password changes. First create a disposable password-based account with a compliant password. Then test all of the following in a non-production browser profile.

| Check | Action | Expected result |
| --- | --- | --- |
| Recent-authentication guard | Attempt a password change without completing the required reauthentication step. | Supabase requests reauthentication and does not change the password. |
| Current-password guard | Supply an incorrect `current_password` value during a password update. | Supabase rejects the update. |
| Complexity guard | Supply the correct current password but a new password missing one required character class. | Supabase rejects the update. |
| Length guard | Supply the correct current password but a new password shorter than 12 characters. | Supabase rejects the update. |
| Compliant update | Complete reauthentication, supply the correct current password, and submit a 12+ character password containing all four required character classes. | Supabase accepts the update. |

Supabase documents that strengthened requirements are enforced for new users and password changes, and that users must satisfy the current policy when signing in with a password.[1] Reauthentication requires the application to obtain and pass the nonce as described in Supabase’s password-security guide.[1]

## Monitoring verification after a test

Open **Logs → Auth Logs** in Supabase after each negative test and filter to the time window of the test. For a privacy-preserving trend view, use the Logs Explorer query below. It counts only warning/error events by hour and does not select email, IP address, token, or user-agent fields.

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

Do not add email addresses, password strings, access tokens, Magic Link URLs, or raw IP addresses to the monitoring query, application analytics, or test report.

## Cleanup

Delete the optional disposable test user after the positive test. Do not leave a password account or confirmation email unreviewed. Keep only the pass/fail result, timestamp, and non-sensitive error category in the testing record.

## References

[1]: https://supabase.com/docs/guides/auth/password-security "Supabase — Password security"
[2]: https://supabase.com/docs/guides/monitoring-and-debugging/logs "Supabase — Logging"
