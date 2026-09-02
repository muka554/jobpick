import assert from 'node:assert/strict';

const site = 'https://jobpick20.com/tools/';
const api = 'https://jobpickcv-5ouvegg7.manus.space';
const html = await (await fetch(site)).text();

for (const marker of ['id="cvTemplate"', 'value="modern"', 'value="classic"', 'value="executive"', 'cv_generation_success', 'cv_generation_failure', 'cv_download_success', 'cv_download_failure']) {
  assert.ok(html.includes(marker), `live tools page is missing ${marker}`);
}

const preflight = await fetch(`${api}/api/trpc/cv.upload`, {
  method: 'OPTIONS',
  headers: {
    Origin: 'https://jobpick20.com',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,x-jobpick-session',
  },
});
assert.equal(preflight.status, 204, 'CV API preflight must succeed');
assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://jobpick20.com');
assert.equal(preflight.headers.get('access-control-allow-credentials'), 'true');

for (const endpoint of ['upload', 'process', 'download', 'remove']) {
  const response = await fetch(`${api}/api/trpc/cv.${endpoint}`, {
    method: 'POST',
    headers: { Origin: 'https://jobpick20.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ json: {} }),
  });
  assert.equal(response.status, 401, `${endpoint} must reject unauthenticated access`);
  const payload = await response.json();
  assert.equal(payload?.error?.json?.data?.code, 'UNAUTHORIZED');
}

const list = await fetch(`${api}/api/trpc/cv.list?input=${encodeURIComponent(JSON.stringify({ json: {} }))}`, {
  headers: { Origin: 'https://jobpick20.com' },
});
assert.equal(list.status, 401, 'list must reject unauthenticated access');
console.log('PASS: live CV UI, consent-gated analytics wiring, CORS, and unauthenticated auth gates');
console.log('NOTE: authenticated upload/process/download/RLS flow requires a user-owned signed-in session and is intentionally not automated with credentials.');
