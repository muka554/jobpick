# Contributing safely

JobPick is deployed from a public GitHub repository. Keep all browser code limited to intentionally public values and never commit service-role keys, Resend keys, OAuth secrets, database credentials, private certificates, or personal data.

Before opening a pull request, inspect `git diff --check`, search the diff for `secret`, `password`, `token`, `service_role`, `Authorization: Bearer`, and provider-specific key prefixes, and verify that no `.env`, local database, log, backup, or private-key file is included. Use environment variables or the managed provider secret store for server-side credentials.

Do not weaken Supabase Row Level Security to make a frontend feature work. Test public pages while logged out, preserve self-referencing canonicals and `index,follow` directives, and confirm that new public routes are linked internally and added to `sitemap.xml`.

For a suspected vulnerability, follow the private-reporting process in [`SECURITY.md`](SECURITY.md) rather than opening a public issue.
