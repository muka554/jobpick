const GULF_PLATFORM_CONFIG = {
  version: 1,
  countries: {
    uae: { label: 'United Arab Emirates', cities: { any: '', dubai: 'Dubai', abudhabi: 'Abu Dhabi', sharjah: 'Sharjah' } },
    ksa: { label: 'Saudi Arabia', cities: { any: '', riyadh: 'Riyadh', jeddah: 'Jeddah', dammam: 'Dammam' } }
  },
  groups: [
    { id: 'general', title: 'General & Global Boards', platforms: [
      { id: 'bayt', name: 'Bayt.com', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, city, country }) => `https://www.bayt.com/en/${country === 'ksa' ? 'saudi-arabia' : 'uae'}/jobs/${slug(role)}${city ? `/?location=${encodeURIComponent(city)}` : '/'}` },
      { id: 'linkedin', name: 'LinkedIn Jobs', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, city }) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}${city ? `&location=${encodeURIComponent(city)}` : ''}` },
      { id: 'indeed', name: 'Indeed', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, city, country }) => `https://${country === 'ksa' ? 'sa.indeed.com' : 'ae.indeed.com'}/jobs?q=${encodeURIComponent(role)}${city ? `&l=${encodeURIComponent(city)}` : ''}` },
      { id: 'glassdoor', name: 'Glassdoor', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, city }) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(role)}${city ? `&locT=C&locId=&locKeyword=${encodeURIComponent(city)}` : ''}` },
      { id: 'google-jobs', name: 'Google for Jobs', type: 'google', coverage: 'Aggregated listings', buildUrl: ({ role, city }) => googleFallback('jobs', role, city) }
    ] },
    { id: 'gulf', title: 'Gulf Specialist Boards', platforms: [
      { id: 'gulftalent', name: 'GulfTalent', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, city }) => `https://www.gulftalent.com/jobs/search?search=${encodeURIComponent(role)}${city ? `&location=${encodeURIComponent(city)}` : ''}` },
      { id: 'naukrigulf', name: 'Naukrigulf', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, city }) => `https://www.naukrigulf.com/${slug(role)}-jobs${city ? `?location=${encodeURIComponent(city)}` : ''}` },
      { id: 'foundit', name: 'foundit Gulf', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, city }) => `https://www.founditgulf.com/srp/results?query=${encodeURIComponent(role)}${city ? `&locations=${encodeURIComponent(city)}` : ''}` },
      { id: 'laimoon', name: 'Laimoon', type: 'direct', coverage: 'Gulf jobs', buildUrl: ({ role, city, country }) => `https://uae.laimoon.com/jobs/${slug(role)}${city ? `?location=${encodeURIComponent(city)}` : ''}` },
      { id: 'akhtaboot', name: 'Akhtaboot', type: 'google', coverage: 'Gulf jobs', buildUrl: ({ role, city }) => googleFallback('site:akhtaboot.com', role, city) },
      { id: 'rigzone', name: 'Rigzone', type: 'direct', coverage: 'Energy jobs', buildUrl: ({ role, city }) => `https://www.rigzone.com/oil/jobs/search/?q=${encodeURIComponent(role)}${city ? `&location=${encodeURIComponent(city)}` : ''}` }
    ] },
    { id: 'agencies', title: 'Recruitment Agencies', platforms: [
      { id: 'michael-page', name: 'Michael Page', type: 'direct', coverage: 'Recruitment agency', buildUrl: ({ role, city }) => `https://www.michaelpage.ae/en/search-jobs?keyword=${encodeURIComponent(role)}${city ? `&location=${encodeURIComponent(city)}` : ''}` },
      { id: 'robert-half', name: 'Robert Half', type: 'direct', coverage: 'Recruitment agency', buildUrl: ({ role, city }) => `https://www.roberthalf.com/ae/en/jobs?keywords=${encodeURIComponent(role)}${city ? `&location=${encodeURIComponent(city)}` : ''}` },
      { id: 'hays', name: 'Hays', type: 'google', coverage: 'Recruitment agency', buildUrl: ({ role, city }) => googleFallback('site:hays.ae', role, city) },
      { id: 'charterhouse', name: 'Charterhouse ME', type: 'google', coverage: 'Recruitment agency', buildUrl: ({ role, city }) => googleFallback('site:charterhouseme.ae', role, city) }
    ] }
  ]
};

function slug(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'jobs';
}

function googleFallback(scope, role, city) {
  const terms = [scope, role, city].filter(Boolean).join(' ');
  return `https://www.google.com/search?q=${encodeURIComponent(terms || 'jobs')}`;
}

function getPlatformGroups() {
  return GULF_PLATFORM_CONFIG.groups;
}

function getPlatformSearchUrl(platform, query) {
  try {
    return platform.buildUrl({
      role: String(query.role || '').trim(),
      city: String(query.city || '').trim(),
      country: query.country || 'uae'
    });
  } catch (error) {
    return googleFallback(`site:${platform.id}`, query.role, query.city);
  }
}

window.GULF_PLATFORM_CONFIG = GULF_PLATFORM_CONFIG;
window.getPlatformGroups = getPlatformGroups;
window.getPlatformSearchUrl = getPlatformSearchUrl;
