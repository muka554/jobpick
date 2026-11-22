import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import cookieParser from 'cookie-parser';
import { OAuth2Client } from 'google-auth-library';
import { createGoogleOAuthRouter } from '../cv-service-google-oauth/src/google-oauth-router.mjs';

// No real Google requests, accounts, tokens or databases are used in these tests.
OAuth2Client.prototype.getToken = async () => ({ tokens: { id_token: 'local-test-token' } });
OAuth2Client.prototype.verifyIdToken = async () => ({ getPayload: () => ({ sub: 'local-test-user', email: 'fixture@example.invalid', email_verified: true }) });
const pending = new Map();
const calls = { put: 0, get: 0, remove: 0, user: 0, handoff: 0 };
const config = {
  clientId: 'local-client', clientSecret: 'local-fixture', redirectUri: 'https://fixture.invalid/api/oauth/google/callback', frontendOrigin: 'https://jobpick20.com',
  stateStore: {
    async put(key, value) { calls.put++; pending.set(key, value); },
    async get(key) { calls.get++; return pending.get(key); },
    async delete(key) { calls.remove++; pending.delete(key); },
  },
  userStore: { async findOrCreateGoogleUser() { calls.user++; return { id: 'fixture-user' }; } },
  session: { async createHandoff() { calls.handoff++; return 'single-use-local-handoff'; } },
};
const app = express();
// The test proxy alone can supply client addresses. Production trust proxy is not changed.
app.set('trust proxy', 'loopback');
app.use(cookieParser());
app.use('/api/oauth', createGoogleOAuthRouter(config));
app.use('/short/oauth', createGoogleOAuthRouter({ ...config, rateLimitWindowMs: 100, loginRequestLimit: 1, callbackRequestLimit: 1 }));
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = 'http://127.0.0.1:' + server.address().port;
const clientA = '192.0.2.10', clientB = '198.51.100.20';
const request = (path, ip = clientA, headers = {}) => fetch(origin + path, { redirect: 'manual', headers: { 'x-forwarded-for': ip, ...headers } });
try {
  let first;
  for (let i = 0; i < 30; i++) {
    const response = await request('/api/oauth/login?returnTo=%2Ftools%2F');
    assert.equal(response.status, 302);
    if (!first) first = response;
  }
  assert.equal(calls.put, 30);
  const blocked = await request('/api/oauth/login');
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0);
  assert.equal(calls.put, 30, 'over-limit login must stop before the state store');
  assert.equal((await request('/api/oauth/login', clientB)).status, 302, 'another client remains able to log in');

  // Login throttling must not consume the separate callback budget.
  const state = new URL(first.headers.get('location')).searchParams.get('state');
  const verifier = pending.get(state).verifier;
  const cookie = 'jobpick_google_oauth_state=' + state + '; jobpick_google_oauth_pkce=' + verifier;
  const callback = await request('/api/oauth/google/callback?state=' + state + '&code=fixture-code', clientA, { cookie });
  assert.equal(callback.status, 302);
  assert.equal(callback.headers.get('location'), 'https://jobpick20.com/tools/#manus_session=single-use-local-handoff');
  assert.equal(calls.user, 1);
  assert.equal(calls.handoff, 1);
  for (let i = 1; i < 60; i++) assert.equal((await request('/api/oauth/google/callback')).status, 400);
  const before = { ...calls };
  assert.equal((await request('/api/oauth/google/callback')).status, 429);
  assert.deepEqual(calls, before, 'over-limit callback must stop before expensive work');
  assert.equal((await request('/api/oauth/google/callback', clientB)).status, 400);

  assert.equal((await request('/short/oauth/login')).status, 302);
  assert.equal((await request('/short/oauth/login')).status, 429);
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.equal((await request('/short/oauth/login')).status, 302, 'budget resets after the window');
  assert.throws(() => createGoogleOAuthRouter({ ...config, loginRequestLimit: 0 }), /Invalid OAuth rate-limit/);
  console.log('PASS: per-client login/callback limits, 429/Retry-After before expensive work, separate budgets, successful sign-in and window reset');
} finally {
  server.close();
  await once(server, 'close');
    }
