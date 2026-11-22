// CV Studio is a local writing tool. Vacancy text is never candidate evidence.
export const VERSION = 1;
export const LIMITS = { text: 6000, short: 180, entries: 20, draftBytes: 2000000 };
const clean = (v, max = LIMITS.text) => typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max).trim() : '';
export const lines = v => clean(v).split('\n').map(s => s.replace(/^\s*[-•]\s*/, '').trim()).filter(Boolean);
export function blankDraft() {
  return { version: VERSION, sample: false, template: 'professional', direction: 'ltr', educationFirst: false,
    profile: { name: '', title: '', email: '', phone: '', city: '', link: '', summary: '', availability: '', workStatus: '' },
    experience: [{ title: '', employer: '', location: '', start: '', end: '', bullets: '' }],
    education: [{ qualification: '', institution: '', dates: '', detail: '' }],
    skills: '', languages: '', certifications: '', projects: '',
    target: { role: '', company: '', requirements: '', recipient: '', motivation: '', evidence: '', closing: '', date: '' } };
}
export function normalizeDraft(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.version !== VERSION) throw new Error('Use a CV Studio version 1 draft. Other file formats are not supported.');
  const d = blankDraft();
  d.sample = raw.sample === true;
  d.template = ['professional', 'editorial', 'compact', 'executive', 'minimal', 'contemporary'].includes(raw.template) ? raw.template : 'professional';
  d.direction = raw.direction === 'rtl' ? 'rtl' : 'ltr';
  d.educationFirst = raw.educationFirst === true;
  for (const key of Object.keys(d.profile)) d.profile[key] = clean(raw.profile?.[key], key === 'summary' ? 3000 : LIMITS.short);
  for (const key of Object.keys(d.target)) d.target[key] = clean(raw.target?.[key], ['requirements', 'evidence', 'motivation', 'closing'].includes(key) ? LIMITS.text : LIMITS.short);
  for (const kind of ['experience', 'education']) {
    const schema = d[kind][0];
    d[kind] = (Array.isArray(raw[kind]) ? raw[kind] : []).slice(0, LIMITS.entries).map(entry => Object.fromEntries(Object.keys(schema).map(k => [k, clean(entry?.[k], ['bullets', 'detail'].includes(k) ? LIMITS.text : LIMITS.short)])));
  }
  for (const key of ['skills', 'languages', 'certifications', 'projects']) d[key] = clean(raw[key]);
  return d;
}
export function sampleDraft() {
  const d = blankDraft();
  d.sample = true;
  d.profile = { name: 'Mira Nasser', title: 'Customer Service Coordinator', email: 'mira@example.com', phone: '', city: 'Dubai, UAE', link: '', summary: 'Customer service coordinator with experience handling delivery enquiries, maintaining case records and preparing weekly service reports. Uses clear written updates to keep customers and internal teams informed.', availability: '', workStatus: '' };
  d.experience = [ { title: 'Customer Service Coordinator', employer: 'Harbour Desk Trading (fictional)', location: 'Dubai, UAE', start: 'Jan 2023', end: 'Oct 2026', bullets: 'Coordinated delivery enquiries by email and phone, keeping customer records up to date.\nPrepared a weekly Excel log covering 12 open enquiries for the operations team.\nWrote clear handover notes so colleagues could follow the next action on each case.' }, { title: 'Reception Volunteer', employer: 'Neighbourhood Learning Centre (fictional)', location: 'Dubai, UAE', start: 'Sep 2022', end: 'Dec 2022', bullets: 'Welcomed visitors and maintained the daily appointment list.\nUpdated attendance records and shared schedule changes with the team.' } ];
  d.education = [{ qualification: 'Diploma in Business Administration', institution: 'Coastal Learning Institute (fictional)', dates: '2020 - 2022', detail: '' }];
  d.skills = 'Customer enquiries\nMicrosoft Excel\nCase records\nWritten communication\nTeam handovers';
  d.languages = 'English: professional working proficiency\nArabic: native';
  d.target.role = 'Customer Service Coordinator';
  d.target.company = 'Example Employer (fictional)';
  d.target.requirements = 'Customer enquiries\nMicrosoft Excel\nCRM administration';
  return d;
}
export function cvBlocks(d) {
  const p = d.profile;
  const blocks = [];
  const add = (type, text) => { if (text) blocks.push({ type, text }); };
  add('name', p.name);
  add('role', p.title);
  add('contact', [p.city, p.phone, p.email].filter(Boolean).join(' | '));
  add('contact', p.link);
  add('contact', [p.availability && `Availability: ${p.availability}`, p.workStatus && `Work status: ${p.workStatus}`].filter(Boolean).join(' | '));
  if (p.summary) { add('heading', 'Professional Summary'); add('paragraph', p.summary); }
  const experience = () => {
    const entries = d.experience.filter(e => Object.values(e).some(Boolean));
    if (!entries.length) return;
    add('heading', 'Work Experience');
    for (const e of entries) { add('subheading', [e.title, e.employer].filter(Boolean).join(' | ')); add('meta', [e.location, [e.start, e.end].filter(Boolean).join(' - ')].filter(Boolean).join(' | ')); for (const b of lines(e.bullets)) add('bullet', b); }
  };
  const education = () => {
    const entries = d.education.filter(e => Object.values(e).some(Boolean));
    if (!entries.length) return;
    add('heading', 'Education');
    for (const e of entries) { add('subheading', e.qualification); add('meta', [e.institution, e.dates].filter(Boolean).join(' | ')); for (const b of lines(e.detail)) add('paragraph', b); }
  };
  if (d.educationFirst) { education(); experience(); } else { experience(); education(); }
  for (const [key, title] of [['projects', 'Projects'], ['skills', 'Skills'], ['certifications', 'Certifications'], ['languages', 'Languages']]) {
    if (!d[key]) continue;
    add('heading', title);
    if (key === 'skills') add('paragraph', lines(d[key]).join(' · '));
    else for (const b of lines(d[key])) add('paragraph', b);
  }
  return blocks;
}
export function letterBlocks(d) {
  const p = d.profile, t = d.target;
  const out = [];
  const add = (type, text) => { if (text) out.push({ type, text }); };
  add('name', p.name);
  add('contact', [p.city, p.phone, p.email].filter(Boolean).join(' | '));
  add('contact', p.link);
  add('paragraph', t.date);
  add('paragraph', t.company);
  add('subheading', t.role ? `Application: ${t.role}` : 'Application');
  add('paragraph', t.recipient ? `Dear ${t.recipient},` : 'Dear Hiring Team,');
  add('paragraph', t.role ? `I am applying for the ${t.role} position${t.company ? ` at ${t.company}` : ''}.` : 'I am writing to apply for the advertised position.');
  add('paragraph', t.motivation);
  if (t.evidence) { add('paragraph', 'Relevant experience I would bring to this role:'); for (const b of lines(t.evidence)) add('bullet', b); }
  add('paragraph', t.closing || 'Thank you for considering my application. I would welcome the opportunity to discuss the role.');
  add('paragraph', 'Kind regards,'); add('paragraph', p.name);
  return out;
}
export function plainText(blocks) { return blocks.map(b => `${b.type === 'bullet' ? '• ' : ''}${b.text}`).join('\n\n'); }
export function requirementMatches(d) {
  const evidence = cvBlocks(d).filter(b => !['heading', 'role'].includes(b.type)).map(b => b.text).join('\n').toLocaleLowerCase();
  return lines(d.target.requirements).slice(0, 40).map(term => ({ term, found: evidence.includes(term.toLocaleLowerCase()) }));
}
export function reviewDraft(d) {
  const issues = [];
  const add = (text, step) => issues.push({ text, step });
  if (!d.profile.name) add('Add your full name.', 0);
  if (!d.profile.email && !d.profile.phone) add('Add an email address or phone number.', 0);
  if (d.profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.profile.email)) add('Check your email address.', 0);
  if (!d.profile.title) add('Add a professional headline that describes you truthfully.', 0);
  if (!d.profile.summary) add('Write a short, factual professional summary.', 0);
  const exp = d.experience.filter(e => Object.values(e).some(Boolean));
  const edu = d.education.some(e => Object.values(e).some(Boolean));
  if (!exp.length && !edu && !d.projects) add('Add experience, education or a project.', 1);
  for (const [i, e] of exp.entries()) {
    if (!e.title || !e.employer) add(`Complete the title and organisation for experience ${i + 1}.`, 1);
    if (!e.start || !e.end) add(`Check the dates for experience ${i + 1}. Use Present only if true.`, 1);
    if (!lines(e.bullets).length) add(`Add evidence for experience ${i + 1}.`, 1);
    const start = Date.parse(e.start), end = Date.parse(e.end);
    if (Number.isFinite(start) && Number.isFinite(end) && end < start) add(`The end date is before the start date for experience ${i + 1}.`, 1);
  }
  for (const [i, e] of d.education.entries()) if (Object.values(e).some(Boolean) && (!e.qualification || !e.institution || !e.dates)) add(`Complete the qualification, institution and dates for education ${i + 1}.`, 2);
  if (d.sample) add('This is a fictional sample. Start a blank CV before making your application.', 0);
  if (cvBlocks(d).some(b => /\[[^\]]+\]|lorem ipsum|your name|insert here/i.test(b.text))) add('Look for unfinished placeholders in your CV.', 5);
  if (!d.target.role || !d.target.company) add('For a cover letter, add the target role and employer.', 4);
  if (!d.target.evidence) add('For a cover letter, choose or write the evidence you want to use.', 4);
  return issues;
}
