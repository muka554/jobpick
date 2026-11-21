import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ROLES,exploreRoles} from '../assets/role-explorer.mjs';
assert.equal(ROLES.length,8);assert.equal(new Set(ROLES.map(r=>r.id)).size,8);
for(const role of ROLES){assert.equal(role.choices.length,4);assert.ok(fs.existsSync('.'+role.guide+'index.html'));const all=exploreRoles(Array(4).fill(role.id));assert.equal(all.results.length,1);assert.equal(all.results[0].count,4);assert.equal(all.results[0].id,role.id);}
assert.equal(exploreRoles(Array(4).fill('unsure')).results.length,0);
for(const a of [null,{},[],['it'],['it','it','it','bad'],['it','it','it',''],['it','it','it',null]])assert.ok(exploreRoles(a).error);
const choices=[...ROLES.map(r=>r.id),'unsure'];let tested=0;
for(const a of choices)for(const b of choices)for(const c of choices)for(const d of choices){const input=[a,b,c,d],output=exploreRoles(input);assert.equal(output.results.reduce((sum,r)=>sum+r.count,0)+output.unsure,4);for(const r of output.results)assert.equal(r.count,input.filter(id=>id===r.id).length);for(let i=1;i<output.results.length;i++)assert.ok(output.results[i-1].count>=output.results[i].count);tested++;}
const tie=exploreRoles(['sales','it','service','healthcare']);assert.equal(tie.results.length,4);assert.ok(tie.results.every(r=>r.count===1));
const module=fs.readFileSync('assets/role-explorer.mjs','utf8'),html=fs.readFileSync('tools/role-explorer/index.html','utf8');assert.ok(!/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|innerHTML|eval)\b/.test(module));assert.ok(html.includes("connect-src 'none'"));assert.ok(html.includes("script-src 'self'"));assert.ok(!html.includes('fonts.googleapis'));assert.ok(html.includes('not a validated psychometric assessment'));
console.log('PASS: eight destinations, all '+tested+' combinations, exact tally/ties/no-signal/invalid inputs, no network/storage/HTML sinks');
