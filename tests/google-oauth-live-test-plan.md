# Google OAuth live-test walkthrough

Target: `https://jobpick20.com/tools/`

## Current preflight evidence

On 2026-09-02, the current live login endpoint was called with:

```text
https://jobpickcv-5ouvegg7.manus.space/api/oauth/login?provider=google&returnTo=https%3A%2F%2Fjobpick20.com%2Ftools%2F
```

It returned HTTP 302, but the `Location` was still the Manus account chooser rather than Google. This confirms that the static frontend redirect has been updated, while the deployed CV backend has not yet deployed the Google provider implementation. Do not call the flow complete until the `Location` header contains `accounts.google.com`.

## Browser test after backend deployment

1. Open a fresh private/incognito browser context and navigate to `https://jobpick20.com/tools/`.
2. Confirm the login control reads **Continue with Google** and its resolved link contains `provider=google` and the encoded return path `/tools/`.
3. Open browser DevTools Network, preserve the log, and click **Continue with Google**.
4. Confirm the first response is a 302 from the CV backend to `https://accounts.google.com/o/oauth2/v2/auth` with `client_id`, `redirect_uri`, `response_type=code`, `scope=openid+email+profile`, `state`, `code_challenge`, and `code_challenge_method=S256`. There must be no access token in the URL.
5. Select a test Google account the owner controls. If Google shows a consent screen, confirm the app name is **JobPick**, the homepage/privacy links are correct, and only the identity scopes are requested.
6. Confirm Google redirects to the exact callback URI `https://jobpickcv-5ouvegg7.manus.space/api/oauth/google/callback` with a short-lived authorization `code` and the original `state`.
7. Confirm the callback redirects to `https://jobpick20.com/tools/` with a short-lived, one-time session handoff in the URL fragment. The authorization code, Google ID token, and client secret must not appear in the final URL.
8. Confirm the page consumes the handoff, removes it from the visible URL/history, stores only the CV-service session handoff in session storage, hides the login button, and displays **Signed in**.
9. Upload a non-sensitive test CV. Confirm the request goes to the CV backend with `Origin: https://jobpick20.com`, credentials, and `X-JobPick-Session`; confirm HTTP 200 and a document ID.
10. Process the document with a test role and vacancy. Confirm the generated output is truthful, contains no editor notes, and the success analytics event contains only template/readiness metadata—not CV text or contact details.
11. Download the generated PDF. Confirm the file opens, contains the expected CV sections, and the download success event is emitted.
12. Refresh the page and call **Refresh my CV workspace**. Confirm the same account sees only its own document.
13. Open a second fresh browser as another test account. Confirm it cannot list, download, process, or remove the first account’s document.
14. Test cancellation, invalid/replayed state, expired state, wrong audience, unverified Google email, session expiry, and logout/session-clear behavior. Each must fail safely without creating or exposing a CV document.

## Backend/API assertions

- Google `sub` is the upsert key; email is not the identity key.
- A Google subject already linked to another local user is rejected, never reassigned.
- Only verified Google email claims are accepted.
- `returnTo` is allowlisted to `https://jobpick20.com`.
- OAuth state is single-use and expires within 10 minutes.
- PKCE verifier is server-side and single-use.
- CV endpoints return 401 without the CV-service session.
- CORS allows only `https://jobpick20.com`, credentials, `Content-Type`, and `X-JobPick-Session`.
- Logs contain event names and provider-neutral error codes only; never tokens, CV text, authorization codes, or personal contact data.

## Completion criterion

The flow is complete only when the browser reaches the tools page signed in, the session handoff is consumed, an authenticated CV upload/process/download succeeds, and an isolated second account is denied access to the first account’s document. The current live state is blocked at backend provider deployment: `provider=google` is currently ignored and still returns the Manus chooser.

## Provisioning completed on 2026-09-02

The Google Cloud project **JobPick CV Service** was created under project ID `jobpick-cv-service`. Google Auth Platform branding was configured with the JobPick name, external audience, `https://jobpick20.com/` homepage, the live privacy and terms URLs, and `jobpick20.com` plus `manus.space` as authorized domains. The account `wiz.mkawe@gmail.com` was added as a test user.

A web OAuth client named **JobPick CV Web** was created with client ID `655715100959-1mu86jk030h5lpns5ka87fmt386r2c10.apps.googleusercontent.com`, JavaScript origin `https://jobpick20.com`, and redirect URI `https://jobpickcv-5ouvegg7.manus.space/api/oauth/google/callback`. The client secret is intentionally not recorded in this repository.

The live endpoint still redirects to the Manus account chooser because the hosted CV backend is not owned by the current account and has not been updated to consume this client. The next deployment must set `GOOGLE_CLIENT_ID` to the client above and securely provision a newly generated `GOOGLE_CLIENT_SECRET`, then apply the Supabase migration before retesting.
