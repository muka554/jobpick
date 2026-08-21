# Gulf Job Hub

A static, self-contained job-search aggregator covering the UAE and Saudi Arabia. One search box builds direct search links into 20+ job platforms — Bayt, LinkedIn, Indeed, GulfTalent, Naukrigulf, Dubizzle/Haraj, Taqat, Jadarat, and more — grouped by category, styled as an airport departure board. Available in English, Arabic, Hindi, and Urdu.

No backend, no build step, no database. Just HTML/CSS/JS files you can host anywhere.

## Files

| File | Purpose |
|---|---|
| `index.html` | Homepage — the job board and search tool |
| `about.html` | What the site is, no-affiliation notice, who runs it |
| `privacy-policy.html` | Cookies, AdSense data use, opt-out links |
| `terms-of-use.html` | Liability limits, IP notice, acceptable use |
| `advertising-disclosure.html` | How the site is funded, how sponsored links are marked |
| `contact.html` | Mailto-based contact form (no server needed) |
| `ads.txt` | Required by Google AdSense to authorize ad serving on this domain |

## Deploying

1. Put **all files in one folder**, at the root of whatever you deploy — `ads.txt` in particular must resolve at `jobpick.netlify.app/ads.txt`, not inside a subfolder.
2. Deploy with any static host:
   - **GitHub Pages** — push to a repo, enable Pages in Settings, `index.html` is auto-served as the homepage.
   - **Netlify** — drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop) for an instant link, or connect the repo for ongoing deploys.
   - **Vercel** — import the folder/repo as a static project.
3. Point a custom domain at your host if you have one (recommended — `ads.txt` and AdSense both work more reliably on a root domain than a subpath like `username.github.io/repo/`).

## AdSense

Publisher ID: `ca-pub-6874304698042148`

Three ad units are wired into `index.html`:

| Placement | Slot ID |
|---|---|
| Top leaderboard (above the board) | `6351608708` |
| Mid-board (between Gulf Specialist and Recruitment Agencies) | `5258018884` |
| Bottom banner (below the board) | `9250797882` |

`ads.txt` already contains the matching publisher line:
```
google.com, pub-6874304698042148, DIRECT, f08c47fec0942fa0
```
If AdSense ever issues a second line (e.g. for a reseller relationship), add it to `ads.txt` as instructed in your AdSense dashboard under **Sites → your site → View ads.txt instructions**.

## Before you consider this fully "live"

- [ ] Confirm the domain in `privacy-policy.html`'s meta description matches your real domain
- [ ] Have someone qualified in your jurisdiction glance at `privacy-policy.html` and `terms-of-use.html` — they're solid templates, not a legal review
- [ ] Fill in the governing-law line in `terms-of-use.html` (§11)
- [ ] Double check `jobpick.netlify.app/ads.txt` loads as plain text after deploy, not a 404
- [ ] Click every nav link on the live URL once to confirm nothing broke in transit

## Editing the platform list

All job-board entries live inside the `getGroups(country)` function near the top of the `<script>` block in `index.html`, grouped into: General & Global Boards, Gulf Specialist Boards, Recruitment Agencies, Classifieds, and Government/National Platforms. Each entry defines how its search URL is built — either a `direct` link with a query template (often branching by `country`), a `google` site-search fallback (for platforms with no public search URL), or a `portal` link (login-required destinations like Nafis, Taqat, or Jadarat).

## Country and language

- **Country selector** (UAE / Saudi Arabia) swaps the City dropdown, the URL patterns used for shared platforms, and the last two board groups (Classifieds, Government/National) entirely.
- **Language selector** (English / العربية / हिन्दी / اردو) translates all UI chrome via the `I18N` dictionary at the top of the script. Arabic and Urdu switch the page to RTL layout and swap in Arabic-script fonts; Hindi uses a Devanagari font. Platform names stay in Latin script, matching normal international-site convention. The choice is remembered via `localStorage`.
- To add a fifth language: add a new key to `I18N` with every string the `en` object has, then add an `<option>` to the `#lang` select in the HTML.

## Ownership

© 2026 Gulf Job Hub. Run by Ahmed Abayzeed. Contact: wiz.mkawe@gmail.com
