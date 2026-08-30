# JobPick live employer-feed audit

**Run time:** 30 August 2026, 05:52 UTC  
**Scope:** 19 configured public Greenhouse, Lever, and Ashby boards  
**Method:** Public JSON endpoints; 365-day freshness rule; deduplicated by original application URL; city matching follows `/jobs/` aliases.

## Executive result

All **19 of 19 sources responded successfully**. The feeds returned **5,890 raw postings** and **3,492 current postings** after the existing freshness and listed-status rules. The current postings were unique by original application URL in this run. **117 postings matched the configured Middle East region aliases**, while 3,375 were global, outside-region, or not city-matched.

## City-by-city distribution

| City | Current postings | Share of matched MENA postings | Leading sources |
|---|---:|---:|---|
| Riyadh | 56 | 47.86% | Sarj.ai 13; Flow 11; SOUM 8 |
| Dubai | 42 | 35.90% | Cohere 8; Checkout.com 7; Ajax Systems 6 |
| Cairo | 15 | 12.82% | Strategic Gears 5; SOUM 4 |
| Jeddah | 4 | 3.42% | Ajax Systems, Hopper, Jensen Hughes, SOUM |
| Abu Dhabi | 2 | 1.71% | Palantir Technologies; dLocal |
| Doha | 1 | 0.85% | Hopper |
| Manama | 1 | 0.85% | dLocal |
| Kuwait City | 0 | 0.00% | No current city match |
| Muscat | 0 | 0.00% | No current city match |
| Amman | 0 | 0.00% | No current city match |

The city counts total more than the regional total when a single posting names multiple cities, such as a MENA-region role. This is intentional: city counts represent discoverability in each city filter, while the regional total counts unique postings matching at least one regional alias.

## Source health and current volume

| Source | ATS | Raw | Current | MENA city matches |
|---|---|---:|---:|---|
| Ajax Systems | Lever | 205 | 181 | Riyadh, Dubai, Jeddah, Cairo |
| Flow | Lever | 42 | 42 | Riyadh, Dubai |
| Strategic Gears | Lever | 9 | 5 | Cairo |
| SOUM | Lever | 15 | 14 | Riyadh, Jeddah, Cairo |
| VEON | Lever | 3 | 3 | Dubai |
| WeRide.ai | Lever | 30 | 12 | Dubai |
| Palantir Technologies | Lever | 307 | 130 | Abu Dhabi |
| Contentsquare | Lever | 28 | 28 | Riyadh, Dubai, Cairo |
| dLocal | Lever | 53 | 44 | Riyadh, Abu Dhabi, Cairo, Manama |
| TSMG | Lever | 4,167 | 2,011 | Riyadh, Dubai |
| Jensen Hughes | Greenhouse | 137 | 137 | Riyadh, Dubai, Jeddah |
| Monks | Greenhouse | 354 | 354 | Riyadh, Dubai, Cairo |
| InterSystems | Greenhouse | 131 | 131 | Riyadh, Dubai |
| Cohere | Ashby | 146 | 138 | Riyadh, Dubai |
| Nomic | Ashby | 9 | 8 | Riyadh, Dubai |
| Checkout.com | Ashby | 176 | 176 | Riyadh, Dubai |
| Sarj.ai | Ashby | 13 | 13 | Riyadh |
| Hopper | Ashby | 43 | 43 | Riyadh, Dubai, Jeddah, Doha |
| Redesign Health | Ashby | 22 | 22 | Riyadh |

## Geographic interpretation

The current integrated set is heavily concentrated in **Riyadh and Dubai**, which together account for **83.76%** of city-filter matches. Cairo is the only other materially covered hub at 12.82%. Abu Dhabi, Jeddah, Doha, and Manama have limited coverage, while Kuwait City, Muscat, and Amman currently have no matches from these 19 boards.

The concentration is driven by a small number of sources: Sarj.ai and Flow in Riyadh; Cohere, Checkout.com, and Ajax Systems in Dubai; and Strategic Gears and SOUM in Cairo. TSMG is a large global Lever board but contributed only Riyadh and Dubai matches under the exact location-field rules used by the live page. It should not be treated as evidence of coverage for the zero-match cities.

## Accuracy and limitations

This audit does not fabricate vacancies or scrape employer pages. It reads public ATS JSON endpoints and counts only records that the live normalizer can identify, that remain listed, and that pass the existing freshness rule. A source can change between audit runs, and employer postings can mention multiple locations or regional eligibility without representing a dedicated local office. Users should continue to verify each role on the original employer application page.

## References

1. [JobPick live listings page](https://jobpick20.com/jobs/) — public interface and stated source methodology.
2. [Lever public postings API documentation](https://hire.lever.co/developer/documentation) — public employer-posting feed format used by Lever sources.
3. [Greenhouse Job Board API](https://developers.greenhouse.io/job-board.html) — public job-board endpoint format used by Greenhouse sources.
4. [Ashby Job Postings API](https://developers.ashbyhq.com/docs/posting-api) — public job-board endpoint format used by Ashby sources.
5. [TSMG public Lever board](https://jobs.lever.co/tsmg) — newly integrated employer board.
6. [JobPick repository commit](https://github.com/muka554/jobpick/commit/9ea43db) — prior TSMG source integration.
