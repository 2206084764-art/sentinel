/* Native product loops with visible-only playback and AOV angle scrubbing. */
window.SENTINEL_CONTEXT_SCENES = {
  createLoopComponent(React, jsx) {
    return function GlobeLoop({title, poster, caption, reduced = false}) {
      const media = React.useRef(null);
      const [playing, setPlaying] = React.useState(false);
      const [mode, setMode] = React.useState(null);
      const [failed, setFailed] = React.useState(false);
      React.useEffect(() => {
        const video = media.current;
        if (!video || failed) return;
        let visible = false;
        const sync = () => {
          if (visible && !document.hidden && mode !== 'pause' && (!reduced || mode === 'play')) {
            video.play().catch(() => setPlaying(false));
          } else video.pause();
        };
        const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; sync();}, {threshold: 0});
        observer.observe(video);
        const warmup = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && (!reduced || mode === 'play')) {
            video.preload = 'auto'; warmup.disconnect();
          }
        }, {rootMargin: '600px 0px'});
        warmup.observe(video);
        document.addEventListener('visibilitychange', sync);
        return () => {observer.disconnect(); warmup.disconnect(); document.removeEventListener('visibilitychange', sync); video.pause();};
      }, [mode, reduced, failed]);
      return jsx.jsxs('figure', {
        className: 'context-scene globe-loop', id: 'scene-globe-sentinel', 'data-scene': 'globe-sentinel',
        'data-state': failed ? 'fallback' : playing ? 'playing' : 'paused',
        children: [
          jsx.jsx('div', {className: 'context-scene-stage', children: failed
            ? jsx.jsx('img', {className: 'context-scene-poster', src: poster, alt: title})
            : jsx.jsx('video', {
                ref: media, className: 'context-scene-video', src: './assets/videos/globe-sentinel-loop.mp4',
                poster, muted: true, loop: true, playsInline: true, preload: reduced ? 'none' : 'metadata', 'aria-label': title,
                onPlay: () => setPlaying(true), onPause: () => setPlaying(false), onError: () => setFailed(true)
              })}),
          jsx.jsxs('figcaption', {children: [jsx.jsx('span', {children: caption}), !failed && jsx.jsx('button', {
            type: 'button', className: 'context-scene-toggle', 'aria-label': `${playing ? 'Pause' : 'Play'} ${title}`,
            'aria-pressed': !playing, onClick: () => setMode(playing ? 'pause' : 'play'),
            children: playing ? 'Pause animation' : 'Play animation'
          })]})
        ]
      });
    };
  },
  createDragVideoComponent(React, jsx) {
    return function DragVideo({title, poster, caption, reduced = false}) {
      const container = React.useRef(null), media = React.useRef(null);
      const pointer = React.useRef(null), pending = React.useRef(null), playback = React.useRef(() => {});
      const [source, setSource] = React.useState(null), [failed, setFailed] = React.useState(false);
      const [playing, setPlaying] = React.useState(false), [mode, setMode] = React.useState(null);
      React.useEffect(() => {
        if (failed) return;
        const controller = new AbortController();
        let destroyed = false, objectURL;
        const load = async () => {
          try {
            let url = './assets/videos/truck-day-night-turntable.mp4';
            if (location.protocol !== 'file:') {
              const response = await fetch(url, {signal: controller.signal});
              if (!response.ok) throw new Error('Video unavailable');
              const blob = await response.blob();
              if (destroyed) return;
              objectURL = URL.createObjectURL(blob); url = objectURL;
            }
            if (!destroyed) setSource(url);
          } catch (error) {if (!destroyed && error.name !== 'AbortError') setFailed(true);}
        };
        const observer = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) {observer.disconnect(); load();}
        }, {rootMargin: '600px 0px'});
        observer.observe(container.current);
        return () => {destroyed = true; controller.abort(); observer.disconnect(); if (objectURL) URL.revokeObjectURL(objectURL);};
      }, [failed]);
      React.useEffect(() => {
        const video = media.current;
        if (!video || failed) return;
        let visible = false;
        const sync = () => {
          if (visible && !document.hidden && !pointer.current && mode !== 'pause' && (!reduced || mode === 'play')) {
            video.play().catch(() => setPlaying(false));
          } else video.pause();
        };
        playback.current = sync;
        const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; sync();});
        observer.observe(video);
        document.addEventListener('visibilitychange', sync);
        return () => {observer.disconnect(); document.removeEventListener('visibilitychange', sync); playback.current = () => {}; video.pause();};
      }, [source, failed, mode, reduced]);
      const seek = () => {
        const video = media.current;
        if (!video || video.seeking || !Number.isFinite(video.duration)) return;
        if (pending.current !== null) {
          const target = pending.current; pending.current = null;
          if (Math.abs(video.currentTime - target) > .025) {video.currentTime = target; return;}
        }
        if (!pointer.current) playback.current();
      };
      const rotate = time => {
        const video = media.current;
        if (!video || !Number.isFinite(video.duration)) return;
        pending.current = ((time % video.duration) + video.duration) % video.duration;
        video.pause(); seek();
      };
      const start = event => {
        const video = media.current;
        if (event.button !== 0 || !video || video.readyState < 2 || !Number.isFinite(video.duration)) return;
        pointer.current = {id: event.pointerId, x: event.clientX, time: video.currentTime, width: video.clientWidth};
        video.pause(); video.setPointerCapture(event.pointerId);
      };
      const move = event => {
        const drag = pointer.current, video = media.current;
        if (drag && drag.id === event.pointerId) rotate(drag.time - (event.clientX - drag.x) / drag.width * video.duration);
      };
      const finish = event => {
        if (!pointer.current || pointer.current.id !== event.pointerId) return;
        pointer.current = null;
        const video = media.current;
        if (video?.hasPointerCapture(event.pointerId)) video.releasePointerCapture(event.pointerId);
        seek();
      };
      return jsx.jsxs('figure', {
        ref: container, id: 'scene-truck-day-night', className: 'context-scene drag-video', 'data-scene': 'truck-day-night',
        'data-state': failed ? 'fallback' : playing ? 'playing' : 'paused', children: [
          jsx.jsx('div', {className: 'context-scene-stage', children: failed
            ? jsx.jsx('img', {className: 'context-scene-poster', src: poster, alt: title})
            : jsx.jsx('video', {
              ref: media, className: 'context-scene-video', src: source || undefined, poster,
              muted: true, loop: true, playsInline: true, preload: 'auto', draggable: false, tabIndex: 0,
              'aria-label': `${title}. Drag left or right to rotate; left and right arrow keys also work.`,
              onLoadedData: () => playback.current(), onPlay: () => setPlaying(true), onPause: () => setPlaying(false),
              onError: () => setFailed(true), onSeeked: seek,
              onPointerDown: start, onPointerMove: move, onPointerUp: finish, onPointerCancel: finish, onLostPointerCapture: finish,
              onKeyDown: event => {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                event.preventDefault(); rotate(media.current.currentTime + (event.key === 'ArrowRight' ? 1 : -1) * media.current.duration / 24);
              }
            })}),
          jsx.jsxs('figcaption', {children: [jsx.jsx('span', {children: caption}), !failed && jsx.jsx('button', {
            type: 'button', className: 'context-scene-toggle', 'aria-label': `${playing ? 'Pause' : 'Play'} ${title}`,
            'aria-pressed': !playing, onClick: () => setMode(playing ? 'pause' : 'play'), children: playing ? 'Pause animation' : 'Play animation'
          })]})
        ]
      });
    };
  },
};
