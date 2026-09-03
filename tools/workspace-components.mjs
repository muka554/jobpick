const SECTION_HEADINGS = new Set([
  'PROFESSIONAL SUMMARY',
  'WORK EXPERIENCE',
  'EDUCATION',
  'SKILLS',
  'CERTIFICATIONS',
  'PROJECTS',
]);

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length || !sections.length) sections.push(current);
  return sections.filter((section) => section.lines.some((line) => line.trim()) || section.heading === 'PROFILE');
}

export function renderTemplatePreview({ text = '', template = 'ats' } = {}) {
  const sections = splitCvSections(text);
  const body = sections.map((section) => {
    const content = escapeHtml(section.lines.join('\n').trim());
    return `<section class="cv-template-section"><h4>${escapeHtml(section.heading)}</h4><pre>${content || 'No content provided.'}</pre></section>`;
  }).join('');
  const templateClass = template === 'modern' ? 'cv-template-modern' : 'cv-template-ats';
  return `<article class="cv-template-preview ${templateClass}" aria-label="${template === 'modern' ? 'Modern professional' : 'ATS-friendly'} template preview">${body}</article>`;
}

export function renderComparisonView({ original = '', generated = '' } = {}) {
  return `<div class="cv-comparison" aria-label="Side-by-side CV comparison"><section class="cv-comparison-pane"><h4>Uploaded source</h4><pre>${escapeHtml(original || 'Source text is unavailable for this file type; review the uploaded document preview above.')}</pre></section><section class="cv-comparison-pane cv-comparison-generated"><h4>Generated result</h4><pre>${escapeHtml(generated || 'Generated content is not available yet.')}</pre></section></div>`;
}

if (typeof window !== 'undefined') window.JobPickWorkspaceComponents = { escapeHtml, splitCvSections, renderTemplatePreview, renderComparisonView };
