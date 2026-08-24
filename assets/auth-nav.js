(function () {
  const SUPABASE_URL = 'https://rvitqbkgtgjharxqaxmv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_aUYK7r0Nrm8y7AXYEFkR5Q_z0lTWUtt';
  window.gulfSupabaseClient = window.gulfSupabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.supabaseClient = window.gulfSupabaseClient;
  window.gulfSafeNext = function (value) {
    try {
      const next = value || '/home/';
      return next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/home/';
    } catch (_) { return '/home/'; }
  };
  window.gulfRedirectAfterAuth = function () {
    const next = window.gulfSafeNext(new URLSearchParams(window.location.search).get('next'));
    window.location.replace(next);
  };
})();
