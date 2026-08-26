(function () {
  'use strict';

  var config = window.JOBHUB_SUPABASE_CONFIG;
  if (!config || !config.url || !config.publishableKey || /YOUR_|YOUR_PROJECT/.test(config.url + config.publishableKey)) {
    window.JobHubSearchSync = { enabled: false, reason: 'Supabase configuration is not installed.' };
    return;
  }

  var clientPromise = import('https://esm.sh/@supabase/supabase-js@2').then(function (module) {
    return module.createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  });
  var MAX_ENTRIES = 6;

  function normalise(entry) {
    return {
      role: String(entry.role || '').trim().slice(0, 80),
      country: String(entry.country || ''),
      city: String(entry.city || 'any'),
      deleted_at: null
    };
  }
  function redirectUrl() { return window.location.origin + window.location.pathname; }
  async function user() {
    var client = await clientPromise;
    var result = await client.auth.getUser();
    return result.data.user || null;
  }
  async function signInWithEmail(email) {
    var client = await clientPromise;
    return client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: redirectUrl() } });
  }
  async function signOut() {
    var client = await clientPromise;
    return client.auth.signOut();
  }
  async function list() {
    var currentUser = await user();
    if (!currentUser) return [];
    var client = await clientPromise;
    var result = await client.from('user_search_history').select('id,role,country,city,created_at,updated_at,deleted_at').is('deleted_at', null).order('updated_at', { ascending: false }).limit(MAX_ENTRIES);
    if (result.error) throw result.error;
    return result.data || [];
  }
  async function upsert(entry) {
    var currentUser = await user();
    if (!currentUser) return null;
    var record = normalise(entry);
    var client = await clientPromise;
    var result = await client.from('user_search_history').upsert(Object.assign({ user_id: currentUser.id }, record), { onConflict: 'user_id,normalized_role,country,city' }).select().single();
    if (result.error) throw result.error;
    return result.data;
  }
  async function clearEverywhere() {
    var currentUser = await user();
    if (!currentUser) return;
    var client = await clientPromise;
    var result = await client.from('user_search_history').update({ deleted_at: new Date().toISOString() }).eq('user_id', currentUser.id).is('deleted_at', null);
    if (result.error) throw result.error;
  }
  async function merge(localEntries) {
    var cloudEntries = await list();
    var merged = new Map();
    localEntries.concat(cloudEntries).forEach(function (entry) {
      var safe = normalise(entry);
      var key = [safe.role.toLowerCase(), safe.country, safe.city].join('|');
      var previous = merged.get(key);
      if (!previous || new Date(entry.updated_at || entry.createdAt || 0) > new Date(previous.updated_at || previous.createdAt || 0)) merged.set(key, Object.assign({}, entry, safe));
    });
    return Array.from(merged.values()).sort(function (a, b) { return new Date(b.updated_at || b.createdAt || 0) - new Date(a.updated_at || a.createdAt || 0); }).slice(0, MAX_ENTRIES);
  }
  window.JobHubSearchSync = {
    enabled: true,
    signInWithEmail: signInWithEmail,
    signOut: signOut,
    user: user,
    list: list,
    upsert: upsert,
    merge: merge,
    clearEverywhere: clearEverywhere
  };
}());
