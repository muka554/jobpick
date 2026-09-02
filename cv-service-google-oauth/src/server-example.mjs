import express from 'express';
import cookieParser from 'cookie-parser';
import { createGoogleOAuthRouter } from './google-oauth-router.mjs';

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: '12mb' }));

// Replace these adapters with the CV service's production implementations.
const stateStore = {
  async put() { throw new Error('Implement a Redis/database-backed OAuth state store'); },
  async get() { throw new Error('Implement a Redis/database-backed OAuth state store'); },
  async delete() { throw new Error('Implement a Redis/database-backed OAuth state store'); },
};
const userStore = {
  async findOrCreateGoogleUser() { throw new Error('Implement a user upsert keyed by Google sub'); },
};
const session = {
  async createHandoff() { throw new Error('Connect to the existing CV session/handoff issuer'); },
};

app.use('/api/oauth', createGoogleOAuthRouter({ stateStore, userStore, session }));
app.listen(process.env.PORT || 3000, () => console.log('CV OAuth service listening'));
