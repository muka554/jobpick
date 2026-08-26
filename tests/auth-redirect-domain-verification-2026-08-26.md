# Supabase Auth redirect-domain verification — 2026-08-26

## Scope

This is a read-only verification of the production JobPick public Auth client and the authorization-start redirect. It does not change provider settings, callback URLs, sign-in credentials, or the existing user session.

## Confirmed state

| Item | Observed production value | Result |
|---|---|---|
| Supabase project | `rvitqbkgtgjharxqaxmv` (`gulf-job-hub`) | Active and healthy |
| Public Auth/API host | `https://rvitqbkgtgjharxqaxmv.supabase.co` | Active managed Supabase host |
| Requested post-auth return URL | `https://jobpick20.com/` | Accepted by the authorization-start endpoint |
| Google OAuth callback URI | `https://rvitqbkgtgjharxqaxmv.supabase.co/auth/v1/callback` | Current managed Supabase callback route |
| Authorization-start response | HTTP 302 to Google OAuth | Pass; no sign-in performed |

The tested authorization-start URL accepted JobPick’s HTTPS home URL as `redirect_to` and returned a standard Google authorization redirect. Google then uses the Supabase-managed `/auth/v1/callback` URI, after which Supabase returns the user to the allowed JobPick URL.

## Custom-domain conclusion

No custom Supabase Auth domain is configured or exposed through the connected project access. The managed callback host therefore remains the correct current callback and is the reason Google may display `rvitqbkgtgjharxqaxmv.supabase.co` in its account chooser. A website-only reverse proxy should not be inserted in front of managed Supabase Auth merely to mask this hostname: it would alter a security-sensitive OAuth callback boundary and is not required for the verified redirect flow.

A future supported migration would require a Supabase custom auth domain, DNS validation, and adding the new provider callback URI before switching traffic. This verification does not infer plan entitlement, account approval, or Google Cloud branding ownership.
