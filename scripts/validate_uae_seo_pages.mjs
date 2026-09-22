import { readFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';

const root = process.cwd();
const slugs = ['jobs-in-uae','it-jobs-uae','customer-service-jobs-dubai','technical-support-jobs-uae','sales-jobs-uae'];
for (const slug of slugs) {
  const file = `${slug}/index.html`;
  await access(file);
  const html = await readFile(file, 'utf8');
  if (!html.includes(`rel="canonical" href="https://jobpick20.com/${slug}/"`)) throw new Error(`${file}: canonical missing`);
  if (!html.includes('href="/jobs/"')) throw new Error(`${file}: jobs CTA missing`);
  if ((html.match(/href="\//g) || []).length < 8) throw new Error(`${file}: too few internal links`);
}
const sitemap = await readFile('sitemap.xml', 'utf8');
for (const slug of slugs) if (!sitemap.includes(`https://jobpick20.com/${slug}/`)) throw new Error(`sitemap missing ${slug}`);
for (const file of ['index.html','resources/index.html','jobs/index.html','cities/dubai-jobs/index.html','cities/abu-dhabi-jobs/index.html']) {
  const html = await readFile(file, 'utf8');
  if (!html.includes('/jobs-in-uae/')) throw new Error(`${file}: missing UAE hub link`);
}
console.log(`PASS: ${slugs.length} landing pages, sitemap parity, and hub links.`);
