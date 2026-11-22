import { blankDraft, sampleDraft, normalizeDraft, cvBlocks, letterBlocks, plainText, requirementMatches, reviewDraft, jobRequirementLines, matchingJobFacts, LIMITS } from './cv-studio-model.mjs';
import { docxFile, downloadFile, safeFilename } from './cv-studio-export.mjs';

const $ = id => document.getElementById(id);
const STORE = 'jobpick.cv-studio.v1';
const TITLES = ['Start with you.', 'Make the work speak.', 'Show what you learned.', 'Bring your strengths forward.', 'Make it relevant.', 'One last, careful look.'];
const KICKERS = ['THE INTRODUCTION', 'YOUR EVIDENCE', 'YOUR FOUNDATION', 'THE DETAILS THAT MATTER', 'ONE ROLE. ONE CLEAR STORY.', 'READY WHEN YOU ARE'];
const HELP = ['The essentials, without the oversharing.', 'Most recent first. Employment, volunteering and placements all count.', 'Add education, training and qualifications you actually hold.', 'Use specific tools and skills. No percentage bars or inflated claims.', 'Use the vacancy to choose your evidence, never to invent it.', 'These are editing checks, not an ATS score or a hiring prediction.'];
let draft = blankDraft(), step = 0, documentKind = 'cv', dirty = false, savingEnabled = false, saveTimer;
function el(tag, text, attrs = {}) { const n = document.createElement(tag); if (text != null) n.textContent = text; for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; }
function announce(text) { $('notice').textContent = text; }
function getPath(path) { return path.split('.').reduce((obj, k) => obj?.[k], draft); }
function setPath(path, value) { const keys = path.split('.'), key = keys.pop(); const obj = keys.reduce((o, k) => o[k], draft); obj[key] = value; }
function field(label, path, { hint = '', placeholder = '', area = false, optional = false, max = 180, type = 'text', rows = 4 } = {}) {
  const wrap = el('label', null, { class: 'field' });
  const title = el('span', label, { class: 'field-label' });
  if (optional) title.append(el('span', 'optional', { class: 'optional' }));
  const input = el(area ? 'textarea' : 'input');
  input.id = `field-${path.replaceAll('.', '-')}`;
  input.dataset.path = path; input.value = getPath(path) ?? ''; input.maxLength = area ? (max === 180 ? LIMITS.text : max) : max;
  if (placeholder) input.placeholder = placeholder;
  if (area) input.rows = rows; else input.type = type;
  input.dir = 'auto';
  if (path === 'profile.name') input.autocomplete = 'name';
  else if (path === 'profile.email') input.autocomplete = 'email';
  else if (path === 'profile.phone') input.autocomplete = 'tel';
  else input.autocomplete = 'off';
  wrap.append(title, input);
  if (hint) { const id = `${input.id}-hint`; wrap.append(el('span', hint, { class: 'field-hint', id })); input.setAttribute('aria-describedby', id); }
  return wrap;
}
function row(...nodes) { const n = el('div', null, { class: 'field-row' }); n.append(...nodes); return n; }
function button(text, fn, className = 'quiet') { const b = el('button', text, { type: 'button', class: className }); b.addEventListener('click', fn); return b; }
function tip(title, text) { const n = el('div', null, { class: 'writing-tip' }); n.append(el('strong', title), el('span', text)); return n; }
function checkbox(text, key, hint) { const wrap = el('label', null, { class: 'field save-option' }); const c = el('input', null, { type: 'checkbox' }); c.checked = !!draft[key]; c.dataset.path = key; wrap.append(c, document.createTextNode(text)); if (hint) c.title = hint; return wrap; }
function rebuildFields() {
  $('stepTitle').textContent = TITLES[step]; $('stepKicker').textContent = KICKERS[step]; $('stepHelp').textContent = HELP[step];
  document.querySelectorAll('[data-step]').forEach(b => { if (Number(b.dataset.step) === step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  if ([2, 3, 4].includes(step)) $('optionalSections').open = true;
  const nodes = [];
  if (step === 0) {
    nodes.push(field('Full name', 'profile.name', { placeholder: 'Your name, as you use it professionally' }), field('Professional headline', 'profile.title', { placeholder: 'e.g. Customer Service Coordinator', hint: 'Describe your real experience, not a seniority you have not held.' }), row(field('Email address', 'profile.email', { type: 'email', placeholder: 'you@example.com' }), field('Phone number', 'profile.phone', { type: 'tel', optional: true, placeholder: '+971 ...' })), field('City and country', 'profile.city', { placeholder: 'e.g. Dubai, UAE', hint: 'Your current location. Do not imply you live in the UAE if you do not.' }), field('LinkedIn or portfolio', 'profile.link', { optional: true, placeholder: 'Your professional profile URL' }), field('Professional summary', 'profile.summary', { area: true, max: 3000, placeholder: 'Your field + relevant work + the strengths you can evidence.', hint: 'Aim for a few clear lines. Never add years, results or qualifications you cannot support.' }));
    const details = el('details', null, { class: 'writing-tip' }); details.append(el('summary', 'Optional UAE application details'), el('p', 'Only include these if relevant and accurate. This tool does not assess work permission. Do not enter passport, Emirates ID or visa document numbers.'), field('Availability / notice period', 'profile.availability', { optional: true, placeholder: 'e.g. One month notice, if true' }), field('Work status', 'profile.workStatus', { optional: true, placeholder: 'Your own accurate description' })); nodes.push(details);
  }
  if (step === 1) {
    nodes.push(tip('Specific beats impressive.', 'Write one achievement or responsibility per line. What did you do, how did you do it, and what happened? Add a number only if you can support it.'));
    draft.experience.forEach((entry, i) => {
      const card = entryCard('experience', i, 'Experience');
      card.append(field('Job title', `experience.${i}.title`, { placeholder: 'Your actual title' }), field('Organisation', `experience.${i}.employer`, { placeholder: 'Full organisation name' }), field('Location', `experience.${i}.location`, { optional: true }), row(field('Start date', `experience.${i}.start`, { placeholder: 'e.g. Jan 2024' }), field('End date', `experience.${i}.end`, { placeholder: 'e.g. Oct 2026 or Present' })), field('Evidence and responsibilities', `experience.${i}.bullets`, { area: true, rows: 6, placeholder: 'One point per line. Your exact wording appears in the CV.' }));
      const guide = el('details', null, { class: 'writing-tip' }); guide.append(el('summary', 'Need help writing a point?'));
      const inputs = ['Action: what did you do?', 'Context: how or for whom?', 'Result: what changed? (optional)'].map((label, k) => { const l = el('label', label, { class: 'field-hint' }), input = el('input', null, { maxlength: '600', 'aria-label': label }); input.dataset.builder = String(k); l.append(input); guide.append(l); return input; });
      guide.append(button('Add this point', () => { const parts = inputs.map(n => n.value.trim()).filter(Boolean); if (!parts.length) { announce('Write the action you took first.'); inputs[0].focus(); return; } if (!inputs[0].value.trim()) { announce('Start with an action you actually took.'); inputs[0].focus(); return; } const previous = draft.experience[i].bullets; const value = [previous, parts.join('; ')].filter(Boolean).join('\n'); if (value.length > LIMITS.text) { announce('This experience has reached the text limit. Shorten a point before adding another.'); return; } draft.experience[i].bullets = value; changed(); rebuildFields(); announce('Added your words without adding facts.'); }, 'small-button')); card.append(guide); nodes.push(card);
    });
    nodes.push(addEntryButton('experience', 'Add experience'));
  }
  if (step === 2) {
    nodes.push(checkbox('Show education before experience', 'educationFirst'));
    draft.education.forEach((entry, i) => { const card = entryCard('education', i, 'Education'); card.append(field('Qualification', `education.${i}.qualification`, { placeholder: 'Full qualification name' }), field('Institution', `education.${i}.institution`), field('Dates', `education.${i}.dates`, { placeholder: 'e.g. 2020 - 2024' }), field('Relevant detail', `education.${i}.detail`, { optional: true, area: true, hint: 'Completed modules, projects or honours. If still studying, say so.' })); nodes.push(card); });
    nodes.push(addEntryButton('education', 'Add education'), field('Projects', 'projects', { area: true, optional: true, hint: 'One item per line. State the project, your part and the result. Use only real work.' }));
  }
  if (step === 3) {
    nodes.push(field('Skills and tools', 'skills', { area: true, placeholder: 'One skill or tool per line', hint: 'Choose skills you can explain with an example. Vacancy keywords are not automatically added.' }), field('Languages', 'languages', { area: true, optional: true, placeholder: 'e.g. Arabic: native\nEnglish: professional working proficiency', hint: 'Describe your level accurately.' }), field('Certifications', 'certifications', { area: true, optional: true, placeholder: 'Certification | Issuer | Date', hint: 'Include the status or expiry when relevant. Never imply a licence you do not hold.' }));
  }
  if (step === 4) {
    nodes.push(field('Paste the job description', 'target.jobDescription', { area: true, rows: 7, optional: true, placeholder: 'Paste the advert here. It stays on your device.', hint: 'No AI or upload. We can prioritize your existing points, not write new claims.' }), button('Tailor using my existing facts', () => {
      if (!draft.target.jobDescription.trim()) { announce('Paste a job description first.'); return; }
      draft.target.requirements = jobRequirementLines(draft.target.jobDescription).join('\n');
      draft.tailorToJob = true; changed(); rebuildFields(); showDocument('cv');
      announce('Matching points and skills are prioritized. No facts were added or removed. Review the gaps below, then save this job version.');
    }, 'primary'), button('Start another job', async () => {
      if (Object.values(draft.target).some(Boolean) && !await confirmReplace('Clear the current job and letter? Your CV facts stay unchanged. Save a draft file first if you want to keep this job version.', 'Start another job?', 'Clear job only')) return;
      draft.target = blankDraft().target; draft.tailorToJob = false; changed(); rebuildFields(); announce('Ready for a new job. Your original CV facts are unchanged.');
    }, 'quiet'), checkbox('Prioritize matching points in my CV', 'tailorToJob'));
    nodes.push(el('p', null, {id:'jobVersionStatus',class:'field-hint'}));
    nodes.push(row(field('Target role', 'target.role', { placeholder: 'Exact vacancy title' }), field('Employer', 'target.company', { placeholder: 'Company you are applying to' })), field('Requirements to check', 'target.requirements', { area: true, placeholder: 'Paste one specific skill or phrase per line', hint: 'The job description is split into lines for a conservative exact-phrase check. Edit these to short requirements if needed. Similar wording can show as a gap even when you have relevant facts. Up to 40 lines.' }));
    const matches = el('div', null, { id: 'requirementMatches', role: 'region', 'aria-label': 'Phrase comparisons' }); nodes.push(matches, tip('Missing is a prompt, not permission.', 'A phrase match does not prove competence. If a requirement is missing, add genuine evidence only if you have it. Never copy requirements into your skills as a shortcut.'));
    const matchingFacts = matchingJobFacts(normalizeDraft(draft));
    if (draft.target.jobDescription && matchingFacts.length) {
      const facts = el('div', null, { class: 'job-facts' }); facts.append(el('h3', 'Relevant facts already in your CV'));
      for (const fact of matchingFacts) facts.append(el('p', fact));
      nodes.push(facts);
    }
    const letterStart = nodes.length;
    nodes.push(el('h3', 'Your matching cover letter'), field('Recipient name or team', 'target.recipient', { optional: true, placeholder: 'Leave blank for Hiring Team' }), field('Letter date', 'target.date', { optional: true, placeholder: 'e.g. 22 November 2026' }), field('Why this role and employer?', 'target.motivation', { area: true, optional: true, hint: 'Write your real reason. No employer claims are filled in for you.' }));
    const picker = el('details', null, { class: 'writing-tip' }); picker.append(el('summary', 'Choose evidence from your experience'));
    const evidence = draft.experience.flatMap(e => e.bullets.split('\n').map(s => s.replace(/^\s*[-•]\s*/, '').trim()).filter(Boolean));
    if (!evidence.length) picker.append(el('p', 'Add experience first, or write your own evidence below.'));
    for (const text of evidence) picker.append(button(`+ ${text}`, () => { const existing = draft.target.evidence; const value = [existing, text].filter(Boolean).join('\n'); if (value.length > LIMITS.text) { announce('The letter evidence has reached the text limit.'); return; } draft.target.evidence = value; changed(); rebuildFields(); announce('Copied your exact experience into the letter. Review it in context.'); }, 'text-button'));
    nodes.push(picker, field('Relevant evidence for this letter', 'target.evidence', { area: true, hint: 'One point per line. These are your assertions. Check each against your real experience.' }), field('Closing paragraph', 'target.closing', { area: true, optional: true, hint: 'Leave blank for a short, neutral thank-you. No availability or qualifications are assumed.' }));
    const letterOptions = el('details', null, {id:'letterOptions',class:'writing-tip'});
    letterOptions.append(el('summary','Add a cover letter (optional)'), ...nodes.splice(letterStart)); nodes.push(letterOptions);
  }
  if (step === 5) {
    const issues = reviewDraft(normalizeDraft(draft));
    nodes.push(el('p', `${issues.length}`, { class: 'review-count' }), el('p', issues.length === 1 ? 'editing check to review' : 'editing checks to review', { class: 'review-copy' }));
    const list = el('ul', null, { class: 'check-list' });
    for (const issue of issues) { const item = el('li'); item.append(button(issue.text, () => goStep(issue.step), 'text-button')); list.append(item); }
    if (!issues.length) list.append(el('li', 'The basic editing checks are complete. Read every line before sending.'));
    nodes.push(button('Add education & projects', () => goStep(2), 'secondary'), button('Add skills & languages', () => goStep(3), 'secondary'), button('Tailor to a job / cover letter', () => goStep(4), 'secondary'), list, tip('Your final review', 'Check names, dates, contact details, spelling and evidence. Verify that text copies in the right order. Follow the vacancy file requirements. Save separate draft files for different applications.'), button('Preview cover letter', () => showDocument('letter'), 'secondary'), el('p', 'Export controls are below the live preview. Word files remain editable. Print / save PDF uses your browser, so check page breaks there.', { class: 'review-copy' }));
  }
  $('fields').replaceChildren(...nodes);
  $('previous').disabled = step === 0; $('next').hidden = step === 5;
  $('next').textContent = step === 0 ? 'Experience →' : 'Finish →';
  $('stepCount').textContent = [0,1,5].includes(step) ? `${step === 5 ? 3 : step + 1} of 3` : 'Optional section';
  renderMatches();
}
function entryCard(kind, i, title) {
  const card = el('div', null, { class: 'entry-card' }), head = el('div', null, { class: 'entry-head' }), controls = el('div', null, { class: 'entry-controls' });
  head.append(el('h3', `${title} ${i + 1}`));
  if (i > 0) controls.append(button('Move up', () => { [draft[kind][i - 1], draft[kind][i]] = [draft[kind][i], draft[kind][i - 1]]; changed(); rebuildFields(); announce(`${title} moved up. Keep the newest first.`); }));
  controls.append(button('Remove', async () => { if (Object.values(draft[kind][i]).some(Boolean) && !await confirmReplace(`Remove ${title.toLowerCase()} ${i + 1}? This only changes the current draft.`, 'Remove this entry?', 'Remove entry')) return; draft[kind].splice(i, 1); changed(); rebuildFields(); announce(`${title} removed.`); }));
  head.append(controls); card.append(head); return card;
}
function addEntryButton(kind, text) {
  const b = button(`+ ${text}`, () => { if (draft[kind].length >= LIMITS.entries) { announce('You can add up to 20 entries.'); return; } const schema = blankDraft()[kind][0]; draft[kind].push(schema); changed(); rebuildFields(); $('fields').querySelectorAll('.entry-card').item(draft[kind].length - 1)?.querySelector('input')?.focus(); }, 'add-entry'); b.disabled = draft[kind].length >= LIMITS.entries; return b;
}
function goStep(n) { step = Math.max(0, Math.min(5, n)); rebuildFields(); $('editor').focus({ preventScroll: true }); if (matchMedia('(max-width:700px)').matches) $('editor').scrollIntoView({ behavior: 'instant', block: 'start' }); }
function renderMatches() {
  const target = $('requirementMatches'); if (!target) return;
  const matches = requirementMatches(normalizeDraft(draft));
  target.replaceChildren(...matches.map(m => { const n = el('div', null, { class: 'requirement' }); n.append(el('span', m.found ? 'Exact phrase found' : 'Gap / confirm', { class: `match-tag${m.found ? '' : ' missing'}` }), el('span', m.term)); return n; }));
}
function currentBlocks() { const d = normalizeDraft(draft), blocks = documentKind === 'cv' ? cvBlocks(d) : letterBlocks(d); return d.sample ? [{ type: 'sample', text: 'FICTIONAL SAMPLE - design example only, not applicant evidence.' }, ...blocks] : blocks; }
function resizePaper() {
  const viewport = $('paperViewport'), paper = $('paper');
  const scale = viewport.clientWidth / 794;
  paper.style.transform = `scale(${scale})`;
  viewport.style.height = `${Math.ceil(paper.offsetHeight * scale)}px`;
}
function renderPreview() {
  const blocks = currentBlocks();
  const hasContent = cvBlocks(normalizeDraft(draft)).some(b => b.text);
  $('emptyPreview').hidden = hasContent; $('paperViewport').hidden = !hasContent;
  const paper = $('paper'); paper.className = `paper ${draft.template}`; paper.dir = draft.direction;
  paper.lang = draft.direction === 'rtl' ? 'ar' : 'en';
  const content = el('div', null, { class: documentKind === 'letter' ? 'letter-document' : 'cv-document' });
  let section = content, entry = null;
  const header = el('div', null, { class: 'cv-header' });
  const sections = el('div', null, { class: 'cv-sections' });
  if (documentKind === 'cv') { content.append(header, sections); section = header; }
  const sectionNames = { 'Professional Summary':'summary', 'Work Experience':'experience', Education:'education', Projects:'projects', Skills:'skills', Certifications:'certifications', Languages:'languages' };
  for (const b of blocks) {
    if (documentKind === 'cv' && b.type === 'heading') {
      section = el('section', null, { class: `cv-section section-${sectionNames[b.text] || 'other'}` });
      sections.append(section); entry = null;
    }
    if (documentKind === 'cv' && b.type === 'subheading') {
      entry = el('div', null, { class: 'cv-entry' }); section.append(entry);
    }
    const tag = b.type === 'name' ? 'h2' : b.type === 'heading' ? 'h3' : 'p';
    (entry || section).append(el(tag, b.text, { class: b.type === 'sample' ? 'sample-stamp' : `cv-${b.type}`, dir: 'auto' }));
  }
  if (documentKind === 'cv' && draft.template === 'executive') {
    const main = el('div', null, { class: 'cv-main' }), side = el('div', null, { class: 'cv-sidebar' });
    for (const node of [...sections.children]) (node.matches('.section-skills,.section-certifications,.section-languages') ? side : main).append(node);
    sections.append(main, side);
    if (!side.children.length) sections.classList.add('without-sidebar');
  }
  const layoutNotes = {
    professional:'Professional: a traditional, single-column CV. A good default for automated application forms.',
    editorial:'Editorial: a large serif masthead and clearly separated sections in one column.',
    compact:'Compact: tighter type and spacing for shorter output. It never removes facts or forces a page limit.',
    executive:'Sidebar: experience in the main column, skills and languages in a separate rail. For automated forms, prefer Professional or the linear Word export.',
    minimal:'Skills first: skills, projects and certifications before employment. The same order is used in Word and text.',
    contemporary:'Timeline: a date rail beside each job. For automated forms, prefer Professional or the linear Word export.'
  };
  $('layoutDescription').textContent = documentKind === 'letter' ? 'Cover letters use a simple single-column layout in every design.' : layoutNotes[draft.template];
  paper.replaceChildren(content);
  $('sampleBanner').hidden = !draft.sample;
  $('draftLabel').textContent = draft.profile.name.trim() ? `${draft.profile.name.trim()} · CV` : 'Untitled CV';
  $('template').value = draft.template; $('direction').value = draft.direction;
  for (const id of ['printDocument', 'downloadWord', 'downloadText']) $(id).disabled = !hasContent;
  const jobStatus = $('jobVersionStatus'); if (jobStatus) jobStatus.textContent = draft.tailorToJob && draft.target.jobDescription ? 'Job-specific ordering is on. Only your existing points and skills are reordered. Save a separate draft for each job.' : 'Your original fact order is shown. Paste a job description, then use the tailor button.';
  renderMatches(); resizePaper();
}
function showDocument(kind) { documentKind = kind; $('showCv').setAttribute('aria-pressed', String(kind === 'cv')); $('showLetter').setAttribute('aria-pressed', String(kind === 'letter')); renderPreview(); }
function hasDraftContent() { const d = normalizeDraft(draft); return cvBlocks(d).length > 0 || Object.values(d.target).some(Boolean); }
function markUnsaved() { dirty = true; $('saveState').textContent = $('rememberDraft').checked ? 'Saving…' : 'Not saved'; }
function changed() { markUnsaved(); renderPreview(); clearTimeout(saveTimer); if (savingEnabled) saveTimer = setTimeout(persistDraft, 450); }
function persistDraft() {
  if (!savingEnabled) return;
  try { localStorage.setItem(STORE, JSON.stringify(normalizeDraft(draft))); $('saveState').textContent = 'Saved on this device'; dirty = false; }
  catch { savingEnabled = false; $('rememberDraft').checked = false; $('saveState').textContent = 'Not saved'; dirty = true; announce('Browser saving is unavailable or full. Save a draft file to keep your work.'); }
}
async function confirmReplace(message = 'Unsaved changes will be lost. Save a draft file first if you want to keep them.', title = 'Replace this draft?', action = 'Replace draft') {
  const dialog = $('confirmDialog'); $('confirmText').textContent = message; $('confirmTitle').textContent = title; $('acceptConfirm').textContent = action;
  if (dialog.open) return false;
  return new Promise(resolve => {
    const finish = value => { $('acceptConfirm').removeEventListener('click', yes); $('cancelConfirm').removeEventListener('click', no); dialog.removeEventListener('cancel', cancel); dialog.close(); resolve(value); };
    const yes = () => finish(true), no = () => finish(false), cancel = event => { event.preventDefault(); finish(false); };
    $('acceptConfirm').addEventListener('click', yes); $('cancelConfirm').addEventListener('click', no); dialog.addEventListener('cancel', cancel); dialog.showModal(); $('cancelConfirm').focus();
  });
}
async function replaceDraft(next) {
  if (hasDraftContent() && !await confirmReplace()) return false;
  draft = normalizeDraft(next); documentKind = 'cv'; step = 0; changed(); rebuildFields(); showDocument('cv'); return true;
}
$('fields').addEventListener('input', event => { const input = event.target; if (!input.dataset.path) return; setPath(input.dataset.path, input.type === 'checkbox' ? input.checked : input.value); if (input.dataset.path === 'target.jobDescription') { draft.tailorToJob = false; draft.target.requirements = ''; const toggle = $('fields').querySelector('[data-path=tailorToJob]'); if (toggle) toggle.checked = false; const requirements = $('field-target-requirements'); if (requirements) requirements.value = ''; $('fields').querySelector('.job-facts')?.remove(); } changed(); });
$('previous').addEventListener('click', () => goStep(step === 1 ? 0 : 1)); $('next').addEventListener('click', () => goStep(step === 0 ? 1 : 5));
document.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => goStep(Number(b.dataset.step))));
for (const id of ['loadSample', 'emptySample']) $(id).addEventListener('click', async () => { if (await replaceDraft(sampleDraft())) announce('Fictional sample loaded. Its details are not yours. Start blank to build your own CV.'); });
for (const id of ['startBlank', 'sampleBlank']) $(id).addEventListener('click', async () => { if (await replaceDraft(blankDraft())) announce('Blank CV started. Add only your own facts.'); });
$('showCv').addEventListener('click', () => showDocument('cv')); $('showLetter').addEventListener('click', () => showDocument('letter'));
$('template').addEventListener('change', event => { draft.template = event.target.value; changed(); });
$('direction').addEventListener('change', event => { draft.direction = event.target.value; changed(); });
$('privacyToggle').addEventListener('click', () => { const open = $('privacyToggle').getAttribute('aria-expanded') !== 'true'; $('privacyToggle').setAttribute('aria-expanded', String(open)); $('privacyDetail').hidden = !open; });
$('rememberDraft').addEventListener('change', async () => {
  clearTimeout(saveTimer);
  if ($('rememberDraft').checked) {
    if (!await confirmReplace('Save this CV on this device? Anyone using this browser profile may be able to see it. Avoid this on a shared or public device.', 'Save on this device?', 'Save locally')) { $('rememberDraft').checked = false; return; }
    savingEnabled = true; persistDraft(); if (savingEnabled) announce('Browser saving enabled. Turn it off to delete the stored copy. Exported files are separate.');
  } else {
    try { localStorage.removeItem(STORE); savingEnabled = false; dirty = true; $('saveState').textContent = 'Not saved'; announce('Stored browser copy deleted. Your current draft is still open. Draft files you exported are not deleted.'); }
    catch { $('rememberDraft').checked = true; announce('The browser could not delete its stored copy. Clear this site\'s storage in browser settings on this device.'); }
  }
});
$('saveDraft').addEventListener('click', () => { downloadFile(new Blob([JSON.stringify(normalizeDraft(draft), null, 2)], { type: 'application/json' }), safeFilename(draft.profile.name, 'cv-draft.json')); dirty = false; $('saveState').textContent = $('rememberDraft').checked ? 'Saved on this device' : 'Draft file exported'; announce('Draft file export started. Keep it private. You can reopen it here.'); });
$('openDraft').addEventListener('click', () => $('importDraft').click());
$('importDraft').addEventListener('change', async event => {
  const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
  if (file.size > LIMITS.draftBytes) { announce('Draft file is too large. The limit is 2 MB.'); return; }
  try { const next = normalizeDraft(JSON.parse(await file.text())); if (await replaceDraft(next)) announce('Draft opened locally. No upload was made.'); }
  catch { announce('Could not open this file. Choose a valid CV Studio version 1 JSON draft. Your current work is unchanged.'); }
});
function exportCheck() {
  if (!cvBlocks(normalizeDraft(draft)).length) { announce('Add your details before exporting.'); return false; }
  const missing = reviewDraft(normalizeDraft(draft)).length;
  announce(`${missing ? `${missing} editing checks remain. ` : ''}Review every line and page before sending. No ATS or hiring result is guaranteed.`);
  return true;
}
$('downloadWord').addEventListener('click', () => { if (!exportCheck()) return; downloadFile(docxFile(currentBlocks(), draft), safeFilename(draft.profile.name, `${documentKind === 'cv' ? 'CV' : 'cover-letter'}.docx`)); });
$('downloadText').addEventListener('click', () => { if (!exportCheck()) return; downloadFile(new Blob([plainText(currentBlocks())], { type: 'text/plain;charset=utf-8' }), safeFilename(draft.profile.name, `${documentKind === 'cv' ? 'CV' : 'cover-letter'}.txt`)); });
$('printDocument').addEventListener('click', () => { if (!exportCheck()) return; window.print(); });
window.addEventListener('beforeunload', event => { if (dirty && hasDraftContent()) { event.preventDefault(); event.returnValue = ''; } });
window.addEventListener('pagehide', () => { if (savingEnabled) persistDraft(); });
window.addEventListener('storage', event => { if (event.key === STORE) { clearTimeout(saveTimer); savingEnabled = false; $('rememberDraft').checked = false; dirty = true; $('saveState').textContent = 'Browser draft changed elsewhere'; announce('Another tab changed the saved draft. This tab has stopped saving to avoid overwriting it. Export this tab\'s draft file if you want to keep it.'); } });
new ResizeObserver(resizePaper).observe($('paperViewport'));
try { const saved = localStorage.getItem(STORE); if (saved) { draft = normalizeDraft(JSON.parse(saved)); savingEnabled = true; $('rememberDraft').checked = true; $('saveState').textContent = 'Restored from this device'; announce('Restored the CV previously saved on this device. Turn off browser saving to delete the stored copy.'); } }
catch { announce('A saved draft could not be restored. Start fresh or open a draft file.'); }
rebuildFields(); renderPreview();
