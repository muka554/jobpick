# Content and Link Readiness Validation — 2026-08-26

This report validates the locally staged static-site revision. External checks use a small ranged GET request, follow redirects, and classify access controls, rate limits, and server errors as **indeterminate**, not broken.

## City-guide framework checks

| City guide | Editorial-team link | Source section | Last-reviewed note | External authoritative links | Result |
|---|---:|---:|---:|---:|---|
| abu-dhabi-jobs | Yes | Yes | Yes | 3 | Pass |
| amman-jobs | Yes | Yes | Yes | 3 | Pass |
| cairo-jobs | Yes | Yes | Yes | 4 | Pass |
| doha-jobs | Yes | Yes | Yes | 3 | Pass |
| dubai-jobs | Yes | Yes | Yes | 3 | Pass |
| kuwait-city-jobs | Yes | Yes | Yes | 3 | Pass |
| manama-jobs | Yes | Yes | Yes | 4 | Pass |
| muscat-jobs | Yes | Yes | Yes | 4 | Pass |
| riyadh-jobs | Yes | Yes | Yes | 3 | Pass |

## Crawl signals

| Signal | Result |
|---|---|
| Robots allows crawling | Pass |
| Robots advertises sitemap | Pass |
| Author profile in sitemap | Pass |
| All revised city URLs carry 2026-08-26 lastmod | Pass |
| All guide URLs carry 2026-08-26 lastmod | Pass |

## Local internal-link results

All checked internal links from the revised city and guide pages resolve to local source files.

## External authoritative-source results

**Reachable:** 10. **Indeterminate:** 19. **Broken:** 0.

| Source URL | HTTP result | Classification | Final URL / diagnostic |
|---|---:|---|---|
| https://cgb.gov.qa/En/Services/Pages/eService-Details.aspx?itemID=6 | network error | indeterminate | curl: (28) Operation timed out after 8000 milliseconds with 39521 out of 109079 bytes received |
| https://dubaicareers.ae/en/employers/pages/Information.aspx?ID=28 | network error | indeterminate | curl: (28) SSL connection timeout |
| https://dubaicareers.ae/en/pages/default.aspx | network error | indeterminate | curl: (28) SSL connection timeout |
| https://e.gov.kw/sites/kgoenglish/Pages/ApplicationPages/ServiceSearch.aspx?T=Employment | 403 | indeterminate | https://e.gov.kw/sites/kgoenglish/Pages/ApplicationPages/ServiceSearch.aspx?T=Employment |
| https://e.gov.kw/sites/kgoenglish/Pages/eServices/CSC/RegisterForJob.aspx | 403 | indeterminate | https://e.gov.kw/sites/kgoenglish/Pages/eServices/CSC/RegisterForJob.aspx |
| https://gov.om/en/ministry-of-labour | network error | indeterminate | curl: (28) Operation timed out after 8000 milliseconds with 237489 bytes received |
| https://gov.om/en/w/apply-for-private-sector-job-opportunities | 200 | reachable | https://gov.om/en/w/apply-for-private-sector-job-opportunities |
| https://gov.om/en/w/register-job-seeker-s-data-in-manpower-records | 200 | reachable | https://gov.om/en/w/register-job-seeker-s-data-in-manpower-records |
| https://hukoomi.gov.qa/en/services/apply-for-a-job-through-kawader-national-erecruitment-portal-for-qataris | 403 | indeterminate | https://hukoomi.gov.qa/en/services/apply-for-a-job-through-kawader-national-erecruitment-portal-for-qataris |
| https://jobs.gov.eg/ | network error | indeterminate | curl: (60) SSL certificate problem: self-signed certificate in certificate chain More details here: https://curl.se/docs/sslcerts.html  curl failed to verify the legitimacy of the server and therefore could not establish a secure connection to it. To learn more about this situation and how to fix it, please visit the web page mentioned above. |
| https://lmra.gov.bh/en/home | 403 | indeterminate | https://lmra.gov.bh/en/home |
| https://mol.gov.jo/EN/Pages/About_MOL | network error | indeterminate | curl: (28) SSL connection timeout |
| https://mol.gov.jo/EN/Pages/Employment_Directorate | network error | indeterminate | curl: (28) SSL connection timeout |
| https://my.gov.sa/en/services/19019 | 403 | indeterminate | https://my.gov.sa/en/services/19019 |
| https://opaz.gov.om/en/about-us/current-vacancies | 200 | reachable | https://opaz.gov.om/en/about-us/current-vacancies |
| https://qcdc.org.qa/ | network error | indeterminate | curl: (28) Operation timed out after 8000 milliseconds with 104728 out of 107461 bytes received |
| https://sajjil.gov.jo/ | network error | indeterminate | curl: (28) Operation timed out after 8001 milliseconds with 53023 bytes received |
| https://services.bahrain.bh/wps/portal/en/BSP/GSX-UI-EServiceDetails?esID=2274 | 200 | reachable | https://services.bahrain.bh/wps/portal/en/BSP/GSX-UI-EServiceDetails?esID=2274 |
| https://sis.gov.eg/en/media-center/news/ministry-of-labor-to-launch-platform-connecting-job-seekers-with-employers/ | network error | indeterminate | curl: (60) SSL certificate problem: unable to get local issuer certificate More details here: https://curl.se/docs/sslcerts.html  curl failed to verify the legitimacy of the server and therefore could not establish a secure connection to it. To learn more about this situation and how to fix it, please visit the web page mentioned above. |
| https://u.ae/en/information-and-services/jobs | 200 | reachable | https://u.ae/en/information-and-services/jobs |
| https://u.ae/en/resources/government-jobs | 200 | reachable | https://u.ae/en/resources/government-jobs |
| https://www.cairo.gov.eg/en/more/important-sites/ | 200 | reachable | https://www.cairo.gov.eg/en/more/important-sites/ |
| https://www.hrdf.org.sa/en/products-and-services/programs/individuals/other/jadarat/ | network error | indeterminate | curl: (28) SSL connection timeout |
| https://www.hrdf.org.sa/en/products-and-services/programs/individuals/other/jadarat/apply/ | network error | indeterminate | curl: (28) SSL connection timeout |
| https://www.manpower.gov.eg/ | network error | indeterminate | curl: (60) SSL certificate problem: unable to get local issuer certificate More details here: https://curl.se/docs/sslcerts.html  curl failed to verify the legitimacy of the server and therefore could not establish a secure connection to it. To learn more about this situation and how to fix it, please visit the web page mentioned above. |
| https://www.manpower.gov.kw/EmploymentServiceEnglish.aspx | network error | indeterminate | curl: (28) SSL connection timeout |
| https://www.mol.gov.bh/?lang=en | 200 | reachable | https://www.mol.gov.bh/?lang=en |
| https://www.tamkeen.bh/en/programs/national-employment-program-3-0/ | 200 | reachable | https://www.tamkeen.bh/en/programs/national-employment-program-3-0/ |
| https://www.tamm.abudhabi/en/life-events/individual/Discover-Emirati-Benefits/Work-Employment/ApplytoaJobVacancy | 200 | reachable | https://www.tamm.abudhabi/en/life-events/individual/Discover-Emirati-Benefits/Work-Employment/ApplytoaJobVacancy |

## Scope and limits

This is a pre-publication link and source check. It does not prove Google indexing, Search Console coverage, advertiser approval, traffic quality, or an external agency’s current eligibility rules. Those depend on the external service and may change after publication.
