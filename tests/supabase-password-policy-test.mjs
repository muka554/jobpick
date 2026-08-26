#!/usr/bin/env node

/**
 * JobPick Supabase password-policy verification harness.
 *
 * This script is intentionally NOT part of the public website and must be run
 * only against a disposable inbox. It never prints the configured API key,
 * test email address, or any password value.
 *
 * Required environment variables:
 *   SUPABASE_URL=https://your-project.supabase.co
 *   SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
 *   AUTH_TEST_EMAIL=mailbox-that-supports-plus-addressing@example.com
 *
 * Optional:
 *   --allow-create  Also verify one strong password is accepted. This may create
 *                   one disposable Auth user and send a confirmation email.
 */

const required = ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'AUTH_TEST_EMAIL'];
const absent = required.filter((name) => !process.env[name]);
if (absent.length) {
  console.error(`Missing required environment variable(s): ${absent.join(', ')}`);
  process.exit(2);
}

const url = process.env.SUPABASE_URL.replace(/\/$/, '');
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
const baseEmail = process.env.AUTH_TEST_EMAIL;
const allowCreate = process.argv.includes('--allow-create');

const at = baseEmail.lastIndexOf('@');
if (at < 1 || at === baseEmail.length - 1) {
  console.error('AUTH_TEST_EMAIL must be a valid inbox address that supports plus-addressing.');
  process.exit(2);
}

const localPart = baseEmail.slice(0, at);
const domain = baseEmail.slice(at + 1);
const runId = `jobpick-policy-${Date.now()}`;

function testEmail(label) {
  return `${localPart}+${runId}-${label}@${domain}`;
}

async function attemptSignup(label, password) {
  const response = await fetch(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ email: testEmail(label), password })
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // Keep an empty payload when the server returns no JSON body.
  }

  const errorText = String(payload?.msg || payload?.message || payload?.error?.message || '');
  return { accepted: response.ok && !payload?.error, status: response.status, errorText };
}

const rejectedCases = [
  ['four_characters', 'aA1!'],
  ['eleven_characters', 'Abcdefghi1!'],
  ['missing_lowercase', 'ABCDEFGHIJ1!'],
  ['missing_uppercase', 'abcdefghij1!'],
  ['missing_digit', 'Abcdefghijk!'],
  ['missing_symbol', 'Abcdefghij12']
];

const results = [];
for (const [label, password] of rejectedCases) {
  const result = await attemptSignup(label, password);
  const passed = !result.accepted;
  results.push({ label, expected: 'rejected', passed, status: result.status, reason: result.errorText || '(no error text returned)' });
}

if (allowCreate) {
  const result = await attemptSignup('strong_password', 'V7!aK2#pL9@q');
  results.push({ label: 'strong_password', expected: 'accepted', passed: result.accepted, status: result.status, reason: result.errorText || '(accepted or no error text returned)' });
}

console.table(results.map(({ label, expected, passed, status, reason }) => ({
  case: label,
  expected,
  result: passed ? 'PASS' : 'FAIL',
  http_status: status,
  response: reason
})));

const failures = results.filter((result) => !result.passed);
if (failures.length) {
  console.error(`\n${failures.length} policy check(s) failed. If a weak-password case was accepted, delete the resulting disposable user in Supabase Authentication > Users, then review the Email provider settings.`);
  process.exit(1);
}

console.log('\nAll selected password-policy checks passed.');
if (!allowCreate) {
  console.log('The strong-password acceptance test was skipped. Re-run with --allow-create only when you are ready to receive a confirmation email and clean up one disposable test user.');
}
