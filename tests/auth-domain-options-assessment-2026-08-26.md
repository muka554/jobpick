# JobPick Auth-Domain Options Assessment — 2026-08-26

## Scope

The current managed Supabase project is `rvitqbkgtgjharxqaxmv` on the Free plan. Google OAuth currently advertises the hosted Supabase Auth callback host, which is why Google’s account chooser shows `rvitqbkgtgjharxqaxmv.supabase.co`.

## Options assessed

| Option | Feasibility for the managed Free project | OAuth result | Recommendation |
|---|---|---|---|
| Official Supabase custom domain, e.g. `auth.jobpick20.com` | Requires a paid Supabase plan and custom-domain add-on, DNS CNAME/TXT records, and project Owner/Admin access | Supported. Supabase Auth advertises the branded callback host after Google adds the new callback URI alongside the existing one. | **Recommended production path** when plan and DNS access are available. |
| Supabase vanity subdomain | Requires a paid Supabase plan; experimental | Could replace the random project reference with a branded `*.supabase.co` name, but not the JobPick domain. | Secondary option only. |
| Reverse proxy in front of the managed hosted project | No supported hosted-project control exists to change Supabase Auth’s external callback host. A proxy cannot safely rewrite Google redirect URIs, Auth state/cookies, CORS, WebSocket, and service URLs as a cosmetic change. | The managed Auth service still advertises the project callback host. A callback relay/proxy would be an unsupported authentication redesign with state and cookie risk. | **Do not implement**. |
| Self-hosted Supabase behind Caddy/Nginx | Technically viable with an independently managed server, DNS, HTTPS, operational monitoring, and migration of existing services/data | Supported only after configuring the self-hosted Auth external URL and Google callback URL to the branded host. | Not a low-risk alternative to the current managed setup. |
| Google Identity Services popup + `signInWithIdToken` | Requires access to the owning Google OAuth client to authorize `https://jobpick20.com` as a JavaScript origin and brand the app | Can improve the initial sign-in UX while retaining Supabase sessions; it does not alter the managed redirect host for the existing redirect flow. | Potential UX enhancement only once owner access is available. |

## Security conclusion

Do not use a free reverse proxy or callback relay to disguise the managed Supabase Auth host. The supported hosted-Supabase path is a custom domain. The safe no-regression action is to leave the current redirect flow intact until the required plan, DNS, and Google OAuth-owner access are available.

## Official sources

1. Supabase Custom Domains: https://supabase.com/docs/guides/platform/custom-domains
2. Supabase self-hosted reverse proxy and HTTPS: https://supabase.com/docs/guides/self-hosting/self-hosted-proxy-https
3. Supabase Google Login: https://supabase.com/docs/guides/auth/social-login/auth-google
