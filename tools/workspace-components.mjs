const SECTION_HEADINGS = new Set(['PROFESSIONAL SUMMARY', 'WORK EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS', 'PROJECTS']);

const TEMPLATE_CARDS = [
  ['modern', 'Modern', 'Teal accents · clean ATS layout'],
  ['classic', 'Classic', 'Traditional navy · formal hierarchy'],
  ['executive', 'Executive', 'Charcoal and gold · leadership emphasis'],
  ['minimal', 'Minimal', 'Monochrome grey · understated clarity'],
  ['bold', 'Bold', 'Crimson accent · strong contrast'],
  ['elegant', 'Elegant', 'Deep plum accent · refined tone'],
];

export function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function splitCvSections(text = '') {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const sections = [];
  let current = { heading: 'PROFILE', lines: [] };
  for (const line of lines) {
    const trimmed = line.trim();
    if (SECTION_HEADINGS.has(trimmed.toUpperCase())) {
      if (current.lines.length || current.heading !== 'PROFILE') sections.push(current);
      current = { heading: trimmed.toUpperCase(), lines: [] };
    } else current.lines.push(line);
  }
  sections.push(current);
  return sections.filter((section) => section.lines.some((line) => line.trim()) || section.heading === 'PROFILE');
}

export function renderTemplateCards({ text = '', template = 'modern', role = 'Target role' } = {}) {
  const firstLine = String(text).trim().split(/\r?\n/)[0] || role;
  return TEMPLATE_CARDS.map(([key, label, description]) => `<button type="button" class="preview-card ${key}" data-template="${key}" aria-pressed="${key === template}" aria-label="Use ${label} CV template"><div class="mini-head">${label}</div><div class="mini-role">${escapeHtml(key === template ? firstLine : description)}</div><div class="mini-line"></div><div class="mini-line"></div><div class="mini-line short"></div><div class="mini-line"></div><div class="mini-line short"></div></button>`).join('');
}
