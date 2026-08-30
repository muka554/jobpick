# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a suspected security vulnerability. Contact the repository owner privately through the GitHub security contact or the site’s [Contact page](https://jobpick20.com/contact/). Include the affected URL or file, reproduction steps, impact, and any suggested mitigation. Do not include passwords, API keys, access tokens, personal data, or private employer information in the report.

## Scope

JobPick is a public static site. Browser-visible configuration such as a Supabase project URL and publishable/anonymous key is not a secret by itself, but it must be protected by strict Supabase Row Level Security policies. Service-role keys, Resend keys, OAuth client secrets, database passwords, signing keys, and private certificates must never be committed to this repository or embedded in frontend JavaScript.

## Safe disclosure and credential response

If a secret is accidentally committed, remove it from the working tree, revoke or rotate it at the provider immediately, then assess whether the Git history must be rewritten. Deleting a file in a later commit does not invalidate a credential that appeared in an earlier commit. Report the affected provider and rotation status privately.

## Repository controls

Secret scanning and push protection are enabled for this repository where supported by GitHub. Dependabot security updates are enabled. These controls supplement, rather than replace, manual review. Contributors should inspect diffs before pushing and should use environment variables or the provider’s secret store for runtime credentials.
