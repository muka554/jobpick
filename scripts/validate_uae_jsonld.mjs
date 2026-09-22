import { readFile } from 'node:fs/promises';

const slugs = ['jobs-in-uae','it-jobs-uae','customer-service-jobs-dubai','technical-support-jobs-uae','sales-jobs-uae'];
for (const slug of slugs) {
  const file = `${slug}/index.html`;
  const html = await readFile(file, 'utf8');
  const startTag = '<script type="application/ld+json">';
  const start = html.indexOf(startTag);
  const end = html.indexOf('</script>', start);
  if (start < 0 || end < 0) throw new Error(`${file}: missing JSON-LD`);
  const data = JSON.parse(html.slice(start + startTag.length, end));
  if (data['@type'] !== 'Article' || !data.headline || !data.mainEntityOfPage?.['@id']) throw new Error(`${file}: incomplete Article schema`);
  console.log(`PASS ${file}`);
}
console.log(`Validated ${slugs.length} UAE JSON-LD blocks.`);
