import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'index.html') htmlFiles.push(full);
  }
}
walk(root);

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'sitemap URLs must be unique');
assert.equal(sitemapUrls.filter((u) => u === 'https://jobpick20.com/').length, 1, 'root must appear once');
assert.ok(!sitemapUrls.some((u) => u.includes('/home/')), 'legacy /home/ must not be in sitemap');

for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  if (rel === 'home/index.html') continue;
  if (rel === '404.html' || rel === 'google212a37498484aaf9.html') continue;
  const html = fs.readFileSync(file, 'utf8');
  for (const marker of ['<title>', 'name="description"', 'rel="canonical"', 'property="og:title"', 'property="og:description"', 'property="og:url"', 'name="twitter:card"']) {
    assert.ok(html.includes(marker), `${rel} is missing ${marker}`);
  }
}

const internalReferencePattern = /(?:src|href)=["'](\/[^"'#?]+)(?:["'#?])/gi;
for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(internalReferencePattern)) {
    const target = match[1];
    if (target === '/' || target.startsWith('/#')) continue;
    const candidates = [target, target.endsWith('/') ? `${target}index.html` : target];
    assert.ok(candidates.some((candidate) => fs.existsSync(path.join(root, candidate))), `${rel} references missing internal path ${target}`);
  }
}

for (const url of sitemapUrls) {
  const pathname = new URL(url).pathname;
  const file = pathname === '/' ? 'index.html' : `${pathname.replace(/^\//, '').replace(/\/$/, '')}/index.html`;
  assert.ok(fs.existsSync(path.join(root, file)), `sitemap URL ${url} must map to ${file}`);
}

const home = read('home/index.html');
assert.match(home, /meta http-equiv="refresh" content="0; url=https:\/\/jobpick20\.com\//i, 'legacy home must be redirect-only');
assert.match(home, /window\.location\.replace\(destination\)/, 'legacy home must preserve query/hash in redirect');

const index = read('index.html');
assert.match(index, /name:'Robert Half',[\s\S]*?type:'portal'/, 'Robert Half must be a portal visit');
assert.match(index, /name:'Charterhouse ME',[\s\S]*?type:'portal'/, 'Charterhouse must be a portal visit');
assert.match(index, /else if\(country==='oman'\) local=null/, 'Oman duplicate local entry must be removed');
assert.match(index, /else local=null/, 'Qatar duplicate local entry must be removed');
assert.match(index, /name:'Bayt\.com',[\s\S]*?location=\$\{encodeURIComponent\(cityName\)\}/, 'Bayt search must preserve city');
assert.match(index, /name:'GulfTalent',[\s\S]*?https:\/\/www\.gulftalent\.com\/mobile\//, 'GulfTalent search must use the working mobile route');
assert.match(index, /\.filter\(group=>group&&group\.items&&group\.items\.length\)/, 'empty catalogue groups must be filtered');

const tools = read('tools/index.html');
assert.match(tools, /rel="canonical" href="https:\/\/jobpick20\.com\/tools\/">/, 'CV tools canonical tag must be valid HTML');
assert.match(tools, /id="cvTemplate"[\s\S]*?modern[\s\S]*?classic[\s\S]*?executive/, 'CV tools must expose all PDF templates');
assert.equal((tools.match(/function trackCv\(/g) || []).length, 1, 'CV analytics helper must be defined once');
for (const eventName of ['cv_generation_started', 'cv_generation_success', 'cv_generation_failure', 'cv_download_started', 'cv_download_success', 'cv_download_failure']) {
  assert.match(tools, new RegExp(eventName), `CV analytics must track ${eventName}`);
}
assert.ok(!tools.includes('twitter:image" content="https://jobpick20.com/assets/middle-east-job-hub-logo.png">>'), 'CV tools metadata must not contain an extra closing bracket');
assert.match(tools, /Download generated PDF/, 'CV tools must expose PDF-only download wording');
assert.match(tools, /renderTemplateCards as renderProductionTemplateCards/, 'CV tools must import the tested production template renderer');
assert.match(tools, /callCv\('download'/, 'CV tools must use the authenticated server download procedure');
assert.match(tools, /id="secureEmployer"/, 'CV tools must collect an optional employer name');
assert.match(tools, /employerName:employerName\|\|undefined/, 'CV processing must receive the employer name');
assert.match(tools, /Rewrite the CV from scratch/, 'CV processing must request a complete rewrite rather than additive notes');
assert.match(tools, /function assessCvReadiness\(text\)/, 'CV output must be checked for application readiness');
assert.match(tools, /id="loginCv"[^>]+provider=google/, 'CV tools must use the Google OAuth provider');
assert.match(tools, /Log in with Google/, 'CV tools must expose the Google login label');
assert.match(tools, /function cleanGeneratedCv\(text\)/, 'CV output must be normalized before preview and secure download');
assert.match(tools, /EDITOR NOTES/, 'CV output sanitizer must recognize editor notes');

const privacy = read('assets/privacy-controls.js');
assert.ok(!privacy.includes("el.innerHTML="), 'consent banner must not assemble unescaped HTML');
assert.match(privacy, /textContent=t\.title/, 'consent title must use textContent');
assert.match(privacy, /textContent=t\.body/, 'consent body must use textContent');
for (const file of ['index.html', 'guides/uae-job-search-guide/index.html', 'assets/site-translations.json', 'assets/site-translations-source.json']) {
  assert.ok(!read(file).includes('20+'), `${file} must not claim more than the verified 20 platforms`);
}

const headers = read('_headers');
for (const marker of ['Content-Security-Policy:', 'X-Content-Type-Options:', 'Referrer-Policy:', 'Permissions-Policy:', 'X-Frame-Options:']) {
  assert.ok(headers.includes(marker), `_headers is missing ${marker}`);
}
assert.match(headers, /static\.cloudflareinsights\.com/, 'CSP fallback must allow Cloudflare Insights');
assert.match(headers, /connect-src[^\n]*https:\/\/jobpickcv-5ouvegg7\.manus\.space/, 'CSP must allow the configured CV backend');

console.log(`PASS: ${htmlFiles.length} HTML entry points, ${sitemapUrls.length} unique sitemap URLs, metadata/header/catalogue checks`);
