import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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
assert.ok(!fs.existsSync(path.join(root, 'home')), 'legacy /home/ route must not exist');

for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  if (rel === '404.html' || rel === 'google212a37498484aaf9.html') continue;
  const html = fs.readFileSync(file, 'utf8');
  for (const marker of ['<title>', 'name="description"', 'rel="canonical"', 'property="og:title"', 'property="og:description"', 'property="og:url"', 'name="twitter:card"']) {
    assert.ok(html.includes(marker), `${rel} is missing ${marker}`);
  }
}

// Resolve both root-relative and page-relative assets. The old absolute-only
// check missed a broken tools/assets/privacy-controls.js request on /tools/.
const internalReferencePattern = /(?:src|href)=["']([^"']+)["']/gi;
for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  const pageUrl = new URL(rel.replaceAll(path.sep, '/'), 'https://jobpick20.com/');
  for (const match of html.matchAll(internalReferencePattern)) {
    const reference = match[1];
    if (reference.includes('${') || reference.startsWith('#')) continue;
    const targetUrl = new URL(reference.replaceAll('&amp;', '&'), pageUrl);
    if (targetUrl.origin !== 'https://jobpick20.com') continue;
    const target = decodeURIComponent(targetUrl.pathname);
    const resolved = path.join(root, target);
    const candidates = [resolved, path.join(resolved, 'index.html')];
    assert.ok(candidates.some((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()), `${rel} references missing internal path ${target}`);
    if (targetUrl.hash && target.endsWith('/')) {
      const targetHtml = fs.readFileSync(path.join(resolved, 'index.html'), 'utf8');
      const anchor = decodeURIComponent(targetUrl.hash.slice(1));
      assert.ok(targetHtml.includes(`id="${anchor}"`) || targetHtml.includes(`id='${anchor}'`), `${rel} references missing anchor ${reference}`);
    }
  }
}

for (const url of sitemapUrls) {
  const pathname = new URL(url).pathname;
  const file = pathname === '/' ? 'index.html' : `${pathname.replace(/^\//, '').replace(/\/$/, '')}/index.html`;
  assert.ok(fs.existsSync(path.join(root, file)), `sitemap URL ${url} must map to ${file}`);
}

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
assert.match(tools, /id="loginCv"[^>]+\/api\/auth\/google\/login/, 'CV tools must use the direct Google OAuth route');
assert.match(tools, /Log in with Google/, 'CV tools must expose the Google login label');
assert.match(tools, /function cleanGeneratedCv\(text\)/, 'CV output must be normalized before preview and secure download');
assert.match(tools, /EDITOR NOTES/, 'CV output sanitizer must recognize editor notes');

// Parse browser modules as modules: checking a .js file can miss import-related failures.
for (const [index, match] of [...tools.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()) {
  if (!/type=["']module["']/i.test(match[1])) continue;
  const checked = spawnSync(process.execPath, ['--check', '--input-type=module'], { input: match[2], encoding: 'utf8' });
  assert.equal(checked.status, 0, `CV tools inline module ${index} must parse: ${checked.stderr}`);
}

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
// Match either the explicit Supabase project ID or the wildcard, with optional whitespace
assert.ok(
  /connect-src[^\n]*(https:\/\/rvitqbkgtgjharxqaxmv\.supabase\.co|https:\/\/\*\.supabase\.co)/.test(headers),
  'CSP must allow Supabase (either explicit project ID or wildcard)'
);

console.log(`PASS: ${htmlFiles.length} HTML entry points, ${sitemapUrls.length} unique sitemap URLs, metadata/header/catalogue checks`);

const callbackTest = spawnSync(process.execPath, ['tests/auth-callback.mjs'], { cwd: root, encoding: 'utf8' });
assert.equal(callbackTest.status, 0, callbackTest.stdout + callbackTest.stderr);
console.log(callbackTest.stdout.trim());

const toolsHtml = fs.readFileSync(path.join(root, 'tools/index.html'), 'utf8');
assert.ok(toolsHtml.indexOf("const cvText=document.getElementById('cvText')") < toolsHtml.indexOf('<script type="module">'), 'local checker must bind independently before workspace imports');
assert.match(toolsHtml, /id="checkCv" type="button" disabled/, 'checker starts disabled before initialization');
assert.match(toolsHtml, /getElementById\('checkCv'\)\.disabled=false/, 'checker enables after local handlers bind');

const helperLayoutHtml = fs.readFileSync(path.join(root, 'tools/site-helper/index.html'), 'utf8');
assert(helperLayoutHtml.indexOf('id="sh-query"') < helperLayoutHtml.indexOf('id="helper-limits"'), 'Helper input must come before full limits');
assert(helperLayoutHtml.includes('href="#helper-limits"'), 'Helper short safety notice must link to full limits');

// Reading-layout additions preserve native no-JavaScript section links.
for (const name of ["guides/saudi-job-search-guide/index.html", "guides/recruitment-scam-warning-signs/index.html", "guides/egypt-job-search-guide/index.html", "guides/uae-job-market-guide/index.html", "guides/qatar-job-search-guide/index.html", "guides/kuwait-job-search-guide/index.html", "guides/jeddah-job-search-guide/index.html", "guides/oman-job-search-guide/index.html", "guides/jordan-job-search-guide/index.html", "guides/uae-job-search-guide/index.html", "guides/bahrain-job-search-guide/index.html", "cities/doha-jobs/index.html", "cities/riyadh-jobs/index.html", "cities/kuwait-city-jobs/index.html", "cities/dubai-jobs/index.html", "cities/cairo-jobs/index.html", "cities/abu-dhabi-jobs/index.html", "cities/muscat-jobs/index.html", "cities/amman-jobs/index.html", "cities/manama-jobs/index.html", "jobs-in-uae/index.html", "it-jobs-uae/index.html", "sales-jobs-uae/index.html", "customer-service-jobs-dubai/index.html", "technical-support-jobs-uae/index.html"]) {
 const html = read(name);
 assert.match(html, /<details class="guide-section-links">/, name + ' needs a compact section index');
 const details = html.match(/<details class="guide-section-links">([\s\S]*?)<\/details>/)?.[1] || '';
 for (const match of details.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes('id="' + match[1] + '"'), name + ' has a broken section target');
                    }

const homePriorities = read('index.html');
assert.ok(homePriorities.indexOf('class="live-jobs-spotlight"') < homePriorities.indexOf('class="filter-panel"'), 'Live jobs shortcut must precede directory filters');
assert.ok(homePriorities.indexOf('class="home-next-steps"') < homePriorities.indexOf('class="filter-panel"'), 'Priority guides must precede directory filters');
assert.match(homePriorities, /<details class="home-tracker-panel"><summary/, 'Secondary tracker begins collapsed but stays accessible');
assert.equal((homePriorities.match(/id="applicationTracker"/g) || []).length, 1, 'Tracker must not be duplicated');

for (const full of htmlFiles) {
 const html = fs.readFileSync(full, 'utf8');
 const primary = html.match(/<nav class="sitenav jobpick-primary-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
 assert.ok(primary, full + ' needs shared navigation');
 for (const href of ['/', '/jobs/', '/resources/', '/tools/', '/about/']) assert.ok(primary.includes('href="' + href + '"'), full + ' missing primary ' + href);
 for (const href of ['/privacy-policy/', '/terms-of-use/', '/advertising-disclosure/']) assert.ok(!primary.includes('href="' + href + '"'), full + ' legal links belong in footer');
 assert.ok(html.includes('class="jobpick-footer-links"'), full + ' needs shared footer links');
}

const standardsPhone = read('editorial-standards/index.html');
assert.match(standardsPhone, /class="standards-table-wrap" role="region"/, 'Standards table needs a named keyboard-scrollable region');
assert.match(standardsPhone, /standards-table-wrap\{max-width:100%;overflow-x:auto/, 'Standards table overflow must stay inside its wrapper');
const employerPhone = read('guides/verify-uae-employer/index.html');
assert.match(employerPhone, /a\.button\{max-width:100%;white-space:normal;box-sizing:border-box/, 'Employer CTA must wrap within narrow screens');
