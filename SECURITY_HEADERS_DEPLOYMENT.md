# Security headers deployment note

The `_headers` file contains the recommended CSP, MIME-sniffing, referrer, permissions, and framing controls for hosts that support repository `_headers` files, such as Netlify or Cloudflare Pages. GitHub Pages serves repository files but does not apply `_headers` as HTTP response headers. The live custom domain will therefore continue to expose only the headers provided by GitHub Pages until the site is placed behind a header-capable CDN/reverse proxy or moved to a host with custom-header support.

Before enabling the CSP, test all analytics, advertising, font, image, and tag-manager behavior. The policy intentionally allows the current third-party services and inline code; the stronger long-term solution is to move inline code to external files and replace `'unsafe-inline'` with nonces or hashes.
