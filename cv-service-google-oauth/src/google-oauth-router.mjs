import crypto from 'node:crypto';
import express from 'express';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_SCOPES = ['openid', 'email', 'profile'];
const STATE_COOKIE = 'jobpick_google_oauth_state';
const PKCE_COOKIE = 'jobpick_google_oauth_pkce';

function safeReturnTo(value, frontendOrigin, defaultPath = '/tools/') {
  try {
    const parsed = new URL(value || defaultPath, frontendOrigin);
    if (parsed.origin !== frontendOrigin) return new URL(defaultPath, frontendOrigin).toString();
    return parsed.toString();
  } catch {
    return new URL(defaultPath, frontendOrigin).toString();
  }
}

function base64Url(buffer) {
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function createPkcePair() {
  const verifier = base64Url(crypto.randomBytes(32));
  const challenge = base64Url(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

function issueShortLivedHandoff(session) {
  // Replace this adapter with the CV service's existing session/JWT issuer.
  // Never put the Google client secret or a long-lived service credential in this value.
  return session.createHandoff({ userId: session.userId, ttlSeconds: 600 });
}

/**
 * Mount at /api/oauth on the CV service.
 *
 * Required adapters:
 *   stateStore.put/get/delete(state, value, ttlSeconds)
 *   userStore.findOrCreateGoogleUser({ googleSubject, email, name, avatarUrl })
 *   session.createHandoff({ userId, ttlSeconds })
 */
export function createGoogleOAuthRouter({
  clientId = process.env.GOOGLE_CLIENT_ID,
  clientSecret = process.env.GOOGLE_CLIENT_SECRET,
  redirectUri = process.env.GOOGLE_REDIRECT_URI,
  frontendOrigin = process.env.FRONTEND_ORIGIN || 'https://jobpick20.com',
  frontendReturnPath = process.env.FRONTEND_RETURN_PATH || '/tools/',
  stateStore,
  userStore,
  session,
}) {
  if (!clientId || !clientSecret || !redirectUri || !stateStore || !userStore || !session) {
    throw new Error('Google OAuth configuration or adapter missing');
  }
  const google = new OAuth2Client(clientId, clientSecret, redirectUri);
  const router = express.Router();
  const cookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 10 * 60 * 1000, path: '/api/oauth' };

  router.get('/login', async (req, res, next) => {
    try {
      if (req.query.provider && req.query.provider !== 'google') return res.status(400).json({ error: 'Unsupported OAuth provider' });
      const state = base64Url(crypto.randomBytes(32));
      const { verifier, challenge } = createPkcePair();
      const returnTo = safeReturnTo(req.query.returnTo, frontendOrigin, frontendReturnPath);
      await stateStore.put(state, { returnTo, verifier }, 600);
      res.cookie(STATE_COOKIE, state, cookieOptions);
      res.cookie(PKCE_COOKIE, verifier, cookieOptions);
      const authorizationUrl = google.generateAuthUrl({
        access_type: 'code',
        scope: GOOGLE_SCOPES,
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
        prompt: 'select_account',
      });
      return res.redirect(302, authorizationUrl);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/google/callback', async (req, res, next) => {
    const state = String(req.query.state || '');
    const code = String(req.query.code || '');
    try {
      if (!state || !code || state.length < 32 || state !== req.cookies?.[STATE_COOKIE]) return res.status(400).send('Invalid OAuth state. Please restart sign-in.');
      const pending = await stateStore.get(state);
      await stateStore.delete(state);
      if (!pending || pending.verifier !== req.cookies?.[PKCE_COOKIE]) return res.status(400).send('Expired OAuth session. Please restart sign-in.');
      const { tokens } = await google.getToken({ code, codeVerifier: pending.verifier, redirect_uri: redirectUri });
      const ticket = await google.verifyIdToken({ idToken: tokens.id_token, audience: clientId });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email || payload.email_verified !== true) return res.status(403).send('Google account email is not verified.');
      const user = await userStore.findOrCreateGoogleUser({ googleSubject: payload.sub, email: payload.email, name: payload.name || '', avatarUrl: payload.picture || '' });
      const handoff = issueShortLivedHandoff({ ...session, userId: user.id });
      res.clearCookie(STATE_COOKIE, { ...cookieOptions, maxAge: undefined });
      res.clearCookie(PKCE_COOKIE, { ...cookieOptions, maxAge: undefined });
      const target = new URL(pending.returnTo);
      target.hash = `manus_session=${encodeURIComponent(await handoff)}`;
      return res.redirect(302, target.toString());
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
