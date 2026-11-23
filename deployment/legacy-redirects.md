# Exact legacy URL redirects

Status: staged configuration only. Merging this PR does not deploy redirects. The live site uses GitHub Pages behind Cloudflare, and the existing edge redirect is managed in Cloudflare. Do not call an `_redirects` edit a live fix.

## Scope

The November 23 Search Console review found six legacy 404 examples. Their replacements already exist and return 200. Add only these permanent redirects:

| Exact source path | Static destination |
| --- | --- |
| `/home` | `https://jobpick20.com/` |
| `/privacy-policy.html` | `https://jobpick20.com/privacy-policy/` |
| `/about.html` | `https://jobpick20.com/about/` |
| `/advertising-disclosure.html` | `https://jobpick20.com/advertising-disclosure/` |
| `/terms-of-use.html` | `https://jobpick20.com/terms-of-use/` |
| `/contact.html` | `https://jobpick20.com/contact/` |

`legacy-redirects.json` is the exact deployment source. It describes six Cloudflare Single Redirect rules, each with an exact HTTPS/apex-host/path filter, a static same-site destination, status 301 and Preserve query string enabled. Existing query parameters are kept, not interpreted as redirect destinations. Fragments are not sent to the server. No wildcard, prefix, regex, dynamic target, external destination or catch-all is needed. Mixed-case paths and child paths remain outside this change.

The existing `Legacy home permanent redirect` matches `https://jobpick20.com/home/*` and must remain untouched. Exact `/home` does not overlap that rule. Append the six new rules after it, in manifest order. The current HTTP/www behavior is outside this patch. No other redirect, cache, response header, CSP, ad, analytics, consent, content or tool behavior changes.

Current rules inspected before PR preparation: one existing legacy-home redirect, one static-assets cache rule, and three response-header transforms including the audited ad-page CSP rule. Stop if that configuration has changed before deployment.

## Why not clear every Search Console exclusion?

Canonical alternatives and intended redirects are normal exclusions. The Pages report inspected on November 23 was last updated November 16; its failed-validation dates were in September. Repairing these six old addresses does not make all exclusions errors, guarantee indexing or AdSense approval, or immediately remove historical Search Console entries. Do not start validation, resubmit the sitemap, request indexing or change Search Console settings as part of this rollout.

## Checks

- `node tests/legacy-redirects.mjs`: offline manifest/exact-scope/destination/no-loop/query-setting regression check. Runs in the existing CI workflow, no network traffic.
- `node tests/legacy-redirects.mjs --live-before`: confirms the six source paths, with plain and two query variants, are still 404; replacements return 200 with matching canonicals; 16 control paths retain their status, Location and security headers.
- `node tests/legacy-redirects.mjs --live-after`: expects the six exact redirects and preserved query strings; checks direct 200 destinations and the same unchanged controls.
- `node tests/adsense-csp.mjs --live-after`: confirm the existing ad/non-ad CSP contract remains unchanged.

Controls cover all six destinations, tools, Studio, Egypt guide, existing `/home/` and child redirect behavior, slashless `/about`, mixed-case and child legacy-looking paths, and an unrelated missing page. The live checks are explicit operator commands; CI only runs offline tests.

## Audited rollout

1. Obtain independent PASS on the exact PR head and green checks before merge. Do not amend an audited head without another audit.
2. Merge only that head. Compare the merged manifest to the audited file. No automatic Cloudflare deployment is included.
3. Reinspect the live rules and run both the redirect `--live-before` preflight and the existing CSP `--live-after` check. Stop on drift. Capture the existing redirect and header/cache configuration so rollback cannot affect it.
4. In Cloudflare's existing zone, create six Single Redirect rules using the manifest. For each: choose Custom filter expression, paste the exact expression, choose a Static URL target, paste its exact destination, use 301 and enable Preserve query string. Place each Last so the six append in manifest order.
5. Before each deployment, compare the full expression, name, static target, code, query setting and position with the audited manifest. Capture screenshots. Do not create a broad rule to save steps. Do not change the existing rule.
6. Read each saved rule back. After all six, run the redirect `--live-after` and CSP `--live-after` checks. Verify direct 301 Location headers and 200 canonical destinations, no chains or loops. Inspect a representative redirect and destination in a fresh browser without clicking ads.
7. Report the merged SHA, six saved rule IDs, verified live results and any remaining Search Console reporting lag. A PR merge alone is not live completion.

## Rollback

Disable or delete only the six newly named rules. Never disable the existing `Legacy home permanent redirect` or any CSP/cache rule. The preflight then expects the original six 404s and unchanged controls. Permanent redirects may be cached in visitors' browsers, so disabling the rule cannot retract an already cached 301; this is why exact mappings and pre-deploy review matter. Stop and roll back the new rules if any control path changes or a target loops.

Reference, including static target, 301 and query settings: https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/
