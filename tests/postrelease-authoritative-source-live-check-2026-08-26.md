# Post-Release Authoritative Source Live Check — 2026-08-26

## Method

This follow-up reviews the exact 24 URLs that were previously classified as indeterminate. Each source is retrieved afresh from its public URL and is classified as **verified live**, **partially retrievable**, or **not independently retrievable in this environment**. A retrieval limitation is not treated as a broken source without a verified 4xx/5xx response or a browser-visible error.

## Findings recorded so far

| Source | Current classification | Evidence from the live page |
|---|---|---|
| [Qatar Civil Service — Kawader](https://cgb.gov.qa/En/Services/Pages/eService-Details.aspx?itemID=6) | Verified live | The Civil Service and Government Development Bureau page identifies Kawader, describes its audience and service information, and lists requirements. |
| [Dubai Careers](https://dubaicareers.ae/en/pages/default.aspx) | Verified live | The official portal exposes job-search categories, employer pages, and public links for UAE nationals, graduates, private-sector jobs, experienced applicants, and people of determination. |
| [Kuwait Government — Employment services directory](https://e.gov.kw/sites/kgoenglish/Pages/ApplicationPages/ServiceSearch.aspx?T=Employment) | Not independently retrievable in initial text check | The text extractor returned no readable content; no broken-link finding is made. |
| [Kuwait Government — Central Registration for Job Seekers](https://e.gov.kw/sites/kgoenglish/Pages/eServices/CSC/RegisterForJob.aspx) | Not independently retrievable in initial text check | The text extractor returned no readable content; no broken-link finding is made. |
| [Oman Ministry of Labour](https://gov.om/en/ministry-of-labour) | Verified live | The official Gov.om ministry profile is available and identifies the Ministry’s services and labour-market role. |
| [Oman — Apply for a job in the private sector](https://gov.om/en/w/apply-for-private-sector-job-opportunities) | Verified live | The official service page describes private-sector job/training search and application steps; it was marked updated July 21, 2026. |
| [Qatar Hukoomi — Kawader service](https://hukoomi.gov.qa/en/services/apply-for-a-job-through-kawader-national-erecruitment-portal-for-qataris) | Verified live | The service page describes the Kawader route, target audience, activation steps, supporting documents, and job application sequence. |
| [Egypt Government Jobs Portal](https://jobs.gov.eg/) | Not independently retrievable in initial text check | The text extractor returned no readable content; no broken-link finding is made. |
| [Jordan Ministry of Labour — About](https://mol.gov.jo/EN/Pages/About_MOL) | Verified live | The official page exposes employment services, guidance material, private employment-office resources, and labour-market information. |
| [Jordan Ministry of Labour — Employment Directorate](https://mol.gov.jo/EN/Pages/Employment_Directorate) | Partially retrievable; source identity verified | The available page content identifies the Central Employment Directorate, the National Employment Platform Division, and direct employment through Sajjil. |
| [Saudi GOV.SA — Apply for jobs on Jadarat](https://my.gov.sa/en/services/19019) | Verified live | The official service page describes professional-file creation, job search, application steps, citizen target audience, and its HRDF service route. |

The remaining sources are reviewed below as the check proceeds.
| [OPAZ — Careers](https://opaz.gov.om/en/about-us/current-vacancies) | Verified live | The Public Authority for Special Economic Zones and Free Zones page is live, identifies itself as a careers route, and says current vacancies are published through its linked Arabic page. |
| [Jordan Sajjil National Employment Platform](https://sajjil.gov.jo/) | Verified live | The platform is live and presents individual job/training search, employer access, and dated listed opportunities. |
| [Egypt State Information Service — planned platform announcement](https://sis.gov.eg/en/media-center/news/ministry-of-labor-to-launch-platform-connecting-job-seekers-with-employers/) | Verified live, announcement only | The live May 1, 2026 article describes an upcoming national platform. It does not establish that the announced platform is a current application route. |

## Notes for editorial use

The Egypt city guide already treats the State Information Service item as an announcement rather than a live application instruction. That framing remains appropriate after the live check. The OPAZ and Sajjil links are confirmed usable public routes. No content change is required from these three checks.
| [UAE Government — Jobs](https://u.ae/en/information-and-services/jobs) | Verified live | The official federal jobs hub is live and provides categories for job search, employment process, workplace regulations, and labour-market information. |
| [UAE Government — Government jobs](https://u.ae/en/resources/government-jobs) | Verified live | The official page is live and links to federal, Abu Dhabi, Dubai, Sharjah, Ajman, Ras Al Khaimah, and people-of-determination government job routes. |
| [Abu Dhabi TAMM — Apply to a Job Vacancy](https://www.tamm.abudhabi/en/life-events/individual/Discover-Emirati-Benefits/Work-Employment/ApplytoaJobVacancy) | **Broken at the exact URL** | The live TAMM site returned its own “page you’re looking for can’t be found” page. The source should be removed or replaced after a current official destination is confirmed. |
| [Cairo Governorate — Important Sites](https://www.cairo.gov.eg/en/more/important-sites/) | Verified live, contextual directory | The official Cairo portal page is live and provides a broad public directory of government, service, industry, education, and other sites; it is not an employment-application portal. |

## Required follow-up

The exact TAMM page in the Abu Dhabi guide is now a confirmed broken route. It must not remain as a cited official job-application destination. The UAE Government’s own live **Government jobs** directory remains an authoritative alternative source but its linked Abu Dhabi destination currently resolves to the same unavailable TAMM page; no substitute application URL will be asserted until independently confirmed.
| [Saudi HRDF — Jadarat overview](https://www.hrdf.org.sa/en/products-and-services/programs/individuals/other/jadarat/) | Verified live | The official HRDF page identifies Jadarat as the Unified National Employment Platform, its Saudi job-seeker audience, public/private-sector scope, and the platform destination. |
| [Saudi HRDF — Apply for jobs on Jadarat](https://www.hrdf.org.sa/en/products-and-services/programs/individuals/other/jadarat/apply/) | Partially retrievable; source identity verified | The available official content identifies the application service, its Nafath/professional-file steps, Saudi eligibility, and current HRDF service route. |
| [Egypt Ministry of Labour](https://www.manpower.gov.eg/) | Verified live | The Ministry page is live and exposes work-opportunity content and links to domestic and overseas opportunity routes. |
| [Kuwait Public Authority for Manpower — Employment Service](https://www.manpower.gov.kw/EmploymentServiceEnglish.aspx) | Verified live | The English service page is live and describes electronic employment/protection services for registered workers and employers; it is not a general public job-board page. |

## Notes for editorial use

The two Jadarat sources and Egypt Ministry source remain appropriate authoritative references. The Kuwait source should be described as an official employment-service route rather than as an open vacancy directory; the current city-guide wording is reviewed for that distinction in the final implementation check.
| [Bahrain Labour Market Regulatory Authority](https://lmra.gov.bh/en/home) | Verified live by browser | The official homepage loaded and displayed public labour-market e-services, virtual-centre access, employer/employee service groups, and a 23 August 2026 update. |
| [Bahrain Ministry of Labour](https://www.mol.gov.bh/?lang=en) | Verified live by browser | The official homepage loaded and displayed National Employment Platform, jobseeker registration/status, nomination/employment records, training, and unemployment-support services. |

## Bahrain hostname note

The text-extraction service could not resolve the two Bahrain government hostnames, but both exact HTTPS URLs loaded normally in the browser. They are confirmed live and should not be reported as broken.
| [Kuwait Government — Employment services directory](https://e.gov.kw/sites/kgoenglish/Pages/ApplicationPages/ServiceSearch.aspx?T=Employment) | **Restricted: verified 403** | Direct browser retrieval returned `403 Forbidden` from `Microsoft-Azure-Application-Gateway/v2`. No page content was available to confirm a current public route. |
| [Kuwait Government — Central Registration for Job Seekers](https://e.gov.kw/sites/kgoenglish/Pages/eServices/CSC/RegisterForJob.aspx) | **Restricted: verified 403** | Direct browser retrieval returned `403 Forbidden` from `Microsoft-Azure-Application-Gateway/v2`. No page content was available to confirm a current public route. |

## Kuwait follow-up

The two exact Kuwait Government URLs are not marked as broken because the observed response is access restriction, not `404`/`410`. However, neither is presently usable as a public-link destination from this verification environment. The Kuwait city guide should label them as official references and avoid implying that visitors can necessarily open or complete their service directly from every network.
| [Egypt Government Jobs Portal](https://jobs.gov.eg/) | **Unsafe from this browser: untrusted certificate warning** | Direct browser navigation was intercepted by an endpoint-security warning for an untrusted certificate. The warning was not bypassed, and no portal content was accessed. |

## Completion summary

All **24** originally indeterminate URLs have now been reviewed. **18** are verified live public pages or routes (including two browser-verified Bahrain pages), **2** are partially retrievable but have verified official identity, **2** return verified `403` access restrictions from Kuwait’s gateway, **1** is a confirmed TAMM `404` page, and **1** presents an untrusted-certificate warning.

### Required remediation before re-publication

The exact Abu Dhabi TAMM link should be removed from the relevant city guide because it now returns a page-not-found response. The exact Egypt Government Jobs portal link should be removed or clearly excluded from direct-application guidance until a secure, officially confirmed replacement is available; this check did not bypass the certificate warning. The two Kuwait links should be retained only as official-reference links with no promise of public network availability.
## Staged remediation completed

The Abu Dhabi guide’s exact TAMM page-not-found link and the Cairo guide’s exact Egypt Government Jobs link with the certificate warning have been removed from the city-guide source lists. Abu Dhabi retains two verified UAE Government sources, and Cairo retains three verified authoritative/contextual sources. The Kuwait City guide now states that the official Civil Service Commission reference may be restricted by the visitor’s network and does not imply universal availability.

The staged generator and rendered pages were checked to confirm the two removed URLs no longer appear in those guides and the Kuwait caveat is present. Publication remains pending the final commit, deployment, and production recheck.
