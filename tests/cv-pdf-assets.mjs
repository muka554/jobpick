import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const base=new URL('../assets/vendor/pdfjs-6.5.438/',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',base),'utf8'));
assert.equal(manifest.version,'6.5.438');assert.equal(manifest.source_commit,'0a4153349dc473ba950fc17941c5ca7eda43c1de');
const main=fs.readFileSync(new URL('pdf.min.mjs',base),'utf8');const notice='/*! @license Apache-2.0. JobPick: packaging notice and final newline added; reader code unchanged from official PDF.js 6.5.438. */\n';assert.ok(main.startsWith(notice));assert.equal(createHash('sha256').update(main.slice(notice.length).replace(/\n$/,'')).digest('hex'),'3a88402882cfa3e7e72c2c9b5149f52f0f88baf1c5b62aa11a41abdbc2072440','reader code matches the exact official distribution after documented packaging-only changes');
const workers=Object.keys(manifest.files).filter(n=>n.startsWith('pdf.worker'));
assert.equal(workers.length,9);
for(const [name,expected] of Object.entries(manifest.files)){
 assert.match(name,/^(?:LICENSE|pdf(?:\.worker(?:\.part-[a-f0-9]{12})?)?\.min\.mjs|pdf\.worker\.part-[a-f0-9]{12}\.mjs)$/);
 const body=fs.readFileSync(new URL(name,base));assert.equal(body.byteLength,expected.bytes);assert.equal(createHash('sha256').update(body).digest('hex'),expected.sha256,name+' integrity');
 if(name.startsWith('pdf.worker')){assert.ok(body.byteLength<256*1024);assert.match(body.toString(),/JobPick: rebuilt from PDF\.js 6\.5\.438/);assert.match(body.toString(),/pdfjsVersion = 6\.5\.438/);}
}
const entry=fs.readFileSync(new URL('pdf.worker.min.mjs',base),'utf8');
const imports=[...entry.matchAll(/\bfrom["'](\.\/pdf\.worker\.part-[a-f0-9]{12}\.mjs)["']/g)].map(m=>m[1].slice(2));
assert.deepEqual([...imports].sort(),workers.filter(n=>n!=='pdf.worker.min.mjs').sort(),'worker imports every packaged part with static relative imports');
assert.doesNotMatch(entry,/\bfrom["'](?:https?:|data:|blob:)/);
assert.deepEqual(fs.readdirSync(base).filter(n=>n.endsWith('.mjs')).sort(),Object.keys(manifest.files).filter(n=>n.endsWith('.mjs')).sort(),'no stale or missing runtime modules');
console.log('PASS: exact upstream reader code, nine bounded statically imported worker modules, license/change notices, asset SHA-256 integrity and no stale parts');
