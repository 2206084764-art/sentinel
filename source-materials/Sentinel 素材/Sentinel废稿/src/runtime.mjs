export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export function safeHttps(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}

export function zoomLink(value) {
  const url = safeHttps(value);
  if (!url) return '';
  const host = new URL(url).hostname;
  return host === 'zoom.us' || host.endsWith('.zoom.us') || host === 'zoom.com' || host.endsWith('.zoom.com') ? url : '';
}

export function eventState(config, now = Date.now()) {
  const start = Date.parse(config.startISO);
  const end = Date.parse(config.endISO);
  if (Number.isFinite(end) && end <= now) {
    return { status: 'ended', url: safeHttps(config.replayUrl), label: config.replayUrl && safeHttps(config.replayUrl) ? 'Watch the replay' : 'Explore Sentinel' };
  }
  const url = zoomLink(config.zoomUrl);
  return { status: url ? 'open' : 'pending', url, label: url ? 'Reserve my spot' : 'Join the launch', seconds: Number.isFinite(start) && start > now ? Math.floor((start - now) / 1000) : null };
}

export function attribution(search, referrer, pathname, stored = {}) {
  if (!stored || typeof stored !== 'object') stored = {};
  const params = new URLSearchParams(search);
  const incoming = Object.fromEntries(UTM_KEYS.filter(key => params.has(key) && params.get(key).trim()).map(key => [key, params.get(key).slice(0, 200)]));
  let source = 'direct';
  try { source = new URL(referrer).hostname; } catch { /* A direct visit has no referrer. */ }
  const result = Object.keys(incoming).length ? incoming : Object.fromEntries(UTM_KEYS.filter(k => typeof stored[k] === 'string').map(k => [k, stored[k].slice(0, 200)]));
  return { utm_source: source, utm_medium: source === 'direct' ? '(none)' : 'referral', ...result, entry_path: pathname, referrer: source === 'direct' ? '' : source };
}

export function decorateUrl(value, attrs) {
  const safe = safeHttps(value);
  if (!safe) return '';
  const url = new URL(safe);
  for (const key of UTM_KEYS) if (attrs[key] && !url.searchParams.has(key)) url.searchParams.set(key, attrs[key]);
  return url.href;
}

export function countdown(seconds) {
  const value = Math.max(0, Math.floor(seconds || 0));
  return [Math.floor(value / 86400), Math.floor(value % 86400 / 3600), Math.floor(value % 3600 / 60), value % 60];
}

export function getAttribution() {
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem('sentinel_attribution') || '{}'); } catch { /* Storage may be blocked. */ }
  let referrer = document.referrer;
  try { if (new URL(referrer).origin === location.origin) referrer = ''; } catch { /* Direct entry. */ }
  const attrs = attribution(location.search, referrer, location.pathname, stored);
  try { sessionStorage.setItem('sentinel_attribution', JSON.stringify(attrs)); } catch { /* No storage is required to browse. */ }
  return attrs;
}

export function track(name, details = {}) {
  window.dataLayer = window.dataLayer || [];
  const params = { product: 'sentinel', ...getAttribution(), ...details };
  window.dataLayer.push({ event: name, ...params });
  if (window.__sentinelAnalyticsMode === 'ga4' && window.gtag) window.gtag('event', name, params);
}

export function enableAnalytics(config) {
  if (window.__sentinelAnalyticsStarted) return;
  window.__sentinelAnalyticsStarted = true;
  const addScript = src => { const script = document.createElement('script'); script.async = true; script.src = src; document.head.append(script); };
  window.dataLayer = window.dataLayer || [];
  if (/^GTM-[A-Z0-9]+$/.test(config.gtmId || '')) {
    window.__sentinelAnalyticsMode = 'gtm';
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    addScript(`https://www.googletagmanager.com/gtm.js?id=${config.gtmId}`);
  } else if (/^G-[A-Z0-9]+$/.test(config.ga4Id || '')) {
    window.__sentinelAnalyticsMode = 'ga4';
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', config.ga4Id);
    addScript(`https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`);
  }
  if (config.linkedinEnabled && /^\d+$/.test(config.linkedinPartnerId || '')) {
    window._linkedin_partner_id = config.linkedinPartnerId;
    window._linkedin_data_partner_ids = [config.linkedinPartnerId];
    addScript('https://snap.licdn.com/li.lms-analytics/insight.min.js');
  }
}
