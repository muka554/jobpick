#!/usr/bin/env node
/**
 * Generate sitemap.xml from canonical, indexable public index.html pages.
 * Run from the repository root: node scripts/generate_sitemap.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const origin = 'https://jobpick20.com';
const sitemapPath = join(root, 'sitemap.xml');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && entry.name === 'index.html') files.push(path);
  }
  return files;
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1] || null;
}

function canonicalFrom(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rel = attr(tag, 'rel');
    if (rel && /(?:^|\s)canonical(?:\s|$)/i.test(rel)) return attr(tag, 'href');
  }
  return null;
}

function isIndexable(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  return !tags.some((tag) => /\bname=["']robots["']/i.test(tag) && /noindex/i.test(attr(tag, 'content') || ''));
}

const oldXml = await readFile(sitemapPath, 'utf8').catch(() => '');
const oldLastmod = new Map();
for (const match of oldXml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
  oldLastmod.set(match[1], match[2]);
}

const pages = [];
for (const file of await walk(root)) {
  const rel = relative(root, file).replaceAll('\\', '/');
  if (rel === '404.html') continue;
  const html = await readFile(file, 'utf8');
  const canonical = canonicalFrom(html);
  if (!canonical || !canonical.startsWith(`${origin}/`) || !isIndexable(html)) continue;
  pages.push(canonical);
}
const urls = [...new Set(pages)].sort((a, b) => a.localeCompare(b));
if (!urls.includes(`${origin}/`)) throw new Error('Root canonical URL is missing from the inventory');

const body = urls.map((url) => {
  const lastmod = oldLastmod.get(url);
  return [
    '  <url>',
    `    <loc>${url}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    '  </url>'
  ].join('\n');
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
await writeFile(sitemapPath, xml, 'utf8');
console.log(`Generated ${urls.length} canonical sitemap URLs at ${sitemapPath}`);
