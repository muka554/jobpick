import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
const require = createRequire(process.env.CV_STUDIO_QA_PACKAGES || import.meta.url);
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const out = process.env.CV_STUDIO_QA_OUTPUT || path.join(tmpdir(), 'jobpick-cv-studio-qa'); await mkdir(out, { recursive: true });
const server = createServer(async (req,res)=>{try{ const name = path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname)); if (!name.startsWith(root+'/')) throw Error(); const f = (await stat(name)).isDirectory()?path.join(name,'index.html'):name; const data=await readFile(f); res.setHeader('Content-Type',f.endsWith('.mjs')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'application/octet-stream');res.end(data);}catch{res.writeHead(404);res.end('Missing');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({headless:true});
try {
 const context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true});
 const page=await context.newPage(); const errors=[], external=[];
 page.on('pageerror',e=>errors.push(e.message)); page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('blob:'))external.push(r.url());});
 await page.goto(origin+'/tools/cv-studio.html');
 await page.locator('#field-profile-name').fill('Test User');
 assert.equal(await page.evaluate(()=>localStorage.length),0);
 await page.locator('#field-profile-name').fill('');
 await page.locator('#loadSample').click();
 await page.screenshot({path:out+'/desktop-sample.png',fullPage:true});
 assert.equal((await new AxeBuilder({page}).analyze()).violations.length,0);
 await page.locator('#next').click();
 assert.equal(await page.locator('#stepCount').innerText(),'2 of 3');
 await page.locator('#next').click();
 assert.equal(await page.locator('#stepCount').innerText(),'3 of 3');
 await page.locator('[data-step="1"]').click();
 await page.screenshot({path:out+'/desktop-experience.png',fullPage:true});
 for (let i=0;i<6;i++) {
  if([2,3,4].includes(i)) await page.locator('#optionalSections').evaluate(n=>n.open=true);
  await page.locator(`[data-step="${i}"]`).click();
  const violations=(await new AxeBuilder({page}).analyze()).violations;
  assert.equal(violations.length,0,`Step ${i}: ${JSON.stringify(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))}`);
 }
 await page.locator('#optionalSections').evaluate(n=>n.open=true);
 await page.locator('[data-step="4"]').click();
 await page.locator('#letterOptions').evaluate(n=>n.open=true);
 await page.locator('#field-target-motivation').fill('I am interested in the customer enquiries work described in this role.');
 await page.getByText('Choose evidence from your experience',{exact:true}).click();
 await page.locator('.writing-tip button').filter({hasText:'Prepared a weekly Excel'}).click();
 await page.locator('#showLetter').click();
 assert.ok((await page.locator('#paper').innerText()).includes('12 open enquiries'));
 assert.ok(!(await page.locator('#paper').innerText()).includes('CRM administration'));
 await page.screenshot({path:out+'/desktop-letter.png',fullPage:true});
 let downloadEvent=page.waitForEvent('download'); await page.locator('#downloadWord').click(); await (await downloadEvent).saveAs(out+'/sample-letter.docx');
 await page.locator('#showCv').click();
 downloadEvent=page.waitForEvent('download'); await page.locator('#downloadWord').click(); await (await downloadEvent).saveAs(out+'/sample-cv.docx');
 await page.pdf({path:out+'/sample-cv.pdf',format:'A4',preferCSSPageSize:true,printBackground:true});
 await page.locator('#direction').selectOption('rtl');
 await page.locator('[data-step="0"]').click();
 await page.locator('#field-profile-name').fill('مريم أحمد');
 await page.locator('#field-profile-summary').fill('منسقة خدمة عملاء بخبرة في متابعة استفسارات العملاء وإعداد تقارير الخدمة باستخدام Excel.');
 await page.screenshot({path:out+'/desktop-arabic.png',fullPage:true});
 await page.pdf({path:out+'/sample-arabic.pdf',format:'A4',preferCSSPageSize:true,printBackground:true});
 downloadEvent=page.waitForEvent('download'); await page.locator('#downloadWord').click(); await (await downloadEvent).saveAs(out+'/sample-arabic.docx');
 // Keep entered hostile strings inert in rendered content and all exports.
 await page.locator('#field-profile-name').fill('<img src="https://evil.invalid/x" onerror="alert(1)">');
 await page.locator('#field-profile-summary').fill('<script>alert(1)</script> & normal text');
 assert.equal(await page.locator('#paper img,#paper script').count(),0);
 assert.ok((await page.locator('#paper').innerText()).includes('<img'));
 assert.equal(await page.evaluate(()=>localStorage.length),0);
 // Saving is opt-in, restore works, turning it off deletes the stored copy.
 await page.locator('#rememberDraft').check();
 assert.equal(await page.evaluate(()=>localStorage.length),0);
 await page.locator('#acceptConfirm').click();
 await page.waitForFunction(()=>localStorage.length===1);
 await page.reload();
 assert.equal(await page.locator('#rememberDraft').isChecked(),true);
 assert.ok((await page.locator('#field-profile-name').inputValue()).includes('<img'));
 await page.locator('#rememberDraft').uncheck();
 assert.equal(await page.evaluate(()=>localStorage.length),0);
 // Cancel replacement does not erase work; confirmed replacement does.
 await page.locator('#startBlank').click(); await page.locator('#cancelConfirm').click();
 assert.ok((await page.locator('#field-profile-name').inputValue()).includes('<img'));
 await page.locator('#startBlank').click(); await page.locator('#acceptConfirm').click();
 assert.equal(await page.locator('#field-profile-name').inputValue(),'');
 await page.locator('#loadSample').click();
 for(const width of [390,320,768,1280]) {
  await page.setViewportSize({width,height:950});
  await page.locator('[data-step="0"]').click();
  await page.screenshot({path:out+`/sample-${width}.png`,fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow at ${width}`);
  assert.equal((await new AxeBuilder({page}).analyze()).violations.length,0,`Mobile axe ${width}`);
 }

 // All six designs retain text and export from the same facts.
 for (const template of ['professional','editorial','compact','executive','minimal','contemporary']) {
  await page.locator('#template').selectOption(template);
  assert.ok((await page.locator('#paper').textContent()).includes('Mira Nasser'));
  await page.locator('#showLetter').click();
  assert.equal((await new AxeBuilder({page}).analyze()).violations.length,0,`Letter ${template}`);
  await page.locator('#showCv').click();
  await page.pdf({path:out+`/design-${template}.pdf`,format:'A4',preferCSSPageSize:true,printBackground:true});
 }
 await page.locator('#template').selectOption('professional');
 // Paste a job, prioritize only existing facts, inspect gaps, and start another job.
 await page.locator('#optionalSections').evaluate(n=>n.open=true);
 await page.locator('[data-step="4"]').click();
 await page.locator('#field-target-jobDescription').fill('Microsoft Excel\nCRM administration\nAviation licence');
 await page.getByRole('button',{name:'Tailor using my existing facts',exact:true}).click();
 assert.equal(await page.locator('#requirementMatches .missing').count(),2);
 assert.ok((await page.locator('#paper').textContent()).includes('Mira Nasser'));
 assert.ok(!(await page.locator('#paper').textContent()).includes('Aviation licence'));
 assert.ok(!(await page.locator('#paper').textContent()).includes('CRM administration'));
 assert.ok((await page.locator('.section-experience .cv-bullet').first().textContent()).includes('weekly Excel'));
 assert.equal((await new AxeBuilder({page}).analyze()).violations.length,0);
 await page.screenshot({path:out+'/job-tailoring.png',fullPage:true});
 await page.getByRole('button',{name:'Start another job',exact:true}).click();await page.locator('#cancelConfirm').click();
 assert.ok((await page.locator('#field-target-jobDescription').inputValue()).includes('Aviation licence'));
 await page.getByRole('button',{name:'Start another job',exact:true}).click();await page.locator('#acceptConfirm').click();
 assert.equal(await page.locator('#field-target-jobDescription').inputValue(),'');
 assert.ok((await page.locator('.section-experience .cv-bullet').first().textContent()).includes('Coordinated delivery'));
 // Invalid import never replaces the current draft.
 await page.locator('#importDraft').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":99}')});
 await page.waitForFunction(()=>document.getElementById('notice').innerText.includes('Could not open'));
 assert.ok((await page.locator('#paper').textContent()).includes('Mira Nasser'));
 await page.locator('#saveDraft').click();
 // Oversized factual imports must fail visibly rather than lose entry 21.
 await page.locator('#importDraft').setInputFiles({name:'too-many.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,experience:Array(21).fill({title:'Do not lose me'})}))});
 await page.waitForFunction(()=>document.getElementById('notice').innerText.includes('more than 20 entries'));
 assert.ok((await page.locator('#paper').textContent()).includes('Mira Nasser'));
 // Long input is wrapped, never clipped out of the document or silently shortened.
 await page.locator('[data-step="0"]').click();
 await page.locator('#field-profile-summary').fill('START-LONG '+ 'exampleword'.repeat(180)+' END-LONG');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.ok((await page.locator('#paper').innerText()).includes('END-LONG'));
 await page.locator('#optionalSections').evaluate(n=>n.open=true);
 await page.locator('[data-step="1"]').click();
 const longPoints=Array.from({length:40},(_,i)=>`TEST-POINT-${i+1}: A factual writing-test line repeated to check pagination and reading order, not an applicant achievement.`).join('\n');
 await page.locator('#field-experience-0-bullets').fill(longPoints);
 await page.pdf({path:out+'/long-cv.pdf',format:'A4',preferCSSPageSize:true,printBackground:true});
 assert.ok((await page.locator('#paper').innerText()).includes('TEST-POINT-40'));
 for (const template of ['compact','executive','minimal','contemporary']) {
  await page.locator('#template').selectOption(template);
  await page.pdf({path:out+`/long-${template}.pdf`,format:'A4',preferCSSPageSize:true,printBackground:true});
 }
 await page.locator('#template').selectOption('professional');
 // Explicit removal and reordering, with cancellation preserving the entry.
 await page.locator('.entry-controls button').filter({hasText:'Move up'}).first().click();
 assert.equal(await page.locator('#field-experience-0-title').inputValue(),'Reception Volunteer');
 await page.locator('.entry-controls button').filter({hasText:'Remove'}).first().click();
 await page.locator('#cancelConfirm').click();
 assert.equal(await page.locator('#field-experience-0-title').inputValue(),'Reception Volunteer');
 // A concurrent tab changing the saved draft must stop this tab from overwriting it.
 await page.locator('#rememberDraft').check(); await page.locator('#acceptConfirm').click();
 const other = await context.newPage(); await other.goto(origin+'/tools/cv-studio.html');
 await other.locator('#field-profile-name').fill('Other tab candidate');
 await page.waitForFunction(()=>!document.getElementById('rememberDraft').checked);
 assert.ok(!(await page.locator('#paper').textContent()).includes('Other tab candidate'));
 await page.locator('[data-step="0"]').click(); await page.locator('#field-profile-name').fill('Current tab unsaved');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('jobpick.cv-studio.v1')).profile.name),'Other tab candidate');
 await other.close();
 await page.locator('#rememberDraft').check(); await page.locator('#acceptConfirm').click();
 const clearingTab=await context.newPage(); await clearingTab.goto(origin+'/__qa_empty.html');
 await clearingTab.evaluate(()=>localStorage.clear());
 await page.waitForFunction(()=>!document.getElementById('rememberDraft').checked);
 assert.ok((await page.locator('#saveState').textContent()).includes('changed elsewhere'));
 await page.locator('#field-profile-name').fill('Do not restore deleted storage');
 assert.equal(await page.evaluate(()=>localStorage.length),0);
 assert.equal(await page.locator('#rememberDraft').isChecked(),false);
 await clearingTab.close();
 const blocked=await browser.newContext();
 await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}}));
 const blockedPage=await blocked.newPage();await blockedPage.goto(origin+'/tools/cv-studio.html');
 await blockedPage.locator('#loadSample').click();await blockedPage.locator('#rememberDraft').check();await blockedPage.locator('#acceptConfirm').click();
 await blockedPage.waitForFunction(()=>document.getElementById('notice').innerText.includes('unavailable'));
 assert.equal(await blockedPage.locator('#rememberDraft').isChecked(),false);
 assert.ok((await blockedPage.locator('#notice').innerText()).includes('unavailable'));
 await blocked.close();

 // The letter evidence picker must preserve numeric signs through the shared cleanup.
 await page.locator('[data-step="1"]').click();
 await page.locator('#field-experience-0-bullets').fill('-20% change\n-5°C storage');
 await page.locator('#optionalSections').evaluate(n=>n.open=true);
 await page.locator('[data-step="4"]').click();
 await page.locator('#letterOptions').evaluate(n=>n.open=true);
 await page.getByText('Choose evidence from your experience',{exact:true}).click();
 await page.getByRole('button',{name:'+ -20% change',exact:true}).click();
 assert.equal(await page.locator('#field-target-evidence').inputValue(),'-20% change');
 await page.locator('#showLetter').click();
 assert.ok((await page.locator('#paper').textContent()).includes('-20% change'));
 assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
 console.log('PASS browser: three-step core and optional editors, six structural layouts and letter styles, job tailoring/gaps, axe, DOCX/PDF, RTL, hostile text, local-only behavior, storage controls/failure/cross-tab, invalid imports, long output, reorder/cancel and five viewport widths');
} finally { await browser.close(); await new Promise(r=>server.close(r)); }
