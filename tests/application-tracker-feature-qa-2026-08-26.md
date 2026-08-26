# Private Application Tracker QA — 2026-08-26

## Feature boundary

The homepage now includes an optional **Private application tracker**. A visitor can save a company/employer, role, application date, and progress status (Applied, Interview, Offer, or Closed). The tracker is intentionally local-first: records are stored only under the browser key `jobhub_application_tracker_v1` and are not sent to Supabase, search-history sync, analytics, employers, job platforms, or any other third party.

## Tested behavior

| Check | Result |
|---|---|
| Create an application | Pass — locally persisted company, role, date, and status |
| Update an entry status | Pass — status update persisted locally |
| Remove an entry | Pass — entry removed from local storage |
| Tracker analytics emissions | Pass — 0 tracker analytics events observed in the feature test |
| Arabic/RTL interface | Pass — Arabic title and right-to-left mode applied |
| Desktop and mobile containment | Pass — no horizontal overflow in tested desktop/mobile states |
| Eleven-breakpoint tracker layout | Pass — 320×568 through 1440×900, including an open form at every threshold |

The tracker deliberately does not request or retain email addresses, résumés, identification numbers, passwords, links to job applications, or account credentials. It is an optional personal planning tool; users can remove individual entries or clear all local tracker records at any time.
