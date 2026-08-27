# Content and performance remediation record

**Site:** Middle East Job Hub / JobPick (`jobpick20.com`)  
**Prepared:** 27 August 2026  
**Purpose:** Apply the attached audit’s content-distinctness and homepage critical-path recommendations without changing advertising-account settings, consent-message configuration, `ads.txt`, payment/identity/tax details, or the editorial-only advertising boundary.

## Summary

This release addresses two practical quality risks. First, it replaces six highly templated country guides and a generic scam-warning page with a canonical safety-and-evidence resource plus country-specific public-service decisions. Second, it removes the largest avoidable assets and optional account/sync work from an anonymous homepage visit, while retaining a visible sign-in entry point and the existing local-only history, private tracker, language, location, privacy, and safe authentication behavior.

The changes do **not** establish Google indexing, traffic growth, Core Web Vitals, consent-dialog delivery, or AdSense approval. Those remain dependent on crawling, real-user conditions, account configuration, and Google’s review systems.

| Area | Implemented change | Measured or verified result |
|---|---|---|
| Header and favicon image cost | Added owned 64 px PNG/WebP variants from the existing site logo; public headers use the 2,234-byte WebP and favicons use the 3,477-byte PNG. | The visible header image falls from 1,915,349 bytes to 2,234 bytes, a **99.8834%** reduction. The full-resolution image remains available for structured publisher identity/social metadata. |
| Default language path | Split `site-translations.json` (1,342,636 bytes) into language-specific assets and changed the runtime to request only the selected non-English dictionary. | A clean anonymous English homepage visit did not request `site-translations.json`, `i18n/ar.json`, `i18n/hi.json`, or `i18n/ur.json`. Explicit Arabic selection requested only `i18n/ar.json` and the Arabic font stylesheet. |
| Optional account/sync work | Replaced eager homepage Supabase configuration and history-sync scripts with explicit loading when a visitor selects **Sign in** or **Sync searches**. A light Sign in launcher remains visible. | Browser regression passed: no anonymous initial account/sync download; Sign in loads the existing dialog only after a click; Sync searches loads the optional sync module and exposes its email-link form without submitting an email. |
| Noncritical homepage work | Deferred local search-history rendering, private tracker rendering, country-detection listener setup, and sync-control preparation until idle; removed the decorative `mousemove` handler and board mutation/count animation subsystem. | Core country/city search behavior, default-empty selection, local history, location buttons, tracker controls, and privacy coordinator are left intact; no UI credentials or personal data were entered during validation. |
| Universal country-guide overlap | Rebuilt the existing recruitment-scam page as the canonical **job application safety and evidence checklist**, using an original “pause, compare, preserve” workflow. | The resource centralizes universal document/payment/evidence advice, source limitations, corrections logging, and official reporting context. |
| Country-guide distinctness | Rewrote Bahrain, Qatar, Oman, Jordan, Egypt, and Kuwait guides around different public-service or route decisions. | Post-rewrite body-overlap audit found **zero** pairs at or above 20% 8-gram Jaccard similarity; the highest remaining pair was 14.81%. |
| Localization and mobile behavior | Added validated Arabic, Hindi, and Urdu mappings and corrected a global inline-whitespace localization defect. | Zero missing exact strings on eight affected guide/resource pages; 72 mobile/RTL combinations passed at 320, 390, and 430 px. |

## Editorial architecture now applied

| Page or guide | Reader decision made distinct | Primary-source scope |
|---|---|---|
| [Application safety and evidence checklist](/guides/recruitment-scam-warning-signs/) | How to pause, compare independently located sources, and preserve a private record before sharing information or responding to payment requests. | Fair-recruitment cost context from the ILO; UAE online cybercrime reporting channels; Saudi private-sector labour-regulation reporting context. [1] [2] [3] |
| [Bahrain guide](/guides/bahrain-job-search-guide/) | Whether the public job-seeker registration route fits the reader before preparing sensitive documents. | The public service lists its stated audience, conditions, and attachments. [4] |
| [Qatar guide](/guides/qatar-job-search-guide/) | Whether Kawader’s published audience applies, versus an employer-led application path. | The public service identifies Qataris and children of Qatari women as its audience and describes documents and electronic stages. [5] |
| [Oman guide](/guides/oman-job-search-guide/) | How to separate job-seeker-record evidence from role-specific employer-application evidence. | The official service describes job-seeker registration/update and lists current document context. [6] |
| [Jordan guide](/guides/jordan-job-search-guide/) | Whether the immediate need is matching through Sajjil, career guidance, or a direct employer application. | The Ministry describes Sajjil, matching, and career-guidance functions. [7] |
| [Egypt guide](/guides/egypt-job-search-guide/) | How to distinguish a dated platform announcement from a currently available application route. | The official notice reported a planned national digital platform on 1 May 2026; the guide does not imply live access. [8] |
| [Kuwait guide](/guides/kuwait-job-search-guide/) | How to verify a live central-registration route before building a plan around it. | The official page identifies Central Registration for Job Seekers. Conditions and availability are intentionally not reproduced because automated extraction was unavailable. [9] |

Every rewritten page has a canonical URL, Article structured data, the Editorial Team byline, a dated source-and-review module, a corrections-log link, scoped `strict-origin-when-cross-origin` referrer policy, the existing editorial CMP marker, and exactly one site-authored ad loader. The homepage remains ad-free.

## Validation performed

The following deterministic and browser-level checks passed before publication:

| Check | Result |
|---|---|
| HTML/Article JSON-LD/canonical/CMP/referrer-policy checks for seven editorial guides | Pass |
| Homepage no-ad scope and no eager Supabase/search-sync/all-language catalog references | Pass |
| Shared runtime, account-module, and homepage inline JavaScript syntax | Pass |
| Exact-string localization audit for the canonical guide, six country guides, and resource library | 0 missing strings |
| Generated translation script-integrity checks | 0 cross-script issues |
| Translation source catalog, full catalog, and all three runtime files agree | Pass for 240 newly validated source strings |
| Responsive sweep: homepage plus seven editorial pages × 3 widths × EN/AR/UR | 72/72 pass; no page, navigation, or table overflow |
| Clean-profile anonymous homepage resource test | Pass; no eager optional account/sync module and no all-language dictionary |
| Explicit Sign in and Sync searches no-credentials tests | Pass |
| Country-guide overlap audit | 0 pairs at or above 20%; highest remaining pair 14.81% |
| Diff whitespace hygiene | Pass |

The mobile visual review at 390 px confirmed readable navigation, title hierarchy, source content, contained tables, a visible Sign in entry point, and no privacy-control overlap. It surfaced one runtime whitespace issue next to inline links; the shared localization runtime was corrected and the clean-profile re-render passed.

## Authority-link recheck

The automated recheck reported six reachable sources: UAE Government, Saudi MHRSD, Bahrain Government, Qatar Civil Service and Government Development Bureau, Gov.om, and Jordan Ministry of Labour. The ILO and Kuwait endpoints returned access restrictions (HTTP 403) to the checker, while the Egyptian State Information Service endpoint had a TLS/network-indeterminate result. Those three are **not** classified as broken; their URLs and source boundaries are documented for periodic manual rechecking.

## Remaining dependencies

No new Google Search Console request, AdSense review, or advertising-account setting was submitted. Future work should include allowing crawl time, observing index coverage and Search Console page performance, reconfirming each official source before material editorial updates, and adding further country/city guides only when they provide a genuinely distinct decision tool. A synthetic Lighthouse score was not rerun in this sandbox, so this record reports the measured critical-path removals and browser regression outcomes rather than an unverified score improvement.

## References

[1]: https://www.ilo.org/topics-and-sectors/fair-recruitment/regulating-and-measuring-recruitment-fees-and-costs "ILO — Regulating and measuring recruitment fees and costs"
[2]: https://u.ae/en/information-and-services/justice-safety-and-the-law/cyber-safety-and-digital-security "UAE Government — Cyber safety and digital security"
[3]: https://www.hrsd.gov.sa/en/ministry-services/services/%D8%B1%D8%B5%D8%AF-%D8%A8%D9%84%D8%A7%D8%BA%D8%A7%D8%AA-%D9%85%D8%AE%D8%A7%D9%84%D9%81%D8%A7%D8%AA-%D9%86%D8%B8%D8%A7%D9%85-%D8%A7%D9%84%D8%B9%D9%85%D9%84 "MHRSD — Reporting violations of labour regulations"
[4]: https://services.bahrain.bh/wps/portal/en/BSP/GSX-UI-EServiceDetails?esID=2274 "Bahrain Government — Register new job seekers and update data"
[5]: https://cgb.gov.qa/En/Services/Pages/eService-Details.aspx?itemID=6 "Qatar Civil Service and Government Development Bureau — Kawader"
[6]: https://gov.om/en/w/register-job-seeker-s-data-in-manpower-records "Gov.om — Register as a job seeker or update your information"
[7]: https://mol.gov.jo/EN/Pages/Employment_Directorate "Jordan Ministry of Labour — Employment Directorate"
[8]: https://sis.gov.eg/en/media-center/news/ministry-of-labor-to-launch-platform-connecting-job-seekers-with-employers/ "Egypt State Information Service — Ministry of Labor platform announcement"
[9]: https://e.gov.kw/sites/kgoenglish/Pages/eServices/CSC/RegisterForJob.aspx "Kuwait Government Online — Central Registration for Job Seekers"
