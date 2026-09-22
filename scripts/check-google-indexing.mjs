#!/usr/bin/env node
/**
 * Check JobPick's sitemap, crawlability signals, and (optionally) Google Search
 * Console URL Inspection status. Public checks work without credentials.
 *
 * Examples:
 *   node scripts/check-google-indexing.mjs
 *   GOOGLE_ACCESS_TOKEN=... node scripts/check-google-indexing.mjs
 *   node scripts/check-google-indexing.mjs --limit 5 --output /tmp/jobpick-indexing.json
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_SITE = 'https://jobpick20.com/';
const DEFAULT_SITEMAP = `${DEFAULT_SITE}sitemap.xml`;
const DEFAULT_STATE = '.seo-indexing/history.json';
const DEFAULT_OUTPUT = '.seo-indexing/latest.json';
const DEFAULT_MARKDOWN = '.seo-indexing/latest.md';
const INSPECTION_ENDPOINT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

function arg(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function numberArg(name, fallback) {
  const value = Number(arg(name, fallback));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const siteUrl = new URL(arg('--property', process.env.SC_PROPERTY || DEFAULT_SITE)).toString();
const sitemapUrl = arg('--sitemap', process.env.SITEMAP_URL || DEFAULT_SITEMAP);
const statePath = resolve(arg('--state', DEFAULT_STATE));
const outputPath = resolve(arg('--output', DEFAULT_OUTPUT));
const markdownPath = resolve(arg('--markdown', DEFAULT_MARKDOWN));
const limit = numberArg('--limit', 50);
const token = process.env.GOOGLE_ACCESS_TOKEN || process.env.GSC_ACCESS_TOKEN || '';
const timeoutMs = numberArg('--timeout-ms', 15000);

if (!siteUrl.endsWith('/')) {
  throw new Error(`--property must end with / for a URL-prefix property: ${siteUrl}`);
}

function decodeXml(value) {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function textBetween(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? decodeXml(match[1].trim()) : null;
}

function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map((match) => {
    const block = match[1];
    return { url: textBetween(block, 'loc'), lastmod: textBetween(block, 'lastmod') };
  }).filter((entry) => entry.url);
}

function parseHtml(html) {
  const canonical = html.match(/<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*canonical[^"']*["']/i);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const robots = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
  return {
    canonical: canonical?.[1] || null,
    title: title?.[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || null,
    hasH1: Boolean(h1),
    robots: robots?.[1] || null,
  };
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' });
    const body = await response.text();
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

async function inspectPublic(url, sitemapEntry) {
  const checkedAt = new Date().toISOString();
  try {
    const { response, body } = await fetchText(url, { headers: { 'user-agent': 'JobPickIndexingMonitor/1.0' } });
    const html = response.headers.get('content-type')?.includes('text/html') ? parseHtml(body) : {};
    return {
      checkedAt,
      url,
      sitemapLastmod: sitemapEntry.lastmod,
      httpStatus: response.status,
      finalUrl: response.url,
      contentType: response.headers.get('content-type'),
      contentLength: body.length,
      ...html,
      publicStatus: response.ok ? 'ok' : 'http_error',
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    return { checkedAt, url, sitemapLastmod: sitemapEntry.lastmod, publicStatus: 'request_error', error: error.message };
  }
}

async function inspectGoogle(url) {
  if (!token) return { googleStatus: 'not_checked', google: null };
  try {
    const { response, body } = await fetchText(INSPECTION_ENDPOINT, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ inspectionUrl: url, siteUrl, languageCode: 'en-US' }),
    });
    let data = null;
    try { data = JSON.parse(body); } catch { /* retain raw response below */ }
    if (!response.ok) {
      return { googleStatus: 'api_error', google: { httpStatus: response.status, error: data?.error?.message || body.slice(0, 500) } };
    }
    const result = data?.inspectionResult || {};
    const index = result.indexStatusResult || {};
    const verdict = index.verdict || null;
    const coverage = index.coverageState || null;
    const isIndexed = verdict === 'PASS' || /submitted and indexed|url is on google/i.test(coverage || '');
    return {
      googleStatus: isIndexed ? 'indexed' : 'not_indexed',
      google: {
        verdict,
        coverageState: coverage,
        indexingState: index.indexingState || null,
        robotsTxtState: index.robotsTxtState || null,
        pageFetchState: index.pageFetchState || null,
        googleCanonical: index.googleCanonical || null,
        userCanonical: index.userCanonical || null,
        lastCrawlTime: index.lastCrawlTime || null,
        referringUrls: index.referringUrls || [],
      },
    };
  } catch (error) {
    return { googleStatus: 'api_error', google: { error: error.message } };
  }
}

function loadJson(path, fallback) {
  return readFile(path, 'utf8').then((text) => JSON.parse(text)).catch(() => fallback);
}

function mdCell(value) {
  return String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function makeMarkdown(report) {
  const counts = report.summary;
  const lines = [
    `# JobPick Google Indexing Check`,
    ``,
    `Checked: ${report.checkedAt}  `,
    `Property: ${report.property}  `,
    `Sitemap: ${report.sitemap}  `,
    `Google API status: ${report.googleApiEnabled ? 'enabled' : 'not enabled (public checks only)'}`,
    ``,
    `## Summary`,
    ``,
    `| Metric | Count |`,
    `|---|---:|`,
    `| Sitemap URLs checked | ${counts.total} |`,
    `| Public HTTP checks passed | ${counts.publicOk} |`,
    `| Indexed according to Search Console | ${counts.indexed} |`,
    `| Not indexed / excluded | ${counts.notIndexed} |`,
    `| Google API errors | ${counts.apiError} |`,
    `| Crawlability or metadata warnings | ${counts.warnings} |`,
    ``,
    `## URL details`,
    ``,
    `| URL | Sitemap lastmod | HTTP | Google status | Coverage | Last crawl | Warnings |`,
    `|---|---|---:|---|---|---|---|`,
  ];
  for (const item of report.urls) {
    const warnings = [];
    if (item.httpStatus !== 200) warnings.push(`HTTP ${item.httpStatus ?? 'error'}`);
    if (!item.canonical) warnings.push('missing canonical');
    if (!item.hasH1) warnings.push('missing H1');
    if (/noindex/i.test(item.robots || '')) warnings.push('noindex');
    lines.push(`| ${mdCell(item.url)} | ${mdCell(item.sitemapLastmod)} | ${mdCell(item.httpStatus)} | ${mdCell(item.googleStatus)} | ${mdCell(item.google?.coverageState)} | ${mdCell(item.google?.lastCrawlTime)} | ${mdCell(warnings.join(', '))} |`);
  }
  lines.push('', '## Interpretation', '', '- Public HTTP success does not prove Google has indexed a page.', '- Exact indexed/not-indexed status requires the Search Console URL Inspection API and a token with `webmasters.readonly` access to the property.', '- A newly changed page can remain unindexed while Google recrawls it; compare this report with the stored history over several checks rather than treating one run as a final verdict.', '');
  return `${lines.join('\n')}\n`;
}

const sitemapResponse = await fetchText(sitemapUrl, { headers: { 'user-agent': 'JobPickIndexingMonitor/1.0' } });
if (!sitemapResponse.response.ok) throw new Error(`Sitemap request failed: HTTP ${sitemapResponse.response.status}`);
const sitemapEntries = parseSitemap(sitemapResponse.body).slice(0, limit);
if (!sitemapEntries.length) throw new Error(`No <url><loc> entries found in ${sitemapUrl}`);

const now = new Date().toISOString();
const publicResults = [];
for (const entry of sitemapEntries) {
  const publicResult = await inspectPublic(entry.url, entry);
  const googleResult = await inspectGoogle(entry.url);
  publicResults.push({ ...publicResult, ...googleResult });
}

const summary = {
  total: publicResults.length,
  publicOk: publicResults.filter((item) => item.publicStatus === 'ok').length,
  indexed: publicResults.filter((item) => item.googleStatus === 'indexed').length,
  notIndexed: publicResults.filter((item) => item.googleStatus === 'not_indexed').length,
  apiError: publicResults.filter((item) => item.googleStatus === 'api_error').length,
  warnings: publicResults.filter((item) => item.httpStatus !== 200 || !item.canonical || !item.hasH1 || /noindex/i.test(item.robots || '')).length,
};
const report = { checkedAt: now, property: siteUrl, sitemap: sitemapUrl, googleApiEnabled: Boolean(token), summary, urls: publicResults };
const history = await loadJson(statePath, { property: siteUrl, checks: [], pages: {} });
history.property = siteUrl;
history.checks.push({ checkedAt: now, summary });
history.checks = history.checks.slice(-100);
for (const item of publicResults) {
  const page = history.pages[item.url] || { firstSeenAt: now, checks: [] };
  page.lastSeenAt = now;
  page.sitemapLastmod = item.sitemapLastmod;
  page.checks.push({ checkedAt: now, httpStatus: item.httpStatus, googleStatus: item.googleStatus, coverageState: item.google?.coverageState || null, lastCrawlTime: item.google?.lastCrawlTime || null });
  page.checks = page.checks.slice(-100);
  history.pages[item.url] = page;
}
await mkdir(dirname(statePath), { recursive: true });
await mkdir(dirname(outputPath), { recursive: true });
await mkdir(dirname(markdownPath), { recursive: true });
await writeFile(statePath, `${JSON.stringify(history, null, 2)}\n`);
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(markdownPath, makeMarkdown(report));
console.log(JSON.stringify({ output: outputPath, markdown: markdownPath, state: statePath, ...summary }, null, 2));
if (summary.publicOk !== summary.total || summary.warnings > 0) process.exitCode = 2;
