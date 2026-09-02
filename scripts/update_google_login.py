from pathlib import Path
p=Path('/home/ubuntu/jobpick-audit/tools/index.html')
s=p.read_text()
s=s.replace('api/oauth/login?returnTo=https%3A%2F%2Fjobpick20.com%2Ftools%2F">Sign in to enable private actions', 'api/oauth/login?provider=google&amp;returnTo=https%3A%2F%2Fjobpick20.com%2Ftools%2F">Continue with Google', 1)
s=s.replace("loginButton.href=`${API_BASE}/api/oauth/login?returnTo=${encodeURIComponent(window.location.origin+window.location.pathname)}`", "loginButton.href=`${API_BASE}/api/oauth/login?provider=google&returnTo=${encodeURIComponent(window.location.origin+window.location.pathname)}`", 1)
p.write_text(s)
