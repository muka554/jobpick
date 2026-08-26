# JobPick Direct Password Failure Alert Runbook

## Purpose and scope

This runbook documents the production alert path for **repeated failed direct email/password sign-ins initiated by JobPick**. It does not monitor Google OAuth, Magic Link, sign-up, password reset, or every failure that may appear within Supabase Auth. Platform-wide monitoring for all Auth failures needs a trusted server-side log source such as a managed log drain or an appropriate management-log integration; it is not inferred from browser telemetry.

## Trigger and notification policy

The browser reports an event only when Supabase returns the direct-password error `Invalid login credentials`. The report is intentionally fire-and-forget: a monitoring outage cannot change the visible sign-in result.

| Control | Production setting |
| --- | --- |
| Per-identifier threshold | At least 5 failed direct password sign-ins within 15 minutes |
| Global email cooldown | At most 1 alert notification per 60 minutes |
| Notification destination | Encrypted server-side recipient setting |
| Notification content | Threshold and review guidance only; no email address, password, IP address, or raw identifier |
| Counter identifier | HMAC-SHA-256 of normalized email using a server-only key |
| Browser database access | None |
| Edge Function gateway | JWT verification required |

## Data handling

The Edge Function receives an email only to calculate a keyed non-reversible counter identifier in memory. It does **not** receive a password. The database state table stores the HMAC, timestamp window, count, and alert timestamps. It is RLS-protected, force-RLS enabled, and has an explicit restrictive deny-all policy for public roles. Only server-side service-role RPCs are granted access.

The transactional-email credential and notification recipient are encrypted Edge Function secrets. They are not committed, exposed in browser JavaScript, logged, or sent to analytics.

## Operational verification completed on 26 August 2026

A synthetic `.invalid` identifier was submitted five times directly to the protected function. Each request returned HTTP 204. The fifth request reached the email-delivery path without a recorded function error. A separate browser call through the Supabase Functions client was verified after allowing the required `authorization`, `apikey`, `content-type`, and `x-client-info` CORS request headers.

The live JobPick guide loaded account asset revision `20260826h`, and the signed-in header Account control and Sign out control were present. Header profile behavior was validated without ending the active account session. GitHub Pages deployments for commits `18116e1`, `475dc48`, `d17b4f3`, and `65ce933` completed successfully.

## Review procedure

Review the existing privacy-safe Supabase Auth warning/error aggregate and the function logs when an alert arrives. Do not add a raw-email, raw-IP, or password field to the alert table. If operational requirements change, adjust the threshold and cooldown through server-side migrations and preserve the no-browser-access rule.

## Current known boundary

Supabase's leaked-password protection remains unavailable on the current Free plan. The direct-password policy remains unchanged: minimum **12 characters** with lowercase, uppercase, digit, and symbol requirements. Do not reduce it to four characters.
