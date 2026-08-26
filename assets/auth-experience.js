(function () {
  'use strict';

  var SKIP_KEY = 'jobhub_account_prompt_skipped';
  var RETURN_KEY = 'jobhub_auth_return_to';
  var config = window.JOBHUB_SUPABASE_CONFIG;
  var clientPromise = null;
  var client = null;
  var ui = {};
  var language = 'en';
  var initialised = false;

  var copy = {
    en: {
      badge: 'JobPick account', title: 'Pick up where you left off',
      body: 'Sign in to keep your searches with you across devices. You can continue without an account.',
      google: 'Continue with Google', or: 'or', email: 'Email address', placeholder: 'you@example.com',
      magic: 'Send sign-in link', skip: 'Skip for now', checking: 'Checking your account…',
      signed: 'You are signed in', signout: 'Sign out', account: 'Account', close: 'Close',
      sent: 'Check your email for a secure sign-in link.', error: 'We could not start sign-in. Please try again.',
      unavailable: 'Account sync is not available right now.', returnNotice: 'Signed in successfully. Returning you to your page…'
    },
    ar: {
      badge: 'حساب JobPick', title: 'أكمل من حيث توقفت',
      body: 'سجّل الدخول للاحتفاظ بعمليات البحث عبر أجهزتك. يمكنك المتابعة من دون حساب.',
      google: 'المتابعة باستخدام Google', or: 'أو', email: 'البريد الإلكتروني', placeholder: 'you@example.com',
      magic: 'إرسال رابط تسجيل الدخول', skip: 'تخطَّ الآن', checking: 'جارٍ التحقق من حسابك…',
      signed: 'تم تسجيل دخولك', signout: 'تسجيل الخروج', account: 'الحساب', close: 'إغلاق',
      sent: 'تحقق من بريدك الإلكتروني للحصول على رابط تسجيل دخول آمن.', error: 'تعذّر بدء تسجيل الدخول. يرجى المحاولة مرة أخرى.',
      unavailable: 'مزامنة الحساب غير متاحة الآن.', returnNotice: 'تم تسجيل الدخول بنجاح. نعيدك إلى صفحتك…'
    },
    hi: {
      badge: 'JobPick खाता', title: 'जहाँ छोड़ा था वहीं से आगे बढ़ें',
      body: 'अपने खोज परिणाम सभी डिवाइस पर रखने के लिए साइन इन करें। आप बिना खाते के भी आगे बढ़ सकते हैं।',
      google: 'Google से जारी रखें', or: 'या', email: 'ईमेल पता', placeholder: 'you@example.com',
      magic: 'साइन-इन लिंक भेजें', skip: 'अभी छोड़ें', checking: 'आपका खाता जाँचा जा रहा है…',
      signed: 'आप साइन इन हैं', signout: 'साइन आउट', account: 'खाता', close: 'बंद करें',
      sent: 'सुरक्षित साइन-इन लिंक के लिए अपना ईमेल देखें।', error: 'साइन-इन शुरू नहीं हो सका। कृपया फिर कोशिश करें।',
      unavailable: 'खाता सिंक अभी उपलब्ध नहीं है।', returnNotice: 'साइन-इन सफल रहा। आपको आपके पेज पर वापस भेजा जा रहा है…'
    },
    ur: {
      badge: 'JobPick اکاؤنٹ', title: 'جہاں سے چھوڑا تھا وہیں سے آگے بڑھیں',
      body: 'اپنی تلاشوں کو تمام آلات پر رکھنے کے لیے سائن اِن کریں۔ آپ اکاؤنٹ کے بغیر بھی جاری رکھ سکتے ہیں۔',
      google: 'Google کے ساتھ جاری رکھیں', or: 'یا', email: 'ای میل ایڈریس', placeholder: 'you@example.com',
      magic: 'سائن اِن لنک بھیجیں', skip: 'ابھی چھوڑ دیں', checking: 'آپ کا اکاؤنٹ چیک کیا جا رہا ہے…',
      signed: 'آپ سائن اِن ہیں', signout: 'سائن آؤٹ', account: 'اکاؤنٹ', close: 'بند کریں',
      sent: 'محفوظ سائن اِن لنک کے لیے اپنا ای میل دیکھیں۔', error: 'سائن اِن شروع نہیں ہو سکا۔ دوبارہ کوشش کریں۔',
      unavailable: 'اکاؤنٹ سنک اس وقت دستیاب نہیں ہے۔', returnNotice: 'سائن اِن کامیاب رہا۔ آپ کو آپ کے صفحے پر واپس بھیجا جا رہا ہے…'
    }
  };

  function text(key) { return (copy[language] || copy.en)[key] || copy.en[key] || ''; }
  function usableConfig() { return !!(config && config.url && config.publishableKey && !/YOUR_|YOUR_PROJECT/.test(config.url + config.publishableKey)); }
  function rootRedirect() { return new URL('/', window.location.origin).href; }
  function pagePath() { return window.location.pathname + window.location.search + window.location.hash; }
  function setStatus(message, state) { if (ui.status) { ui.status.textContent = message || ''; ui.status.setAttribute('data-state', state || ''); } }
  function setBusy(busy) { [ui.google, ui.magic, ui.skip].forEach(function (button) { if (button) button.disabled = !!busy; }); }
  function rememberReturn() {
    try {
      var path = pagePath();
      if (path !== '/' && path !== '/index.html') localStorage.setItem(RETURN_KEY, path);
    } catch (e) {}
  }
  function completeReturn() {
    try {
      var target = localStorage.getItem(RETURN_KEY);
      localStorage.removeItem(RETURN_KEY);
      if (target && window.location.pathname === '/' && target.charAt(0) === '/' && target.indexOf('//') !== 0 && target !== '/') {
        setStatus(text('returnNotice'), 'success');
        window.setTimeout(function () { window.location.assign(target); }, 350);
      }
    } catch (e) {}
  }
  function getClient() {
    if (!usableConfig()) return Promise.reject(new Error('Unavailable'));
    if (!clientPromise) {
      clientPromise = import('https://esm.sh/@supabase/supabase-js@2').then(function (module) {
        client = module.createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
        return client;
      });
    }
    return clientPromise;
  }
  function show(force) {
    if (!ui.layer) return;
    if (!force) {
      try { if (localStorage.getItem(SKIP_KEY) === '1') { ui.launcher.hidden = false; return; } } catch (e) {}
    }
    ui.launcher.hidden = true;
    ui.layer.hidden = false;
    window.setTimeout(function () { if (ui.google) ui.google.focus(); }, 30);
  }
  function hide(skipped) {
    if (!ui.layer) return;
    if (skipped) { try { localStorage.setItem(SKIP_KEY, '1'); } catch (e) {} }
    ui.layer.hidden = true;
    if (ui.launcher) ui.launcher.hidden = false;
  }
  function showSignedIn(user) {
    if (!ui.signed) return;
    ui.signed.hidden = false;
    ui.signedLabel.textContent = text('signed');
    ui.form.hidden = true;
    ui.divider.hidden = true;
    ui.skip.hidden = true;
    if (ui.launcher) { ui.launcher.textContent = text('account'); ui.launcher.hidden = false; }
    if (user && user.email) ui.signed.setAttribute('title', text('signed'));
  }
  function showForm() {
    if (!ui.signed) return;
    ui.signed.hidden = true;
    ui.form.hidden = false;
    ui.divider.hidden = false;
    ui.skip.hidden = false;
    if (ui.launcher) { ui.launcher.textContent = text('account'); ui.launcher.hidden = false; }
  }
  function refreshCopy() {
    if (!ui.layer) return;
    ui.badge.textContent = text('badge'); ui.title.textContent = text('title'); ui.body.textContent = text('body');
    ui.google.innerHTML = '<span class="jobhub-google-mark" aria-hidden="true">G</span><span>' + text('google') + '</span>';
    ui.divider.textContent = text('or'); ui.label.textContent = text('email'); ui.email.placeholder = text('placeholder');
    ui.magic.textContent = text('magic'); ui.skip.textContent = text('skip'); ui.close.setAttribute('aria-label', text('close')); ui.close.title = text('close');
    ui.signout.textContent = text('signout'); if (ui.launcher) ui.launcher.textContent = text('account');
  }
  function createUI() {
    if (document.getElementById('jobhubAuthLayer')) return;
    var ambient = document.createElement('div');
    ambient.className = 'jobhub-ambient';
    ambient.setAttribute('aria-hidden', 'true');
    ambient.innerHTML = '<span class="jobhub-orb jobhub-orb--one"></span><span class="jobhub-orb jobhub-orb--two"></span><span class="jobhub-orb jobhub-orb--three"></span>';
    document.body.appendChild(ambient);

    var launcher = document.createElement('button');
    launcher.type = 'button'; launcher.className = 'jobhub-auth-launcher'; launcher.hidden = true; launcher.setAttribute('data-no-localize', '');
    document.body.appendChild(launcher);

    var layer = document.createElement('section');
    layer.id = 'jobhubAuthLayer'; layer.className = 'jobhub-auth-layer'; layer.hidden = true; layer.setAttribute('data-no-localize', '');
    layer.setAttribute('role', 'dialog'); layer.setAttribute('aria-modal', 'true'); layer.setAttribute('aria-labelledby', 'jobhubAuthTitle');
    layer.innerHTML = '<div class="jobhub-auth-card"><button class="jobhub-auth-close" type="button" aria-label="Close">×</button><div class="jobhub-auth-inner"><p class="jobhub-auth-badge"></p><h2 class="jobhub-auth-title" id="jobhubAuthTitle"></h2><p class="jobhub-auth-copy"></p><div class="jobhub-auth-actions"><button type="button" class="jobhub-auth-button jobhub-auth-google"></button><div class="jobhub-auth-divider"></div><form class="jobhub-auth-email"><label class="jobhub-auth-label" for="jobhubAuthEmail"></label><input class="jobhub-auth-input" id="jobhubAuthEmail" type="email" autocomplete="email" inputmode="email" required><button type="submit" class="jobhub-auth-button jobhub-auth-magic"></button></form><button type="button" class="jobhub-auth-skip"></button></div><p class="jobhub-auth-status" aria-live="polite"></p><div class="jobhub-auth-signedin" hidden><span></span><button type="button" class="jobhub-auth-signout"></button></div></div></div>';
    document.body.appendChild(layer);

    ui = {
      layer: layer, launcher: launcher, close: layer.querySelector('.jobhub-auth-close'), badge: layer.querySelector('.jobhub-auth-badge'), title: layer.querySelector('.jobhub-auth-title'), body: layer.querySelector('.jobhub-auth-copy'), google: layer.querySelector('.jobhub-auth-google'), divider: layer.querySelector('.jobhub-auth-divider'), form: layer.querySelector('.jobhub-auth-email'), label: layer.querySelector('.jobhub-auth-label'), email: layer.querySelector('.jobhub-auth-input'), magic: layer.querySelector('.jobhub-auth-magic'), skip: layer.querySelector('.jobhub-auth-skip'), status: layer.querySelector('.jobhub-auth-status'), signed: layer.querySelector('.jobhub-auth-signedin'), signedLabel: layer.querySelector('.jobhub-auth-signedin span'), signout: layer.querySelector('.jobhub-auth-signout')
    };
    refreshCopy();

    ui.close.addEventListener('click', function () { hide(true); });
    ui.skip.addEventListener('click', function () { hide(true); });
    ui.launcher.addEventListener('click', function () { show(true); });
    layer.addEventListener('click', function (event) { if (event.target === layer) hide(true); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !layer.hidden) hide(true); });
    ui.google.addEventListener('click', function () {
      rememberReturn(); setBusy(true); setStatus(text('checking'));
      getClient().then(function (supabase) {
        return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: rootRedirect(), queryParams: { prompt: 'select_account' } } });
      }).then(function (result) {
        if (result.error) throw result.error;
      }).catch(function () { setStatus(text('error'), 'error'); setBusy(false); });
    });
    ui.form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!ui.email.value.trim()) return;
      rememberReturn(); setBusy(true); setStatus(text('checking'));
      getClient().then(function (supabase) {
        return supabase.auth.signInWithOtp({ email: ui.email.value.trim(), options: { emailRedirectTo: rootRedirect() } });
      }).then(function (result) {
        if (result.error) throw result.error;
        setStatus(text('sent'), 'success');
      }).catch(function () { setStatus(text('error'), 'error'); }).finally(function () { setBusy(false); });
    });
    ui.signout.addEventListener('click', function () {
      getClient().then(function (supabase) { return supabase.auth.signOut(); }).then(function () { showForm(); setStatus(''); show(true); }).catch(function () { setStatus(text('error'), 'error'); });
    });
  }
  function initialiseAuth() {
    createUI();
    if (!usableConfig()) { setStatus(text('unavailable'), 'error'); show(); return; }
    setStatus(text('checking'));
    getClient().then(function (supabase) {
      return supabase.auth.getUser().then(function (result) {
        var current = result.data && result.data.user;
        if (current) { showSignedIn(current); completeReturn(); }
        else { showForm(); show(); }
        setStatus('');
      }).then(function () {
        supabase.auth.onAuthStateChange(function (_event, session) {
          if (session && session.user) { showSignedIn(session.user); completeReturn(); }
          else showForm();
        });
      });
    }).catch(function () { showForm(); setStatus(text('unavailable'), 'error'); show(); });
  }
  function init() {
    if (initialised) return;
    initialised = true;
    language = (window.JobHubLocalization && typeof window.JobHubLocalization.language === 'function' && window.JobHubLocalization.language()) || 'en';
    document.addEventListener('jobhub:languagechange', function (event) { language = (event.detail && event.detail.language) || 'en'; refreshCopy(); });
    initialiseAuth();
  }

  if (document.readyState === 'complete') init(); else window.addEventListener('load', init, { once: true });
  window.JobHubAuthExperience = { open: function () { show(true); }, hide: function () { hide(true); } };
}());
