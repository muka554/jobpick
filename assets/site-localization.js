(function () {
  'use strict';

  var STORAGE_KEY = 'jobhub_site_language';
  var FILE_BASE = '/assets/i18n/';
  var SUPPORTED = {
    en: { label: 'EN', name: 'English', dir: 'ltr', locale: 'en' },
    ar: { label: 'العربية', name: 'العربية', dir: 'rtl', locale: 'ar' },
    hi: { label: 'हिन्दी', name: 'हिन्दी', dir: 'ltr', locale: 'hi' },
    ur: { label: 'اردو', name: 'اردو', dir: 'rtl', locale: 'ur' }
  };
  var LOCALE_FONT_URLS = {
    ar: 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap',
    hi: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap',
    ur: 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap'
  };
  var ACCOUNT_LABELS = { en: 'Sign in', ar: 'تسجيل الدخول', hi: 'साइन इन', ur: 'سائن اِن' };
  var source = { text: new Map(), attributes: new Map() };
  var translationPromises = {};
  var translationData = { languages: {} };
  var languageRequest = 0;
  var accountLoading = false;

  function normalise(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function preferredLanguage() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED[saved]) return saved;
    } catch (e) {}
    var browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return SUPPORTED[browser] ? browser : 'en';
  }
  function translations(language) {
    if (language === 'en') return Promise.resolve({ languages: {} });
    if (!translationPromises[language]) {
      translationPromises[language] = fetch(FILE_BASE + language + '.json', { credentials: 'same-origin' })
        .then(function (response) { if (!response.ok) throw new Error('Translations unavailable'); return response.json(); })
        .catch(function () { return { languages: {} }; });
    }
    return translationPromises[language];
  }
  function loadLocaleFont(language) {
    var url = LOCALE_FONT_URLS[language];
    if (!url || document.getElementById('jobhubLocaleFont-' + language)) return;
    var stylesheet = document.createElement('link');
    stylesheet.id = 'jobhubLocaleFont-' + language;
    stylesheet.rel = 'stylesheet';
    stylesheet.href = url;
    document.head.appendChild(stylesheet);
  }
  function eligible(element) {
    return element && !element.closest('script,style,noscript,code,pre,[data-no-localize],[data-i18n],[data-i18n-ph]');
  }
  function captureText(node) {
    if (!node.parentElement || !eligible(node.parentElement)) return;
    var raw = String(node.nodeValue || '');
    var value = normalise(raw);
    if (value && !source.text.has(node)) {
      source.text.set(node, { value: value, leading: /^\s/.test(raw) ? ' ' : '', trailing: /\s$/.test(raw) ? ' ' : '' });
    }
  }
  function captureAttributes(element) {
    if (!eligible(element) || element.hasAttribute('data-no-localize')) return;
    ['title', 'placeholder', 'aria-label', 'alt'].forEach(function (attribute) {
      if (element.hasAttribute(attribute) && !source.attributes.has(element)) source.attributes.set(element, {});
      if (element.hasAttribute(attribute)) {
        var store = source.attributes.get(element);
        if (store && !Object.prototype.hasOwnProperty.call(store, attribute)) store[attribute] = normalise(element.getAttribute(attribute));
      }
    });
    if (element.tagName === 'META') {
      var key = normalise(element.getAttribute('name') || element.getAttribute('property')).toLowerCase();
      if ((key.indexOf('title') !== -1 || key.indexOf('description') !== -1) && element.hasAttribute('content')) {
        if (!source.attributes.has(element)) source.attributes.set(element, {});
        var metaStore = source.attributes.get(element);
        if (!Object.prototype.hasOwnProperty.call(metaStore, 'content')) metaStore.content = normalise(element.getAttribute('content'));
      }
    }
  }
  function capturePage() {
    var walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) captureText(node);
    document.querySelectorAll('*').forEach(captureAttributes);
  }
  function translate(value, language) {
    if (!value || language === 'en') return value;
    var maps = (translationData.languages && translationData.languages[language]) || { text: {}, attributes: {} };
    return maps.text[value] || maps.attributes[value] || value;
  }
  function updatePicker(language) {
    document.querySelectorAll('[data-site-language-picker]').forEach(function (picker) { picker.value = language; });
  }
  function updateAccountLauncher(language) {
    document.querySelectorAll('[data-jobhub-account-launcher]').forEach(function (button) {
      button.textContent = ACCOUNT_LABELS[language] || ACCOUNT_LABELS.en;
    });
  }
  function apply(language, data) {
    var settings = SUPPORTED[language] || SUPPORTED.en;
    var maps = (data.languages && data.languages[language]) || { text: {}, attributes: {} };
    translationData = data || { languages: {} };
    document.documentElement.lang = settings.locale;
    document.documentElement.dir = settings.dir;
    document.body.classList.toggle('site-rtl', settings.dir === 'rtl');
    if (document.getElementById('lang') && typeof window.applyLanguage === 'function') {
      try { window.applyLanguage(language); } catch (e) {}
    }
    source.text.forEach(function (record, node) {
      if (!node.parentElement || !eligible(node.parentElement)) return;
      var original = record.value;
      var translated = language === 'en' ? original : (maps.text[original] || original);
      node.nodeValue = record.leading + translated + record.trailing;
    });
    source.attributes.forEach(function (attributes, element) {
      Object.keys(attributes).forEach(function (attribute) {
        var original = attributes[attribute];
        element.setAttribute(attribute, language === 'en' ? original : (maps.attributes[original] || maps.text[original] || original));
      });
    });
    updatePicker(language);
    updateAccountLauncher(language);
    document.dispatchEvent(new CustomEvent('jobhub:languagechange', { detail: { language: language, direction: settings.dir } }));
  }
  function setLanguage(language) {
    if (!SUPPORTED[language]) language = 'en';
    try { localStorage.setItem(STORAGE_KEY, language); } catch (e) {}
    loadLocaleFont(language);
    var request = ++languageRequest;
    translations(language).then(function (data) {
      if (request === languageRequest) apply(language, data);
    });
  }
  function pickerMarkup() {
    return '<label class="site-language-label" for="siteLanguage">Language</label>' +
      '<select id="siteLanguage" class="site-language-select" data-site-language-picker aria-label="Language" data-no-localize>' +
      Object.keys(SUPPORTED).map(function (key) { return '<option value="' + key + '">' + SUPPORTED[key].label + '</option>'; }).join('') +
      '</select>';
  }
  function addPicker() {
    if (document.querySelector('[data-site-language-picker]')) return;
    var existing = document.getElementById('lang');
    if (existing) {
      existing.setAttribute('data-site-language-picker', '');
      existing.setAttribute('data-no-localize', '');
      existing.classList.add('site-language-select');
      return;
    }
    var nav = document.querySelector('.sitenav, .nav, nav[aria-label="Site"], header nav');
    var holder = document.createElement('div');
    holder.className = 'site-language-control';
    holder.innerHTML = pickerMarkup();
    if (nav) nav.appendChild(holder); else document.body.insertBefore(holder, document.body.firstChild);
  }
  function addBrandLogo() {
    document.querySelectorAll('.sitenav .brand, .nav .brand, nav[aria-label="Site"] .brand').forEach(function (brand) {
      if (brand.querySelector('.jobhub-brand-logo')) return;
      var logo = document.createElement('img');
      logo.className = 'jobhub-brand-logo';
      logo.src = '/assets/middle-east-job-hub-logo-64.webp';
      logo.width = 28;
      logo.height = 28;
      logo.alt = '';
      logo.decoding = 'async';
      logo.setAttribute('data-no-localize', '');
      brand.insertBefore(logo, brand.firstChild);
    });
  }
  function loadAccountExperience() {
    if (window.JobHubAuthExperience && typeof window.JobHubAuthExperience.open === 'function') {
      window.JobHubAuthExperience.open();
      return;
    }
    if (accountLoading) return;
    accountLoading = true;
    var styles = document.getElementById('jobhubExperienceStyles');
    if (!styles) {
      styles = document.createElement('link');
      styles.id = 'jobhubExperienceStyles';
      styles.rel = 'stylesheet';
      styles.href = '/assets/site-experience.css?v=20260827p';
      document.head.appendChild(styles);
    }
    function addExperienceScript() {
      if (document.getElementById('jobhubExperienceScript')) return;
      var script = document.createElement('script');
      script.id = 'jobhubExperienceScript';
      script.src = '/assets/auth-experience.js?v=20260826k';
      script.defer = true;
      script.onload = function () {
        accountLoading = false;
        if (window.JobHubAuthExperience && typeof window.JobHubAuthExperience.open === 'function') window.JobHubAuthExperience.open();
      };
      script.onerror = function () { accountLoading = false; };
      document.head.appendChild(script);
    }
    if (window.JOBHUB_SUPABASE_CONFIG) {
      addExperienceScript();
    } else {
      var configScript = document.getElementById('jobhubSupabaseConfig');
      if (configScript) {
        configScript.addEventListener('load', addExperienceScript, { once: true });
        configScript.addEventListener('error', addExperienceScript, { once: true });
      } else {
        configScript = document.createElement('script');
        configScript.id = 'jobhubSupabaseConfig';
        configScript.src = '/assets/supabase-config.js?v=b8f5004';
        configScript.onload = addExperienceScript;
        configScript.onerror = addExperienceScript;
        document.head.appendChild(configScript);
      }
    }
  }
  function resumeAccountIfNeeded() {
    var shouldResume = false;
    try { shouldResume = localStorage.getItem('jobhub_account_seen') === '1'; } catch (e) {}
    try { shouldResume = shouldResume || Object.keys(localStorage).some(function (key) { return /^sb-[a-z0-9-]+-auth-token$/i.test(key); }); } catch (e) {}
    try { shouldResume = shouldResume || new URL(window.location.href).searchParams.has('code'); } catch (e) {}
    if (!shouldResume) return;
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadAccountExperience, { timeout: 1000 });
    else window.setTimeout(loadAccountExperience, 120);
  }
  function addAccountLauncher() {
    if (document.querySelector('[data-jobhub-account-launcher]')) return;
    var nav = document.querySelector('.sitenav, .nav, nav[aria-label="Site"], header nav');
    if (!nav) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'jobhub-account-launcher';
    button.setAttribute('data-jobhub-account-launcher', '');
    button.setAttribute('data-no-localize', '');
    button.textContent = ACCOUNT_LABELS[preferredLanguage()] || ACCOUNT_LABELS.en;
    button.addEventListener('click', loadAccountExperience);
    nav.appendChild(button);
  }
  function addStyles() {
    if (document.getElementById('siteLocalizationStyles')) return;
    var style = document.createElement('style');
    style.id = 'siteLocalizationStyles';
    style.textContent = '.site-language-control{display:inline-flex;align-items:center;gap:7px;margin-left:auto;padding:4px 0}.site-language-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.site-language-select{min-width:88px;border:1px solid #3a4a59;border-radius:7px;background:#101820;color:#ece8de;padding:7px 26px 7px 9px;font:700 12px Inter,Arial,sans-serif;cursor:pointer}.site-language-select:focus-visible,.jobhub-account-launcher:focus-visible{outline:3px solid #ffb020;outline-offset:2px}.jobhub-account-launcher{border:1px solid #2dd9c0;background:#2dd9c0;color:#062420;border-radius:7px;padding:8px 13px;font:700 12px Inter,Arial,sans-serif;cursor:pointer}.jobhub-account-launcher:hover{background:#55e7d2}.jobhub-brand-logo{width:28px;height:28px;object-fit:contain;vertical-align:middle;margin-right:8px}.site-rtl .jobhub-brand-logo{margin-right:0;margin-left:8px}.site-rtl .sitenav,.site-rtl .nav,.site-rtl header nav{direction:rtl}.site-rtl .site-language-control{margin-left:0;margin-right:auto}.site-rtl p,.site-rtl li,.site-rtl h1,.site-rtl h2,.site-rtl h3{direction:rtl;text-align:right}@media(max-width:640px){.site-language-control{margin-left:0}.site-language-select{min-width:76px}}';
    document.head.appendChild(style);
  }
  function init() {
    addStyles();
    addBrandLogo();
    addPicker();
    addAccountLauncher();
    resumeAccountIfNeeded();
    capturePage();
    document.addEventListener('change', function (event) {
      if (event.target && event.target.matches('[data-site-language-picker]')) setLanguage(event.target.value);
    });
    setLanguage(preferredLanguage());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.JobHubLocalization = { setLanguage: setLanguage, language: preferredLanguage, translate: translate, openAccount: loadAccountExperience };
}());
