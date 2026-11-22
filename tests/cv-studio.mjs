import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { blankDraft, normalizeDraft, importDraft, lines, sampleDraft, cvBlocks, letterBlocks, plainText, reviewDraft, requirementMatches, jobRequirementLines, prioritizeFacts } from '../assets/cv-studio-model.mjs';
import { docxFile, safeFilename } from '../assets/cv-studio-export.mjs';

const blank = blankDraft();
assert.deepEqual(cvBlocks(blank), []);
assert.ok(reviewDraft(blank).some(i => i.text.includes('full name')));
assert.throws(() => normalizeDraft({ version: 9 }));
const sample = sampleDraft();
assert.equal(sample.sample, true);
assert.equal(normalizeDraft(sample).profile.name, 'Mira Nasser');
assert.ok(reviewDraft(sample).some(i => i.text.includes('fictional sample')));
const d = normalizeDraft({ ...sample, sample: false });
d.profile.name = 'Example Candidate';
d.target.requirements = 'Microsoft Excel\nCRM administration\nAviation licence';
const matches = requirementMatches(d);
assert.deepEqual(matches.map(m => m.found), [true, false, false]);
const before = plainText(cvBlocks(d));
requirementMatches(d); letterBlocks(d);
assert.equal(plainText(cvBlocks(d)), before, 'tailoring never changes CV facts');
assert.ok(!before.includes('CRM administration'));
assert.ok(!before.includes('Aviation licence'));
assert.ok(!plainText(letterBlocks(d)).includes('12 open enquiries'), 'letter evidence must be explicitly chosen');
d.target.evidence = d.experience[0].bullets.split('\n')[1];
assert.ok(plainText(letterBlocks(d)).includes('12 open enquiries'));
assert.ok(!plainText(letterBlocks(d)).includes('Reception Volunteer'));
d.educationFirst = true;
const headings = cvBlocks(d).filter(b => b.type === 'heading').map(b => b.text);
assert.ok(headings.indexOf('Education') < headings.indexOf('Work Experience'));
d.experience[0].start = 'Jan 2025'; d.experience[0].end = 'Jan 2024';
assert.ok(reviewDraft(d).some(i => i.text.includes('before the start')));
const hostile = normalizeDraft({ ...d, profile: { name: '<img src=x onerror=alert(1)> & أحمد', summary: 'Literal <script>test</script>\u0001' }, experience: Array(24).fill({ title: 'x'.repeat(400) }) });
assert.equal(hostile.experience.length, 20);
assert.equal(hostile.experience[0].title.length, 180);
assert.equal(hostile.profile.summary.includes('\u0001'), false);
assert.equal(hostile.profile.email, '');
assert.equal(Object.hasOwn(normalizeDraft(JSON.parse('{"version":1,"__proto__":{"polluted":true}}')), '__proto__'), false);
assert.equal(safeFilename('../..//evil?.exe', 'CV.docx'), 'evilexe-CV.docx');

// Inspect every ZIP entry and XML part instead of trusting an extension.
for (const direction of ['ltr', 'rtl']) {
  const blob = docxFile(cvBlocks(hostile), { direction });
  const bytes = new Uint8Array(await blob.arrayBuffer()), view = new DataView(bytes.buffer);
  const entries = new Map(); let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    assert.equal(view.getUint16(offset + 8, true), 0, 'ZIP method is stored');
    const size = view.getUint32(offset + 18, true), nameLength = view.getUint16(offset + 26, true), extraLength = view.getUint16(offset + 28, true);
    const name = new TextDecoder().decode(bytes.slice(offset + 30, offset + 30 + nameLength));
    const start = offset + 30 + nameLength + extraLength;
    const text = new TextDecoder().decode(bytes.slice(start, start + size));
    const xml = new JSDOM(text, { contentType: 'text/xml' });
    assert.equal(xml.window.document.querySelector('parsererror'), null);
    entries.set(name, text); xml.window.close(); offset = start + size;
  }
  assert.deepEqual([...entries.keys()], ['[Content_Types].xml', '_rels/.rels', 'word/document.xml']);
  assert.ok(!entries.get('_rels/.rels').includes('TargetMode="External"'));
  const xml = entries.get('word/document.xml');
  assert.ok(xml.includes('&lt;img src=x onerror=alert(1)&gt; &amp; أحمد'));
  assert.ok(xml.includes('w:w="11906" w:h="16838"'));
  assert.ok(xml.includes('<w:bidi w:val="0"/>'));
  assert.equal(xml.includes('<w:jc w:val="right"/>'), direction === 'rtl');
  assert.ok(!xml.includes('<w:tbl>'), 'no document tables');
  assert.ok(!xml.includes('<w:headerReference'), 'contact details stay in body');
}
const page = fs.readFileSync(new URL('../tools/cv-studio.html', import.meta.url), 'utf8');
assert.match(page, /name="robots" content="noindex,follow"/);
assert.match(page, /id="rememberDraft" type="checkbox"/);
assert.ok(!page.includes('googletagmanager'));
assert.ok(!page.includes('supabase'));
const controller = fs.readFileSync(new URL('../assets/cv-studio.mjs', import.meta.url), 'utf8');
assert.doesNotMatch(controller, /innerHTML|outerHTML|insertAdjacentHTML|\bfetch\s*\(|XMLHttpRequest|sendBeacon|eval\s*\(/);
assert.match(controller, /textContent = text/);
assert.match(controller, /FICTIONAL SAMPLE - design example only, not applicant evidence/);
assert.match(controller, /if \(!savingEnabled\) return/);
assert.match(controller, /window\.addEventListener\('storage'/);
assert.match(controller, /window\.addEventListener\('beforeunload'/);
console.log('PASS: CV Studio factual boundaries, phrase matching, draft validation, chronological review, inert OpenXML exports, RTL, noindex and local-only privacy contracts');

const jobDraft = sampleDraft();
jobDraft.target.jobDescription = 'Requirements:\nMicrosoft Excel\nAviation licence\nSQL administration';
jobDraft.target.requirements = jobRequirementLines(jobDraft.target.jobDescription).join('\n');
const originalPoints = jobDraft.experience.map(e => e.bullets);
jobDraft.tailorToJob = true;
assert.deepEqual(prioritizeFacts(['Welcomed visitors.', 'Prepared a Microsoft Excel report.'],jobDraft), ['Prepared a Microsoft Excel report.','Welcomed visitors.']);
assert.deepEqual(jobDraft.experience.map(e => e.bullets),originalPoints);
assert.ok(!plainText(cvBlocks(jobDraft)).includes('Aviation licence'));
assert.deepEqual(requirementMatches(jobDraft).map(m => m.found),[true,false,false]);
for (const template of ['professional','editorial','compact','executive','minimal','contemporary']) {
 const doc = cvBlocks({...jobDraft,template});
 for (const point of originalPoints.flatMap(v => v.split('\n'))) assert.ok(doc.some(b => b.text === point));
 const headings = doc.filter(b => b.type === 'heading').map(b => b.text);
 if (template === 'minimal') assert.ok(headings.indexOf('Skills') < headings.indexOf('Work Experience'));
  }

assert.deepEqual(lines('-20% change\n- 20% change\n-5°C\n−5°C\n- Confirmed action\n• -12%'), ['-20% change','- 20% change','-5°C','−5°C','Confirmed action','-12%']);
const signed = sampleDraft(); signed.experience[0].bullets='-20% change\n-5°C storage'; signed.target.evidence='-20% change';
assert.ok(cvBlocks(signed).some(b => b.text === '-20% change'));
assert.ok(letterBlocks(signed).some(b => b.text === '-20% change'));
assert.throws(() => importDraft({...sampleDraft(),experience:Array(21).fill({title:'Keep every entry'})}),/more than 20 entries/);
assert.throws(() => importDraft({...sampleDraft(),skills:'a'.repeat(6001)}),/exceeds/);
assert.throws(() => importDraft({...sampleDraft(),profile:{name:'a'.repeat(181)}}),/exceeds/);
const boundary = blankDraft(); boundary.skills='NoSQL'; boundary.target.requirements='SQL\nNoSQL';
assert.deepEqual(requirementMatches(boundary).map(m => m.found),[false,true]);
boundary.skills='SQL, PostgreSQL'; assert.deepEqual(requirementMatches(boundary).map(m => m.found),[true,false]);
assert.ok((await docxFile(cvBlocks(signed)).text()).includes('-20% change'));
assert.ok((await docxFile(cvBlocks(signed)).text()).includes('-5°C storage'));
assert.ok((await docxFile(letterBlocks(signed)).text()).includes('-20% change'));

for (const point of ['-$20 change','- $20 change','-€20 change','- €20 change','-.5% change','- .5% change','- USD 20 change','- AED .50 change','- usd 20 change','- USD $20 change','- US$20 change']) {
 assert.deepEqual(lines(point),[point]);
 const signedAmount=sampleDraft(); signedAmount.experience[0].bullets=point; signedAmount.target.evidence=point;
 assert.ok(cvBlocks(signedAmount).some(b => b.text === point));
 assert.ok(letterBlocks(signedAmount).some(b => b.text === point));
 assert.ok((await docxFile(cvBlocks(signedAmount)).text()).includes(point));
 assert.ok((await docxFile(letterBlocks(signedAmount)).text()).includes(point));
}
