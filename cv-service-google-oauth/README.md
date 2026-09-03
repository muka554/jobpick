# Google OAuth for the JobPick CV Service

This package is a backend reference implementation for replacing the current Manus account chooser with **Continue with Google** while preserving the CV service's existing short-lived session handoff. It is not a credential store and must run in the CV backend, not in the static GitHub Pages repository.

## Google Auth Platform setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the project that will own JobPick authentication.
2. Go to **Google Auth Platform → Branding**. If prompted, configure the project:
   - App name: `JobPick`
   - User support email: an address monitored by the owner
   - App logo: optional; use a square JobPick logo if supplied
   - Application home page: `https://jobpick20.com/`
   - Application privacy policy: `https://jobpick20.com/privacy-policy/`
   - Application terms of service: `https://jobpick20.com/terms-of-use/`
3. Go to **Google Auth Platform → Audience**. Keep the app **External** if people outside the Google Cloud organization must sign in. Add approved test users while the app remains in testing. Move to production only after verifying the consent screen and data-use disclosures.
4. Go to **Google Auth Platform → Data Access** and request only `openid`, `email`, and `profile`. Do not request Drive, Gmail, Calendar, or other scopes for CV processing.
5. Go to **Google Auth Platform → Clients → Create client → Web application**.
6. Add this authorized JavaScript origin:
   - `https://jobpick20.com`
7. Add this exact authorized redirect URI:
   - `https://jobpickcv-rej9ajct.manus.space/api/oauth/google/callback`
8. Copy the client ID into `GOOGLE_CLIENT_ID` and store the client secret only in the CV service's secret manager as `GOOGLE_CLIENT_SECRET`. Never commit either secret to this static repository; the client ID is not a secret but is still best supplied through environment configuration.
9. If Google shows a publishing/verification warning, resolve the branding, privacy-policy, and scope requirements before production. The implementation uses basic identity scopes only.

## Backend integration

Install the dependencies in the CV service:

```sh
npm install express cookie-parser google-auth-library
```

Mount `createGoogleOAuthRouter` under `/api/oauth` and provide adapters for the existing data/session layer:

```js
import cookieParser from 'cookie-parser';
import express from 'express';
import { createGoogleOAuthRouter } from './google-oauth-router.mjs';

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: '12mb' }));
app.use('/api/oauth', createGoogleOAuthRouter({
  stateStore,       // put/get/delete state with a <=10-minute TTL
  userStore,        // map Google sub to the existing user record
  session: sessionService, // createHandoff({ userId, ttlSeconds })
}));
```

The required `userStore.findOrCreateGoogleUser` implementation should upsert by immutable Google `sub`, not by email alone. It may update a verified email and display name, but must not merge an existing account solely because an untrusted request supplied the same email. The existing CV routers must continue to enforce account ownership/RLS using the session created by `session.createHandoff`.

The callback validates the OAuth state cookie and server-side state record, validates PKCE, exchanges the authorization code server-side, verifies the Google ID token audience and verified email, and allowlists the return URL to the JobPick origin. It then redirects to the frontend with the existing short-lived `manus_session` hash handoff. If the CV service uses a different handoff name, change that one adapter boundary and keep the token short-lived and single-use.

## Frontend contract

The static CV tools page now points to:

```text
https://jobpickcv-rej9ajct.manus.space/api/oauth/login?provider=google&returnTo=https%3A%2F%2Fjobpick20.com%2Ftools%2F
```

The backend must accept `provider=google` and redirect to Google. The frontend label is **Continue with Google**. Once the callback returns, the existing page code consumes the session handoff and sends the session header to CV upload/process/list/download/remove endpoints.

## Deployment and security checklist

- Configure `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, and state/session stores in the CV backend secret manager.
- Add `https://jobpickcv-rej9ajct.manus.space` to the live site's `connect-src` CSP. The repository `_headers` file contains the intended value, but GitHub Pages does not apply that file; update the CDN/reverse proxy separately or proxy the API same-origin.
- Configure CORS for `https://jobpick20.com`, credentials, `Content-Type`, and `X-JobPick-Session` only.
- Use HTTPS in production and secure, `HttpOnly`, `SameSite=Lax` cookies.
- Do not use wildcard CORS, arbitrary `returnTo` URLs, implicit OAuth tokens, client-side secrets, or Google access tokens for CV operations.
- Log provider-neutral authentication events and error codes, never authorization codes, ID tokens, session tokens, CV contents, or personal contact details.
- Test login cancellation, invalid state, replayed state, expired state, unverified email, wrong audience, wrong redirect origin, session expiry, account ownership, and Google account linking before production.

## Local verification

```sh
node tests/site-regression.mjs
node tests/cv-live-integration.mjs
```

The repository tests intentionally verify the public UI, CORS, and unauthenticated authorization gates without storing or automating a user's credentials. An authenticated test must be run manually with an account the owner controls.

## Database migration

Apply [`supabase/migrations/20260902220000_create_google_account_identities.sql`](../supabase/migrations/20260902220000_create_google_account_identities.sql) before enabling the callback. It creates a backend-managed `public.user_identities` table with unique `(provider, provider_subject)` and `(user_id, provider)` constraints, denies browser-role access, and exposes only a `service_role` security-definer upsert function. The CV service should call that function after verifying the Google ID token and after ensuring the local `auth.users` row exists.
