import { readdir, readFile, writeFile } from 'node:fs/promises';

const root = '/home/ubuntu/jobpick/guides';
const review = '<p class="meta guide-review-meta">By <a href="/authors/jobpick-editorial-team/">Middle East Job Hub Editorial Team</a> · Last reviewed: August 26, 2026 · Informational guidance</p><p class="meta guide-review-note">What changed: visible editorial ownership, source/review framework, and related-guide links were reviewed on August 26, 2026.</p>';
for (const slug of await readdir(root)) {
  const file = `${root}/${slug}/index.html`;
  let html = await readFile(file, 'utf8');
  html = html.replace(/"author"\s*:\s*\{\s*"@type"\s*:\s*"Person",\s*"name"\s*:\s*"Ahmed Abayzeed"\s*\}/g, '"author":{"@type":"Organization","name":"Middle East Job Hub Editorial Team"}');
  html = html.replace(/"dateModified"\s*:\s*"2026-08-25"/g, '"dateModified":"2026-08-26T00:00:00+04:00"');
  html = html.replace(/\s*<p class="meta" style="margin-top:-14px;border-bottom:0;">Editorially reviewed for clarity, source context, and internal links on August 25, 2026\.<\/p>/g, '');
  html = html.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)(?:\s*<p class="meta[^"]*">[\s\S]*?<\/p>){0,2}/, `$1${review}`);
  html = html.replace('</style>', '.guide-review-meta{margin-bottom:5px}.guide-review-note{margin-top:0;margin-bottom:24px;border-bottom:2px solid var(--line)}.guide-review-meta a{color:inherit;text-decoration:underline;text-underline-offset:3px}</style>');
  await writeFile(file, html);
}
