import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';
import { JSDOM } from 'jsdom';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name==='index.html')files.push(full);}}
walk(root);
let footers=0,regions=0;
const resultIds=new Set(['offer-results','cl-results','ip-results','re-results','sh-answer','sh-results']);
function inspect(node,file){
 const attrs=Object.fromEntries((node.attrs||[]).map(a=>[a.name,a.value]));
 if(node.tagName==='div' && attrs['aria-label'])assert.ok(attrs.role,`${file}: labelled div must have justified semantics`);
 if((attrs.class||'').split(/\s+/).includes('jobpick-footer-links')){
  assert.equal(node.tagName,'nav',`${file}: footer links use native navigation`);
  assert.ok(attrs['aria-label'],`${file}: footer navigation has a name`);footers++;
 }
 if(resultIds.has(attrs.id)){
  assert.equal(attrs.role,'region',`${file}: result panel is a named region`);
  assert.ok(attrs['aria-label']);regions++;
  if(attrs.id!=='sh-results')assert.equal(attrs.tabindex,'-1','existing programmatic focus target retained');
  if(attrs.id==='offer-results')assert.ok('hidden' in attrs,'offer results start hidden');
 }
 if(node.tagName==='link' && attrs.rel==='icon' && attrs.href?.startsWith('data:')){
  assert.ok(!/\s/.test(attrs.href),`${file}: favicon URL contains no whitespace`);
  assert.ok(decodeURIComponent(attrs.href.split(',').slice(1).join(',')).includes('<svg'),`${file}: SVG remains decodable`);
 }
 if(node.tagName==='a' && attrs.href?.startsWith('mailto:'))assert.ok(!/\s/.test(attrs.href),`${file}: mailto parameters are encoded`);
 for(const child of node.childNodes||[])inspect(child,file);
}
for(const file of files)inspect(parse(fs.readFileSync(file,'utf8')),path.relative(root,file));
assert.equal(footers,66);assert.equal(regions,6);
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sources=[];
function scripts(node){if(node.tagName==='script' && !(node.attrs||[]).some(a=>a.name==='src'||a.name==='type'))sources.push((node.childNodes||[]).map(n=>n.value||'').join(''));for(const child of node.childNodes||[])scripts(child);}
scripts(parse(home));assert.equal(sources.length,1);
for(const lang of ['en','ar','hi','ur']){
 const dom=new JSDOM(home,{url:'https://jobpick20.com/',runScripts:'outside-only',pretendToBeVisual:true});
 const {window}=dom;window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});window.requestIdleCallback=()=>0;
 window.HTMLElement.prototype.scrollIntoView=function(){};
 window.eval(sources[0]);
 const language=window.document.getElementById('lang');language.value=lang;language.dispatchEvent(new window.Event('change'));
 const verify=()=>{
  const links=[...window.document.querySelectorAll('.opensearch a')];assert.ok(links.length>=14);
  for(const link of links){const visible=[...link.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();assert.ok(link.getAttribute('aria-label').startsWith(visible),`${lang}: action wording starts accessible name`);assert.equal(link.target,'_blank');assert.ok(link.getAttribute('aria-label').includes('opens in new tab'));}
 };
 verify();
 window.document.getElementById('country').value='uae';window.document.getElementById('country').dispatchEvent(new window.Event('change'));
 window.document.getElementById('role').value='support engineer';window.document.getElementById('goBtn').click();verify();
 const recent=window.document.querySelector('.history-item');assert.ok(recent);assert.equal(recent.getAttribute('aria-label'),recent.textContent);
 window.document.getElementById('role').value='different role';recent.click();assert.equal(window.document.getElementById('role').value,'support engineer','recent-search replay behavior retained');
 window.close();
}
console.log(`PASS: ${footers} native footer navigations, six named result regions, encoded favicon/mailto URLs, four-language action labels and recent-search replay`);
