# Site theme preference

A shared light/dark button is mounted in the navigation of every rendered JobPick page, including CV Studio and the 404 page. Pages without navigation receive the controls at the start of the body. The verification token file is unchanged. Legacy redirect documents load the preference assets, but immediately redirect to their destination.

The device color preference is used until a visitor chooses a mode. Only light or dark is stored under jobpick.theme.v1. Use device setting removes that key. Storage errors leave a usable page-local toggle. Device changes and changes in another tab are reflected. English, Arabic, Hindi and Urdu labels follow the page language. No requests, cookies, dependencies, tracking or account changes are added.

CV and letter document previews and print output remain white, independently of interface mode. Print hides the controls. Existing Google sign-in button branding and other embedded third-party content retain their own colors.

Tests: node tests/theme-preference.mjs (also imported by site regression). Optional browser suite with a separate QA installation: THEME_QA_PACKAGES=/tmp/cv-qa/package.json THEME_QA_OUTPUT=/tmp/jobpick-theme-qa node tests/theme-browser.cjs . It checks all 62 nonredirect rendered documents in both modes, contrast/button names and overflow, plus home/tools/CV Studio/guide/Arabic pages at 320px and 390px, stored preference, reset and white document output. Remote services are blocked in the local suite. Production verification is separate and requires an authorized merge.
