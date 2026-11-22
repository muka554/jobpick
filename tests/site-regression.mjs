import './cv-pdf-checker.mjs';
import './cv-pdf-assets.mjs';
import './tools-simplification.mjs';
import './cv-studio.mjs';
import './accessibility-markup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { moduleScripts, hasExactLink } from '../scripts/lib/content-parsing.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
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
for (const [index, source] of moduleScripts(tools).entries()) {
  const checked = spawnSync(process.execPath, ['--check', '--input-type=module'], { input: source, encoding: 'utf8' });
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
for (const name of ["guides/saudi-job-search-guide/index.html", "guides/recruitment-scam-warning-signs/index.html", "guides/egypt-job-search-guide/index.html", "guides/qatar-job-search-guide/index.html", "guides/kuwait-job-search-guide/index.html", "guides/jeddah-job-search-guide/index.html", "guides/oman-job-search-guide/index.html", "guides/jordan-job-search-guide/index.html", "guides/bahrain-job-search-guide/index.html", "cities/doha-jobs/index.html", "cities/riyadh-jobs/index.html", "cities/dubai-jobs/index.html", "cities/cairo-jobs/index.html", "cities/abu-dhabi-jobs/index.html", "jobs-in-uae/index.html", "it-jobs-uae/index.html", "sales-jobs-uae/index.html", "customer-service-jobs-dubai/index.html", "technical-support-jobs-uae/index.html"]) {
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
 const primary = html.match(/<nav\b(?=[^>]*\bclass="sitenav jobpick-primary-nav")[^>]*>([\s\S]*?)<\/nav>/)?.[1];
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

const qatarMobility = read('guides/qatar-job-search-guide/index.html');
assert.ok(!qatarMobility.includes('generally still requires either a No-Objection'), 'Do not restore the incorrect Qatar NOC requirement');
assert.match(qatarMobility, /without a No-Objection Certificate/, 'Qatar guide must explain NOC removal');
assert.match(qatarMobility, /mol.gov.qa\/admin\/EServices/, 'Qatar employer-change guidance must link to Ministry procedure');
assert.match(read('corrections/index.html'), /correction-20261122-qatar/, 'Material Qatar correction needs a public record');

for (const country of ['oman','kuwait','jordan','bahrain','egypt','uae']) {
 const html = read(country === 'uae' ? 'guides/uae-job-search-playbook/index.html' : 'guides/' + country + '-job-search-guide/index.html');
 assert.match(html, /What changed on 22 November 2026/, country + ' needs an honest claim-correction note');
 assert.ok(!html.includes('affect hiring pace, not eligibility'), country + ' must not reduce eligibility restrictions to hiring speed');
}
assert.ok(hasExactLink(read('guides/oman-job-search-guide/index.html'), 'https://www.mol.gov.om/Laborlaw'), 'Oman restrictions must link to Ministry law');
assert.match(read('corrections/index.html'), /correction-20261122-country/, 'Country claim corrections need a public record');

for (const country of ['oman','kuwait','jordan','bahrain','egypt','uae']) {
 assert.match(read(country === 'uae' ? 'guides/uae-job-search-playbook/index.html' : 'guides/' + country + '-job-search-guide/index.html'), /"dateModified"\s*:\s*"2026-11-22/, country + ' structured review date must match this correction');
}

for (const city of ['amman','cairo','doha','kuwait-city','manama','muscat']) {
 const movedCountries = {'muscat':'oman','kuwait-city':'kuwait','amman':'jordan','manama':'bahrain'};
 const html = read(movedCountries[city] ? 'guides/'+movedCountries[city]+'-job-search-guide/index.html' : 'cities/' + city + '-jobs/index.html');
 assert.match(html, /What changed on 22 November 2026/, city + ' needs a claim-correction note');
 for (const claim of ['meaningful share of Amman','largest commercial district by office stock','Most of Manama','Oman’s largest industrial park','can surface roles that a broad city-wide search misses']) {
  assert.ok(!html.includes(claim), city + ' must not restore unsupported hiring-share or productivity claims');
 }
}
assert.match(read('corrections/index.html'), /correction-20261122-city/, 'City corrections need a public record');

// Reviewed UAE consolidation: preserve useful assets and use explicit static-host redirects.
const consolidated = read('guides/uae-job-search-playbook/index.html');
assert.equal((consolidated.match(/type="checkbox"/g)||[]).length,16,'preserve the 16-point printable checklist');
for (const id of ['official-routes','checklist-section','checklistPrint']) assert.ok(consolidated.includes('id="'+id+'"'));
for (const [old,anchor] of [['uae-job-search-guide','target'],['uae-job-market-guide','official-routes']]) {
 const moved=read('guides/'+old+'/index.html');
 assert.ok(moved.includes('content="0; url=https://jobpick20.com/guides/uae-job-search-playbook/#'+anchor+'"'),'instant redirect target');
 assert.ok(!sitemapUrls.includes('https://jobpick20.com/guides/'+old+'/'),'moved article must leave sitemap');
              }

assert.match(read('guides/uae-job-search-playbook/index.html'), /\.cta \.button\{max-width:100%;white-space:normal;overflow-wrap:anywhere\}/, 'playbook CTA must wrap with the live font on narrow phones');

// City/country consolidation retains bounded source decisions and explicit redirects.
for (const [city,country] of [['muscat','oman'],['kuwait-city','kuwait'],['amman','jordan'],['manama','bahrain']]) {
 const destination='https://jobpick20.com/guides/'+country+'-job-search-guide/';
 const moved=read('cities/'+city+'-jobs/index.html');
 assert.ok(moved.includes('content="0; url='+destination+'#'+city+'"'),'city redirect must be immediate');
 assert.ok(!sitemapUrls.includes('https://jobpick20.com/cities/'+city+'-jobs/'),'moved city must leave sitemap');
 assert.ok(read('guides/'+country+'-job-search-guide/index.html').includes('id="'+city+'"'),'retained city decision needs an anchor');
}
assert.match(read('guides/oman-job-search-guide/index.html'),/https:\/\/gov.om\/w\/register-job-seeker-s-data-in-manpower-records/,'preserve the Arabic source, not a false correction based only on English');
assert.match(read('guides/kuwait-job-search-guide/index.html'),/EmploymentServiceEnglish.aspx/,'keep worker services distinct from vacancy applications');

// Preserve the established multi-family request through the live font rewrite.
for (const name of ['guides/oman-job-search-guide/index.html','guides/kuwait-job-search-guide/index.html','cities/muscat-jobs/index.html','cities/kuwait-city-jobs/index.html','guides/jordan-job-search-guide/index.html','guides/bahrain-job-search-guide/index.html','cities/amman-jobs/index.html','cities/manama-jobs/index.html']) {
 assert.ok(read(name).includes('family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;600;700&family=Manrope:wght@700;800&display=swap'),'city consolidation must preserve the original multi-family font URL: '+name);
}

assert.ok(hasExactLink(read('guides/jordan-job-search-guide/index.html'),'https://www.sajjil.gov.jo/nep'),'programme criteria need their own source');
assert.ok(hasExactLink(read('guides/jordan-job-search-guide/index.html'),'https://mol.gov.jo/EN/Pages/NonJordanian_workers'),'use publisher guide index, not an old fixed PDF as current rules');
assert.match(read('guides/bahrain-job-search-guide/index.html'),/Tamkeen.*National Employment Program/,'enterprise support must stay separate from job applications');

// Employer checks are evidence exercises, not authenticity certification.
const employerGuide=read('guides/verify-uae-employer/index.html');
// Preserve every pre-workshop fragment, including the two heading targets.
for (const id of ["main-content", "contents-title", "why", "identity", "domain", "recruiter", "vacancy", "offer", "fees", "report", "checklist", "sources-title"]) assert.equal((employerGuide.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1, 'Employer guide must preserve unique legacy fragment: ' + id);
assert.match(employerGuide, /<h2 id="contents-title">/, 'Contents fragment must remain on its heading');
assert.match(employerGuide, /<h2 id="sources-title">/, 'Sources legacy fragment must remain on its heading');
assert.match(employerGuide, /<section class="source-box" id="sources">/, 'New sources section fragment must remain');
for(const id of ['why','identity','domain','recruiter','vacancy','offer','fees','report','checklist','case-employer','case-agency','case-payment']) assert.ok(employerGuide.includes('id="'+id+'"'),'retain employer guide decision anchors');
assert.equal((employerGuide.match(/class="case-study"/g)||[]).length,3,'three worked cases');
for(const text of ['Fictional exercise','No details were entered','Enquiry for Job Offer','responsible authority','JobPick does not collect','22 November 2026']) assert.ok(employerGuide.includes(text),'preserve evidence limits: '+text);
assert.ok(!/catch most of these patterns|Every company operating in the UAE holds|Browse verified employer feeds/i.test(employerGuide),'do not restore unsupported assurances');
assert.ok(!employerGuide.includes('receipts.mohre.gov.ae/OfferInquiry'),'use the observed labelled job-offer inquiry route');
assert.ok(hasExactLink(employerGuide,'https://inquiry.mohre.gov.ae/'),'official inquiry entry point');

assert.ok(employerGuide.includes("<link href=\"https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">"),'preserve the employer guide original font markup');

// Complete CV practice remains fictional, evidence-bound, printable and backwards-compatible.
const cvWorkshop=read('guides/uae-cv-guide/index.html');
for (const id of ["main-content", "contents-title", "requirements", "structure", "bullets", "format", "context", "tools", "send", "sources"]) assert.equal((cvWorkshop.match(new RegExp('id="' + id + '"', 'g')) || []).length,1,'Preserve unique CV legacy ID: '+id);
for (const id of ['practice-brief','evidence-map','worked-cv','application-answer','application-message','blank-workbook','blank-print']) assert.equal((cvWorkshop.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'CV workshop target: '+id);
for (const text of ['All people, employers, qualifications, dates and results','invented for teaching','drafted, not submitted','I have not used an ERP system','not a UAE legal requirement','100 MB','2.5 MB','not fillable fields','22 November 2026']) assert.ok(cvWorkshop.includes(text),'CV evidence boundary: '+text);
assert.equal((cvWorkshop.match(/class="worksheet-sheet"/g)||[]).length,3,'Three blank workbook sheets');
const statement=cvWorkshop.match(/id="application-answer"[\s\S]*?<p class="application-copy">([\s\S]*?)<\/p>/)[1];
assert.ok(statement.trim().split(/\s+/).length<=120,'Practice statement respects its own limit');
for (const file of ['jobpick-fictional-cv.pdf','jobpick-cv-application-workbook.pdf']) {
 assert.ok(cvWorkshop.includes('/assets/worksheets/'+file),'PDF link must exist');
 const bytes=fs.readFileSync(path.join(root,'assets/worksheets',file));assert.equal(bytes.subarray(0,5).toString(),'%PDF-','Real PDF asset');assert.ok(bytes.length<100000,'Lightweight worksheets');
}
assert.ok(cvWorkshop.includes('<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>'),'Preserve intended CV fonts with literal query separators for live host rewriting');

// Role workshops preserve old routes/IDs and distinguish practice from outcomes.
for (const name of ['technical-support-jobs-uae/index.html','customer-service-jobs-dubai/index.html']) {
 const html=read(name);
 for (const id of ['main-content','guide-section-1','guide-section-2','guide-section-3','guide-section-4','guide-section-5','guide-section-6','guide-section-7']) assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,name+' legacy fragment '+id);
 for (const phrase of ['22 November 2026','fictional','Self-review, not','workshop-sources','/tools/interview-prep/','/guides/uae-cv-guide/']) assert.ok(html.includes(phrase),name+' practice boundary '+phrase);
 assert.ok(html.includes('family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;600;700&family=Manrope:wght@700;800&display=swap'),'Role guide fonts must survive live rewriting');
 assert.ok(!/35-45 tickets|1,200-user|60-80 inbound|most copied listings|hiring in Dubai concentrates|without warning/.test(html),'Remove unsupported role-market and metric assertions');
 assert.match(html,/\.cta \.btn\{max-width:100%;white-space:normal;overflow-wrap:anywhere\}/,'Role CTA wraps with actual fonts');
}
const supportWorkshop=read('technical-support-jobs-uae/index.html');
for (const text of ['JP-LAB-101','HTTP 403','TRAINING-ID-101','Unresolved; no fix','acceptance pending','09:30','No live logs queried']) assert.ok(supportWorkshop.includes(text),'Support evidence limit: '+text);
for (const id of ['ticket-pack','ticket-reasoning','support-handover','support-update','support-interview']) assert.equal((supportWorkshop.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Support exercise target '+id);
const serviceWorkshop=read('customer-service-jobs-dubai/index.html');
for (const text of ['JP-CASE-201','TRAINING-L201','refund request','not a published service standard','cannot confirm approval','Status remains open','not an actual follow-up']) assert.ok(serviceWorkshop.includes(text),'Complaint evidence limit: '+text);
for (const id of ['complaint-pack','complaint-reply','customer-reply-copy','service-handover','service-followup','service-interview']) assert.equal((serviceWorkshop.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Service exercise target '+id);
const customerReply=serviceWorkshop.match(/id="customer-reply-copy">([\s\S]*?)<\/p>/)[1];assert.ok(customerReply.trim().split(/\s+/).length<=100,'Customer reply respects exercise limit');

// Dated route evidence must not collapse browsing, accounts and submission.
const routeGuide=read('guides/gulf-job-platforms-explained/index.html');
for (const id of ['main-content','contents-title','choose','library','eligibility','trace','accounts','routine','sources']) assert.equal((routeGuide.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Platform guide preserves unique legacy target '+id);
assert.match(routeGuide,/<h2 id="contents-title">/,'Preserve original contents heading target');
assert.equal((routeGuide.match(/class="route-card"/g)||[]).length,6,'Six existing route cards');
assert.equal((routeGuide.match(/class="route-walkthrough"/g)||[]).length,6,'Six native observed walkthroughs');
for (const id of ['fahr','dubai','bayt','hays','dhl','accor']) assert.match(routeGuide,new RegExp('<details class="route-walkthrough" id="route-'+id+'">'),'Native disclosure '+id);
for (const phrase of ['22 November 2026','No results found','UAE Only','All three were checked in the session','create a My Hays account','might have closed','did not select Next','not successful applications','No applications, accounts, uploads','historical observations','not universal platform rules']) assert.ok(routeGuide.includes(phrase),'Preserve observation boundary '+phrase);
assert.ok(!routeGuide.includes('register on the Federal Government IRecruitment Portal to browse openings'),'Remove gateway-only account implication');
assert.ok(!routeGuide.includes('_gl='),'No session-tracking URL published');
assert.ok(!/increase my visibility by 80%|guaranteed placement|all DHL applications are broken/.test(routeGuide),'No unverified promotion or platform-wide failure claim');
assert.ok(routeGuide.includes('family=Manrope:wght@700;800&family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap'),'Keep exact platform-guide font request with literal separators');
assert.match(routeGuide,/"dateModified": "2026-11-22T/,'Material review date');

// Contextual navigation supplements, rather than duplicates, existing discovery links.
const categoryPaths=['/jobs-in-uae/','/it-jobs-uae/','/technical-support-jobs-uae/','/customer-service-jobs-dubai/','/sales-jobs-uae/','/tools/'];
for (const href of categoryPaths) {
 assert.ok(read('index.html').includes('href="'+href+'"'),'Keep existing static homepage category link '+href);
 assert.ok(read('resources/index.html').includes('href="'+href+'"'),'Keep resource directory link '+href);
 assert.ok(sitemapUrls.includes('https://jobpick20.com'+href),'Keep category in sitemap '+href);
}
for(const href of ['/it-jobs-uae/','/technical-support-jobs-uae/','/customer-service-jobs-dubai/','/sales-jobs-uae/']) assert.match(read('guides/uae-job-search-playbook/index.html'),new RegExp('<p class="route-context">[\\s\\S]*?href="'+href+'"'),'Role guidance has ordinary contextual links '+href);
assert.match(read('guides/uae-cv-guide/index.html'),/<p class="route-context">[\s\S]*?href="\/tools\/"/,'CV guide links tools directory in its tools section');
assert.match(read('guides/dubai-vs-abu-dhabi-job-search/index.html'),/<p class="route-context">[\s\S]*?href="\/jobs-in-uae\/"/,'City comparison links UAE city-and-role directory');

// The live host must receive literal separators to retain every intended font family.
for(const file of ['guides/uae-job-search-playbook/index.html','guides/dubai-vs-abu-dhabi-job-search/index.html']) assert.ok(read(file).includes('href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"'),'Preserve exact original font configuration with literal query separators: '+file);

// Keep the audited public-page repairs narrow and prevent their return.
const employerPage=read('employers/index.html');
assert.ok(!employerPage.includes('employerCopy') && !employerPage.includes("getElementById('language')"),'Remove the obsolete employer language block');
assert.match(employerPage,/<script src="\/assets\/site-localization\.js[^" ]*" defer><\/script>/,'Keep the shared language controller');
const missingPage=read('404.html');
assert.match(missingPage,/<meta name="robots" content="noindex,follow"/,'Keep the missing-page noindex policy');
assert.ok(missingPage.includes('For employers</a> · <a href="/tools/">Tools</a> · <a href="/partners/">Partnerships</a>'),'Separate the recovery links');
for(const file of ['about','advertising-disclosure','contact','cities/dubai-jobs','cities/abu-dhabi-jobs','cities/riyadh-jobs']) {
 const html=read(file+'/index.html');
 assert.ok(!html.includes('Special:FilePath'),'No blocked remote background on '+file);
 assert.ok(html.includes('linear-gradient(180deg, rgba(10,15,20,0.78) 0%, rgba(10,15,20,0.85) 100%);'),'Keep existing gradient fallback on '+file);
                     }
