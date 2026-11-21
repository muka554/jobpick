# Security headers deployment note

The `_headers` file contains the recommended CSP, MIME-sniffing, referrer, permissions, and framing controls for hosts that support repository `_headers` files, such as Netlify or Cloudflare Pages. GitHub Pages serves repository files but does not apply `_headers` as HTTP response headers. The live custom domain will therefore continue to expose only the headers provided by GitHub Pages until the site is placed behind a header-capable CDN/reverse proxy or moved to a host with custom-header support.

Before enabling the CSP, test all analytics, advertising, font, image, and tag-manager behavior. The policy intentionally allows the current third-party services and inline code; the stronger long-term solution is to move inline code to external files and replace `'unsafe-inline'` with nonces or hashes.


## Approved location-policy repair, 21 November 2026

The repository policy permits the existing IP lookup at `https://ipwho.is` in `connect-src` and permits device geolocation for the same origin with `geolocation=(self)`. The browser must still ask the visitor for permission. Camera and microphone remain disabled.

This file is not the live deployment. The live domain returns a different CSP and two Permissions-Policy header instances. Update the existing live `connect-src` by adding only `https://ipwho.is`, preserving every other directive and origin. Find both sources of Permissions-Policy and remove their `geolocation=()` restrictions, leaving an effective `camera=(), microphone=(), geolocation=(self)` policy. Do not paste the repository CSP over the live CSP, since the live site has additional required services.

After deployment, inspect response headers for both policy instances. Test a fresh browser with granted device location, user-denied device location, successful IP lookup, failed IP lookup and an existing explicit country choice. A working device-location button depends on the visitor granting permission and providing a usable fix. IP lookup is approximate and depends on its service being available.
