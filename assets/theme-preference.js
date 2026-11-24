/* Theme preference only. No page or account data is read or sent. */
(function () {
  'use strict';
  const key = 'jobpick.theme.v1';
  const root = document.documentElement;
  const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  let preference = null;
  try { const stored = localStorage.getItem(key); if (stored === 'light' || stored === 'dark') preference = stored; } catch (_) { /* Use system preference when storage is blocked. */ }
  let button, reset;
  const labels = {
    en: ['Dark view', 'Light view', 'Use device setting'],
    ar: ['الوضع الداكن', 'الوضع الفاتح', 'استخدام إعداد الجهاز'],
    hi: ['डार्क मोड', 'लाइट मोड', 'डिवाइस सेटिंग का उपयोग करें'],
    ur: ['ڈارک موڈ', 'لائٹ موڈ', 'ڈیوائس کی ترتیب استعمال کریں']
  };
  function apply() {
    const theme = preference || (media && media.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const words = labels[(root.lang || 'en').split('-')[0]] || labels.en;
    if (button) {
      button.textContent = theme === 'dark' ? words[1] : words[0];
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', button.textContent);
      reset.textContent = words[2];
      reset.hidden = !preference;
    }
  }
  function save(value) {
    preference = value;
    try { if (value) localStorage.setItem(key, value); else localStorage.removeItem(key); } catch (_) { /* The current page still works without persistence. */ }
    apply();
  }
  apply();
  function mount() {
    if (document.getElementById('jobpick-theme-toggle')) return;
    if (!document.body) { setTimeout(mount, 50); return; }
    const controls = document.createElement('div');
    controls.className = 'jobpick-theme-controls';
    button = document.createElement('button');
    button.id = 'jobpick-theme-toggle'; button.type = 'button';
    button.addEventListener('click', () => save(root.dataset.theme === 'dark' ? 'light' : 'dark'));
    reset = document.createElement('button'); reset.type = 'button'; reset.className = 'jobpick-theme-system';
    reset.addEventListener('click', () => save(null));
    controls.append(button, reset);
    const nav = document.querySelector('.jobpick-primary-nav, .sitenav, .nav, .topbar');
    if (nav) nav.append(controls); else document.body.prepend(controls);
    apply();
    new MutationObserver(apply).observe(root, {attributes: true, attributeFilter: ['lang']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true}); else mount();
  setTimeout(mount, 0);
  if (media) { if (media.addEventListener) media.addEventListener('change', apply); else if (media.addListener) media.addListener(apply); }
  addEventListener('storage', event => { if (event.key !== key && event.key !== null) return; preference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null; apply(); });
})();
