# JobPick Technical Audit Report

**Target:** [https://jobpick20.com/](https://jobpick20.com/)  
**Repository:** [github.com/muka554/jobpick](https://github.com/muka554/jobpick)  
**Audit date:** 2026-09-02  
**Repository revision:** `56b9e64` (`main`, matching `origin/main`)  
**Testing boundary:** Safe, non-destructive testing only. No credentials were displayed or included in this report.

## Executive Summary

**JobPick is a generally healthy static job-search hub with two confirmed search-routing defects and a measurable performance opportunity.** The live homepage, public content routes, sitemap, robots file, and deployed homepage source were reachable and matched the checked repository revision. The core search state restores correctly from a shared URL and preserves role, country, and city for supported values; however, the Dubai test generated a Bayt URL containing the keyword but no city, and the GulfTalent UAE URL redirected to a mobile route that returned HTTP 404. The live homepage scored 70 Performance, 97 Accessibility, 100 SEO, and 100 Best Practices in Lighthouse; LCP was 3.4 seconds, Total Blocking Time 660 ms, and CLS 0.109, so the largest user-facing engineering opportunity is JavaScript/main-thread and layout stability work rather than a redesign. The source contains a broad, explicit platform catalog and defensive URL encoding, while the public site exposes only publishable Supabase configuration as intended; authentication could not be end-to-end tested because the repository test requires environment variables that were not available. The site has a strong baseline of HTTPS, HSTS, CSP, framing, MIME-sniffing, referrer, and permissions headers. The report therefore prioritizes search-link correctness, platform monitoring, then performance and accessibility refinements, while separating confirmed defects from unverified or provider-dependent observations.

## Scope and Method

The audit combined live browser navigation, rendered-page inspection, HTTP requests, repository inspection, static reference checks, source review, platform URL checks, Lighthouse, and the repository’s own regression suite. Tested public areas included the homepage, navigation targets, jobs, guides, city content, legal pages, contact, tools, employers, partners, resources, methodology, crawl-control files, and an invalid route. Search state was tested with direct role/country/city URL restoration and with the selector flow. External links were checked from the rendered UAE state; provider anti-bot behavior was recorded as observed status, not automatically classified as a JobPick defect.

The following were **not fully completed**: exhaustive browser interaction for every one of the user-suggested keyword combinations, authenticated Supabase flows, a real offline/network-failure simulation, screen-reader testing, and every requested viewport as an independently captured browser session. The report does not present those unperformed checks as passes. The browser console MCP action was unavailable in this session, so no claim of a clean console was made.

## Overall Health

| Area | Score | Basis |
|---|---:|---|
| Website | **84/100** | Public routes work; two confirmed platform/search defects; no broad outage found. |
| Codebase | **86/100** | Clear static architecture, explicit catalog, tests and CI; limited testability and some inline/dead/legacy surface. |
| SEO | **93/100** | Lighthouse SEO 100, canonical/sitemap/robots checks pass; redirect entry point and dynamic-state indexing require continued monitoring. |
| Security | **86/100** | Strong live headers and safe URL handling observed; CSP still permits `unsafe-inline`; auth/RLS not end-to-end verified. |
| Performance | **70/100** | Lighthouse measurement: FCP 1.9 s, LCP 3.4 s, TBT 660 ms, CLS 0.109. |
| Accessibility | **97/100** | Lighthouse score; source has labels, custom selector roles, live regions, and focus behavior. Manual screen-reader coverage remains incomplete. |
| Search functionality | **78/100** | State restoration works; Bayt city omission and GulfTalent dead generated route confirmed. |

## Priority Findings

### HIGH-01 — Bayt search links silently drop the selected city

**Classification:** Confirmed problem  
**Severity:** **HIGH**  
**Area:** Search functionality / external platform routing

**Problem.** A city-specific search does not remain city-specific for Bayt.com.

**Evidence.** Loading the live URL `/?role=Software+Engineer&country=uae&city=dubai` restored `Software Engineer`, `United Arab Emirates`, and `Dubai`. The rendered Bayt link was:

```text
https://www.bayt.com/en/uae/jobs/?keyword=Software%20Engineer
```

The same state generated city parameters for LinkedIn, Indeed, Google, Careerjet, Talent.com, GulfTalent, Naukrigulf, Tanqeeb, Akhtaboot, Rigzone, Michael Page, Hays, and Dubizzle. The Bayt URL is therefore demonstrably inconsistent with the selected city.

**Location.** `index.html:854`:

```js
{code:'BYT',name:'Bayt.com',...,build:(q)=>`https://www.bayt.com/en/${countryPath}/jobs/?keyword=${q}`}
```

**Root Cause.** The Bayt builder accepts only `q`, so `cityName` is never incorporated even though `runSearch()` passes city context to every builder.

**User Impact.** Users searching Dubai, Abu Dhabi, Riyadh, or another city are sent to a broader Bayt country page and must repeat the location selection manually. This undermines the site’s central promise of cross-platform contextual search and can produce materially less relevant job results.

**Recommended Fix.** Confirm Bayt’s currently supported location parameter or canonical city URL pattern, then update the builder to use the verified parameter. If Bayt does not support a reliable city filter, label the row as country-only rather than implying that city filtering applies.

**Verification.** For at least UAE/Dubai, UAE/Abu Dhabi, Saudi/Riyadh, and Egypt/Cairo, assert that the generated URL either contains Bayt’s verified city parameter or the UI explicitly reports country-only behavior. Open each URL and confirm that the destination search state reflects the intended city.

### HIGH-02 — GulfTalent UAE generated search route returns 404

**Classification:** Confirmed problem  
**Severity:** **HIGH**  
**Area:** Search functionality / external platform routing

**Problem.** The generated GulfTalent URL is not a working search destination at the time of audit.

**Evidence.** The rendered UAE search link for the default `it` state was:

```text
https://www.gulftalent.com/uae/jobs/title/it
```

A safe `curl -L` check returned **HTTP 404** after redirecting to:

```text
https://www.gulftalent.com/mobile/uae/jobs/title/it
```

The Dubai source-generated form was:

```text
https://www.gulftalent.com/uae/jobs/title/software-engineer?location=Dubai
```

**Location.** `index.html:863`:

```js
build:(q,slug,cityKey,cityName)=>`https://www.gulftalent.com/${countryPath}/jobs/title/${slug}${cityName?'?location='+encodeURIComponent(cityName):''}`
```

**Root Cause.** The implementation assumes that the `/jobs/title/{slug}` route remains valid, but the provider redirected the request to a mobile path that returned 404. The defect may be an outdated provider URL structure rather than a syntax problem in JobPick.

**User Impact.** One of the site’s listed job sources leads users to a dead destination for the tested search.

**Recommended Fix.** Reconfirm GulfTalent’s current search URL through a real browser, update the route if necessary, and add a scheduled link-health check that follows redirects and evaluates the final page—not only the initial status.

**Verification.** Test keyword-only and city-specific GulfTalent links for all supported country paths. Require a successful final page and confirm that the keyword and location are reflected in the destination search state.

### MEDIUM-01 — Performance is below a strong production baseline

**Classification:** Confirmed measurement / improvement opportunity  
**Severity:** **MEDIUM**  
**Area:** Performance

**Evidence.** Lighthouse against the live homepage returned: Performance **70**, Accessibility **97**, SEO **100**, Best Practices **100**; FCP **1.9 s**, LCP **3.4 s**, TBT **660 ms**, CLS **0.109**, Speed Index **3.1 s**, and interactive **3.4 s**.

**Location.** Live homepage; the homepage includes a large inline script and a 1.9 MB PNG logo in the repository (`assets/middle-east-job-hub-logo.png`).

**Root Cause.** The measurement indicates meaningful main-thread work and a borderline LCP/CLS profile. Source inspection also found two identical Google Fonts stylesheet references in the rendered homepage HTML. The exact contribution of each resource was not isolated in this audit.

**User Impact.** Users on slower mobile devices may wait longer before the page becomes fully useful, and late layout changes may make the search form feel less stable.

**Recommended Fix.** Profile the homepage bundle and resource waterfall before changing code. Remove the duplicate font stylesheet, verify that the LCP background/image path is appropriately sized and prioritized, and split or defer non-critical interaction code only where profiling shows benefit.

**Verification.** Re-run Lighthouse under the same conditions and compare LCP, TBT, and CLS. Preserve visual and search behavior; do not optimize based on file size alone.

### MEDIUM-02 — CSP allows `unsafe-inline`

**Classification:** Confirmed security weakness, not an exploit demonstration  
**Severity:** **MEDIUM**  
**Area:** Security headers

**Evidence.** The live response included a CSP with `script-src ... 'unsafe-inline'` and `style-src ... 'unsafe-inline'`. The repository policy file contains the same allowance at `_headers:2`.

**Root Cause.** The static site relies heavily on inline scripts/styles. `unsafe-inline` reduces the protection CSP provides if an injection bug is later introduced.

**User Impact.** A future XSS defect would have a less restrictive browser policy available to contain it.

**Recommended Fix.** Migrate inline scripts/styles incrementally to external files, hashes, or nonces where the hosting platform supports them. Keep the current third-party allowlist narrow and verify analytics, ads, fonts, Supabase, and localization after each change.

**Verification.** Use a CSP report-only policy first, inspect violations, then remove `unsafe-inline` and re-run the complete interaction and authentication checks.

### LOW-01 — Duplicate Google Fonts stylesheet reference

**Classification:** Confirmed problem  
**Severity:** **LOW**  
**Area:** Performance / maintainability

**Evidence.** The captured live homepage HTML contained two identical stylesheet links to the same Google Fonts URL with the same font families and `display=optional` setting.

**User Impact.** The duplicate reference can create an unnecessary request/revalidation opportunity and makes the document head harder to maintain.

**Recommended Fix.** Keep one stylesheet reference and verify that the computed font and visual layout remain unchanged.

### LOW-02 — Verification HTML file is intentionally not a normal content page

**Classification:** Confirmed observation; not necessarily a defect  
**Severity:** **LOW**  
**Area:** Repository / SEO tooling

**Evidence.** Static inspection found `google212a37498484aaf9.html` without a title, H1, or `lang` attribute. It is a Google Search Console verification token file, not a user-facing document. The repository regression suite passes it as an expected special case.

**Recommendation.** Keep it excluded from generic HTML-page audits and do not add content markup that could invalidate verification. No fix is required.

## Live Route and Broken-Link Audit

| Route | Observed result | Assessment |
|---|---|---|
| `/` | HTTP 200 | Pass |
| `/home/` | HTTP 200, redirects to `/` in browser | Intended redirect entry point; no defect confirmed |
| `/jobs/` | HTTP 200 | Pass |
| `/about/` | HTTP 200 | Pass |
| `/privacy-policy/` | HTTP 200 | Pass |
| `/terms-of-use/` | HTTP 200 | Pass |
| `/advertising-disclosure/` | HTTP 200 | Pass |
| `/contact/` | HTTP 200 | Pass |
| `/corrections/` | HTTP 200 | Pass |
| `/editorial-standards/` | HTTP 200 | Pass |
| `/employers/` | HTTP 200 | Pass |
| `/partners/` | HTTP 200 | Pass |
| `/resources/` | HTTP 200 | Pass |
| `/tools/` | HTTP 200 | Pass |
| `/how-we-review-job-platforms/` | HTTP 200 | Pass |
| `/guides/uae-job-search-guide/` | HTTP 200 | Pass |
| `/cities/dubai-jobs/` | HTTP 200 | Pass |
| `/not-a-real-route-404/` | HTTP 404 | Pass; invalid route is correctly non-existent |

Repository static reference checks found **no broken internal links or missing sitemap targets**. The sitemap contained **38 unique URLs** with no duplicates. The repository’s own site regression test reported: **“PASS: 39 HTML entry points, 38 unique sitemap URLs, metadata/header/catalogue checks.”**

## External Platform Audit

The live UAE rendered state exposed 20 platforms: 7 general/global, 6 Gulf specialist, 4 recruitment agencies, 1 classifieds, and 2 government/emiratisation routes. “Status” below is the observed HTTP result from a safe `curl -L` request; 403, TLS failures, and timeouts can be provider or anti-bot behavior and are not automatically classified as broken JobPick links.

| Platform | Status | Search Works? | Country Works? | City Works? | Problem |
|---|---:|---|---|---|---|
| Bayt.com | 403 | URL generated | Yes in URL | **No — confirmed** | Dubai link omitted city parameter. |
| LinkedIn Jobs | 200 | URL generated | Yes | Yes in URL | No confirmed JobPick defect. |
| Indeed | 403 | URL generated | Yes | Yes in URL | Provider returned 403 to checker. |
| Google Jobs search | 200 | URL generated | Yes | Yes in query | Search fallback; no defect confirmed. |
| Glassdoor | 403 | Country route | Yes | Not selected in route | Provider returned 403; portal is country-level. |
| Careerjet | 200 | URL generated | Yes | Yes in URL | No confirmed defect. |
| Talent.com | 200, redirected | URL generated | Yes | Yes in URL | Provider added `l=United+Arab+Emirates`; no defect confirmed. |
| GulfTalent | **404 after redirect** | **No — confirmed** | Route present | Route present | Generated search route dead. |
| Naukrigulf | curl HTTP/2 error | URL generated | Yes | Yes in URL | Indeterminate provider/TLS result. |
| Tanqeeb | 202 | URL generated | Yes | Yes in URL | Asynchronous/provider response; not classified broken. |
| Akhtaboot | 200 | URL generated | Yes | Yes in URL | No confirmed defect. |
| Rigzone | 403 | URL generated | Yes | Yes in URL | Provider returned 403. |
| foundit | 200 portal | Portal only | Yes | No search params | Listed as portal by design. |
| Michael Page | 200 | URL generated | Yes | Yes in URL | No confirmed defect. |
| Robert Half | 200 portal | Portal only | General portal | No search params | Listed as portal by design. |
| Hays | 200 | URL generated | Yes | Yes in URL | No confirmed defect. |
| Charterhouse ME | 403 portal | Portal only | General portal | No search params | Provider returned 403. |
| Dubizzle Jobs | 200 | URL generated | Yes | Yes for Dubai | UAE route is Dubai-hosted; country-wide behavior needs provider verification. |
| Nafis | TLS error | Portal only | UAE | Not applicable | Provider TLS failure from checker; not classified as site defect. |
| U.AE jobs guidance | timeout | Portal only | UAE | Not applicable | Provider timeout; not classified as site defect. |

### Search-state coverage observed

The direct URL test `/?role=Software+Engineer&country=uae&city=dubai` correctly restored all three visible fields and produced URL-encoded keyword values. The source uses `encodeURIComponent` for keyword, city, and country-derived values in direct builders, and `slugify` for GulfTalent’s path segment. Empty role falls back to `jobs` for generated searches; the country is required before form submission; city selection is disabled until a country is selected. Arabic and special-character encoding appears intentionally handled by `encodeURIComponent`, but a complete browser matrix for all requested Arabic/long-input cases was not run.

## JavaScript and Source-Code Review

### Confirmed positive findings

The source has a clear static-site architecture, an explicit platform catalog, URL encoding for query parameters, defensive `try/catch` around localStorage, focus management in custom selectors, accessible names for star buttons, live regions for several dynamic statuses, and a repository regression suite. The deployed homepage, `robots.txt`, `sitemap.xml`, and `ads.txt` SHA-256 hashes matched the checked repository files at audit time.

The source uses `textContent` for user-entered application-tracker values and creates dynamic controls through DOM APIs in important areas. The search result HTML uses static platform metadata plus encoded URL values; no exploitable user-controlled `innerHTML` injection was demonstrated in this audit.

### Likely or unverified concerns

The homepage has a large inline JavaScript surface and dynamically rebuilds platform rows with `innerHTML`; although the dynamic values observed were encoded/static, future changes to platform metadata should preserve that boundary. The browser console tool was unavailable, so runtime console errors and failed browser network requests were not independently collected. The Supabase auth test could not run because `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `AUTH_TEST_EMAIL` were absent from the session.

## Authentication and Supabase

The repository includes publishable Supabase configuration in `assets/supabase-config.js`; no service-role credential was displayed or found in the current working-tree scan. The front end uses persisted Supabase sessions and optional email/Google flows, while search history and application tracking also have local browser behavior.

The repository’s password-policy test did not execute its authenticated checks because it reported missing required environment variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `AUTH_TEST_EMAIL`. Therefore, login, logout, session persistence, session expiry, RLS enforcement, protected data access, and auth-failure alert behavior remain **unverified**, not confirmed failures. The SQL migration visibly enables and forces RLS, revokes broad table access, grants authenticated access, and defines user-scoped policies; that is a positive source signal but not a substitute for live authorization tests.

The contact form is explicitly documented as a static `mailto:` composer rather than a server submission. Its native required/email validation and `reportValidity()` behavior are consistent with that claim; no mismatch was confirmed.

## SEO Audit

### Confirmed passes

The homepage has a title, meta description, canonical URL, robots directive, Open Graph title/description/url/image, Twitter card/title/description/image, `lang="en"`, and visible H1. Lighthouse SEO returned **100**. The sitemap has 38 unique URLs and all checked sitemap targets map to repository files. `robots.txt` is reachable and does not block the public site. The live homepage and the repository use the same canonical root and the same crawl-control file contents at audit time.

The repository’s static scan found no broken internal links or missing local script/image references among the checked HTML files. Guide and city pages contain page-specific titles and H1s in the source inventory.

### Limitations and recommendations

No Search Console or analytics exports were available, so organic traffic, index coverage, query performance, backlink quality, Core Web Vitals field data, and canonical duplication in Google’s index cannot be assessed. Search-state query parameters are intentionally functional state, while the canonical remains the homepage; monitor Search Console to ensure parameter variants do not become unwanted indexed duplicates. The `/home/` redirect page is correctly `noindex,follow` in source and is not in the sitemap.

## Accessibility Audit

Lighthouse returned **97** Accessibility. Source inspection confirms explicit form labels on the homepage and contact form, custom selector listbox/option semantics, keyboard event handlers for arrows/Home/End/Escape, visible status/live-region patterns, and accessible labels on icon-like controls and dynamic application controls.

No confirmed WCAG blocker was established from the available evidence. Manual screen-reader, high-contrast, 200% zoom, and touch-target testing was not completed. The custom selector implementation should receive focused keyboard and assistive-technology regression tests because it recreates native select behavior and dynamically replaces its options.

## Mobile and Desktop Review

The repository contains responsive CSS and the existing project QA records report a 72/72 responsive sweep across homepage and editorial pages at three widths and multiple languages, with no page/navigation/table overflow. That prior record is useful supporting evidence but was not recreated at every requested width in this session. The live viewport rendered the header, search controls, custom selectors, directory, and footer without an observed horizontal scrollbar in the inspected state.

**No new confirmed mobile or desktop layout defect is reported.** A full audit should still capture fresh screenshots at 320, 375, 390, 430, 768, 1280, 1440, and 1920 pixels, especially after fixing search row behavior.

## Forms and Error Handling

The homepage search form requires a country and preserves search state in the URL and local storage. The contact form has native required fields and email type validation, then composes a pre-filled email through `mailto:`; this behavior is disclosed on the page. The application tracker normalizes and length-limits company and role input, validates date shape and status, and stores data locally.

Network failure, offline mode, Supabase failure, disabled localStorage, and authenticated duplicate submissions were not fully simulated. The source generally catches localStorage failures and treats sync as optional, which is a sound graceful-degradation pattern. These cases should be added to an automated browser regression suite rather than assumed to pass.

## Prioritized Fix Plan

| Priority | File / function | Exact problem | Exact change required | Risk | Required test |
|---:|---|---|---|---|---|
| 1 | `index.html:863`, `getGroups()` GulfTalent builder | Generated UAE search reaches a redirected 404 route. | Confirm current GulfTalent route and replace the stale builder; add provider-specific route health test. | Medium: provider URL may change again. | Follow redirects for all country/keyword/city combinations; inspect final page and query state. |
| 2 | `index.html:854`, `getGroups()` Bayt builder | Selected city is omitted from Bayt search URL. | Use verified Bayt city parameter/URL or mark platform country-only in UI metadata. | Medium: provider may not support city filtering consistently. | Assert city preservation for UAE/Dubai, UAE/Abu Dhabi, Saudi/Riyadh, Egypt/Cairo. |
| 3 | Platform health test / CI | HTTP 200 alone does not prove search links work; provider redirects and 404s were observed. | Add scheduled safe checks that follow redirects, record final URL/status, and maintain an allowlist for provider anti-bot statuses. | Low to medium: external providers are variable. | Run on every catalog change and periodically; fail only on reproducible dead routes. |
| 4 | Homepage `<head>` | Duplicate Google Fonts stylesheet reference. | Remove the duplicate link and compare computed fonts/layout. | Low. | Lighthouse and screenshot comparison at mobile and desktop widths. |
| 5 | Homepage critical path | Lighthouse TBT 660 ms, LCP 3.4 s, CLS 0.109. | Profile first; defer/split non-critical JS and verify image/font loading only where measurements identify cost. | Medium: can affect interactions or localization. | Same-condition Lighthouse plus manual search/selector regression. |
| 6 | `_headers`, inline scripts/styles | CSP permits `unsafe-inline`. | Migrate inline code to external files or hashes/nonces, beginning with report-only CSP. | Medium to high: third-party integrations may break. | CSP report review, auth/search/ads/analytics test matrix, security-header scan. |
| 7 | Tests | Auth/RLS and failure modes lack runnable evidence in this environment. | Add CI-safe mocked auth tests plus separately credentialed integration tests; add offline/localStorage-disabled browser cases. | Medium. | Run with fixtures and, where authorized, staging Supabase credentials. |
| 8 | Custom selectors | Native-select replacement requires ongoing keyboard/AT coverage. | Add Playwright/axe tests for roles, focus return, arrow navigation, Escape, and selected-value announcement. | Low. | Keyboard and automated accessibility regression suite. |

## Critical Problems

**None confirmed.**

## High Priority Problems

1. **HIGH-01:** Bayt drops the selected city from generated search links.
2. **HIGH-02:** GulfTalent generated UAE search route returns 404 after redirect.

## Medium Priority Problems

1. **MEDIUM-01:** Lighthouse Performance score 70 with LCP 3.4 s and TBT 660 ms.
2. **MEDIUM-02:** CSP allows `unsafe-inline`, reducing defense-in-depth.

## Low Priority Problems

1. **LOW-01:** Duplicate Google Fonts stylesheet reference.
2. **LOW-02:** Verification file lacks document metadata, but is an intentional special-purpose token file and needs no fix.

## Final Assessment

The repository and production site are substantially aligned and have a stronger baseline than a generic static-site review would suggest: regression checks pass, crawl files are coherent, public routes resolve, SEO metadata is present, and live security headers are materially useful. The audit’s most important action is not redesign; it is correcting and continuously validating outbound search routes. Once Bayt/GulfTalent routing is fixed, the next highest-value work is measured critical-path performance improvement and hardening the CSP without breaking the site’s inline behavior or optional Supabase features.

## Fixes Applied in This Follow-up

The two confirmed outbound search defects were fixed with minimal source changes. The Bayt builder now includes the selected city as a URL-encoded `location` parameter, while the GulfTalent builder now targets the provider’s working `/mobile/` route and preserves the city parameter. The repository regression suite was updated to prevent either regression from returning.

The duplicate-looking Google Fonts references were not removed: one is the normal JavaScript-enabled stylesheet and the other is the intentional `<noscript>` fallback. Removing the fallback would reduce no-JavaScript support rather than fix a confirmed duplicate network request. CSP migration and broader performance optimization were not applied because they require profiling and an integration-safe staged change; the current measured findings remain documented above.

Verification after the changes:

- `node tests/site-regression.mjs` passed.
- All tracked JavaScript syntax checks passed.
- All tracked JSON parsing checks passed.
- `git diff --check` passed.
- The corrected GulfTalent mobile URL returned HTTP 200 and retained `location=Dubai` after redirect resolution.
- The Bayt generated URL now includes `&location=Dubai`; Bayt returned HTTP 403 to the checker, so provider-side result rendering remains anti-bot/externally unverified.

No source files outside `index.html` and `tests/site-regression.mjs` were changed for this follow-up.

## Evidence Commands and Artifacts

- Repository regression: `node tests/site-regression.mjs` → `PASS: 39 HTML entry points, 38 unique sitemap URLs, metadata/header/catalogue checks`.
- Auth test: `node tests/supabase-password-policy-test.mjs` → not run because required environment variables were unavailable.
- Lighthouse: `npx lighthouse https://jobpick20.com/ ...` → scores and metrics recorded above.
- Deployment comparison: SHA-256 hashes for `index.html`, `robots.txt`, `sitemap.xml`, and `ads.txt` matched repository files.
- Live route checks: all listed public routes returned HTTP 200; invalid route returned HTTP 404.
- External platform evidence: safe `curl -L` checks against rendered UAE links; provider statuses are tabulated above.

No credentials, publishable keys, access tokens, or personal data are included in this report.

## CV Generator and Live Integration Follow-up — 2026-09-02

The live `/tools/` page was tested with a non-sensitive sample CV and a Senior Software Engineer job description targeting TypeScript, React, Node.js, PostgreSQL, AWS, automated testing, API performance, reliability, mentoring, and product/design collaboration. The page exposed the modern, classic, and executive template choices and accepted the sample inputs. An unauthenticated upload correctly returned a user-facing failure rather than bypassing access control. After authenticating through the connected browser, the page displayed “Signed in” and the sample file was uploaded again, but the browser still reported `Failed to fetch` before a successful upload response.

The API itself responded correctly to safe probes: the preflight returned HTTP 204 with `Access-Control-Allow-Origin: https://jobpick20.com`, credentials enabled, and the expected headers; unauthenticated upload, process, download, and remove mutations returned HTTP 401 with `UNAUTHORIZED`; and unauthenticated list access was rejected. The observed browser failure is explained by the deployed response CSP: its `connect-src` list does not include `https://jobpickcv-5ouvegg7.manus.space`, even though the repository `_headers` file was updated to include it. The repository deployment note states that GitHub Pages does not apply `_headers`; therefore, the live header must be changed at the header-capable CDN/reverse proxy or the API must be proxied same-origin. This is an external deployment configuration blocker, not an authentication bypass.

The local PDF generator was hardened and tested with the same sample CV. All three templates generated valid one-page Letter PDFs with extractable name, target role, employer, contact information, summary, experience, skills, education, and footer text. The wrapping function now preserves the final line of long content, the function accepts an explicit `template='modern'` argument, and unsupported Unicode punctuation is normalized into PDF-safe text. Analytics hooks are present for `cv_generation_started`, `cv_generation_success`, `cv_generation_failure`, `cv_download_started`, `cv_download_success`, and `cv_download_failure`, with consent gating delegated to `window.JobHubTrack`. The duplicate `trackCv` declarations were removed.

A fresh Lighthouse run against the live CV tools page returned Performance **93**, Accessibility **100**, SEO **100**, and Best Practices **100**. The measured CV page values were FCP **2.2 s**, LCP **2.3 s**, TBT **0 ms**, CLS **0**, Speed Index **4.4 s**, and interactive **2.3 s**. The live security response includes HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, permissions restrictions, X-Frame-Options, and CSP. CSP still contains `unsafe-inline`; removing it requires staged migration of inline code and integration testing. No further performance optimization was deployed because the CV page’s measured performance is already strong and the remaining CSP issue is an infrastructure configuration mismatch.

The changes are committed and pushed in `4e9f3f5` (`feat: harden cv export and analytics checks`). Local validation passed for site regression, PDF export, live unauthenticated/CORS integration, JavaScript syntax, JSON parsing, and whitespace. Authenticated upload/process/download/RLS success remains the only uncompleted integration path and requires the live CSP deployment fix first.


## CV Regeneration Prompt Update — 2026-09-02

The attached CV regeneration standard has been incorporated into the secure processing instruction. The generator now internally analyzes the vacancy and source CV, distinguishes highly relevant and transferable evidence, maps requirements to truthful source content, prioritizes supported ATS terminology, preserves legitimate metrics and dates, uses an evidence-based 3–5 line summary, organizes skills by value, omits unsupported certifications and qualifications, selects an appropriate one- or two-page length, and produces only the final CV rather than analysis, ATS scoring, recruiter commentary, or application-gap notes inside the downloadable document. It explicitly forbids invented employers, titles, dates, responsibilities, achievements, KPIs, technologies, certifications, education, languages, and qualifications.

A client-side readiness gate now checks generated output for contact information, summary/profile, experience or education, and skills. If all core signals are present, the UI reports an application-ready CV; otherwise it reports the missing sections and keeps the output available for review rather than falsely claiming readiness. The readiness state is included in the consent-gated `cv_generation_success` analytics event without transmitting CV text or personal contact data.

Validation after this update passed the site regression suite, all three PDF template exports, the live UI/CORS/unauthenticated integration suite, JavaScript syntax checks, and whitespace checks. The implementation is committed and pushed in `33fc429` (`feat: improve truthful cv job targeting`).

