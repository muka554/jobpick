import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
function expose(source, names, context) {
  const instrumented = source.replace(/\}\(\)\);\s*$/, `window.__test = {${names.join(',')}}; }());`);
  assert.notEqual(instrumented, source, 'test instrumentation must attach inside the IIFE');
  vm.runInNewContext(instrumented, context);
  return context.window.__test;
}
function fixture(url, stored = {}) {
  const store = {...stored};
  const timers = [];
  const context = {
    URL, URLSearchParams,
    document: {readyState:'loading', addEventListener(){}},
    localStorage: Object.assign(store, {getItem:key=>store[key] ?? null, removeItem:key=>delete store[key]}),
    window: {
      location:{href:url}, addEventListener(){},
      setTimeout:fn=>timers.push(fn), requestIdleCallback:fn=>timers.push(fn),
      history:{state:{keep:true}, replaceState(state, _, next){this.last = next;this.state = state;}}
    }
  };
  return {context, timers, store};
}
const loader = read('assets/site-localization.js');
for (const suffix of ['', '?role=developer', '#platforms']) {
  const f=fixture('https://jobpick20.com/'+suffix);
  expose(loader,['resumeAccountIfNeeded'],f.context).resumeAccountIfNeeded();
  assert.equal(f.timers.length,0,`ordinary URL ${suffix} must keep auth lazy`);
}
for (const suffix of ['?code=marker', '#access_token=marker&refresh_token=marker', '?error=access_denied', '#error=access_denied', '?error_description=marker', '#error_code=otp_expired']) {
  const f=fixture('https://jobpick20.com/'+suffix);
  expose(loader,['resumeAccountIfNeeded'],f.context).resumeAccountIfNeeded();
  assert.equal(f.timers.length,1,`callback ${suffix} must initialize auth without a stored account`);
}
for (const stored of [{'jobhub_account_seen':'1'}, {'sb-project-auth-token':'marker'}]) {
  const f=fixture('https://jobpick20.com/',stored);
  expose(loader,['resumeAccountIfNeeded'],f.context).resumeAccountIfNeeded();
  assert.equal(f.timers.length,1,'existing-session resume must remain supported');
}
const auth=read('assets/auth-experience.js');
for (const [suffix, expected] of [
  ['', ''], ['#platforms',''], ['#access_token=marker&refresh_token=marker',''],
  ['?code=marker',''], ['?error=access_denied','callbackCancelled'],
  ['#error=access_denied&error_description=provider-text','callbackCancelled'],
  ['?error=server_error','callbackError'], ['#error_description=provider-text','callbackError'],
  ['#error=access_denied&error_code=otp_expired','callbackError']
]) {
  const f=fixture('https://jobpick20.com/'+suffix);
  const test=expose(auth,['callbackFailureFromUrl'],f.context);
  assert.equal(test.callbackFailureFromUrl(),expected,suffix);
}
const injected=auth.replace('  function text(key)',`  function setTestUi(value) { ui = value; }\n  function text(key)`);
for (const suffix of ['?role=IT&error=access_denied&error_description=untrusted#platforms', '?role=IT#error=server_error&error_code=marker&error_description=untrusted']) {
  const f=fixture('https://jobpick20.com/'+suffix,{'jobhub_auth_return_to':'/jobs/'});
  f.context.window.setTimeout=()=>{};
  const test=expose(injected,['showCallbackFailure','setTestUi'],f.context);
  const ui={layer:{hidden:true},status:{textContent:'',setAttribute(){}}};
  test.setTestUi(ui);
  assert.equal(test.showCallbackFailure(),true);
  assert.equal(ui.layer.hidden,false,'callback failure must be visible even after Skip for now');
  assert.ok(ui.status.textContent.length>15);
  assert.ok(!ui.status.textContent.includes('untrusted'),'provider text must not be reflected');
  assert.ok(!f.context.window.history.last.includes('error'),'error fields must be removed from the URL');
  assert.ok(f.context.window.history.last.includes('role=IT'),'unrelated query must survive');
  if(suffix.includes('#platforms')) assert.ok(f.context.window.history.last.endsWith('#platforms'),'normal anchors must survive');
  assert.deepEqual(f.context.window.history.state,{keep:true});
  assert.equal(f.store.jobhub_auth_return_to,undefined,'failed callbacks must clear stale stored return paths');
}
assert.match(read('index.html'),/site-localization\.js\?v=20261121flash1/);
assert.match(loader,/auth-experience\.js\?v=20261121flash1/);
console.log('PASS: lazy auth, first-return hash/code/error initialization, existing sessions, safe visible callback errors and URL cleanup');

// An explicit open from the lazy loader must not expose UI before session lookup.
{
  const f=fixture('https://jobpick20.com/');
  f.context.window.setTimeout=()=>{};
  const t=expose(injected,['show','setTestUi'],f.context);
  const ui={layer:{hidden:true},google:{focus(){}}};t.setTestUi(ui);
  t.show(true);assert.equal(ui.layer.hidden,true,'pending session must keep modal hidden');
}
assert.match(auth,/jobhub-header-login" hidden/,'replacement header login starts hidden');
assert.match(auth,/else if \(authCheckComplete\) showAccess\(\)/,'null early events must not show signed-out state');
assert.match(loader,/button.hidden = needsAccountResume\(\)/,'resume launcher must not claim signed-out state');
console.log('PASS: unresolved session keeps modal and signed-out header hidden');
