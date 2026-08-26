import { readFile, writeFile } from 'node:fs/promises';
const file = '/home/ubuntu/jobpick/sitemap.xml';
const changed = [
  ...['abu-dhabi-jobs','amman-jobs','cairo-jobs','doha-jobs','dubai-jobs','kuwait-city-jobs','manama-jobs','muscat-jobs','riyadh-jobs'].map((slug) => `cities/${slug}`),
  ...['bahrain-job-search-guide','egypt-job-search-guide','gulf-job-platforms-explained','jordan-job-search-guide','kuwait-job-search-guide','oman-job-search-guide','qatar-job-search-guide','recruitment-scam-warning-signs','uae-cv-guide','uae-job-market-guide','uae-job-search-guide'].map((slug) => `guides/${slug}`)
];
let xml = await readFile(file, 'utf8');
for (const path of changed) {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<loc>https://jobpick20\\.com/${escaped}/<\\/loc>\\s*<lastmod>)\\d{4}-\\d{2}-\\d{2}(</lastmod>)`);
  if (!pattern.test(xml)) throw new Error(`Missing sitemap entry: ${path}`);
  xml = xml.replace(pattern, '$12026-08-26$2');
}
if (!xml.includes('https://jobpick20.com/authors/jobpick-editorial-team/')) {
  xml = xml.replace('</urlset>', `  <url>\n    <loc>https://jobpick20.com/authors/jobpick-editorial-team/</loc>\n    <lastmod>2026-08-26</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n</urlset>`);
}
await writeFile(file, xml);
