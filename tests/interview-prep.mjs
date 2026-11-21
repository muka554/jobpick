import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ROLES,getPracticePlan} from '../assets/interview-prep.mjs';
assert.equal(ROLES.length,8);assert.equal(new Set(ROLES.map(r=>r.id)).size,8);
for(const role of ROLES){const plan=getPracticePlan(role.id);assert.equal(plan.questions.length,6);assert.ok(fs.existsSync('.'+plan.guide+'index.html'));for(const q of plan.questions){for(const value of Object.values(q))assert.ok(typeof value==='string'&&value.length>25);}}
for(const id of ['',null,undefined,'<img>','__proto__',{}])assert.equal(getPracticePlan(id),null);
const module=fs.readFileSync('assets/interview-prep.mjs','utf8');assert.ok(!/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|innerHTML|eval)\b/.test(module));assert.ok(module.includes("window.addEventListener('pagehide',clear)"));
const html=fs.readFileSync('tools/interview-prep/index.html','utf8');assert.ok(html.includes("connect-src 'none'"));assert.ok(html.includes("script-src 'self'"));assert.ok(!html.includes('googletagmanager'));assert.ok(!html.includes('fonts.googleapis'));assert.ok(module.includes('not a prediction'));assert.ok(html.includes('not reviewed or scored')||html.includes('not analysed, graded or saved'));
console.log('PASS: eight role plans, six complete prompts each, valid guides, invalid-role handling and no network/storage/HTML sinks');
