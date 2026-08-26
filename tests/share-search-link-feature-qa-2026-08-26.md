# Shareable Search Link Feature QA — 2026-08-26

## Feature scope

The homepage now provides a **Copy search link** action after a country is selected. It copies the current public search URL containing only the selected role/keyword, country, and optional city. It does not include account identifiers, email addresses, passwords, Supabase tokens, authentication callback parameters, saved-platform data, search-history timestamps, or analytics identifiers.

## Tested behavior

| Scenario | Result |
|---|---|
| Empty initial location state | The control is disabled. |
| UAE / Dubai / `project coordinator` | The copied URL retained `role=project+coordinator`, `country=uae`, and `city=dubai`. |
| Authentication safety | The copied URL excluded `code`, `error`, and `jobhub_return_to` parameters. |
| Clipboard status | A localized confirmation explains that only selected role, country, and city are included. |
| Arabic / RTL | The control rendered as `نسخ رابط البحث` and the document direction was RTL. |
| Mobile 390×844 | The control was enabled after selection, full-width on its own row, had no horizontal overflow, and did not overlap the Search or Reset controls. |

## Related compatibility correction

The QA found that a valid `city` query parameter could be lost during homepage initialization. City options now apply a valid URL city parameter before the search code updates URL state. This ensures recipients who open a shared city-specific link see the same selected city.

## Result

The deterministic local browser suite passed all checks.
