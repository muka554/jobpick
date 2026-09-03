const TEMPLATE_CARDS = [
  ['modern', 'Modern', 'Teal accents · clean ATS layout'],
  ['classic', 'Classic', 'Traditional navy · formal hierarchy'],
  ['executive', 'Executive', 'Charcoal and gold · leadership emphasis'],
];

const SECTION_HEADINGS = new Set(['PROFESSIONAL SUMMARY', 'WORK EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS', 'PROJECTS']);

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
  if (current.lines.length || !sections.length) sections.push(current);
  return sections.filter((section) => section.lines.some((line) => line.trim()) || section.heading === 'PROFILE');
}

export function renderTemplateCards({ text = '', template = 'modern', role = 'Target role' } = {}) {
  const firstLine = String(text).trim().split(/\r?\n/)[0] || role;
  return TEMPLATE_CARDS.map(([key, label, description]) => `<button type="button" class="preview-card ${key}" aria-pressed="${key === template}" aria-label="Use ${label} CV template"><div class="mini-head">${label}</div><div class="mini-role">${escapeHtml(key === template ? firstLine : description)}</div><div class="mini-line"></div><div class="mini-line"></div><div class="mini-line short"></div><div class="mini-line"></div><div class="mini-line short"></div></button>`).join('');
}

export function renderTemplatePreview({ text = '', template = 'modern', role = 'Target role' } = {}) {
  const sections = splitCvSections(text);
  const body = sections.map((section) => `<section class="cv-template-section"><h4>${escapeHtml(section.heading)}</h4><pre>${escapeHtml(section.lines.join('\n').trim()) || 'No content provided.'}</pre></section>`).join('');
  const templateClass = template === 'modern' ? 'cv-template-modern' : 'cv-template-ats';
  return `<article class="cv-template-preview ${templateClass}" aria-label="${template === 'modern' ? 'Modern professional' : 'ATS-friendly'} template preview">${body}</article>`;
}

export function renderComparisonView({ original = '', generated = '' } = {}) {
  return `<div class="cv-comparison" aria-label="Side-by-side CV comparison"><section class="cv-comparison-pane"><h4>Uploaded source</h4><pre>${escapeHtml(original || 'Source text is unavailable for this file type; review the uploaded document preview above.')}</pre></section><section class="cv-comparison-pane cv-comparison-generated"><h4>Generated result</h4><pre>${escapeHtml(generated || 'Generated content is not available yet.')}</pre></section></div>`;
}

if (typeof window !== 'undefined') window.JobPickWorkspaceComponents = { escapeHtml, splitCvSections, renderTemplateCards, renderTemplatePreview, renderComparisonView };
