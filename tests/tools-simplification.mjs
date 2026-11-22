import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html=fs.readFileSync(new URL('../tools/index.html',import.meta.url),'utf8');
const create=(suffix='')=>new JSDOM(html,{url:'https://jobpick20.com/tools/'+suffix,runScripts:'outside-only'});
const dom=create();const doc=dom.window.document;
const disclosure=doc.getElementById('signed-in-cv-workspace');
assert.equal(disclosure.tagName,'DETAILS');assert.ok(!disclosure.hasAttribute('open'));
assert.ok(disclosure.querySelector(':scope > summary'));
assert.ok(doc.getElementById('checker').compareDocumentPosition(disclosure)&dom.window.Node.DOCUMENT_POSITION_FOLLOWING,'local check comes before the optional workspace');
for(const id of ['secureCvTitle','cvFile','uploadCv','previewCv','loginCv','logoutCv','secureRole','secureEmployer','secureJobDescription','cvTemplate','processCv','downloadCv','deleteCv','cvPreview'])assert.ok(disclosure.querySelector('#'+id),'legacy workspace target remains: '+id);
for(const id of ['buildPrompt','promptResult','targetRole','targetCity'])assert.equal(doc.getElementById(id),null,'retired prompt form removed');
assert.ok(!html.includes("getElementById('buildPrompt')"),'retired handler removed too');
const expected=['/tools/cover-letter-checker/','/tools/interview-prep/','/guides/uae-salary-guide/#offer-worksheet'];
assert.deepEqual([...doc.querySelectorAll('.next-tools .tool-link')].map(a=>a.getAttribute('href')),expected);
assert.equal(doc.querySelectorAll('.tools-start a[href="/tools/site-helper/"],.tools-start a[href="/tools/role-explorer/"]').length,0);
assert.ok(doc.getElementById('cvText').getAttribute('aria-describedby'));
const classic=[...doc.scripts].filter(s=>!s.src&&!s.type);assert.equal(classic.length,1);
dom.window.eval(classic[0].textContent);
doc.getElementById('checkCv').click();assert.match(doc.getElementById('cvResult').textContent,/Choose a PDF or paste your CV text first/);
doc.getElementById('cvText').value='Phone and location\nProfessional summary\nWork experience\nManaged and delivered updates\nSkills\nEducation';doc.getElementById('checkCv').click();assert.match(doc.getElementById('cvResult').textContent,/main structure signals/);
assert.equal(disclosure.open,false);
const callbackKeys=['code','access_token','error','error_code','error_description'];
const localization=fs.readFileSync(new URL('../assets/site-localization.js',import.meta.url),'utf8');
const sharedKeys=JSON.parse(localization.match(/var callbackKeys = (\[[^\]]+\]);/)[1].replaceAll("'",'"'));
assert.deepEqual(callbackKeys,sharedKeys,'match the full shared auth callback key set');
for(const key of callbackKeys)for(const suffix of ['?'+key+'=fixture','#'+key+'=fixture','?other=fixture&'+key+'=fixture','#token_type=bearer&'+key+'=fixture','?'+key+'=','#'+key+'=']){
 const returned=create(suffix);const before=returned.window.location.href;const script=[...returned.window.document.scripts].find(s=>!s.src&&!s.type);returned.window.eval(script.textContent);assert.equal(returned.window.document.getElementById('signed-in-cv-workspace').open,true,'return UI is visible for '+suffix);assert.equal(returned.window.location.href,before,'presentation does not consume or rewrite callback parameters');returned.window.close();
}
for(const suffix of ['?other=fixture','#checker','#token_type=bearer','?note=error_code%3Dfixture','#note=access_token%3Dfixture']){
 const normal=create(suffix);normal.window.eval([...normal.window.document.scripts].find(s=>!s.src&&!s.type).textContent);assert.equal(normal.window.document.getElementById('signed-in-cv-workspace').open,false,'unrelated URLs stay folded: '+suffix);normal.window.close();
}
assert.equal(doc.querySelector('script[src="/assets/cv-pdf-checker.mjs"]').type,'module');
assert.equal(doc.getElementById('cvCheckPdf').type,'file');assert.equal(doc.getElementById('cvCheckPdf').accept,'.pdf,application/pdf');assert.equal(doc.getElementById('cvCheckPdf').disabled,true,'the PDF chooser is enabled only after its module loads');assert.equal(doc.getElementById('cvPasteText').tagName,'DETAILS');
assert.equal(doc.getElementById('openCvWorkspace').getAttribute('href'),'#secureCvTitle');
assert.ok(doc.getElementById('openCvWorkspace').compareDocumentPosition(doc.getElementById('checker'))&dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
const studioLinks=doc.querySelectorAll('a[href="/tools/cv-studio.html"]');assert.equal(studioLinks.length,1,'one explicit CV Studio entry');
const studioLink=studioLinks[0],studioCard=studioLink.closest('section');assert.equal(studioCard.getAttribute('aria-labelledby'),'cvStudioTitle');assert.equal(studioCard.querySelector('h2').textContent,'CV Studio');assert.match(studioCard.textContent,/CV builder preview\. Runs in your browser\./);assert.doesNotMatch(studioCard.textContent,/payment|subscription|pricing|\bfree\b|\bAI\b/i);
assert.ok(doc.getElementById('openCvWorkspace').compareDocumentPosition(studioLink)&dom.window.Node.DOCUMENT_POSITION_FOLLOWING,'Tailor your CV stays first');assert.ok(studioLink.compareDocumentPosition(doc.getElementById('checker'))&dom.window.Node.DOCUMENT_POSITION_FOLLOWING,'Studio uses the reserved slot before the checker');
const studioPage=new JSDOM(fs.readFileSync(new URL('../tools/cv-studio.html',import.meta.url),'utf8'),{url:'https://jobpick20.com/tools/cv-studio.html'});const studioDoc=studioPage.window.document;assert.equal(studioDoc.title,'CV Studio Preview | JobPick');assert.equal(studioDoc.querySelector('link[rel="canonical"]').href,'https://jobpick20.com/tools/cv-studio.html');assert.equal(studioDoc.querySelector('meta[name="robots"]').content,'noindex,follow');assert.match(studioDoc.getElementById('privacyDetail').textContent,/processed in this browser/);assert.match(studioDoc.getElementById('privacyDetail').textContent,/Browser saving is off by default/);assert.match(studioDoc.getElementById('privacyDetail').textContent,/Cloudflare Web Analytics to measure page performance/);assert.doesNotMatch(studioDoc.getElementById('privacyDetail').textContent,/no ads or analytics|only local page assets/);assert.equal(studioDoc.getElementById('rememberDraft').checked,false);assert.ok(!fs.readFileSync(new URL('../sitemap.xml',import.meta.url),'utf8').includes('cv-studio'));studioPage.window.close();
assert.ok(doc.querySelector('noscript'),'no-JavaScript guidance remains available');
dom.window.close();
console.log('PASS: focused tools order, optional native workspace, retained legacy controls, retired prompt removal, direct task links, local checker, honest CV Studio preview link with destination metadata/privacy boundaries and OAuth-return disclosure');
