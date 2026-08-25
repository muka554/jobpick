# JobPick SEO and Performance Update

## How to install

Replace the contents of the GitHub repository with the contents of this package. Preserve the existing custom-domain setting and repository settings. The site remains a static public website and does not require Gulf Job Hub login.

If applying the patch instead, run this from the repository root:

```bash
git apply jobpick-seo-fixes.patch
```

Then commit and push the changes:

```bash
git add .
git commit -m "Improve SEO and page performance"
git push origin main
```

## Complete replacement files

The `jobpick-seo-fixed.zip` attachment contains the complete updated website. Copy the files inside its `jobpick/` directory into the root of the GitHub repository.

The following files were changed or added:

| Repository path | Action | Purpose |
|---|---|---|
| `index.html` | Replace | Keeps the root redirect lightweight and adds viewport/robots metadata. |
| `home/index.html` | Replace | Adds social metadata, WebPage/WebSite structured data, font preconnect, mobile background optimization, content-visibility, and shareable search URLs. |
| `about/index.html` | Replace | Adds consistent SEO/social metadata, structured data, font preconnect, and rendering hints. |
| `advertising-disclosure/index.html` | Replace | Same shared SEO/performance improvements. |
| `cities/abu-dhabi-jobs/index.html` | Replace | Same shared SEO/performance improvements. |
| `cities/dubai-jobs/index.html` | Replace | Same shared SEO/performance improvements. |
| `cities/riyadh-jobs/index.html` | Replace | Same shared SEO/performance improvements. |
| `contact/index.html` | Replace | Keeps the validated contact form and adds shared SEO/performance improvements. |
| `guides/gulf-job-platforms-explained/index.html` | Replace | Same shared SEO/performance improvements. |
| `guides/recruitment-scam-warning-signs/index.html` | Replace | Same shared SEO/performance improvements. |
| `guides/uae-cv-guide/index.html` | Replace | Same shared SEO/performance improvements. |
| `guides/uae-job-search-guide/index.html` | Replace | Same shared SEO/performance improvements. |
| `privacy-policy/index.html` | Replace | Same shared SEO/performance improvements. |
| `terms-of-use/index.html` | Replace | Same shared SEO/performance improvements. |
| `sitemap.xml` | Replace | Normalizes the homepage URL to `https://jobpick20.com/`. |
| `404.html` | Add | Provides a branded, crawl-safe fallback page for missing URLs. |
| `assets/platforms.js` | Delete | Removes the stale duplicate platform catalog; the homepage is the single source of truth. |
| `README.md` | Replace | Aligns documentation with the 20-platform public product. |

The Google site-verification file is intentionally unchanged.

## SEO improvements included

Every indexable page now has an explicit robots directive, theme color, Open Graph URL/type/site name, locale, Twitter card metadata, and truthful `WebPage` structured data. The homepage additionally has `WebSite` and `SearchAction` structured data. The homepage search state is written to the URL, which makes a search shareable and gives crawlers a stable query pattern.

The sitemap now uses the same normalized homepage URL as the canonical tag. A dedicated `404.html` is included with `noindex,follow` so invalid paths do not appear as indexable content while still giving users a useful route back to the site.

## Performance improvements included

The pages preconnect to both Google Fonts origins. The homepage disables fixed background attachment on smaller screens and applies `content-visibility:auto` to long content surfaces so below-the-fold sections can be skipped by the browser until needed. The root redirect no longer loads obsolete authentication dependencies. The stale duplicate platform JavaScript file was removed to prevent drift and an unnecessary asset request.

## After deployment

Submit the normalized sitemap in Google Search Console and Bing Webmaster Tools. Inspect the homepage and one guide, city, and legal page with Lighthouse on mobile. Confirm that the structured-data validator reports valid `WebPage` and homepage `WebSite` markup. Test the shareable URL format with a query such as:

```text
https://jobpick20.com/home/?role=software+engineer&country=ksa&city=riyadh
```

Finally, verify that `/account/` no longer appears as a navigation destination and that missing URLs show the new branded 404 page.
