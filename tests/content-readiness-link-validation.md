# Content and Link Readiness Validation — 2026-08-26

This report validates the locally staged static-site revision. External checks use a small ranged GET request, follow redirects, and classify access controls, rate limits, and server errors as **indeterminate**, not broken.

## City-guide framework checks

| City guide | Editorial-team link | Source section | Last-reviewed note | External authoritative links | Result |
|---|---:|---:|---:|---:|---|
| abu-dhabi-jobs | Yes | Yes | Yes | 2 | Pass |
| amman-jobs | Yes | No | No | 0 | Review |
| cairo-jobs | Yes | No | No | 0 | Review |
| doha-jobs | Yes | No | No | 0 | Review |
| dubai-jobs | Yes | Yes | Yes | 3 | Pass |
| kuwait-city-jobs | Yes | No | No | 0 | Review |
| manama-jobs | Yes | No | No | 0 | Review |
| muscat-jobs | Yes | No | No | 0 | Review |
| riyadh-jobs | Yes | Yes | Yes | 3 | Pass |

## Crawl signals

| Signal | Result |
|---|---|
| Robots allows crawling | Pass |
| Robots advertises sitemap | Pass |
| Author profile in sitemap | Pass |
| All revised city URLs carry 2026-08-26 lastmod | Fail |
| All guide URLs carry 2026-08-26 lastmod | Fail |

## Local internal-link results

| From | Link | Expected local target |
|---|---|---|
| guides/bahrain-job-search-guide/index.html | [metadata] last-reviewed note | required framework item |
| guides/bahrain-job-search-guide/index.html | [metadata] structured modified date | required framework item |
| guides/egypt-job-search-guide/index.html | [metadata] last-reviewed note | required framework item |
| guides/egypt-job-search-guide/index.html | [metadata] structured modified date | required framework item |
| guides/gulf-job-platforms-explained/index.html | [metadata] structured author | required framework item |
| guides/gulf-job-platforms-explained/index.html | [metadata] structured modified date | required framework item |
| guides/jeddah-job-search-guide/index.html | [metadata] structured modified date | required framework item |
| guides/jordan-job-search-guide/index.html | [metadata] last-reviewed note | required framework item |
| guides/jordan-job-search-guide/index.html | [metadata] structured modified date | required framework item |
| guides/kuwait-job-search-guide/index.html | [metadata] last-reviewed note | required framework item |
| guides/kuwait-job-search-guide/index.html | [metadata] structured modified date | required framework item |
| guides/oman-job-search-guide/index.html | [metadata] last-reviewed note | required framework item |
| guides/oman-job-search-guide/index.html | [metadata] structured modified date | required framework item |
| guides/qatar-job-search-guide/index.html | [metadata] last-reviewed note | required framework item |
| guides/qatar-job-search-guide/index.html | [metadata] structured modified date | required framework item |
| guides/recruitment-scam-warning-signs/index.html | [metadata] structured modified date | required framework item |
| guides/saudi-job-search-guide/index.html | [metadata] structured modified date | required framework item |
| guides/uae-cv-guide/index.html | [metadata] structured author | required framework item |
| guides/uae-cv-guide/index.html | [metadata] structured modified date | required framework item |
| guides/uae-job-market-guide/index.html | [metadata] structured author | required framework item |
| guides/uae-job-market-guide/index.html | [metadata] structured modified date | required framework item |
| guides/uae-job-search-guide/index.html | [metadata] structured author | required framework item |
| guides/uae-job-search-guide/index.html | [metadata] structured modified date | required framework item |
| guides/uae-job-search-playbook/index.html | [metadata] last-reviewed note | required framework item |
| guides/uae-job-search-playbook/index.html | [metadata] structured author | required framework item |
| guides/uae-job-search-playbook/index.html | [metadata] structured modified date | required framework item |

## External authoritative-source results

**Reachable:** 2. **Indeterminate:** 5. **Broken:** 0.

| Source URL | HTTP result | Classification | Final URL / diagnostic |
|---|---:|---|---|
| https://dubaicareers.ae/en/employers/pages/Information.aspx?ID=28 | 200 | reachable | https://dubaicareers.ae/en/employers/pages/Information.aspx?ID=28 |
| https://dubaicareers.ae/en/pages/default.aspx | 200 | reachable | https://dubaicareers.ae/en/pages/default.aspx |
| https://my.gov.sa/en/services/19019 | 403 | indeterminate | https://my.gov.sa/en/services/19019 |
| https://u.ae/en/information-and-services/jobs | network error | indeterminate | curl: (28) SSL connection timeout |
| https://u.ae/en/resources/government-jobs | network error | indeterminate | curl: (28) Operation timed out after 8001 milliseconds with 51771 bytes received |
| https://www.hrdf.org.sa/en/products-and-services/programs/individuals/other/jadarat/ | network error | indeterminate | curl: (28) SSL connection timeout |
| https://www.hrdf.org.sa/en/products-and-services/programs/individuals/other/jadarat/apply/ | network error | indeterminate | curl: (28) SSL connection timeout |

## Scope and limits

This is a pre-publication link and source check. It does not prove Google indexing, Search Console coverage, advertiser approval, traffic quality, or an external agency’s current eligibility rules. Those depend on the external service and may change after publication.
