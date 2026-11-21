import assert from 'node:assert/strict';
import fs from 'node:fs';
const headers = fs.readFileSync(new URL('../_headers', import.meta.url), 'utf8');
assert.match(headers, /connect-src[^;\n]*https:\/\/ipwho\.is(?:\s|;)/, 'existing IP lookup origin must be allowed');
assert.match(headers, /Permissions-Policy: camera=\(\), microphone=\(\), geolocation=\(self\)/, 'geolocation must be same-origin only, camera/microphone disabled');
assert.ok(!headers.includes('geolocation=()'), 'no disabling duplicate permission policy');
console.log('PASS: narrow IP lookup CSP origin and same-origin geolocation permission');
