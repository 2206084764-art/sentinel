import test from 'node:test';
import assert from 'node:assert/strict';
import { eventState, zoomLink, attribution, decorateUrl, countdown, track } from '../src/runtime.mjs';

test('unknown events never register or reuse an old URL', () => {
  assert.equal(eventState({}).status, 'pending');
  assert.equal(eventState({}).url, '');
  assert.equal(zoomLink('https://zoom.us.evil.example/form'), '');
  assert.equal(zoomLink('javascript:alert(1)'), '');
  assert.equal(zoomLink('https://user:pass@zoom.us/form'), '');
  assert.equal(eventState({ zoomUrl: 'https://events.zoom.us/ev/example' }).status, 'open');
});
test('ended events do not send visitors to expired registration', () => {
  assert.equal(eventState({ endISO: '2020-01-01T00:00:00Z', zoomUrl: 'https://zoom.us/form' }).url, '');
  assert.equal(eventState({ endISO: '2020-01-01T00:00:00Z', replayUrl: 'https://www.streamax.com/replay' }).status, 'ended');
});
test('attribution keeps real traffic sources and preserves destination queries', () => {
  const attrs = attribution('?utm_source=email&utm_campaign=launch', '', '/sentinel/');
  assert.equal(attrs.utm_source, 'email');
  assert.equal(attribution('', '', '/').utm_source, 'direct');
  assert.equal(attribution('', '', '/', null).utm_source, 'direct');
  assert.equal(attribution('', 'https://example.com/story', '/').utm_source, 'example.com');
  const url = new URL(decorateUrl('https://events.zoom.us/ev/test?token=keep&utm_source=partner', attrs));
  assert.equal(url.searchParams.get('token'), 'keep');
  assert.equal(url.searchParams.get('utm_source'), 'partner');
  assert.equal(url.searchParams.get('utm_campaign'), 'launch');
  assert.equal(decorateUrl('javascript:bad', attrs), '');
  assert.deepEqual(countdown(90061), [1, 1, 1, 1]);
});

test('GA4 direct sends one event; GTM only queues a custom event', () => {
  const calls = [];
  globalThis.window = { dataLayer: [], __sentinelAnalyticsMode: 'ga4', gtag: (...args) => calls.push(args) };
  globalThis.location = { search: '?utm_source=qa', pathname: '/sentinel/', origin: 'https://example.test' };
  globalThis.document = { referrer: 'https://example.test/sentinel/' };
  globalThis.sessionStorage = { getItem: () => null, setItem: () => {} };
  track('webinar_cta_click', { placement: 'test' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'event');
  assert.equal(calls[0][1], 'webinar_cta_click');
  assert.equal(window.dataLayer.length, 1);
  window.__sentinelAnalyticsMode = 'gtm';
  track('webinar_cta_click', { placement: 'test' });
  assert.equal(calls.length, 1);
  assert.equal(window.dataLayer.length, 2);
  delete globalThis.window; delete globalThis.location; delete globalThis.document; delete globalThis.sessionStorage;
});
