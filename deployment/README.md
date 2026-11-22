# Ad-page CSP override

Status: staged configuration, not an automatic deployment. Merging this directory does not change Cloudflare or the live CSP.

## Purpose and scope

The live response CSP is set by ordered Cloudflare response-header transform rules. GitHub Pages does not apply this repository's `_headers` fallback. Adding an HTML meta policy cannot relax an enforced response policy.

`adsense-csp.json` describes one new, last-position, CSP-only response-header rule. It matches the apex hostname and 24 exact paths: the 12 existing AdSense-bearing articles, each with its directory URL and direct `index.html` URL. The paths are derived from actual script-bearing HTML, not a `/guides/*` or site-wide wildcard. All tool pages, the home page, policy pages and non-ad guides stay under their existing policy. The two existing response-header rules must remain unchanged.

This does not add ads, change ad settings, add analytics, change consent code, or change Permissions-Policy or any other response header. It intentionally allows the existing AdSense library's previously blocked resources, including its diagnostic and anti-abuse requests. There are no new `https:` wildcards, `unsafe-eval`, or changes to the existing inline-script permissions.

## Exact additions

The manifest is the deployment source of truth. Everything in its baseline policy is preserved. Only these seven source permissions are added:

| Directive | Added source | Reproduced use |
| --- | --- | --- |
| `script-src` | `https://ep2.adtrafficquality.google` | SODAR script |
| `img-src` | `https://pagead2.googlesyndication.com` | AdSense diagnostic images |
| `img-src` | `https://ep1.adtrafficquality.google` | SODAR image beacon |
| `connect-src` | `https://ep1.adtrafficquality.google` | SODAR configuration request |
| `frame-src` | `https://googleads.g.doubleclick.net` | AdSense frames |
| `frame-src` | `https://ep2.adtrafficquality.google` | SODAR runner frame |
| `frame-src` | `https://www.google.com/recaptcha/` | The library's `/recaptcha/api2/aframe` anti-abuse frame |

The Google frame permission is path-limited, not a blanket permission for all Google frames.

## Evidence and limits

On November 22, 2026, anonymous Chromium reproduced image, connection and frame CSP violations on the Egypt guide. Testing the candidate with only the main document response header substituted in an isolated browser revealed the subsequent SODAR script, runner, anti-abuse frame and image requirements above. With the final candidate, that same mobile-width guide load had no CSP violations, console warnings/errors, failed requests or horizontal overflow during the observation window. Production was not changed for this test. No ads were clicked.

This is a bounded fix for reproduced failures, not a complete, permanent AdSense compatibility guarantee, proof an ad was filled, or proof the CSP caused a content-quality rejection. Google's current AdSense documentation supports nonce-based strict CSP rather than domain allowlists because ad domains change. The current static site uses an allowlist. A fresh per-response nonce and HTML-rewriting design is a separate, wider change, not part of this patch. New regions, consent states or future ad code may expose other requirements. Do not silently broaden this list.

Official references:

- AdSense CSP guidance: https://support.google.com/adsense/answer/16283098?hl=en
- Cloudflare response-header rules, Set versus Add and execution order: https://developers.cloudflare.com/rules/transform/response-header-modification/

## Checks

Install the locked development dependencies with `npm ci --ignore-scripts` if needed.

- `node tests/adsense-csp.mjs`: offline checks for the actual ad-script inventory, exact host/path expression, the seven permitted additions and preservation of every other directive. This runs in the existing regression workflow. It makes no network requests.
- `node tests/adsense-csp.mjs --live-before`: explicit read-only HTTP preflight for every scoped path plus five non-ad controls. It checks the current baseline CSP, unchanged security headers, live script inventory and redirects. This fetches HTML only and never executes ads.
- `node tests/adsense-csp.mjs --live-after`: the same checks, expecting the candidate CSP only on scoped paths and the original CSP on controls.

## Audited rollout

1. Obtain independent audit PASS for the exact PR head. Do not merge an unaudited amendment. Require repository checks green.
2. Merge only that audited head. Re-read the merged manifest and compare it to the audited file. There is no Cloudflare automation in this PR.
3. Inspect the current Cloudflare rule list. If the proposed rule already exists, reconcile it before creating anything. Confirm the existing two rules and their order are unchanged, and run `--live-before`. Stop on baseline/header/inventory drift rather than replacing a newer policy.
4. In the existing zone's Response Header Transform Rules UI, create the rule named in `deployment.ruleName`. Use the exact `expression` from the manifest. Do not use an all-requests filter or directory wildcard.
5. Choose **Set static**, not Add, for the single header `Content-Security-Policy`. Use the exact `policy` value. Appending a second CSP would not relax the first one. Set this rule last, after both current CSP setters. Do not modify either existing rule or add other header operations.
6. Before saving, compare the full expression, policy, header operation and position with the audited manifest. Capture visual evidence. If the UI requires anything beyond this approved change, stop.
7. After deploying, read back the saved rule, run `--live-after`, and inspect the actual response header. It must be one effective enforced CSP, not two combined policies. Confirm tool/control headers stayed unchanged.
8. Open the Egypt guide in a fresh browser context without response interception. Inspect actual pixels, console and CSP violation events after the ad library has loaded. Confirm the relevant frames and diagnostic requests are no longer blocked. Do not click ads. If another required origin is blocked, report it for review rather than expanding this audited policy in place.
9. Report the merged SHA, deployed rule scope and verification results. Do not call the PR merge alone a live fix or an AdSense approval.

## Rollback

Disable or delete only this new final rule. The untouched earlier rules then supply the original policy. Run `--live-before` to verify restoration on every scoped path and all controls. No hosting migration, script change, cache-rule change or consent change is needed.
