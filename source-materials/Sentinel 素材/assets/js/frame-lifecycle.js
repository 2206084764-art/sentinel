(() => {
  const nativeRAF = window.requestAnimationFrame.bind(window);
  const nativeCancel = window.cancelAnimationFrame.bind(window);
  const pending = new Map();
  const scheduled = new Map();
  let running = true;
  let next = 0;
  function schedule(id) {
    scheduled.set(id, nativeRAF((time) => {
      scheduled.delete(id);
      const callback = pending.get(id);
      pending.delete(id);
      if (callback) callback(time);
    }));
  }
  window.requestAnimationFrame = (callback) => {
    const id = ++next;
    pending.set(id, callback);
    if (running) schedule(id);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    if (scheduled.has(id)) nativeCancel(scheduled.get(id));
    scheduled.delete(id);
    pending.delete(id);
  };
  window.addEventListener('message', ({ source, origin, data }) => {
    if (source !== parent || origin !== location.origin || data?.channel !== 'sentinel') return;
    if (data.action === 'pause') {
      running = false;
      scheduled.forEach(nativeCancel);
      scheduled.clear();
    } else if (data.action === 'activate') {
      if (!running) {
        running = true;
        pending.forEach((callback, id) => schedule(id));
      }
    } else if (data.action === 'dispose') {
      running = false;
      scheduled.forEach(nativeCancel);
      scheduled.clear();
      pending.clear();
      window.SENTINEL_FRAME_API?.dispose();
    } else window.SENTINEL_FRAME_API?.command(data);
  });
  window.addEventListener('error', () => parent.postMessage({ channel: 'sentinel', type: 'scene-error' }, location.origin));
})();
