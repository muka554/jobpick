import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHtml,
  splitCvSections,
  renderTemplatePreview,
  renderComparisonView,
} from './workspace-components.mjs';

test('escapeHtml protects user-controlled CV content', () => {
  assert.equal(escapeHtml('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
});

test('splitCvSections preserves profile content and recognizes headings', () => {
  const sections = splitCvSections('Alex Morgan\n\nPROFESSIONAL SUMMARY\nProject coordinator\n\nSKILLS\nReporting');
  assert.deepEqual(sections.map((section) => section.heading), ['PROFILE', 'PROFESSIONAL SUMMARY', 'SKILLS']);
  assert.match(sections[0].lines.join('\n'), /Alex Morgan/);
});

test('ATS template preview renders headings and uses the ATS class', () => {
  const html = renderTemplatePreview({ text: 'PROFESSIONAL SUMMARY\nClear summary', template: 'ats' });
  assert.match(html, /cv-template-ats/);
  assert.match(html, /PROFESSIONAL SUMMARY/);
  assert.match(html, /Clear summary/);
});

test('modern template preview uses a distinct accessible label', () => {
  const html = renderTemplatePreview({ text: 'SKILLS\nReporting', template: 'modern' });
  assert.match(html, /cv-template-modern/);
  assert.match(html, /Modern professional/);
});

test('comparison view keeps source and generated content side by side', () => {
  const html = renderComparisonView({ original: 'Original claim', generated: 'Edited claim' });
  assert.match(html, /Side-by-side CV comparison/);
  assert.match(html, /Uploaded source/);
  assert.match(html, /Original claim/);
  assert.match(html, /Generated result/);
  assert.match(html, /Edited claim/);
});

test('comparison view provides safe empty states', () => {
  const html = renderComparisonView();
  assert.match(html, /Source text is unavailable/);
  assert.match(html, /Generated content is not available yet/);
});
