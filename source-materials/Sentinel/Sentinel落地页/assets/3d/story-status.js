/* Status bridge for the three inline product scenes. */
(() => {
  if (new URLSearchParams(location.search).get('story') !== '1') return;
  let ready = false;
  const send = type => parent.postMessage({type}, location.origin === 'null' ? '*' : location.origin);
  window.SentinelStory = {
    ready() {if (!ready) {ready = true; requestAnimationFrame(() => send('sentinel-scene-ready'));}},
    error() {send('sentinel-scene-error');}
  };
  window.addEventListener('error', () => window.SentinelStory.error());
  window.addEventListener('unhandledrejection', () => window.SentinelStory.error());
  document.addEventListener('webglcontextlost', () => window.SentinelStory.error(), true);
})();
