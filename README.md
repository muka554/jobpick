# Middle East Job Hub (JobPick)

Live site: [jobpick20.com](https://jobpick20.com)

Middle East Job Hub — published under the product name **JobPick** — is a free regional job-search resource and search-routing tool for people exploring opportunities across the UAE, Saudi Arabia, Egypt, Qatar, Kuwait, Oman, Bahrain, and Jordan.

The site does not host or scrape job listings itself. Instead, it builds direct search links into major public and commercial job platforms (Bayt, LinkedIn Jobs, Indeed, GulfTalent, Naukrigulf, Google for Jobs, and others), while publishing independent, source-linked editorial guides on job-search routes, CV practices, recruitment-scam warning signs, and city/country-specific job-market context.

## What the site does

- **Search routing** — `assets/platforms.js` defines the platform catalogue and builds outbound search URLs per role, city, and country.
- **Editorial guides** — `guides/` contains independently written, source-cited articles (e.g. UAE job-search guide, UAE CV guide, recruitment scam warning signs, Gulf job platforms explained).
- **City and country pages** — `cities/` covers city-specific job guidance (Dubai, Abu Dhabi, Riyadh, and others).
- **Trust and compliance pages** — About, Privacy Policy, Terms of Use, Advertising Disclosure, Editorial Standards, Corrections log, and Contact, all linked from the global footer.
- **Publisher/author identity** — `authors/` includes the named publisher profile (Ahmed Abayzeed) and the editorial team profile, both with `ProfilePage`/`Organization` structured data.
- **Employer and partner pages** — `employers/` and `partners/` describe how employers and sponsors can engage with the site.
- **Tools** — `tools/` hosts in-progress candidate-facing utilities (e.g. a local CV readiness checklist), with private/account-based processing gated behind a Supabase backend once deployed.

## Repository structure

```
.
├── index.html                  # Canonical homepage (root)
├── home/                       # Legacy homepage path — redirects to /
├── about/                      # About page
├── authors/                    # Publisher + editorial team profiles
├── cities/                     # City-level job guides (Dubai, Abu Dhabi, Riyadh, ...)
├── guides/                     # Independent editorial guides
├── employers/                  # Employer-facing information
├── partners/                   # Partnerships & sponsorship disclosure
├── resources/                  # Resource hub / index of guides
├── tools/                      # Candidate-facing tools (CV checker, etc.)
├── jobs/                       # Jobs-related routing entry point
├── corrections/                # Public corrections log
├── editorial-standards/        # Editorial standards and sourcing policy
├── advertising-disclosure/     # AdSense and advertising disclosure
├── privacy-policy/             # Privacy policy
├── terms-of-use/               # Terms of use
├── contact/                    # Contact page
├── how-we-review-job-platforms/# Platform review methodology
├── assets/                     # CSS, JS (platforms.js, site-localization.js, privacy-controls.js, etc.)
├── supabase/                   # Supabase project config/migrations for account features
├── scripts/                    # Node content-maintenance scripts (see below)
├── tests/                      # Automated content/structure checks
├── sitemap.xml, robots.txt, ads.txt, CNAME
└── google212a37498484aaf9.html # Google Search Console verification file
```

## Content maintenance scripts

Located in `scripts/`, run with Node (`.mjs`):

| Script | Purpose |
|---|---|
| `rewrite_city_guides.mjs` | Regenerates city guide article bodies and refreshes their structured-data fields. |
| `add_guide_review_framework.mjs` | Injects the visible "last reviewed" note and editorial-team byline into guide pages. |
| `update_sitemap_for_content_revision.mjs` | Rebuilds `sitemap.xml` after content revisions. |
| `validate_content_readiness.mjs` | Checks guide pages for required metadata, byline, and structured-data fields before publishing. |
| `prepare_auth_failure_alert_deploy.mjs` | Prepares deployment step for auth-failure alerting. |

**Note:** these scripts write `dateModified`/`datePublished` as date-only strings (`YYYY-MM-DD`). Google Search Console's Rich Results validator expects a full ISO-8601 timestamp with timezone (e.g. `2026-08-26T00:00:00+04:00`) for `dateModified`. When editing these scripts, keep the timestamp format ISO-8601-compliant to avoid "Invalid datetime value" warnings.

## Search and indexing

- `sitemap.xml` lists all canonical URLs (root `/`, not `/home/`).
- `robots.txt` allows crawling of the full public site.
- `ads.txt` authorizes Google AdSense (`pub-6874304698042148`) for programmatic ad serving.
- Structured data (`ProfilePage`, `Organization`, `Article`) is present on author and guide pages for richer search presentation.

## Backend

Account features (sign-in, saved searches, private CV tool processing) are backed by **Supabase**. Frontend auth/account UI (`site-localization.js`, formerly `auth-guard.js`/`auth-experience.js`) loads lazily and must never block or gate rendering of public page content — this is required both for crawlability and for Google AdSense policy compliance.

## Compliance notes

- All legal pages (Privacy Policy, Terms of Use, Advertising Disclosure) should describe only features that are actually live. Remove template/placeholder disclaimers before treating a page as production-ready.
- Editorial guide pages should carry a real, non-repeated review date and byline (Middle East Job Hub Editorial Team or the named publisher).
- Public pages must never require sign-in to view core content; authentication is reserved for optional account features only.

## Local development

This is a static site (no build step required for HTML/CSS/JS). Serve the root directory with any static file server for local testing, and run the scripts in `scripts/` with Node when batch-updating guide or city content.
