(function () {
  'use strict';

  var SKIP_KEY = 'jobhub_account_prompt_skipped';
  var RETURN_KEY = 'jobhub_auth_return_to';
  var RETURN_PARAM = 'jobhub_return_to';
  var config = window.JOBHUB_SUPABASE_CONFIG;
  var clientPromise = null;
  var client = null;
  var ui = {};
  var language = 'en';
  var mode = 'signin';
  var initialised = false;

  var copy = {
    en: {
      badge: 'JobPick account', title: 'Pick up where you left off',
      body: 'Sign in to keep your searches with you across devices. You can always continue without an account.',
      google: 'Continue with Google', or: 'or', email: 'Email address', placeholder: 'you@example.com', password: 'Password', passwordPlaceholder: 'Enter your password',
      signIn: 'Sign in', signUp: 'Create account', signInButton: 'Sign in securely', signUpButton: 'Create account',
      passwordHint: 'Use at least 12 characters with uppercase, lowercase, a number, and a symbol.', magic: 'Email me a Magic Link',
      skip: 'Skip for now', checking: 'Checking your account…', signed: 'You are signed in', signout: 'Sign out', account: 'Account', close: 'Close',
      magicSent: 'Check your email for a secure Magic Link.', signupSent: 'Check your email to confirm your new account, then return here to sign in.',
      signInError: 'We could not sign you in. Check your email and password, then try again.', signUpError: 'We could not create the account. Check the password requirements and try again.',
      unavailable: 'Account access is not available right now.', returnNotice: 'Signed in successfully. Returning you to your page…', signedNotice: 'Signed in successfully.'
    },
    ar: {
      badge: 'حساب JobPick', title: 'أكمل من حيث توقفت',
      body: 'سجّل الدخول للاحتفاظ بعمليات البحث عبر أجهزتك. يمكنك المتابعة دائمًا من دون حساب.',
      google: 'المتابعة باستخدام Google', or: 'أو', email: 'البريد الإلكتروني', placeholder: 'you@example.com', password: 'كلمة المرور', passwordPlaceholder: 'أدخل كلمة المرور',
      signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب', signInButton: 'تسجيل الدخول بأمان', signUpButton: 'إنشاء حساب',
      passwordHint: 'استخدم 12 حرفًا على الأقل مع أحرف كبيرة وصغيرة ورقم ورمز.', magic: 'أرسل لي رابط دخول',
      skip: 'تخطَّ الآن', checking: 'جارٍ التحقق من حسابك…', signed: 'تم تسجيل دخولك', signout: 'تسجيل الخروج', account: 'الحساب', close: 'إغلاق',
      magicSent: 'تحقق من بريدك الإلكتروني للحصول على رابط دخول آمن.', signupSent: 'تحقق من بريدك الإلكتروني لتأكيد حسابك الجديد، ثم عُد هنا لتسجيل الدخول.',
      signInError: 'تعذّر تسجيل دخولك. تحقق من البريد الإلكتروني وكلمة المرور ثم حاول مجددًا.', signUpError: 'تعذّر إنشاء الحساب. تحقق من متطلبات كلمة المرور ثم حاول مجددًا.',
      unavailable: 'الوصول إلى الحساب غير متاح الآن.', returnNotice: 'تم تسجيل الدخول بنجاح. نعيدك إلى صفحتك…', signedNotice: 'تم تسجيل الدخول بنجاح.'
    },
    hi: {
      badge: 'JobPick खाता', title: 'जहाँ छोड़ा था वहीं से आगे बढ़ें',
      body: 'अपनी खोज परिणाम सभी डिवाइस पर रखने के लिए साइन इन करें। आप बिना खाते के भी आगे बढ़ सकते हैं।',
      google: 'Google से जारी रखें', or: 'या', email: 'ईमेल पता', placeholder: 'you@example.com', password: 'पासवर्ड', passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
      signIn: 'साइन इन', signUp: 'खाता बनाएँ', signInButton: 'सुरक्षित रूप से साइन इन करें', signUpButton: 'खाता बनाएँ',
      passwordHint: 'कम-से-कम 12 अक्षर, अपरकेस, लोअरकेस, अंक और प्रतीक का उपयोग करें।', magic: 'मुझे Magic Link भेजें',
      skip: 'अभी छोड़ें', checking: 'आपका खाता जाँचा जा रहा है…', signed: 'आप साइन इन हैं', signout: 'साइन आउट', account: 'खाता', close: 'बंद करें',
      magicSent: 'सुरक्षित Magic Link के लिए अपना ईमेल देखें।', signupSent: 'अपने नए खाते की पुष्टि के लिए ईमेल देखें, फिर साइन इन करने के लिए यहाँ लौटें।',
      signInError: 'साइन इन नहीं हो सका। अपना ईमेल और पासवर्ड जाँचकर फिर कोशिश करें।', signUpError: 'खाता नहीं बन सका। पासवर्ड नियम जाँचकर फिर कोशिश करें।',
      unavailable: 'खाता एक्सेस अभी उपलब्ध नहीं है।', returnNotice: 'साइन इन सफल रहा। आपको आपके पेज पर वापस भेजा जा रहा है…', signedNotice: 'साइन इन सफल रहा।'
    },
    ur: {
      badge: 'JobPick اکاؤنٹ', title: 'جہاں سے چھوڑا تھا وہیں سے آگے بڑھیں',
      body: 'اپنی تلاشوں کو تمام آلات پر رکھنے کے لیے سائن اِن کریں۔ آپ اکاؤنٹ کے بغیر بھی جاری رکھ سکتے ہیں۔',
      google: 'Google کے ساتھ جاری رکھیں', or: 'یا', email: 'ای میل ایڈریس', placeholder: 'you@example.com', password: 'پاس ورڈ', passwordPlaceholder: 'اپنا پاس ورڈ درج کریں',
      signIn: 'سائن اِن', signUp: 'اکاؤنٹ بنائیں', signInButton: 'محفوظ سائن اِن', signUpButton: 'اکاؤنٹ بنائیں',
      passwordHint: 'کم از کم 12 حروف، بڑے اور چھوٹے حروف، عدد اور علامت استعمال کریں۔', magic: 'مجھے Magic Link بھیجیں',
      skip: 'ابھی چھوڑ دیں', checking: 'آپ کا اکاؤنٹ چیک کیا جا رہا ہے…', signed: 'آپ سائن اِن ہیں', signout: 'سائن آؤٹ', account: 'اکاؤنٹ', close: 'بند کریں',
      magicSent: 'محفوظ Magic Link کے لیے اپنا ای میل دیکھیں۔', signupSent: 'نئے اکاؤنٹ کی تصدیق کے لیے ای میل دیکھیں، پھر سائن اِن کرنے کے لیے یہاں واپس آئیں۔',
      signInError: 'سائن اِن نہیں ہو سکا۔ اپنا ای میل اور پاس ورڈ چیک کرکے دوبارہ کوشش کریں۔', signUpError: 'اکاؤنٹ نہیں بن سکا۔ پاس ورڈ کی شرائط چیک کرکے دوبارہ کوشش کریں۔',
      unavailable: 'اکاؤنٹ تک رسائی اس وقت دستیاب نہیں ہے۔', returnNotice: 'سائن اِن کامیاب رہا۔ آپ کو آپ کے صفحے پر واپس بھیجا جا رہا ہے…', signedNotice: 'سائن اِن کامیاب رہا۔'
    }
  };

  function text(key) { return (copy[language] || copy.en)[key] || copy.en[key] || ''; }
  function usableConfig() { return !!(config && config.url && config.publishableKey && !/YOUR_|YOUR_PROJECT/.test(config.url + config.publishableKey)); }
  function safePath(value) {
    if (!value || typeof value !== 'string' || value.charAt(0) !== '/' || value.indexOf('//') === 0 || value.indexOf('://') !== -1) return '';
    try {
      var parsed = new URL(value, window.location.origin);
      if (parsed.origin !== window.location.origin) return '';
      parsed.searchParams.delete(RETURN_PARAM);
      return parsed.pathname + parsed.search + parsed.hash;
    } catch (error) { return ''; }
  }
  function pagePath() {
    var current = new URL(window.location.href);
    current.searchParams.delete(RETURN_PARAM);
    current.searchParams.delete('code');
    return current.pathname + current.search + current.hash;
  }
  function returnTarget() {
    var fromUrl = safePath(new URL(window.location.href).searchParams.get(RETURN_PARAM) || '');
    if (fromUrl) return fromUrl;
    try { return safePath(localStorage.getItem(RETURN_KEY) || ''); } catch (error) { return ''; }
  }
  function rememberReturn() {
    var path = safePath(pagePath());
    try {
      if (path && path !== '/' && path !== '/index.html') localStorage.setItem(RETURN_KEY, path);
    } catch (error) {}
    return path;
  }
  function callbackRedirect(path) {
    var callback = new URL('/', window.location.origin);
    var safe = safePath(path || '');
    if (safe && safe !== '/' && safe !== '/index.html') callback.searchParams.set(RETURN_PARAM, safe);
    return callback.href;
  }
  function rootCallback() { return window.location.pathname === '/' || window.location.pathname === '/index.html'; }
  function setStatus(message, state) { if (ui.status) { ui.status.textContent = message || ''; ui.status.setAttribute('data-state', state || ''); } }
  function setBusy(busy) {
    [ui.google, ui.magic, ui.submit, ui.signinTab, ui.signupTab, ui.skip, ui.signout].forEach(function (button) { if (button) button.disabled = !!busy; });
    if (ui.email) ui.email.disabled = !!busy;
    if (ui.password) ui.password.disabled = !!busy;
  }
  function clearStoredReturn() { try { localStorage.removeItem(RETURN_KEY); } catch (error) {} }
  function completeReturn() {
    var target = returnTarget();
    if (!target || !rootCallback() || target === '/' || target === '/index.html') return false;
    clearStoredReturn();
    var root = new URL(window.location.href);
    root.searchParams.delete(RETURN_PARAM);
    root.searchParams.delete('code');
    window.history.replaceState({}, '', root.pathname + root.search + root.hash);
    setStatus(text('returnNotice'), 'success');
    window.setTimeout(function () { window.location.replace(target); }, 350);
    return true;
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
      try { if (localStorage.getItem(SKIP_KEY) === '1') { ui.launcher.hidden = false; return; } } catch (error) {}
    }
    ui.launcher.hidden = true;
    ui.layer.hidden = false;
    window.setTimeout(function () { if (ui.google) ui.google.focus(); }, 30);
  }
  function hide(skipped) {
    if (!ui.layer) return;
    if (skipped) { try { localStorage.setItem(SKIP_KEY, '1'); } catch (error) {} }
    ui.layer.hidden = true;
    if (ui.launcher) ui.launcher.hidden = false;
  }
  function showSignedIn(user) {
    if (!ui.signed) return;
    ui.signed.hidden = false;
    ui.signedLabel.textContent = text('signed');
    ui.access.hidden = true;
    ui.skip.hidden = true;
    if (ui.launcher) { ui.launcher.textContent = text('account'); ui.launcher.hidden = false; }
    if (user && user.email) ui.signed.setAttribute('title', text('signed'));
  }
  function showAccess() {
    if (!ui.signed) return;
    ui.signed.hidden = true;
    ui.access.hidden = false;
    ui.skip.hidden = false;
    if (ui.launcher) { ui.launcher.textContent = text('account'); ui.launcher.hidden = false; }
  }
  function setMode(nextMode) {
    mode = nextMode === 'signup' ? 'signup' : 'signin';
    if (!ui.layer) return;
    ui.layer.setAttribute('data-auth-mode', mode);
    ui.signinTab.setAttribute('aria-selected', String(mode === 'signin'));
    ui.signupTab.setAttribute('aria-selected', String(mode === 'signup'));
    ui.password.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
    ui.password.value = '';
    setStatus('');
    refreshCopy();
  }
  function refreshCopy() {
    if (!ui.layer) return;
    ui.badge.textContent = text('badge'); ui.title.textContent = text('title'); ui.body.textContent = text('body');
    ui.google.innerHTML = '<span class="jobhub-google-mark" aria-hidden="true">G</span><span>' + text('google') + '</span>';
    ui.divider.textContent = text('or'); ui.signinTab.textContent = text('signIn'); ui.signupTab.textContent = text('signUp');
    ui.emailLabel.textContent = text('email'); ui.email.placeholder = text('placeholder'); ui.passwordLabel.textContent = text('password'); ui.password.placeholder = text('passwordPlaceholder');
    ui.passwordHint.textContent = text('passwordHint'); ui.submit.textContent = mode === 'signup' ? text('signUpButton') : text('signInButton'); ui.magic.textContent = text('magic');
    ui.skip.textContent = text('skip'); ui.close.setAttribute('aria-label', text('close')); ui.close.title = text('close'); ui.signout.textContent = text('signout');
    if (ui.launcher) ui.launcher.textContent = text('account');
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
    layer.innerHTML = '<div class="jobhub-auth-card"><button class="jobhub-auth-close" type="button" aria-label="Close">×</button><div class="jobhub-auth-inner"><p class="jobhub-auth-badge"></p><h2 class="jobhub-auth-title" id="jobhubAuthTitle"></h2><p class="jobhub-auth-copy"></p><div class="jobhub-auth-actions jobhub-auth-access"><button type="button" class="jobhub-auth-button jobhub-auth-google"></button><div class="jobhub-auth-divider"></div><div class="jobhub-auth-tabs" role="tablist"><button type="button" class="jobhub-auth-tab" role="tab"></button><button type="button" class="jobhub-auth-tab" role="tab"></button></div><form class="jobhub-auth-password-form"><label class="jobhub-auth-label" for="jobhubAuthEmail"></label><input class="jobhub-auth-input" id="jobhubAuthEmail" type="email" autocomplete="email" inputmode="email" required><label class="jobhub-auth-label" for="jobhubAuthPassword"></label><input class="jobhub-auth-input" id="jobhubAuthPassword" type="password" minlength="12" required><p class="jobhub-auth-password-hint"></p><button type="submit" class="jobhub-auth-button jobhub-auth-magic"></button></form><button type="button" class="jobhub-auth-magic-link"></button></div><button type="button" class="jobhub-auth-skip"></button><p class="jobhub-auth-status" aria-live="polite"></p><div class="jobhub-auth-signedin" hidden><span></span><button type="button" class="jobhub-auth-signout"></button></div></div></div>';
    document.body.appendChild(layer);

    ui = {
      layer: layer, launcher: launcher, close: layer.querySelector('.jobhub-auth-close'), badge: layer.querySelector('.jobhub-auth-badge'), title: layer.querySelector('.jobhub-auth-title'), body: layer.querySelector('.jobhub-auth-copy'),
      access: layer.querySelector('.jobhub-auth-access'), google: layer.querySelector('.jobhub-auth-google'), divider: layer.querySelector('.jobhub-auth-divider'), signinTab: layer.querySelectorAll('.jobhub-auth-tab')[0], signupTab: layer.querySelectorAll('.jobhub-auth-tab')[1],
      form: layer.querySelector('.jobhub-auth-password-form'), emailLabel: layer.querySelector('label[for="jobhubAuthEmail"]'), email: layer.querySelector('#jobhubAuthEmail'), passwordLabel: layer.querySelector('label[for="jobhubAuthPassword"]'), password: layer.querySelector('#jobhubAuthPassword'), passwordHint: layer.querySelector('.jobhub-auth-password-hint'), submit: layer.querySelector('.jobhub-auth-password-form button[type="submit"]'), magic: layer.querySelector('.jobhub-auth-magic-link'),
      skip: layer.querySelector('.jobhub-auth-skip'), status: layer.querySelector('.jobhub-auth-status'), signed: layer.querySelector('.jobhub-auth-signedin'), signedLabel: layer.querySelector('.jobhub-auth-signedin span'), signout: layer.querySelector('.jobhub-auth-signout')
    };
    setMode('signin');

    ui.close.addEventListener('click', function () { hide(true); });
    ui.skip.addEventListener('click', function () { hide(true); });
    ui.launcher.addEventListener('click', function () { show(true); });
    layer.addEventListener('click', function (event) { if (event.target === layer) hide(true); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !layer.hidden) hide(true); });
    ui.signinTab.addEventListener('click', function () { setMode('signin'); });
    ui.signupTab.addEventListener('click', function () { setMode('signup'); });

    ui.google.addEventListener('click', function () {
      var target = rememberReturn(); setBusy(true); setStatus(text('checking'));
      getClient().then(function (supabase) {
        return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackRedirect(target), queryParams: { prompt: 'select_account' } } });
      }).then(function (result) { if (result.error) throw result.error; }).catch(function () { setStatus(text('signInError'), 'error'); setBusy(false); });
    });

    ui.magic.addEventListener('click', function () {
      var email = ui.email.value.trim();
      if (!email) { ui.email.focus(); return; }
      var target = rememberReturn(); setBusy(true); setStatus(text('checking'));
      getClient().then(function (supabase) {
        return supabase.auth.signInWithOtp({ email: email, options: { shouldCreateUser: false, emailRedirectTo: callbackRedirect(target) } });
      }).then(function (result) {
        if (result.error) throw result.error;
        setStatus(text('magicSent'), 'success');
      }).catch(function () { setStatus(text('signInError'), 'error'); }).finally(function () { setBusy(false); });
    });

    ui.form.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = ui.email.value.trim();
      var password = ui.password.value;
      if (!email) { ui.email.focus(); return; }
      if (!password) { ui.password.focus(); return; }
      var target = rememberReturn(); setBusy(true); setStatus(text('checking'));
      getClient().then(function (supabase) {
        if (mode === 'signup') {
          return supabase.auth.signUp({ email: email, password: password, options: { emailRedirectTo: callbackRedirect(target) } });
        }
        return supabase.auth.signInWithPassword({ email: email, password: password });
      }).then(function (result) {
        if (result.error) throw result.error;
        ui.password.value = '';
        if (mode === 'signup' && !(result.data && result.data.session)) {
          setStatus(text('signupSent'), 'success');
          return;
        }
        var user = result.data && result.data.user;
        if (user) {
          showSignedIn(user);
          if (!completeReturn()) { setStatus(text('signedNotice'), 'success'); window.setTimeout(function () { hide(false); }, 600); }
        }
      }).catch(function () {
        setStatus(mode === 'signup' ? text('signUpError') : text('signInError'), 'error');
      }).finally(function () { setBusy(false); });
    });

    ui.signout.addEventListener('click', function () {
      getClient().then(function (supabase) { return supabase.auth.signOut(); }).then(function () { showAccess(); setStatus(''); show(true); }).catch(function () { setStatus(text('signInError'), 'error'); });
    });
  }
  function initialiseAuth() {
    createUI();
    if (!usableConfig()) { showAccess(); setStatus(text('unavailable'), 'error'); show(); return; }
    setStatus(text('checking'));
    getClient().then(function (supabase) {
      supabase.auth.onAuthStateChange(function (_event, session) {
        if (session && session.user) {
          showSignedIn(session.user);
          if (!completeReturn()) { setStatus(text('signedNotice'), 'success'); window.setTimeout(function () { hide(false); }, 600); }
        } else showAccess();
      });
      return supabase.auth.getUser().then(function (result) {
        var current = result.data && result.data.user;
        if (current) {
          showSignedIn(current);
          if (!completeReturn()) { hide(false); }
        } else {
          showAccess();
          show();
        }
        setStatus('');
      });
    }).catch(function () { showAccess(); setStatus(text('unavailable'), 'error'); show(); });
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
