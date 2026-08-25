# Gulf Job Hub

A static, self-contained job-search aggregator covering the UAE and Saudi Arabia. One search box builds direct search links into 8 configured job platforms, using platform-specific URLs where available and Google search as a fallback. The platform list and URL builders are embedded in `home/index.html`, so the homepage does not depend on a separate data file. Grouped by category and styled as an airport departure board.

No backend, no build step, no database is required for the core search tool. Just HTML/CSS/JS files you can host anywhere.

## Files

| File | Purpose |
|---|---|
| `index.html` | Root redirect to `/home/` |
| `home/index.html` | Homepage, self-contained platform list, URL builders, and search interface |
| `about/index.html` | What the site is, no-affiliation notice, who runs it |
| `contact/index.html` | Contact form and contact details |
| `privacy-policy/index.html` | Privacy and advertising disclosures |
| `terms-of-use/index.html` | Usage rules and external-link disclaimer |
| `advertising-disclosure/index.html` | Advertising and sponsorship disclosure |
| `assets/` | Shared site assets |
| `cities/` | City landing pages |
| `guides/` | Editorial guides |
| `sitemap.xml` | Search-engine sitemap |
| `robots.txt` | Crawler rules |
| `CNAME` | Custom domain configuration |

## Deployment

This repository is designed for static hosting, including GitHub Pages. Configure the custom domain through the repository settings if needed.

## Scope

The site organizes outbound links to third-party job platforms. It does not scrape listings, create accounts on external platforms, or guarantee availability, accuracy, hiring outcomes, or employer legitimacy. Always verify the original listing before applying.

## Editorial and commercial notes

- Platform descriptions and editorial pages should remain neutral and clearly distinguish outbound links from paid placements.
- Any sponsored placement should be labeled.
- Job seekers should never be asked to pay Gulf Job Hub to access a job listing.
- The site may use advertising or affiliate links; any commercial relationship should be disclosed.
- External destinations may require registration or login on their own websites.

## Maintenance checklist

- Test the homepage search controls after changing platform URLs.
- Check city pages and guides for broken internal links.
- Keep canonical URLs, sitemap entries, and the custom domain aligned.
- Review external destinations periodically because third-party URL formats can change.
- Keep contact and disclosure information current.
