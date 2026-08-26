(function () {
  'use strict';

  var STORAGE_KEY = 'jobhub_site_language';
  var FILE = '/assets/site-translations.json';
  var SUPPORTED = {
    en: { label: 'EN', name: 'English', dir: 'ltr', locale: 'en' },
    ar: { label: 'العربية', name: 'العربية', dir: 'rtl', locale: 'ar' },
    hi: { label: 'हिन्दी', name: 'हिन्दी', dir: 'ltr', locale: 'hi' },
    ur: { label: 'اردو', name: 'اردو', dir: 'rtl', locale: 'ur' }
  };
  var source = { text: new Map(), attributes: new Map() };
  var translationsPromise = null;
  var translationData = { languages: {} };

  function normalise(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function preferredLanguage() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED[saved]) return saved;
    } catch (e) {}
    var browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return SUPPORTED[browser] ? browser : 'en';
  }
  function translations() {
    if (!translationsPromise) {
      translationsPromise = fetch(FILE, { credentials: 'same-origin' })
        .then(function (response) { if (!response.ok) throw new Error('Translations unavailable'); return response.json(); })
        .catch(function () { return { languages: {} }; })
        .then(function (data) { translationData = data || { languages: {} }; return translationData; });
    }
    return translationsPromise;
  }
  function eligible(element) {
    return element && !element.closest('script,style,noscript,code,pre,[data-no-localize],[data-i18n],[data-i18n-ph]');
  }
  function captureText(node) {
    if (!node.parentElement || !eligible(node.parentElement)) return;
    var value = normalise(node.nodeValue);
    if (value && !source.text.has(node)) source.text.set(node, value);
  }
  function captureAttributes(element) {
    if (!eligible(element) || element.hasAttribute('data-no-localize')) return;
    ['title', 'placeholder', 'aria-label', 'alt'].forEach(function (attribute) {
      if (element.hasAttribute(attribute) && !source.attributes.has(element)) {
        source.attributes.set(element, {});
      }
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
  function apply(language, data) {
    var settings = SUPPORTED[language] || SUPPORTED.en;
    var maps = (data.languages && data.languages[language]) || { text: {}, attributes: {} };
    document.documentElement.lang = settings.locale;
    document.documentElement.dir = settings.dir;
    document.body.classList.toggle('site-rtl', settings.dir === 'rtl');
    if (document.getElementById('lang') && typeof window.applyLanguage === 'function') {
      try { window.applyLanguage(language); } catch (e) {}
    }
    source.text.forEach(function (original, node) {
      if (!node.parentElement || !eligible(node.parentElement)) return;
      node.nodeValue = language === 'en' ? original : (maps.text[original] || original);
    });
    source.attributes.forEach(function (attributes, element) {
      Object.keys(attributes).forEach(function (attribute) {
        var original = attributes[attribute];
        element.setAttribute(attribute, language === 'en' ? original : (maps.attributes[original] || maps.text[original] || original));
      });
    });
    updatePicker(language);
    document.dispatchEvent(new CustomEvent('jobhub:languagechange', { detail: { language: language, direction: settings.dir } }));
  }
  function setLanguage(language) {
    if (!SUPPORTED[language]) language = 'en';
    try { localStorage.setItem(STORAGE_KEY, language); } catch (e) {}
    translations().then(function (data) { apply(language, data); });
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
  function addStyles() {
    if (document.getElementById('siteLocalizationStyles')) return;
    var style = document.createElement('style');
    style.id = 'siteLocalizationStyles';
    style.textContent = '@import url("https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap");.site-language-control{display:inline-flex;align-items:center;gap:7px;margin-left:auto;padding:4px 0}.site-language-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.site-language-select{min-width:88px;border:1px solid #3a4a59;border-radius:7px;background:#101820;color:#ece8de;padding:7px 26px 7px 9px;font:700 12px Inter,Arial,sans-serif;cursor:pointer}.site-language-select:focus-visible{outline:3px solid #ffb020;outline-offset:2px}html[lang="ar"],html[lang="ur"]{font-family:"Noto Naskh Arabic",Inter,Arial,sans-serif}html[lang="hi"]{font-family:"Noto Sans Devanagari",Inter,Arial,sans-serif}.site-rtl .sitenav,.site-rtl .nav,.site-rtl header nav{direction:rtl}.site-rtl .site-language-control{margin-left:0;margin-right:auto}.site-rtl p,.site-rtl li,.site-rtl h1,.site-rtl h2,.site-rtl h3{direction:rtl;text-align:right}@media(max-width:640px){.site-language-control{margin-left:0}.site-language-select{min-width:76px}}';
    document.head.appendChild(style);
  }
  function init() {
    addStyles();
    addPicker();
    capturePage();
    document.addEventListener('change', function (event) {
      if (event.target && event.target.matches('[data-site-language-picker]')) setLanguage(event.target.value);
    });
    setLanguage(preferredLanguage());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.JobHubLocalization = { setLanguage: setLanguage, language: preferredLanguage, translate: translate };
}());
