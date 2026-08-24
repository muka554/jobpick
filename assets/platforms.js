const GULF_PLATFORM_CONFIG = {
  version: 7,
  countries: {
    uae: { label: 'United Arab Emirates', searchLocation: 'United Arab Emirates', baytPath: 'uae', cities: { any: 'Any city', dubai: 'Dubai', abudhabi: 'Abu Dhabi', sharjah: 'Sharjah' } },
    ksa: { label: 'Saudi Arabia', searchLocation: 'Saudi Arabia', baytPath: 'saudi-arabia', cities: { any: 'Any city', riyadh: 'Riyadh', jeddah: 'Jeddah', dammam: 'Dammam' } }
  },
  groups: [
    { id: 'general', title: 'General & Global Boards', platforms: [
      { id: 'bayt', name: 'Bayt.com', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, city, location, country }) => { const config = GULF_PLATFORM_CONFIG.countries[country] || GULF_PLATFORM_CONFIG.countries.uae; const scope = city ? config.baytPath : 'international'; const term = slug(role || 'all-categories'); return `https://www.bayt.com/en/${scope}/jobs/${term}-jobs/${city ? `?location=${encodeURIComponent(location)}` : ''}`; } },
      { id: 'linkedin', name: 'LinkedIn Jobs', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, location }) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}` },
      { id: 'indeed', name: 'Indeed', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, location, country }) => `https://${country === 'ksa' ? 'sa.indeed.com' : 'ae.indeed.com'}/jobs?q=${encodeURIComponent(role)}&l=${encodeURIComponent(location)}` },
      { id: 'google-jobs', name: 'Google for Jobs', type: 'google', coverage: 'Aggregated listings', buildUrl: ({ role, location }) => googleFallback('jobs', role, location) },
      { id: 'glassdoor', name: 'Glassdoor', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, location }) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(role)}&locKeyword=${encodeURIComponent(location)}` }
    ] },
    { id: 'gulf', title: 'Gulf Specialist Boards', platforms: [
      { id: 'gulftalent', name: 'GulfTalent', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, location }) => `https://www.gulftalent.com/jobs/search?search=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}` },
      { id: 'naukrigulf', name: 'Naukrigulf', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, location }) => `https://www.naukrigulf.com/${slug(role)}-jobs?location=${encodeURIComponent(location)}` },
      { id: 'foundit', name: 'foundit Gulf', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, location }) => `https://www.founditgulf.com/srp/results?query=${encodeURIComponent(role)}&locations=${encodeURIComponent(location)}` },
      { id: 'laimoon', name: 'Laimoon', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, city, country }) => `https://${country === 'ksa' ? 'saudi-arabia' : 'uae'}.laimoon.com/jobs/${slug(role)}${city ? `?location=${encodeURIComponent(city)}` : ''}` },
      { id: 'akhtaboot', name: 'Akhtaboot', type: 'google', coverage: 'Gulf jobs', buildUrl: ({ role, location }) => googleFallback('site:akhtaboot.com jobs', role, location) },
      { id: 'rigzone', name: 'Rigzone', type: 'direct', coverage: 'Energy jobs', buildUrl: ({ role, location }) => `https://www.rigzone.com/oil/jobs/search/?q=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}` }
    ] },
    { id: 'agencies', title: 'Recruitment Agencies', platforms: [
      { id: 'michael-page', name: 'Michael Page', type: 'direct', coverage: 'Recruitment agency', buildUrl: ({ role, location, country }) => country === 'ksa' ? googleFallback('site:michaelpage.com jobs', role, location) : `https://www.michaelpage.ae/en/search-jobs?keyword=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}` },
      { id: 'robert-half', name: 'Robert Half', type: 'direct', coverage: 'Recruitment agency', buildUrl: ({ role, location, country }) => country === 'ksa' ? googleFallback('site:roberthalf.com jobs', role, location) : `https://www.roberthalf.com/ae/en/jobs?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}` },
      { id: 'hays', name: 'Hays', type: 'google', coverage: 'Recruitment agency', buildUrl: ({ role, location }) => googleFallback('site:hays.ae jobs', role, location) },
      { id: 'charterhouse', name: 'Charterhouse ME', type: 'google', coverage: 'Recruitment agency', buildUrl: ({ role, location }) => googleFallback('site:charterhouseme.ae jobs', role, location) }
    ] }
  ]
};

function slug(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'jobs';
}

function googleFallback(scope, role, location) {
  const terms = [scope, role, location].filter(Boolean).join(' ');
  return `https://www.google.com/search?q=${encodeURIComponent(terms || 'jobs')}`;
}

function getPlatformGroups() {
  return Array.isArray(GULF_PLATFORM_CONFIG.groups) ? GULF_PLATFORM_CONFIG.groups : [];
}

function getPlatformSearchUrl(platform, query = {}) {
  const role = String(query.role || '').trim();
  const country = query.country || 'uae';
  const config = GULF_PLATFORM_CONFIG.countries[country] || GULF_PLATFORM_CONFIG.countries.uae;
  const city = String(query.city || '').trim();
  const location = city || config.searchLocation;
  try {
    const url = platform.buildUrl({ role, city, location, country });
    return url || googleFallback(`site:${platform.id}`, role, location);
  } catch (error) {
    return googleFallback(`site:${platform.id}`, role, location);
  }
}

window.GULF_PLATFORM_CONFIG = GULF_PLATFORM_CONFIG;
window.getPlatformGroups = getPlatformGroups;
window.getPlatformSearchUrl = getPlatformSearchUrl;
