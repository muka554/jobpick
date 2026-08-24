(() => {
  'use strict';

  const SUPABASE_URL = 'https://rvitqbkgtgjharxqaxmv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_aUYK7r0Nrm8y7AXYEFkR5Q_z0lTWUtt';

  function initAuthNav() {
    if (!window.supabase) return;

    const client = window.gulfSupabaseClient ||
      (window.gulfSupabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      ));

    const greeting = document.getElementById('userGreeting');
    const login = document.getElementById('loginBtn');
    const logout = document.getElementById('logoutBtn');

    if (!greeting || !logout) return;

    function render(session) {
      const user = session?.user;
      const signedIn = Boolean(user);

      greeting.hidden = !signedIn;
      logout.hidden = !signedIn;
      if (login) login.hidden = signedIn;

      if (user) {
        const metadata = user.user_metadata || {};
        greeting.textContent = `Hi, ${metadata.full_name || metadata.name || user.email || 'Account'}`;
      }
    }

    client.auth.getSession().then(({ data }) => render(data.session));
    client.auth.onAuthStateChange((_event, session) => render(session));

    logout.addEventListener('click', async () => {
      logout.disabled = true;
      const { error } = await client.auth.signOut();
      if (error) {
        console.error(error);
        logout.disabled = false;
        return;
      }
      window.location.href = '/account/';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthNav, { once: true });
  } else {
    initAuthNav();
  }
})();