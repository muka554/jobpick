import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'deployment/adsense-csp.json'), 'utf8'));
const expectedAdditions = {
  'script-src': ['https://ep2.adtrafficquality.google'],
  'img-src': ['https://pagead2.googlesyndication.com', 'https://ep1.adtrafficquality.google'],
  'connect-src': ['https://ep1.adtrafficquality.google'],
  'frame-src': ['https://googleads.g.doubleclick.net', 'https://ep2.adtrafficquality.google', 'https://www.google.com/recaptcha/'],
};
const sorted = values => [...values].sort();
function policyMap(policy) {
  const result = new Map();
  for (const part of policy.split(';').map(p => p.trim()).filter(Boolean)) {
    const [name, ...sources] = part.split(/\s+/);
    assert(!result.has(name), `Duplicate CSP directive: ${name}`);
    assert.equal(new Set(sources).size, sources.length, `Duplicate source: ${name}`);
    result.set(name, sources);
  }
  return result;
}
function htmlFiles(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (['node_modules', '.git'].includes(entry.name)) return [];
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.isFile() && file.endsWith('.html') ? [file] : [];
  });
}
function hasAdSense(html) {
  let found = false;
  function visit(node) {
    const source = node.tagName === 'script' && node.attrs?.find(a => a.name === 'src')?.value;
    if (source) {
      const url = new URL(source, 'https://jobpick20.com');
      if (url.origin === 'https://pagead2.googlesyndication.com' && url.pathname === '/pagead/js/adsbygoogle.js') found = true;
    }
    for (const child of node.childNodes || []) visit(child);
  }
  visit(parse(html));
  return found;
}
assert.equal(manifest.version, 1);
assert.equal(manifest.host, 'jobpick20.com');
assert.deepEqual(manifest.deployment, {
  ruleName: 'JobPick ad-page CSP compatibility', phase: 'http_response_headers_transform',
  position: 'last', operation: 'set', header: 'Content-Security-Policy',
});
assert.deepEqual(Object.fromEntries(Object.entries(manifest.addedSources).map(([k,v]) => [k, sorted(v)])),
  Object.fromEntries(Object.entries(expectedAdditions).map(([k,v]) => [k, sorted(v)])));
const baseline = policyMap(manifest.baselinePolicy);
const candidate = policyMap(manifest.policy);
assert.deepEqual(sorted(candidate.keys()), sorted(baseline.keys()), 'Do not add or remove directives');
for (const [name, sources] of baseline) {
  assert.deepEqual(sorted(candidate.get(name)), sorted([...sources, ...(expectedAdditions[name] || [])]), `Unexpected change to ${name}`);
}
const actualAdFiles = htmlFiles().filter(file => hasAdSense(fs.readFileSync(file, 'utf8')))
  .map(file => '/' + path.relative(root, file).split(path.sep).join('/')).sort();
assert.equal(actualAdFiles.length, 12, 'Ad inventory changed; review scope rather than silently expanding it');
assert.deepEqual(manifest.adHtmlFiles, actualAdFiles, 'Ad paths must match actual script-bearing HTML');
assert(actualAdFiles.every(file => file.endsWith('/index.html')));
const expectedPaths = sorted(new Set(actualAdFiles.flatMap(file => [file, file.slice(0, -'index.html'.length)])));
assert.deepEqual(manifest.paths, expectedPaths);
assert.equal(manifest.paths.length, 24);
assert(manifest.paths.every(p => p.startsWith('/cities/') || p.startsWith('/guides/')));
const expression = `(http.host eq ${JSON.stringify(manifest.host)} and http.request.uri.path in {${manifest.paths.map(p => JSON.stringify(p)).join(' ')}})`;
assert.equal(manifest.expression, expression, 'Only exact host and exact URI paths may match');
assert(manifest.expression.length < 4096);
const matches = (host, pathname) => host === manifest.host && manifest.paths.includes(pathname);
for (const file of htmlFiles()) {
  const relative = '/' + path.relative(root, file).split(path.sep).join('/');
  const hasAds = actualAdFiles.includes(relative);
  assert.equal(matches(manifest.host, relative), hasAds);
  if (relative.endsWith('/index.html')) assert.equal(matches(manifest.host, relative.slice(0, -10)), hasAds);
}
for (const pathname of ['/', '/tools/', '/tools/cv-studio.html', '/privacy-policy/', '/guides/uae-cv-guide/', '/guides/egypt-job-search-guide/other', '/tools/../guides/egypt-job-search-guide/']) {
  assert(!matches(manifest.host, pathname), `Non-ad path matched: ${pathname}`);
}
for (const host of ['www.jobpick20.com', 'other.example', 'jobpick20.com.other.example']) assert(!matches(host, manifest.paths[0]));
assert(!hasAdSense('<!-- <script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script> -->'));
console.log('PASS: 12 ad pages, 24 exact paths, seven source additions in four directives; every other directive unchanged.');

// Optional read-only HTTP check. This fetches HTML only; it never executes ads or clicks anything.
const mode = process.argv[2];
if (mode) {
  assert(['--live-before', '--live-after'].includes(mode), 'Use --live-before or --live-after');
  const controls = ['/', '/tools/', '/tools/cv-studio.html', '/guides/uae-cv-guide/', '/privacy-policy/'];
  for (const pathname of [...manifest.paths, ...controls]) {
    const url = new URL(pathname, 'https://' + manifest.host);
    const response = await fetch(url, { redirect: 'manual', headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(20000) });
    assert([200, 301, 308].includes(response.status), `${pathname}: HTTP ${response.status}`);
    const isAd = manifest.paths.includes(pathname);
    const expectedPolicy = mode === '--live-after' && isAd ? manifest.policy : manifest.baselinePolicy;
    assert.equal(response.headers.get('content-security-policy'), expectedPolicy, `${pathname}: unexpected CSP, stop on drift`);
    for (const [name, value] of Object.entries(manifest.unchangedHeaders)) {
      assert.equal(response.headers.get(name), value, `${pathname}: ${name} changed`);
    }
    if (response.status === 200) assert.equal(hasAdSense(await response.text()), isAd, `${pathname}: live ad inventory differs`);
    else {
      assert(isAd && pathname.endsWith('/index.html'), `${pathname}: unexpected redirect`);
      assert.equal(new URL(response.headers.get('location'), url).href, url.href.replace(/index\.html$/, ''));
      await response.body?.cancel();
    }
    console.log(`PASS ${mode}: ${pathname}`);
  }
      }
