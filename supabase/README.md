# JobPick Supabase Passwordless Search-History Sync

## Purpose

The public site continues to keep recent searches in the visitor’s browser by default. Once a visitor explicitly signs in, the optional sync client can store up to six recent role, country, and city combinations in an owner-only Supabase table. Typed keywords are synchronized only as the visitor’s own saved-history value; they are not sent through the site’s aggregate analytics events.

> **Security boundary:** the browser may use a Supabase **publishable key**. It must never contain a `service_role` key. Owner-only table access is enforced in PostgreSQL through grants and Row Level Security, not through the user interface.[1]

## Activation sequence

| Step | Action | Repository file or setting |
| --- | --- | --- |
| 1 | Create or select a Supabase project and enable Email authentication. Magic Link is enabled by default in Supabase Auth.[2] | Supabase Dashboard → Authentication → Providers → Email |
| 2 | Set the production **Site URL** to `https://jobpick20.com/` and allow the exact redirect URL `https://jobpick20.com/`. The client returns the user to the active homepage path after a Magic Link click. | Supabase Dashboard → Authentication → URL Configuration [3] |
| 3 | Apply the migration. It creates the table, index, timestamp trigger, grants, and four explicit owner-only RLS policies. | `supabase/migrations/20260826000000_create_user_search_history.sql` |
| 4 | Copy `assets/supabase-config.example.js` to `assets/supabase-config.js`, then replace only the project URL and publishable key. The repository ships a disabled `supabase-config.js` stub until this step is completed. | `assets/supabase-config.js` |
| 5 | Publish the static site. The “Sync searches” control becomes visible only when real configuration is present. Test from two browsers or devices using the same email address. | `assets/supabase-search-sync.js` |

## Applying the migration

Use the Supabase CLI with the project linked locally, then apply the migration in the normal deployment workflow:

```bash
supabase db push
```

Alternatively, review and run the migration in the Supabase SQL Editor. The migration deliberately performs the following security actions: it enables and forces RLS, revokes default client-role access, re-grants only signed-in-user CRUD access, and adds separate `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies. Each policy requires `auth.uid()` to match `user_id`.[1]

## Passwordless flow in the page

When configured, the browser client calls `supabase.auth.signInWithOtp` with the visitor’s email and `emailRedirectTo`. Supabase sends a one-time Magic Link; the client preserves the session after the visitor returns. The site then merges local and cloud history by the newest timestamp and retains a maximum of six unique search entries. Supabase documents that Magic Links are single-use and, by default, requests are rate-limited to one per minute with a one-hour expiry.[2]

The user interface is intentionally unavailable before configuration. This avoids an apparent sign-in workflow that cannot actually deliver email and preserves the existing local-only behavior for visitors who prefer not to create an account.

## Verification checklist

| Check | Expected result |
| --- | --- |
| Signed out | No `user_search_history` rows can be read, created, changed, or deleted through the public client. |
| Signed in as User A | User A can create, read, update, and delete only rows where `user_id = auth.uid()`. |
| Signed in as User B | User B cannot view or mutate User A’s rows. |
| Second device, User A | After Magic Link sign-in, the same six most recent entries appear after a refresh or Sync action. |
| Clear history | The local browser history is cleared and active cloud entries are soft-deleted for the signed-in user. |

## References

[1]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase — Row Level Security"
[2]: https://supabase.com/docs/guides/auth/auth-email-passwordless "Supabase — Passwordless email logins"
[3]: https://supabase.com/docs/guides/auth/redirect-urls "Supabase — Redirect URLs"
