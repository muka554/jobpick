import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);

const root = '/home/ubuntu/jobpick';
const cityRoot = path.join(root, 'cities');
const guideRoot = path.join(root, 'guides');
const reportPath = path.join(root, 'tests/content-readiness-link-validation.md');
const today = '2026-08-26';
const isoModified = '2026-08-26T00:00:00+04:00';
const cityDirs = (await readdir(cityRoot)).sort();
const guideDirs = (await readdir(guideRoot)).sort();
const cityFiles = cityDirs.map((dir) => path.join(cityRoot, dir, 'index.html'));
const guideFiles = guideDirs.map((dir) => path.join(guideRoot, dir, 'index.html'));
const decode = (value) => value.replace(/&amp;/g, '&');
const hrefs = (html) => [...html.matchAll(/\shref=["']([^"']+)["']/gi)].map((match) => decode(match[1]));
const isExternal = (href) => /^https?:\/\//i.test(href);
const localFileForHref = (href, fromFile) => {
  const pagePath = path.relative(root, fromFile).replace(/index\.html$/, '');
  const pathname = new URL(href, `https://jobpick20.com/${pagePath}`).pathname;
  if (pathname === '/') return path.join(root, 'index.html');
  if (pathname.endsWith('/')) return path.join(root, pathname, 'index.html');
  return path.join(root, pathname);
};
const exists = async (file) => {
  try { return (await stat(file)).isFile(); } catch { return false; }
};
const cityResults = [];
const internalFailures = [];
const externalUrls = new Set();

for (const file of cityFiles) {
  const html = await readFile(file, 'utf8');
  const slug = path.basename(path.dirname(file));
  const links = hrefs(html);
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
  const sourceList = main.match(/<ol class="source-list">([\s\S]*?)<\/ol>/i)?.[1] ?? '';
  const external = hrefs(sourceList).filter(isExternal).filter((url) => !url.includes('jobpick20.com'));
  const author = html.includes('href="/authors/jobpick-editorial-team/"') || html.includes("href='/authors/jobpick-editorial-team/'");
  const sources = /Sources and official routes/i.test(main) && Boolean(sourceList);
  const reviewed = html.includes('Last reviewed: August 26, 2026');
  const sourceCount = external.length;
  cityResults.push({ slug, author, sources, reviewed, sourceCount, external });
  for (const href of links.filter((value) => !isExternal(value) && !value.startsWith('#') && !/^(mailto:|tel:|javascript:|data:)/i.test(value))) {
    const target = localFileForHref(href, file);
    if (!(await exists(target))) internalFailures.push({ from: path.relative(root, file), href, expected: path.relative(root, target) });
  }
  external.forEach((url) => externalUrls.add(url));
}

for (const file of guideFiles) {
  const html = await readFile(file, 'utf8');
  const slug = path.basename(path.dirname(file));
  const links = hrefs(html);
  const required = [
    ['visible linked byline', /By\s*<a href="\/authors\/jobpick-editorial-team\/">Middle East Job Hub Editorial Team<\/a>/i.test(html)],
    ['last-reviewed note', html.includes('Last reviewed: August 26, 2026')],
    ['structured author', html.includes('"name":"Middle East Job Hub Editorial Team"')],
    ['structured modified date', html.includes(`"dateModified":"${isoModified}"`)]
  ];
  for (const [label, pass] of required) if (!pass) internalFailures.push({ from: `guides/${slug}/index.html`, href: `[metadata] ${label}`, expected: 'required framework item' });
  for (const href of links.filter((value) => !isExternal(value) && !value.startsWith('#') && !/^(mailto:|tel:|javascript:|data:)/i.test(value))) {
    const target = localFileForHref(href, file);
    if (!(await exists(target))) internalFailures.push({ from: path.relative(root, file), href, expected: path.relative(root, target) });
  }
}

const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
const crawlSignals = [
  ['Robots allows crawling', /^User-agent:\s*\*\s*\nAllow:\s*\//mi.test(robots)],
  ['Robots advertises sitemap', /Sitemap:\s*https:\/\/jobpick20\.com\/sitemap\.xml/i.test(robots)],
  ['Author profile in sitemap', sitemap.includes('https://jobpick20.com/authors/jobpick-editorial-team/')],
  ['All revised city URLs carry 2026-08-26 lastmod', cityDirs.every((slug) => new RegExp(`<loc>https://jobpick20\\.com/cities/${slug}/<\/loc>\\s*<lastmod>2026-08-26<\/lastmod>`).test(sitemap))],
  ['All guide URLs carry 2026-08-26 lastmod', guideDirs.every((slug) => new RegExp(`<loc>https://jobpick20\\.com/guides/${slug}/<\/loc>\\s*<lastmod>2026-08-26<\/lastmod>`).test(sitemap))]
];

const checkUrl = async (url) => {
  try {
    const { stdout } = await execFileAsync('curl', ['--silent', '--show-error', '--location', '--range', '0-1023', '--connect-timeout', '5', '--max-time', '8', '--user-agent', 'JobPickReadinessLinkValidator/1.0 (+https://jobpick20.com/contact/)', '--output', '/dev/null', '--write-out', '%{http_code}\t%{url_effective}', url], { timeout: 10000 });
    const [statusText, finalUrl] = stdout.trim().split('\t');
    const status = Number(statusText) || 'network error';
    const classification = typeof status === 'number' && status >= 200 && status < 400 ? 'reachable' : [401, 403, 405, 429].includes(status) || (typeof status === 'number' && status >= 500) ? 'indeterminate' : 'broken';
    return { url, status, classification, finalUrl };
  } catch (error) {
    const diagnostic = error.killed ? 'timeout' : String(error.stderr || error.message).trim().replace(/\|/g, '/').replace(/\n/g, ' ');
    return { url, status: 'network error', classification: 'indeterminate', finalUrl: diagnostic || 'request failed' };
  }
};
const externalResults = [];
const externalQueue = [...externalUrls].sort();
for (let index = 0; index < externalQueue.length; index += 4) {
  externalResults.push(...await Promise.all(externalQueue.slice(index, index + 4).map(checkUrl)));
}
const count = (classification) => externalResults.filter((item) => item.classification === classification).length;

const lines = [
  `# Content and Link Readiness Validation — ${today}`,
  '',
  'This report validates the locally staged static-site revision. External checks use a small ranged GET request, follow redirects, and classify access controls, rate limits, and server errors as **indeterminate**, not broken.',
  '',
  '## City-guide framework checks',
  '',
  '| City guide | Editorial-team link | Source section | Last-reviewed note | External authoritative links | Result |',
  '|---|---:|---:|---:|---:|---|',
  ...cityResults.map((item) => `| ${item.slug} | ${item.author ? 'Yes' : 'No'} | ${item.sources ? 'Yes' : 'No'} | ${item.reviewed ? 'Yes' : 'No'} | ${item.sourceCount} | ${item.author && item.sources && item.reviewed && item.sourceCount >= 2 && item.sourceCount <= 4 ? 'Pass' : 'Review'} |`),
  '',
  '## Crawl signals',
  '',
  '| Signal | Result |',
  '|---|---|',
  ...crawlSignals.map(([label, pass]) => `| ${label} | ${pass ? 'Pass' : 'Fail'} |`),
  '',
  '## Local internal-link results',
  '',
  internalFailures.length ? '| From | Link | Expected local target |\n|---|---|---|\n' + internalFailures.map((item) => `| ${item.from} | ${item.href} | ${item.expected} |`).join('\n') : 'All checked internal links from the revised city and guide pages resolve to local source files.',
  '',
  '## External authoritative-source results',
  '',
  `**Reachable:** ${count('reachable')}. **Indeterminate:** ${count('indeterminate')}. **Broken:** ${count('broken')}.`,
  '',
  '| Source URL | HTTP result | Classification | Final URL / diagnostic |',
  '|---|---:|---|---|',
  ...externalResults.map((item) => `| ${item.url} | ${item.status} | ${item.classification} | ${item.finalUrl} |`),
  '',
  '## Scope and limits',
  '',
  'This is a pre-publication link and source check. It does not prove Google indexing, Search Console coverage, advertiser approval, traffic quality, or an external agency’s current eligibility rules. Those depend on the external service and may change after publication.'
];
await writeFile(reportPath, `${lines.join('\n')}\n`);
if (internalFailures.length || cityResults.some((item) => !(item.author && item.sources && item.reviewed && item.sourceCount >= 2 && item.sourceCount <= 4)) || crawlSignals.some(([, pass]) => !pass) || count('broken')) process.exitCode = 1;
