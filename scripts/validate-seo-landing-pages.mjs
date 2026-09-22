#!/usr/bin/env node
/**
 * Validate canonical SEO signals on every public index.html landing page.
 * Run: node scripts/validate-seo-landing-pages.mjs
 * Optional: --json /tmp/seo-validation.json
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const root = process.cwd();
const siteOrigin = 'https://jobpick20.com';
const jsonPath = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const failures = [];
const warnings = [];
const results = [];

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

function allMatches(html, regex) {
  return [...html.matchAll(regex)].map((match) => match[1] || match[0]);
}

function tagValue(html, tag, predicate, valueName) {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi')) || [];
  for (const tagText of tags) {
    if (!predicate(tagText)) continue;
    const value = tagText.match(new RegExp(`\\b${valueName}=["']([^"']*)["']`, 'i'));
    if (value) return value[1].trim();
  }
  return null;
}

function metaContent(html, attribute, value) {
  return tagValue(html, 'meta', (tagText) => new RegExp(`\\b${attribute}=["']${value}["']`, 'i').test(tagText), 'content');
}

function linkHref(html, relValue) {
  return tagValue(html, 'link', (tagText) => new RegExp(`\\brel=["'][^"']*\\b${relValue}\\b[^"']*["']`, 'i').test(tagText), 'href');
}

function expectedUrl(file) {
  const rel = relative(root, file).replaceAll('\\', '/');
  if (rel === 'index.html') return `${siteOrigin}/`;
  return `${siteOrigin}/${rel.replace(/index\.html$/, '')}`;
}

function addFailure(file, message) {
  failures.push({ file: relative(root, file), message });
}

const files = (await walk(root)).filter((file) => !['404/index.html'].includes(relative(root, file).replaceAll('\\', '/')));
for (const file of files) {
  const html = await readFile(file, 'utf8');
  const rel = relative(root, file).replaceAll('\\', '/');
  const expected = expectedUrl(file);
  const pageWarnings = [];
  const title = (html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
  const description = metaContent(html, 'name', 'description');
  const descriptions = (html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/gi) || []);
  const canonical = linkHref(html, 'canonical');
  const canonicalTags = (html.match(/<link\b[^>]*\brel=["'][^"']*canonical[^"']*["'][^>]*>/gi) || []).length
    + (html.match(/<link\b[^>]*\bhref=["'][^"']*["'][^>]*rel=["'][^"']*canonical[^"']*["'][^>]*>/gi) || []).length;
  const robots = metaContent(html, 'name', 'robots');
  const ogTitle = metaContent(html, 'property', 'og:title');
  const ogDescription = metaContent(html, 'property', 'og:description');
  const ogUrl = metaContent(html, 'property', 'og:url');
  const twitterCard = metaContent(html, 'name', 'twitter:card');
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const jsonLdBlocks = allMatches(html, /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const jsonLdTypes = [];
  for (const [index, block] of jsonLdBlocks.entries()) {
    try {
      const data = JSON.parse(block.trim());
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        if (node?.['@type']) jsonLdTypes.push(...(Array.isArray(node['@type']) ? node['@type'] : [node['@type']]));
      }
    } catch (error) {
      addFailure(file, `JSON-LD block ${index + 1} is invalid JSON: ${error.message}`);
    }
  }

  if (!title) addFailure(file, 'missing <title>');
  if (title.length > 65) pageWarnings.push(`title is ${title.length} characters`);
  if (!description) addFailure(file, 'missing meta description');
  if (description && description.length > 170) pageWarnings.push(`description is ${description.length} characters`);
  if (descriptions.length !== 1) addFailure(file, `expected exactly one meta description, found ${descriptions.length}`);
  if (!canonical) addFailure(file, 'missing canonical link');
  if (canonicalTags !== 1) addFailure(file, `expected exactly one canonical link, found ${canonicalTags}`);
  if (canonical && canonical !== expected) addFailure(file, `canonical is ${canonical}, expected ${expected}`);
  if (canonical?.includes('/home')) addFailure(file, 'canonical contains removed /home route');
  if (!ogTitle) addFailure(file, 'missing og:title');
  if (!ogDescription) addFailure(file, 'missing og:description');
  if (!ogUrl) addFailure(file, 'missing og:url');
  if (ogUrl && ogUrl !== expected) addFailure(file, `og:url is ${ogUrl}, expected ${expected}`);
  if (!twitterCard) addFailure(file, 'missing twitter:card');
  if (h1Count !== 1) addFailure(file, `expected exactly one H1, found ${h1Count}`);
  if (!jsonLdBlocks.length) addFailure(file, 'missing application/ld+json structured data');
  if (!jsonLdTypes.length) addFailure(file, 'structured data contains no @type');
  if (/noindex/i.test(robots || '')) pageWarnings.push('robots contains noindex');
  if (pageWarnings.length) warnings.push({ file: rel, warnings: pageWarnings });
  results.push({ file: rel, expected, title, descriptionLength: description?.length || 0, canonical, ogUrl, h1Count, jsonLdBlocks: jsonLdBlocks.length, jsonLdTypes, warnings: pageWarnings });
}

const report = { checkedAt: new Date().toISOString(), root, siteOrigin, pageCount: results.length, failureCount: failures.length, warningCount: warnings.length, failures, warnings, pages: results };
if (jsonPath) await writeFile(resolve(jsonPath), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Checked ${results.length} landing pages.`);
if (failures.length) {
  console.error(`FAIL: ${failures.length} issue(s)`);
  for (const failure of failures) console.error(`- ${failure.file}: ${failure.message}`);
} else {
  console.log('PASS: metadata, canonicals, Open Graph, Twitter, H1, and JSON-LD checks');
}
if (warnings.length) {
  console.log(`WARN: ${warnings.length} page(s) with non-blocking warnings`);
  for (const warning of warnings) console.log(`- ${warning.file}: ${warning.warnings.join('; ')}`);
}
process.exitCode = failures.length ? 1 : 0;
