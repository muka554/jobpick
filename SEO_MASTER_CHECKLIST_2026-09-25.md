# JobPick Technical SEO and Programmatic Content Master Checklist

**Site:** https://jobpick20.com  
**Repository:** `muka554/jobpick`  
**Audit date:** 25 September 2026  
**Scope:** indexation, programmatic architecture, structured data, E-E-A-T, AdSense quality, internal linking, and UAE/GCC content expansion.

> This checklist is an implementation guide, not a promise of Google indexing, rich-result eligibility, AdSense approval, traffic growth, or legal compliance. Google evaluates the live site and account independently. Policy pages should be reviewed by qualified counsel for the publisher’s actual entity, vendors, and jurisdictions.

## 1. Current-state verdict

### Already implemented

- The repository contains **44 public canonical HTML entry points**.
- Every audited page has one self-canonical, title, meta description, Open Graph metadata, Twitter card metadata, one H1, and parseable JSON-LD.
- The UAE Job Search Playbook is live at `/guides/uae-job-search-playbook/`.
- Privacy Policy, Terms of Service, advertising disclosure, editorial standards, author pages, and contact routes are publicly linked.
- A versioned privacy-control banner supports essential-only and optional analytics choices on non-Google-CMP pages.
- Editorial pages use the applicable Google-certified consent flow for advertising pages where configured.
- Breadcrumb and editorial structured-data work has been added to the UAE landing-page cluster.
- GitHub Actions runs both the site regression suite and the landing-page SEO validator.

### Highest-priority gaps

1. **Sitemap coverage was incomplete.** Before this change, the sitemap listed 19 URLs while the repository exposed 44 indexable canonical pages. The sitemap is now generated from the canonical-page inventory and contains 44 URLs.
2. **Sitemap maintenance was brittle.** The old updater used a hard-coded partial list and fixed dates. It is now a compatibility wrapper around the deterministic inventory generator.
3. **The validator did not check sitemap parity.** It now fails when a canonical public page is missing from the sitemap or when the sitemap contains a URL that is not an indexable canonical page.
4. **The deployment currently publishes repository-root artifacts.** Operational paths such as `/scripts/`, `/tests/`, `/supabase/`, and `/cv-service-google-oauth/` should be removed from the public build or protected at the hosting layer. `robots.txt` alone is not an index-removal mechanism.
5. **`/index.html` should permanently redirect to `/`.** The root has the correct self-canonical, but an edge redirect is a stronger consolidation signal.
6. **Localization is client-side only.** The current language switch changes text on one URL. Do not add hreflang to the same URL. If Arabic, Hindi, or Urdu organic search is a goal, create server-rendered or static, separately addressable localized URLs first.

## 2. Indexation and URL architecture

### Canonical URL policy

- Keep one HTTPS apex URL: `https://jobpick20.com/`.
- Keep trailing-slash directory URLs for public pages.
- Keep self-canonicals on every indexable page.
- Keep parameterized search/filter states canonicalized to their clean base pages unless a finite filter state becomes a genuine editorial landing page with unique content.
- Do not create thousands of role/city combinations merely by templating a title and a list of outbound links.
- If a filter state has no useful result or no distinct editorial content, keep it out of the sitemap and consider a crawlable `noindex` response at the hosting/application layer. Do not depend on robots blocking to remove it from Google.

### Sitemap implementation

Implemented files:

- `scripts/generate_sitemap.mjs`
- `scripts/update_sitemap_for_content_revision.mjs`
- `scripts/validate-seo-landing-pages.mjs`
- `sitemap.xml`

Operating rules:

- Generate from canonical `index.html` pages rather than a hard-coded list.
- Include only absolute HTTPS URLs that are intended to be indexable.
- Preserve `lastmod` only when a meaningful existing content date is known.
- Do not update `lastmod` for deployment-only, copyright-only, or script-cache changes.
- Omit `changefreq` and `priority`; Google does not use them for ranking or scheduling.
- Submit the root sitemap in Search Console and monitor sitemap processing separately from URL Inspection.

Run:

```bash
node scripts/generate_sitemap.mjs
node scripts/validate-seo-landing-pages.mjs
node tests/site-regression.mjs
```

### Robots and deployment

Current `robots.txt` is intentionally permissive for the public site. The safer long-term architecture is an allow-listed build directory containing only public HTML, public assets, `robots.txt`, `sitemap.xml`, and required verification files. Do not deploy the repository root when source, test, OAuth documentation, or operational scripts are not meant to be public.

If the hosting layer supports headers, use `X-Robots-Tag: noindex` for crawlable operational artifacts that must remain reachable. Use authentication or a 404/410 response for material that should not be public at all. A `Disallow` rule prevents crawling but does not reliably remove an already-known URL from Google’s index.

### Redirects

Add and test this edge rule in the actual hosting/CDN system:

```text
/index.html  /
```

Use a permanent redirect and ensure it does not create a chain. The final root response should be 200, self-canonical, and present in the sitemap.

## 3. Internal-linking framework

Use a three-layer structure:

1. **Discovery hubs:** homepage, `/jobs/`, `/resources/`, and the UAE/GCC country and city hubs.
2. **Intent pages:** `/jobs-in-uae/`, `/it-jobs-uae/`, `/customer-service-jobs-dubai/`, `/technical-support-jobs-uae/`, `/sales-jobs-uae/`, and future role/location pages.
3. **Trust and decision support:** Playbook, CV guide, scam-warning guide, editorial standards, platform-review method, Privacy Policy, Terms, and Advertising Disclosure.

Every new indexable page should receive:

- One contextual link from an established hub.
- One parent breadcrumb link.
- Two to four relevant peer links, not a mass footer list.
- A descriptive anchor that reads naturally, such as “IT jobs in the UAE” or “Dubai customer service jobs”.
- A path back to a source-linked guide or safety page when the intent involves applications or offers.

Recommended UAE cluster:

```text
/                         -> /jobs-in-uae/ -> /it-jobs-uae/
                                      |      -> /technical-support-jobs-uae/
                                      |      -> /customer-service-jobs-dubai/
                                      |      -> /sales-jobs-uae/
                                      |
                                      -> /cities/dubai-jobs/
                                      -> /cities/abu-dhabi-jobs/
                                      -> /guides/uae-job-search-playbook/
                                      -> /guides/uae-cv-guide/
                                      -> /guides/recruitment-scam-warning-signs/
```

Avoid keyword-stuffed blocks, repeated exact-match anchors, and footer links to every location/role combination.

## 4. Structured-data framework

### WebSite with SearchAction

Use on the homepage only when the search action genuinely produces a usable search experience. The target must match the actual site behavior; do not mark a client-side form as a server search URL that does not exist.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "JobPick",
  "url": "https://jobpick20.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://jobpick20.com/jobs/?keyword={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

Only use this exact pattern if the target URL is a real, crawlable search experience. Otherwise publish `WebSite` without a misleading `SearchAction`.

### CollectionPage

Use on genuine hubs such as `/jobs/`, `/resources/`, or a city/category collection page. The page should contain visible, crawlable links to the items it claims to collect.

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "IT Jobs in the UAE",
  "url": "https://jobpick20.com/it-jobs-uae/",
  "isPartOf": {"@type":"WebSite","url":"https://jobpick20.com/"},
  "about": {"@type":"Thing","name":"IT jobs in the United Arab Emirates"}
}
```

### Article / BlogPosting

Use on original editorial guides and Playbooks, with a real author URL, publication date, meaningful modification date, and visible byline. Do not use `Article` to disguise a thin directory page.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "UAE Job Search Playbook",
  "description": "A practical, source-linked workflow for safer UAE job searching.",
  "url": "https://jobpick20.com/guides/uae-job-search-playbook/",
  "datePublished": "2026-09-22T00:00:00+04:00",
  "dateModified": "2026-09-22T00:00:00+04:00",
  "author": {"@type":"Person","name":"JobPick Editorial Team","url":"https://jobpick20.com/authors/jobpick-editorial-team/"},
  "publisher": {"@type":"Organization","name":"Middle East Job Hub","url":"https://jobpick20.com/"}
}
```

### BreadcrumbList

Use visible breadcrumbs and ensure the JSON-LD hierarchy matches the visible links. Keep URLs absolute and include the current page as the final item.

### JobPosting and Google for Jobs

Use `JobPosting` only on a page for one specific, genuine vacancy with a visible job description, real employer, location or remote status, date posted, and valid-through handling. A category page, search-results page, directory page, or generic outbound link page should not emit `JobPosting`.

For externally sourced jobs, retain the source job URL, source timestamp, employer identity, and expiry lifecycle. When a vacancy expires, remove it from the sitemap and either return 404/410 or render a genuinely useful archived page without misleading `JobPosting` markup. Do not keep expired vacancy schema live.

## 5. E-E-A-T and AdSense quality

### Required page-level value

Each role/location landing page should contain more than a list of links:

- What the query means and who the page is for.
- Which platform/source types are appropriate and why.
- A short verification or scam-safety checklist.
- UAE/GCC-specific application context where supported by a source.
- Links to the relevant official or first-party source.
- A clear statement that JobPick does not recruit, place candidates, or guarantee listings.
- A named author/editorial owner and review date for substantive guidance.

### Advertising controls

- Keep ad units visually and structurally separate from search controls and external-platform buttons.
- Do not place ads where they can be mistaken for an application link.
- Keep advertising disclosure and privacy choices accessible from every relevant page.
- Do not use language that encourages ad clicks or implies advertiser endorsement.
- Keep AdSense code off thin utility/search pages where the page’s primary purpose is navigation rather than editorial value.

### External links

- Use `target="_blank" rel="noopener"` for external links opened in a new tab.
- Use `rel="nofollow"` or `rel="sponsored"` where the relationship, paid placement, or editorial status requires it. Do not add `nofollow` to every ordinary editorial reference by default.
- Keep link text descriptive and avoid keyword stuffing.
- Never pass raw user-entered text into HTML without escaping.

## 6. Keyword and content expansion blueprint

Do not publish every permutation. Publish a page only when it has a distinct audience, useful local context, and original content.

| Cluster | Example page | Original value requirement | Internal links |
|---|---|---|---|
| UAE hub | Jobs in the UAE | Search-route explanation, safety checklist, country context | Dubai, Abu Dhabi, role pages, Playbook |
| UAE technology | IT jobs in UAE | Role-family breakdown, title variants, CV evidence prompts | UAE hub, technical support, CV guide |
| UAE support | Technical support jobs in UAE | Skill clusters, shift/worksite questions, verification tips | IT, Dubai, Playbook |
| Dubai service | Customer service jobs in Dubai | Customer-facing role variants, location/work-pattern context | Dubai hub, UAE hub, CV guide |
| UAE commercial | Sales jobs in UAE | B2B/B2C/retail distinction, target/commission caution | UAE hub, city pages, offer-safety guide |
| GCC country | Saudi/Qatar/Kuwait jobs | Country-specific source links and current application cautions | Country guide, city pages, regional hub |
| Trust content | Recruitment scam warning signs | Concrete red flags and reporting/verification routes | Every commercial/search landing page |

Metadata templates should be written to the specific page rather than copied mechanically:

- **Title:** `IT Jobs in the UAE | JobPick` — keep the primary intent early and avoid unnecessary date stuffing.
- **Description:** `Find safer routes to IT jobs in the UAE, compare platform types, and use JobPick’s practical application checklist.`
- **Title:** `Customer Service Jobs in Dubai | JobPick`.
- **Description:** `Explore customer service search routes in Dubai with role variants, application tips, and verification guidance.`

Treat length as a display heuristic, not a ranking guarantee. The repository validator reports long values as warnings so they can be refined without hiding legitimate descriptive titles.

## 7. 30/60/90-day operating cadence

### First 30 days

- Submit and inspect the new 44-URL sitemap.
- Add the production redirect for `/index.html`.
- Move to an allow-listed public build or protect operational source directories.
- Inspect the new Playbook, UAE hubs, and policy pages in Search Console.
- Refine the 19 title/description warnings in priority order.

### Days 31–60

- Add two to four genuinely differentiated UAE role/location pages, not dozens of thin permutations.
- Add contextual links from every new page to a parent hub, one peer page, and one trust guide.
- Review expired/changed external routes and update source notes.
- Decide whether localized organic pages justify separate server-rendered `/ar/`, `/hi/`, or `/ur/` routes. Do not add same-URL hreflang.

### Days 61–90

- Review Search Console performance by page cluster and query intent.
- Consolidate pages with overlapping intent or weak original value.
- Expand only clusters that earn impressions and meaningful engagement.
- Recheck privacy vendors, consent behavior, advertising placement, policy dates, and source freshness.

## References

[1]: https://developers.google.com/search/docs/crawling-indexing/robots/intro "Google Search Central: robots.txt introduction"
[2]: https://developers.google.com/search/docs/crawling-indexing/block-indexing "Google Search Central: block search indexing with noindex"
[3]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central: build and submit a sitemap"
[4]: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls "Google Search Central: consolidate duplicate URLs"
[5]: https://developers.google.com/crawling/docs/faceted-navigation "Google Search Central: manage crawling of faceted navigation URLs"
[6]: https://developers.google.com/search/blog/2022/03/url-parameters-tool-deprecated "Google Search Central: URL Parameters tool deprecated"
[7]: https://developers.google.com/search/docs/specialty/international/localized-versions "Google Search Central: localized versions of pages"
[8]: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites "Google Search Central: managing multi-regional and multilingual sites"
[9]: https://developers.google.com/search/docs/crawling-indexing/links-crawlable "Google Search Central: crawlable links"
[10]: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data "Google Search Central: introduction to structured data"
[11]: https://developers.google.com/search/docs/appearance/structured-data/article "Google Search Central: Article structured data"
[12]: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb "Google Search Central: Breadcrumb structured data"
[13]: https://developers.google.com/search/docs/appearance/structured-data/job-posting "Google Search Central: JobPosting structured data"
[14]: https://support.google.com/adsense/answer/48182 "Google AdSense: publisher policies"
[15]: https://developers.google.com/search/docs/fundamentals/creating-helpful-content "Google Search Central: creating helpful, reliable, people-first content"
