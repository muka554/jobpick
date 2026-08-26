# Sign-in device-flow verification record — 2026-08-26

## Verified without authenticating a user

The production OAuth authorization-start endpoint returned an HTTP 302 to Google, with `https://jobpick20.com/` accepted as the post-authentication return URL and the managed Supabase callback URI set to `https://rvitqbkgtgjharxqaxmv.supabase.co/auth/v1/callback`. The public Supabase Auth settings endpoint reported Google as enabled, sign-up as enabled, and email confirmation as enabled (`mailer_autoconfirm: false`). No credentials, Magic Links, password attempts, Google account selections, or sign-outs were submitted.

The previously established responsive auth-layout test had passed at 320×568, 390×844, 700×900, 1024×768, and 1440×900. It checked no horizontal overflow, a visible account layer, contained header sign-in control, and a reachable sign-in card; short 320×568 viewports use the intended scrollable overlay.

## Fresh device-flow automation limitation

A new isolated fresh-profile browser test was prepared to exercise the UI-only skip, header reopen, and sign-up tab paths at the same five widths without calling any provider or submitting credentials. Three independent fresh headless setups timed out while waiting for the dynamically initialized production Auth layer. This was treated as a test-environment limitation, not evidence of a production sign-in failure. The tests were stopped after the third failure and did not change JobPick, Supabase, Google, or any account state.

A full real authentication round-trip remains intentionally out of scope without an explicit test account and confirmation to use it. The safe production redirect and provider checks above remain valid.
