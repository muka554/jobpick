# Controlled Google CMP and AdSense Integration — 27 August 2026

## Scope and status

This record documents the prepared, **not-yet-published** Google Consent Management Platform (CMP) and AdSense website integration for `jobpick20.com`. It does not claim that an AdSense European-regulations message has been configured, published, served, or approved. The only remaining account-side operation is to create and publish that visitor-facing message after the owner confirms the final setup.

| Area | Implemented preparation | Deliberate boundary |
|---|---|---|
| AdSense site tag | The connected account’s standard publisher script is present once on each of 20 substantive city-guide and editorial-guide pages. | The script is absent from the interactive search hub, country/city selectors, platform directory, saved searches, local-only tracker, account interface, and sign-in surfaces. |
| Referrer policy | Each tagged page uses `strict-origin-when-cross-origin`. | No broad site policy was changed where an advertising tag is not used. |
| Google CMP coordination | Tagged pages are marked for the coordinator, which uses Google’s `CONSENT_MODE_DATA_READY` callback and `getGoogleConsentModeValues()` interface. | No custom consent framework, fabricated consent record, or guessed Google message identifier was added. |
| Analytics | On a CMP-covered tagged page, Analytics is requested only if Google reports `analytics_storage` granted. If the Google message does not apply, the existing local optional-analytics choice is shown and Analytics stays blocked until opt-in. | No raw query text, tracker data, account data, precise location, IP-location response, or payment information is sent through the site analytics helper. |
| Privacy controls | The persistent Privacy choices button calls Google’s documented revocation flow on CMP-covered tagged pages. On non-CMP pages, it retains the existing local optional-analytics settings flow. | The local analytics notice is not presented as an advertising CMP. |
| Disclosures | The Privacy Policy and Advertising Disclosure now describe the scoped ad placement, Google consent flow, revocation route, and Google information link. | The records do not represent the website as approved by AdSense or compliant with every jurisdiction’s law. |
| Localization | New disclosure strings and local privacy-control copy are present in English, Arabic, Hindi, and Urdu. | Google’s own consent-message languages and exact copy remain account-side configuration choices. |

## Validated behavior

The static integration suite passed with the following results: exactly 20 tagged pages; exactly one account tag, CMP marker, and required referrer meta declaration on every tagged page; zero AdSense tags on all other HTML pages; all revised disclosure strings mapped in Arabic, Hindi, and Urdu; and valid JavaScript syntax.

A temporary isolated harness simulated the Google Consent Mode values without loading ads or sending analytics traffic. Its results were as follows.

| Simulated Google CMP result | Analytics tag request | Local analytics notice | Persistent privacy control |
|---|---:|---:|---:|
| `denied` | Blocked | Hidden | Opens Google revocation flow |
| `granted` | Requested only after the simulated result | Hidden | Opens Google revocation flow |
| `not applicable` | Blocked | Shown | Uses the existing local settings flow |

## Remaining controlled account action

The owner must approve the final message configuration in AdSense **Privacy & messaging**. The message should target the EEA, United Kingdom, and Switzerland; expose an obvious first-layer refusal path; include the published Privacy Policy URL; retain Google’s standard consent processing; and be reviewed in preview before publishing. Google’s documentation states that a Google-certified CMP is required for personalized advertising in these regions, and that Privacy & messaging can deploy through an existing AdSense tag.[1][2]

> Publishing this message is an account-side, visitor-facing action. It must be confirmed immediately before publication and tested after publication with Google’s supported `?fc=alwaysshow&fctype=gdpr` preview parameter.[3]

## References

[1] [Google: Consent management requirements for serving ads in the EEA, UK, and Switzerland](https://support.google.com/adsense/answer/13554116?hl=en)

[2] [Google: Set up and manage your Consent Management Platform](https://support.google.com/adsense/answer/7670013?hl=en)

[3] [Google: Privacy & messaging JavaScript API](https://developers.google.com/funding-choices/fc-api-docs)

[4] [Google: Add a consent revocation link to your site](https://support.google.com/adsense/answer/10959060?hl=en)

## Account-side publication and immediate live check

The AdSense **Privacy & messaging → European regulations** message named **JobPick — European privacy choices** now shows status **Published** for `jobpick20.com`. The dashboard confirms the selected site, Middle East Job Hub site name, published HTTPS Privacy Policy URL, uploaded publisher logo, and enabled Consent, Do not consent, and Manage options paths. The missing-logo warning that blocked the draft was cleared before publication.

The production deployment for commit `04581ee` completed successfully. A direct public fetch of `/guides/uae-job-market-guide/` returned HTTP 200 and confirmed the required `strict-origin-when-cross-origin` referrer policy plus the account’s standard AdSense script. A fetch of the interactive homepage returned HTTP 200 and no AdSense-script match. The immediately forced public preview at `?fc=alwaysshow&fctype=gdpr` did not display a message in the connected account-holder browser at the first check. This is recorded as an inconclusive propagation/browser-context result, not a confirmation that delivery has failed; it will be rechecked after propagation time without selecting a consent choice.

A second forced-message browser check after a short propagation interval likewise did not show the Google overlay in the connected account-holder browser. The account dashboard continues to show the message as **Published**. This check did not click any consent option and does not invalidate the published account status; it remains an inconclusive browser-context/propagation observation. Google’s own message reporting still showed zero messages and a 0% consent rate immediately after publication, as expected for a newly published message with no processed traffic.

A final source validation after deployment reported 20 eligible pages with exactly one AdSense tag, CMP marker, and referrer policy each; no non-eligible page with an AdSense tag; correct scoped disclosures; and no missing Arabic, Hindi, or Urdu mappings for the revised site disclosures.
