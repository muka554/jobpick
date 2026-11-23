import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'deployment/legacy-redirects.json'), 'utf8'));
const expected = [
  ['/home', '/'],
  ['/privacy-policy.html', '/privacy-policy/'],
  ['/about.html', '/about/'],
  ['/advertising-disclosure.html', '/advertising-disclosure/'],
  ['/terms-of-use.html', '/terms-of-use/'],
  ['/contact.html', '/contact/'],
];
assert.equal(manifest.version, 1);
assert.equal(manifest.host, 'jobpick20.com');
assert.equal(manifest.scheme, 'https');
assert.equal(manifest.phase, 'http_request_dynamic_redirect');
assert.equal(manifest.position, 'last');
assert.equal(manifest.rules.length, 6);
assert.deepEqual(manifest.rules.map(rule => [rule.path, new URL(rule.destination).pathname]), expected);
for (const rule of manifest.rules) {
  assert.deepEqual(Object.keys(rule).sort(), ['name', 'path', 'destination', 'expression', 'statusCode', 'preserveQueryString'].sort());
  assert.equal(rule.name, `JobPick legacy ${rule.path.slice(1)} redirect`);
  assert.equal(rule.destination, `https://jobpick20.com${expected.find(([source]) => source === rule.path)[1]}`);
  assert.equal(rule.expression, `(http.host eq "jobpick20.com" and http.request.scheme eq "https" and http.request.uri.path eq ${JSON.stringify(rule.path)})`);
  assert.equal(rule.statusCode, 301);
  assert.equal(rule.preserveQueryString, true);
  assert(!manifest.rules.some(other => new URL(rule.destination).pathname === other.path), 'No redirect loop or chain');
  const local = new URL(rule.destination).pathname === '/' ? 'index.html' : new URL(rule.destination).pathname.slice(1) + 'index.html';
  assert(fs.existsSync(path.join(root, local)), `Destination must exist: ${local}`);
}
function match(url) {
  const parsed = new URL(url);
  return parsed.hostname === manifest.host && parsed.protocol === 'https:' ? manifest.rules.find(rule => rule.path === parsed.pathname) : undefined;
}
for (const rule of manifest.rules) {
  for (const suffix of ['', '?utm_source=legacy&x=1', '?next=https%3A%2F%2Fother.example%2F']) {
    assert.equal(match('https://jobpick20.com' + rule.path + suffix), rule);
  }
  for (const url of [
    'https://www.jobpick20.com' + rule.path,
    'http://jobpick20.com' + rule.path,
    'https://other.example' + rule.path,
    'https://jobpick20.com' + rule.path + '/child',
    'https://jobpick20.com' + rule.path + '/',
    'https://jobpick20.com' + rule.path.toUpperCase(),
  ]) assert.equal(match(url), undefined, `Unexpected broad match: ${url}`);
}
assert.equal(new Set(manifest.controls.map(control => control.path)).size, manifest.controls.length);
assert(manifest.controls.length >= 16);
for (const control of manifest.controls) {
  assert.equal(match('https://jobpick20.com' + control.path), undefined);
  assert([200, 301, 404].includes(control.status));
}
console.log('PASS: six exact HTTPS/apex legacy paths, fixed same-site 301 targets, query preservation, no loops, no broad matching; controls excluded.');

// Explicit read-only HTTP verification. Offline CI never fetches the live site.
const mode = process.argv[2];
if (mode) {
  assert(['--live-before', '--live-after'].includes(mode));
  const get = url => fetch(url, { redirect: 'manual', headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(20000) });
  for (const rule of manifest.rules) {
    for (const query of ['', '?utm_source=legacy&x=1', '?next=https%3A%2F%2Fother.example%2F']) {
      const source = 'https://jobpick20.com' + rule.path + query;
      const response = await get(source);
      assert.equal(response.status, mode === '--live-after' ? 301 : 404, source);
      assert.equal(response.headers.get('location'), mode === '--live-after' ? rule.destination + query : null, `${source}: wrong target or query handling`);
      await response.body?.cancel();
    }
    const target = await get(rule.destination);
    assert.equal(target.status, 200, rule.destination);
    assert.equal(target.headers.get('location'), null);
    const html = await target.text();
    assert(html.includes(`<link rel="canonical" href="${rule.destination}"`), `Destination canonical differs: ${rule.destination}`);
    console.log(`PASS ${mode}: ${rule.path} -> ${rule.destination}, queries and destination checked`);
  }
  for (const control of manifest.controls) {
    const response = await get('https://jobpick20.com' + control.path);
    assert.equal(response.status, control.status, `${control.path}: status changed`);
    assert.equal(response.headers.get('location'), control.location, `${control.path}: redirect changed`);
    for (const [header, value] of Object.entries(control.headers)) assert.equal(response.headers.get(header), value, `${control.path}: ${header} changed`);
    await response.body?.cancel();
    console.log(`PASS ${mode}: unchanged control ${control.path}`);
  }
}
