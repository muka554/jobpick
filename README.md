# Gulf Job Hub

A static, self-contained job-search aggregator covering the UAE and Saudi Arabia. One search box builds direct search links into 15 configured job platforms, using platform-specific URLs where available and Google site-search only as a fallback. Platforms are centrally defined in `assets/platforms.js` and rendered by `home/index.html`. Grouped by category and styled as an airport departure board.

No backend, no build step, no database is required for the core search tool. Just HTML/CSS/JS files you can host anywhere.

## Files

| File | Purpose |
|---|---|
| `index.html` | Redirect stub to `/home/` |
| `home/index.html` | Homepage and search interface |
| `assets/platforms.js` | Central platform, country, city, and URL configuration |
| `about/index.html` | What the site is, no-affiliation notice, who runs it |
| `privacy-policy/index.html` | Cookies, analytics, AdSense data use, and opt-out links |
| `terms-of-use/index.html` | Liability limits, IP notice, and acceptable use |
| `advertising-disclosure/index.html` | How the site is funded and how sponsored links are marked |
| `contact/index.html` | Contact page |
| `ads.txt` | Google AdSense authorization file |

## Platform search behavior

Each platform is defined once in `assets/platforms.js`. A platform specifies its name, category, coverage, type, and `buildUrl` function. The homepage calls `getPlatformSearchUrl(platform, query)` for every row, so search behavior stays synchronized with the displayed platform list.

- `direct` means the platform's own search URL is used.
- `google` means the platform does not currently have a dependable public search URL in this configuration, so a Google search fallback is used.
- `portal` is reserved for login-required or landing-page destinations.

Search inputs are URL-encoded. Country and city values are passed to each platform's URL builder where supported. If a URL builder throws an error, the helper safely falls back to Google search.

## Deploying

1. Keep all files at the root of the deployment.
2. Deploy with GitHub Pages, Netlify, Vercel, or another static host.
3. Confirm `/assets/platforms.js` loads successfully and `/ads.txt` resolves from the domain root.
4. Test searches with an empty role, a multi-word role, UAE cities, and Saudi cities.

## Before going fully live

- [ ] Verify every direct URL against the platform's current search behavior.
- [ ] Test external links in a desktop and mobile browser.
- [ ] Confirm the production domain is consistent in canonical tags, sitemap, robots, AdSense, and OAuth settings.
- [ ] Review privacy and terms pages against the actual analytics, advertising, and authentication setup.
- [ ] Confirm `ads.txt` loads as plain text rather than returning a 404.

## Ownership

© 2026 Gulf Job Hub. Run by Ahmed Abayzeed. Contact: wiz.mkawe@gmail.com
