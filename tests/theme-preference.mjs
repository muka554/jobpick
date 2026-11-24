import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {JSDOM} from 'jsdom';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const source=fs.readFileSync(path.join(root,'assets/theme-preference.js'),'utf8');
let count=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.html')){const s=fs.readFileSync(p,'utf8');if(!s.includes('<head>'))continue;assert.equal((s.match(/src="\/assets\/theme-preference.js"/g)||[]).length,1,p);assert.equal((s.match(/href="\/assets\/theme-preference.css"/g)||[]).length,1,p);count++;}}}walk(root);
for(const dark of [false,true])for(const blocked of [false,true]){
 const dom=new JSDOM('<!doctype html><html lang="en"><body><nav class="sitenav"></nav></body></html>',{url:'https://jobpick20.com/',runScripts:'outside-only'}),w=dom.window;
 const media={matches:dark,addEventListener(_,fn){this.update=fn;}};w.matchMedia=()=>media;
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('Storage disabled');}});
 w.eval(source);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 const d=w.document,b=d.getElementById('jobpick-theme-toggle');assert.ok(b);assert.equal(d.documentElement.dataset.theme,dark?'dark':'light');
 b.click();assert.equal(d.documentElement.dataset.theme,dark?'light':'dark');assert.equal(b.getAttribute('aria-pressed'),dark?'false':'true');
 if(!blocked)assert.equal(w.localStorage.getItem('jobpick.theme.v1'),dark?'light':'dark');
 media.matches=!dark;media.update();assert.equal(d.documentElement.dataset.theme,dark?'light':'dark');
 d.querySelector('.jobpick-theme-system').click();assert.equal(d.documentElement.dataset.theme,dark?'light':'dark');assert.equal(d.querySelector('.jobpick-theme-system').hidden,true);
 media.matches=dark;media.update();assert.equal(d.documentElement.dataset.theme,dark?'dark':'light');
 w.dispatchEvent(new w.StorageEvent('storage',{key:'jobpick.theme.v1',newValue:'dark'}));assert.equal(d.documentElement.dataset.theme,'dark');
 w.close();
}
assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|sendBeacon|innerHTML|document\.cookie/);
console.log(`PASS theme: ${count} HTML documents wired, system default/live changes, explicit toggle, local persistence, reset, storage failure/cross-tab and no network APIs`);

// Script optimizers can suppress their replay of DOMContentLoaded.
for (const initiallyMissingBody of [false,true]) {
 const dom=new JSDOM('<!doctype html><html><body><nav class="sitenav"></nav></body></html>',{url:'https://jobpick20.com/',runScripts:'outside-only'}),w=dom.window;
 const doc=w.document,events=doc.addEventListener.bind(doc),timers=[];let loading=true;
 Object.defineProperty(doc,'readyState',{get:()=>loading?'loading':'complete'});
 doc.addEventListener=(name,...args)=>{if(name!=='DOMContentLoaded')events(name,...args);};
 w.setTimeout=fn=>{timers.push(fn);return timers.length;};
 let body=doc.body;if(initiallyMissingBody)body.remove();
 w.eval(source);assert.equal(doc.getElementById('jobpick-theme-toggle'),null);
 timers.shift()();if(initiallyMissingBody){assert.equal(doc.getElementById('jobpick-theme-toggle'),null);doc.documentElement.append(body);timers.shift()();}
 assert.equal(doc.querySelectorAll('#jobpick-theme-toggle').length,1);
 // A late event or repeated fallback cannot add duplicate controls.
 loading=false;doc.dispatchEvent(new w.Event('DOMContentLoaded'));w.eval(source);while(timers.length)timers.shift()();
 assert.equal(doc.querySelectorAll('#jobpick-theme-toggle').length,1);doc.getElementById('jobpick-theme-toggle').click();assert.equal(doc.documentElement.dataset.theme,'dark');w.close();
}
console.log('PASS theme delayed-DOM recovery: suppressed ready event, absent body retry and idempotent repeated mount');
