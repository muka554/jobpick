(function () {
  const SUPABASE_URL = 'https://rvitqbkgtgjharxqaxmv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_aUYK7r0Nrm8y7AXYEFkR5Q_z0lTWUtt';
  const path = window.location.pathname;
  const accountPath = '/account/';
  if (path === accountPath || path === '/account' || path.endsWith('/account/index.html')) return;

  function safeNext() {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  function redirectToLogin() {
    const next = encodeURIComponent(safeNext());
    window.location.replace(`${accountPath}?next=${next}`);
  }

  function start() {
    if (!window.supabase || !window.supabase.createClient) {
      redirectToLogin();
      return;
    }
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    client.auth.getUser().then(({ data }) => {
      if (!data?.user) redirectToLogin();
      else document.documentElement.dataset.authenticated = 'true';
    }).catch(redirectToLogin);
  }

  if (window.supabase?.createClient) start();
  else window.addEventListener('load', start, { once: true });
})();
