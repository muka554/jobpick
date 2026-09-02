import fs from 'node:fs';
import vm from 'node:vm';
import { Blob } from 'node:buffer';

const html = fs.readFileSync(new URL('../tools/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>\n([\s\S]*?)<\/script>\n<\/body>/)?.[1];
if (!script) throw new Error('CV tools script not found');
const stub = () => ({ content: '', style: {}, files: [], value: '', textContent: '', innerHTML: '', disabled: false, addEventListener() {}, setAttribute() {}, classList: { toggle() {}, add() {}, remove() {} }, reset() {} });
const context = { Blob, URLSearchParams, window: {}, document: { querySelector: () => ({ content: '' }), getElementById: () => stub() }, sessionStorage: { getItem: () => null }, console };
context.window = context;
context.window.origin = 'https://jobpick20.com';
context.window.location = { origin: 'https://jobpick20.com', pathname: '/tools/' };
vm.createContext(context);
vm.runInContext(script, context, { filename: 'tools/index.html' });
if (typeof context.createCvPdf !== 'function') throw new Error('createCvPdf is not exposed');

const sample = `Alex Morgan
Dubai, UAE | alex.morgan@example.com | +971 50 123 4567
linkedin.com/in/alexmorgan

Professional Summary
Product-focused software engineer with 6 years of experience building reliable web platforms and customer-facing tools.

Experience
Senior Software Engineer — Gulf Systems — 2022–Present
- Led delivery of a multi-tenant React and Node.js platform used by 40,000 monthly users.
- Reduced API latency by 35% through query profiling, indexing, and caching.
Software Engineer — Northstar Labs — 2019–2022
- Built accessible workflows and automated test coverage for core product journeys.

Skills
JavaScript, TypeScript, React, Node.js, PostgreSQL, AWS, CI/CD

Education
BSc Computer Science — University of Manchester`;

for (const template of ['modern', 'classic', 'executive']) {
  const blob = context.createCvPdf(sample, 'Senior Software Engineer', 'Acme Digital', template);
  const bytes = Buffer.from(await blob.arrayBuffer());
  if (!bytes.subarray(0, 8).toString().startsWith('%PDF-1.4')) throw new Error(`${template}: invalid PDF header`);
  if (!bytes.toString('latin1').includes('/Count')) throw new Error(`${template}: missing page tree`);
  fs.writeFileSync(`/tmp/jobpick-${template}.pdf`, bytes);
  console.log(`${template}: ${bytes.length} bytes`);
}
console.log('PASS: all CV templates generate valid PDF byte streams');
