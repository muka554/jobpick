# JobPick production release and verification record

**Date:** 26 August 2026  
**Production site:** [https://jobpick20.com/](https://jobpick20.com/)  
**Final published revision:** `32a2d0e Prevent resource section layout shift`  
**Deployment status:** GitHub Pages workflow completed successfully. [1]

## Release outcome

The release publishes the optional **Private Application Tracker**, a browser-only tool that lets visitors record an employer, role, status, and date. It also includes a non-blocking font-loading refinement and a responsive accessibility correction for the homepage footer. The final layout correction removes `content-visibility` from the long job-search resource section; this prevents its placeholder height from causing the resource cards to extend into the footer on smaller screens.

The tracker is intentionally private by design. It saves only sanitized, capped entries in the visitor's browser under `jobhub_application_tracker_v1`; it does not send tracker data to Supabase, analytics, a platform, an employer, or any other external service. It does not store application URLs, emails, résumés, IDs, credentials, or account data. The existing local feature suite previously verified add, status update, removal, persistence, no tracker analytics event, RTL text, and responsive containment. A fresh production interaction harness stalled in the isolated browser environment, so this record does **not** claim a newly completed live interaction test.

| Delivered component | Verified state |
|---|---|
| Private Application Tracker | Published through the successful Pages deployment; browser-local design retained. |
| Font loading | Homepage font stylesheet uses non-blocking loading with a `<noscript>` fallback. The final Lighthouse runs reported no render-blocking-resource savings opportunity. |
| Footer touch targets | Eight footer links were tested locally at 320×568, 390×844, 700×900, 1024×768, and 1440×900. Each had a 44 px minimum target, remained contained, and caused no horizontal overflow. |
| Resource-to-footer flow | The same five local viewport tests verified that the resources grid ends before the footer begins after the root-cause correction. |
| Deployment | The final `32a2d0e` GitHub Pages workflow completed successfully. [1] |

## Final Lighthouse measurement

The following are isolated lab measurements taken against the final production deployment. Lighthouse results can vary with network, CDN, and lab conditions; they are measurements of this run, not a causal guarantee for every visitor or a promise of a fixed ranking.

| Form factor | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Mobile | 55 | 100 | 100 | 100 | 4.2 s | 4.2 s | 10 ms | 0.318 | 7.4 s |
| Desktop | 73 | 100 | 100 | 100 | 1.5 s | 2.0 s | 0 ms | 0.114 | 6.1 s |

The final mobile audit reported an estimated **1.07 s** server-response-time opportunity, and the final desktop audit reported approximately **1.10 s**. This remains the largest observed performance opportunity. The mobile CLS of **0.318** also remains above the recommended threshold; the resource-section correction resolves the verified footer overlap, but does not alone eliminate all layout-shift sources. A subsequent focused CLS investigation should measure component shifts after font loading and deferred interface initialization.

For context, the pre-refinement baseline recorded mobile Performance 38, Accessibility 100, Best Practices 100, SEO 100; and desktop Performance 60, Accessibility 100, Best Practices 100, SEO 100. The final scores are higher in these runs, but the change set also includes functional and accessibility work and Lighthouse lab results vary, so no single implementation change is credited as the sole cause.

## Authentication redirect and custom-domain verification

Read-only Supabase and OAuth verification was completed without sending a Magic Link, changing credentials, signing out a user, or completing a real Google login. The configured public Supabase project is `rvitqbkgtgjharxqaxmv` (`gulf-job-hub`), and the verified OAuth authorization request accepted `https://jobpick20.com/` as the return destination. Google OAuth remains enabled, and the managed provider callback remains:

> `https://rvitqbkgtgjharxqaxmv.supabase.co/auth/v1/callback`

No custom Supabase Auth hostname is currently configured. The observed Supabase plan was Free; the supported path to an official custom Auth domain requires the applicable paid custom-domain offering, DNS validation, and an update to the Google OAuth client’s authorized callback configuration. A reverse proxy was intentionally **not** introduced to mask the managed Auth hostname because it can break OAuth callback/state/cookie/CORS behavior and is not a safe cosmetic replacement for the supported custom-domain workflow.

Responsive sign-in layout had previously passed visual coverage at 320×568, 390×844, 700×900, 1024×768, and 1440×900, including a short mobile viewport where the dialog must scroll. A fresh dynamic Auth UI test in an isolated headless context repeatedly timed out. Therefore, this release record confirms the safe redirect and provider configuration but does **not** claim a fresh end-to-end Google, password, or Magic Link sign-in completion.

## Follow-up priorities

The next evidence-led work should focus on reducing mobile CLS and the initial response-time dependency. Any future authentication testing should use an authorized dedicated test account or user-approved test process; it should not send real Magic Links or disrupt a live user session.

## References

[1]: https://github.com/muka554/jobpick/actions/runs/32991547590
[2]: https://jobpick20.com/
