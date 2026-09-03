import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../tools/index.html', import.meta.url), 'utf8');
assert.match(html, /<script type="module">\s*import \{ renderTemplateCards as renderProductionTemplateCards \}/, 'tools page must use the shared module renderer');
assert.match(html, /Download generated PDF/, 'tools page must expose a PDF-only download action');
assert.match(html, /callCv\('download'/, 'tools page must request downloads through the authenticated procedure');
assert.doesNotMatch(html, /URL\.createObjectURL\(new Blob\(\[generatedCvText\]/, 'tools page must not create a client-only generated CV download');
console.log('PASS: secure server-side PDF download contract and module-based workspace wiring');
