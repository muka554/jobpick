# CV Studio product preview

## Purpose and boundaries

A guided CV and cover-letter workspace for a job seeker to try before subscription work. Isolated route: `/tools/cv-studio.html`, deliberately `noindex,follow` and not in the sitemap. It does not replace the existing authenticated CV service. No hosting, domain, headers/CSP, auth, Supabase, ads, analytics, billing, workflows or dependencies change.

Core path: Your details → Experience → Finish. Education/projects, skills/languages and letter/tailoring are optional sections. Six layouts: Professional (classic), Editorial (serif masthead), Compact (space-saving), Sidebar (two columns), Skills first (capabilities before employment) and Timeline (date rail). All use selectable text and standard section names, without skill bars, document tables or floating text boxes. Sidebar and Timeline PDFs are visual layouts, not universal ATS-safe formats. The UI recommends Professional or the linear Word export for automated application forms. Compact never removes facts or forces a page limit; length depends on content.

This is a deterministic writing editor, not an AI rewriting product. It does not extract an uploaded PDF or DOCX. It opens its own versioned JSON drafts and exports editable DOCX, plain text, JSON and a browser-print layout. The PDF action is explicitly Print / save PDF, not a direct generated-PDF download. There is no ATS score, employer parsing certification or hiring guarantee. Preview is continuous; browser and Word pagination may differ. Interface, headings and letter scaffold are English, with user-entered Arabic and right-to-left layout supported. This is not full Arabic localization.

## Factual and privacy boundaries

Candidate entries remain literal text. A pasted job description can prioritize existing experience points and skill lines by deterministic word overlap. It does not change job chronology, candidate titles, the summary or factual text. Switching this off restores the original order. The job description can be split into up to 40 requirement lines, which the visitor can edit. Target requirements are only compared as exact case-insensitive phrases with Unicode word boundaries (SQL does not match NoSQL). They never become skills or employment evidence. Unmatched wording is labeled Gap / confirm, not inferred competence. Matching original evidence is shown separately. Each job version can be exported as a separate JSON draft; starting another job clears only job/letter fields after confirmation. Cover-letter evidence is chosen or typed by the visitor; no job-specific employer assertions or experience are inferred. The achievement helper joins only the visitor's own action, context and result text.

The sample candidate and institutions are explicitly fictional. The sample marker remains in previews and exports until a blank CV is started. No real candidate data is committed as a fixture.

No CV processing network calls, account, third-party library, remote font or tracking script. Saving is off by default. Enabling browser saving requires confirmation about shared-device access; turning it off removes the stored draft but leaves the current working draft open. A storage event from another tab stops automatic saving to avoid overwriting it. Save/restore failures are visible; unsaved work has a navigation warning. Draft import is local, bounded to 2 MB, version-checked and rebuilt from allowlisted keys. Imports exceeding 20 entries or any field length limit are rejected with a visible reason, without replacing or truncating the current draft. Negative numeric signs are preserved; only unambiguous list markers are removed. Replacing a nonempty draft requires confirmation.

DOCX is a local uncompressed ZIP/OpenXML package with three XML parts. It has no macros, executable content or external relationships. User text is XML-escaped; filenames are sanitized. Contact information is in the document body. Word/text exports stay linear in every design. The skills-first section order is shared by all export formats. RTL paragraph direction follows the text's first strong script, while document alignment follows the selected layout.

## Sources checked, 22 November 2026

- Greenhouse Support, *Unsuccessful resume parse*, updated 2 March 2026: https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse . Supports reducing common risks from columns, graphics and contact details in headers/text boxes. One vendor's behavior, not a universal ATS rule.
- National Careers Service, *How to write a CV*: https://nationalcareers.service.gov.uk/careers-advice/cv-sections . Supports clear headings, readable type, factual history and role-specific emphasis. UK writing principles, not UAE law or required personal fields.
- National Careers Service, *How to write a cover letter*: https://nationalcareers.service.gov.uk/careers-advice/covering-letter . Supports a role-specific letter and relevant evidence. The editor's scaffold and prompts are original.
- UAE Government, *Searching for a job*: https://u.ae/en/information-and-services/jobs/find-a-job/searching-for-a-job . Supports an honest CV. Does not establish a mandatory UAE CV format, visa entitlement or nationality/photo requirement.

## Verification

`node tests/cv-studio.mjs` runs factual-boundary, draft-schema, phrase-match, chronology, OpenXML, RTL, local-only and noindex regression contracts. Imported into the existing site regression entry point. No CI workflow or dependency changes.

Browser checks use a local static server and test data, not a candidate upload service. Check all core and optional sections with axe, at 320/390/768/1280/1440 widths. Exercise the three-step path; entry add/remove/reorder; exact evidence copying; six template switches; JSON export/import and cancellation; storage opt-in/cancel/restore/delete/failure; multi-tab changes; hostile HTML in fields and drafts; Word/text download; browser print with multi-page output; Arabic mixed with English; and literal long words. Inspect PDF pages and copy/extract their text in reading order. Open DOCX in an office application to confirm the package and layout, rather than trusting the file extension.

Pre-merge and deployed checks are separate. Screenshots of local fixtures do not establish production state. A release still needs independent review, CI, an authorized merge and a post-deploy check.

Optional browser suite (separate QA install, no production dependencies):

```sh
npm install --prefix /tmp/jobpick-cv-qa playwright@1.65.1 @axe-core/playwright@4.14.0
/tmp/jobpick-cv-qa/node_modules/.bin/playwright install chromium
CV_STUDIO_QA_PACKAGES=/tmp/jobpick-cv-qa/package.json node tests/cv-studio-browser.mjs
```

The browser suite writes synthetic samples under the system temporary directory by default. Set `CV_STUDIO_QA_OUTPUT` to another output directory if needed. It does not run in the existing fast CI workflow.
