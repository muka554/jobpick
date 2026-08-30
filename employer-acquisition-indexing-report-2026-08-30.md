# Employer acquisition and indexing update

**Date:** 30 August 2026

## What was implemented

JobPick now has a public `/employers/` pathway for verified vacancy submissions. The page explains the employer value proposition, city-focused candidate discovery, source-of-truth linking, submission requirements, review standards, and the four-step workflow from submission to publication. Because the site is static, the submission path opens an email draft and does not claim to store or process applications on a backend.

A direct **For employers** link was added across the public HTML routes and the 404 fallback. Arabic, Hindi, and Urdu locale dictionaries now include translated navigation labels. The homepage and jobs experience retain direct calls to action for the employer route and live listings.

The employer page includes a self-referencing canonical, `index,follow` robots directive, WebPage JSON-LD, an internal link to the live jobs route, and original-source review language. It was added to `sitemap.xml` with a 30 August 2026 modification date.

## Local validation

The repository validator found 35 public index pages represented by the local sitemap, no missing canonicals, no unexpected `noindex` directives on public pages, no missing Jobs links, valid locale JSON, and valid employer-page JavaScript. The sitemap contains 36 URLs because the homepage is included as an additional root URL.

## Search Console status

Search Console accepted the updated `https://jobpick20.com/sitemap.xml` and reported **Success with 36 discovered pages** on 30 August 2026. URL Inspection showed the homepage and `/jobs/` as indexed. The new `/employers/` URL was not yet indexed because it was unknown to Google, but its live test completed and the priority indexing request was accepted.

The Page indexing report itself was last updated 21 August 2026 and still showed 4 indexed and 6 not indexed pages across four reasons: page with redirect (2), alternate page with proper canonical (2), duplicate where Google chose a different canonical (1), and crawled but currently not indexed (1). This report is stale relative to the new sitemap submission. Google controls the final indexing decision; no site owner can guarantee immediate indexing of every eligible URL.

## Practical employer-growth strategy now in place

The implemented pathway emphasizes low-friction outreach, accurate city and role metadata, direct employer-controlled application destinations, explicit anti-fraud screening, and transparent non-guarantee language. These reduce employer risk while giving candidates a useful reason to visit JobPick. Future growth should focus on direct outreach to employers hiring in the three zero-match hubs identified in the latest feed audit—Kuwait City, Muscat, and Amman—and on offering a structured ATS submission template rather than accepting incomplete vacancy text.

## References

1. [JobPick employer pathway](https://jobpick20.com/employers/)
2. [JobPick live listings](https://jobpick20.com/jobs/)
3. [JobPick sitemap](https://jobpick20.com/sitemap.xml)
4. [Google Search Console documentation: sitemap reports](https://support.google.com/webmasters/answer/7451001)
5. [Google Search Console documentation: URL Inspection](https://support.google.com/webmasters/answer/9012289)
