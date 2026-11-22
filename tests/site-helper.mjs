import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CATALOGUE,ANSWERS,TOPICS,searchHelp,getAnswer} from '../assets/site-helper.mjs';
assert.equal(ANSWERS.length,16);assert.equal(new Set(ANSWERS.map(a=>a.id)).size,16);
const actual=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname).filter(p=>p!=='/tools/site-helper/').sort();assert.deepEqual(CATALOGUE.map(p=>p.path).sort(),actual);
for(const page of CATALOGUE){assert.ok(page.path.startsWith('/')&&!page.path.startsWith('//'));assert.ok(fs.existsSync('.'+page.path+'index.html'));assert.ok(page.title.length>5);assert.ok(page.description.length>20);assert.ok(page.lang);}
for(const answer of ANSWERS){assert.ok(TOPICS.includes(answer.topic));assert.ok(answer.steps.length>=3);assert.ok(answer.answer.length>100);assert.equal(getAnswer(answer.id),answer);for(const [title,url] of answer.links){assert.ok(title);assert.ok(url.startsWith('/')&&!url.startsWith('//'));assert.ok(fs.existsSync('.'+url+'index.html'));}}
for(const [query,id] of [['salary','salary'],['interview','interview'],['login','workspace'],['cover letter','cover'],['ATS','readiness']])assert.ok(searchHelp(query).answers.some(a=>a.id===id));
assert.ok(searchHelp('وظائف','arabic').pages.length>0);assert.ok(searchHelp('','arabic').pages.every(p=>p.lang==='ar'));assert.equal(searchHelp('zxqvnonexistent983').answers.length,0);assert.equal(searchHelp('zxqvnonexistent983').pages.length,0);assert.equal(getAnswer('<img>'),null);
for(const query of [null,{},'x'.repeat(161)])assert.ok(searchHelp(query).error);assert.ok(searchHelp('salary','bad').error);for(const topic of TOPICS)assert.ok(!searchHelp('',topic).error);
const module=fs.readFileSync('assets/site-helper.mjs','utf8'),html=fs.readFileSync('tools/site-helper/index.html','utf8');assert.ok(!/\b(?:fetch|XMLHttpRequest|sendBeacon|eval)\s*\(/.test(module));assert.ok(!/\b(?:localStorage|sessionStorage|innerHTML)\b/.test(module));assert.ok(html.includes("connect-src 'none'"));assert.ok(html.includes("script-src 'self'"));assert.ok(!html.includes('fonts.googleapis'));assert.ok(html.includes('not an AI service or a live adviser'));assert.equal((html.match(/dir="auto" lang=/g)||[]).length,CATALOGUE.length);
console.log('PASS: sixteen sourced prepared answers, '+CATALOGUE.length+' exact sitemap paths, all destinations, search/topic/no-result/input bounds and no network/storage/HTML sinks');

assert.match(module,/helper-catalogue\.mjs\?release=20261122-meta/);
assert.match(html,/src="\/assets\/site-helper\.mjs\?release=20261122-meta"/);
