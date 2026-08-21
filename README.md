# Gulf Job Hub

A static, self-contained job-search aggregator covering the UAE and Saudi Arabia. The site builds search links into job platforms and government employment sources. It does not host job listings or process applications.

## Reliability checklist

- Keep `CNAME`, `robots.txt`, `sitemap.xml`, and `ads.txt` at the repository root.
- Confirm the custom domain loads over HTTPS and enable GitHub Pages **Enforce HTTPS**.
- Test the homepage, legal pages, guides, city pages, `robots.txt`, `sitemap.xml`, and `ads.txt` after every deployment.
- Check every external platform link periodically and remove broken or misleading destinations.
- Keep a visible contact method for corrections, removal requests, and suspicious-link reports.
- Use one canonical domain and avoid duplicate versions of the same page.
- Do not add `JobPosting` structured data unless the site hosts a complete, visible individual job page.

## Content standards

New guides should be original, useful, region-specific, fact-checked, and dated. Do not copy complete job descriptions or claim that external listings are verified unless they have been checked. Sponsored links and advertisements must remain visually distinct from ordinary search links.

## AdSense notes

Verify the publisher line in `ads.txt` against the AdSense dashboard. Add only lines supplied by Google. Do not click your own ads, encourage clicks, use artificial traffic, or place ads where users could mistake them for navigation or job results.

## Repository

The site is deployed from the `main` branch. The AdSense and reliability work is prepared on a separate review branch so it can be inspected before merging.

## Ownership

© 2026 Gulf Job Hub. Run by Ahmed Abayzeed. Contact: wiz.mkawe@gmail.com