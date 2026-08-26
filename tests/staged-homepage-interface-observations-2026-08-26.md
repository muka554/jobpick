# Staged Homepage Interface Observations — 2026-08-26

## Initial state

The staged homepage opened with no country or city preselected. The country control displayed **“Choose a country”** and the city control displayed **“Choose a city.”** The directory guidance panel appeared above the platform result groups and stated that a country selection reveals an official route, verification step, and deeper guide.

## Consent presentation

The visible privacy notice states that optional analytics load only after a visitor chooses to allow them; that JobPick does not currently serve ads; and that the analytics choice is not used for advertising. The notice offers **Essential only**, **Accept optional analytics**, a privacy-policy link, and the separate **Privacy choices** control. It does not claim to be an advertising CMP or imply that ads currently appear in directory rows.

## Pending interaction checks

Country-panel update and multilingual text switching remain to be exercised before publication. The current visual test is against the temporary staged server, not the live production domain.

## Selector interaction note

The custom country-control source has an accessible button/listbox implementation with mouse and keyboard handlers. In the connected-browser accessibility snapshot, the dynamically rendered option buttons were not exposed after opening the control, so selection will be confirmed with a deterministic local browser script rather than treating this automation limitation as a visible defect.

## Deterministic country-guidance DOM check

A JavaScript-enabled local browser rendered three staged states successfully. The blank state preserved the instruction to choose a country. With `?country=uae`, the panel instructed visitors to use official federal or emirate routes only where they fit their situation and linked to `/guides/uae-job-search-guide/`. With `?country=ksa`, it surfaced the Jadarat eligibility/profile verification note and linked to `/cities/riyadh-jobs/`. The panel therefore updates outside the result rows through the same country-change rendering path; the generic visible link label is a navigation label, while the destination varies by country.

## Arabic and RTL check

Selecting Arabic through the staged language control updated the homepage labels, directory-guidance kicker, heading, default country-guidance text, privacy notice, and consent controls in Arabic. The rendered view switched to right-to-left layout without an observed overlap between the notice and the floating privacy control.

## Hindi check

Advancing the staged language selector to Hindi updated the homepage controls, default country-guidance panel, privacy notice, and consent actions in Hindi. The directory guidance remained visible above the platform results and retained the same no-selection instruction in localized form.

## Urdu and RTL check

Advancing the staged language selector to Urdu updated the homepage controls, default country-guidance panel, privacy notice, and consent actions in Urdu. The rendered layout used right-to-left alignment and kept the floating privacy control separate from the consent notice in the observed viewport.

## 390×844 mobile consent-state measurement

A deterministic mobile-browser test verified both consent states at a 390×844 viewport. On first load, the consent banner was present and the redundant floating settings button was intentionally hidden. After selecting **Essential only**, the banner was removed and the settings button was visible from `y=796` to `y=834`, fully inside the 844-pixel viewport; it also received pointer input at its center. This prevents a settings-button/banner overlap while preserving a reachable persistent privacy control after a choice.
