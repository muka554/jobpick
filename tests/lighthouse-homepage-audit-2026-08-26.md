# Lighthouse homepage audit — 2026-08-26

## Scope

Lighthouse 12.8.2 audited `https://jobpick20.com/` in isolated headless Chromium mobile and desktop modes. These are controlled lab measurements, not field Core Web Vitals or a guarantee of a visitor’s result. The homepage was audited before the local font-loading refinement in this release was published.

| Category | Mobile | Desktop |
|---|---:|---:|
| Performance | 38 | 60 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

## Lab metrics

| Metric | Mobile | Desktop |
|---|---:|---:|
| First Contentful Paint | 5.0 s | 3.5 s |
| Largest Contentful Paint | 5.3 s | 3.9 s |
| Total Blocking Time | 370 ms | 0 ms |
| Cumulative Layout Shift | 0.318 | 0.038 |
| Speed Index | 8.9 s | 6.5 s |

Lighthouse reported no failing accessibility audits in either profile. The principal performance opportunities were render-blocking resources (estimated mobile savings: 1,559 ms; desktop: 171 ms) and initial server response time (estimated mobile savings: 829 ms; desktop: 625 ms).

## Applied response

This release changes the homepage Google Fonts stylesheet from a render-blocking stylesheet to an asynchronous stylesheet with a no-script fallback while retaining the same font declarations. The existing image preload remains in place. This directly addresses the measured render-blocking-resource opportunity without removing multilingual typography or changing accessible fallback fonts.

The initial server-response opportunity is influenced by the static hosting/CDN path and cannot be truthfully attributed solely to public-page HTML. No claim is made that this change alone achieves a particular Lighthouse score; a new production audit is required after deployment to measure its effect.
