/* DS100's sticky media pattern: each transition maps its own scroll progress to one clip. */
window.SENTINEL_PRODUCT_FILM = {
  createComponent(React, jsx) {
    const clips = {
      intro: {title: 'Sentinel product introduction.', src: './assets/videos/intro-scroll.mp4', poster: './assets/images/intro-scroll-poster.jpg'},
      product: {title: 'Inside Sentinel.', src: './assets/videos/product-scroll.mp4', poster: './assets/images/product-scroll-poster.jpg', start: 1}
    };
    return function ProductFilm({film = 'product', reduced = false}) {
      const clip = clips[film], root = React.useRef(null);
      React.useEffect(() => {
        if (reduced) return;
        const section = root.current, stage = section.querySelector('.product-film-stage');
        const video = section.querySelector('video');
        let raf = 0, loaded = false, loading = false, destroyed = false, frameReady = false, target = .02, objectURL;
        const loader = new AbortController();
        const clamp = value => Math.max(0, Math.min(1, value));
        const seek = () => {
          if (video.readyState < 1 || video.seeking || !Number.isFinite(video.duration)) return;
          if (Math.abs(video.currentTime - target) > .025) video.currentTime = target;
        };
        const sync = () => {
          raf = 0;
          if (destroyed || document.hidden) return;
          const top = parseFloat(getComputedStyle(section).getPropertyValue('--film-header')) || 0;
          const rect = section.getBoundingClientRect();
          const inline = getComputedStyle(stage).position !== 'sticky';
          const progress = clamp(inline
            ? (innerHeight - rect.top) / Math.max(1, innerHeight - top + rect.height)
            : (top - rect.top) / Math.max(1, section.offsetHeight - stage.offsetHeight));
          const playback = clamp((progress - .02) / .91);
          section.dataset.scrollProgress = progress.toFixed(4);
          // The supplied Intro is a still recording; a brief scroll-driven push gives it movement.
          if (film === 'intro') {
            video.style.transform = `scale(${1 + .06 * playback})`;
            const fade = clamp((progress - .78) / .16);
            section.style.setProperty('--intro-visibility', (1 - fade * fade * (3 - 2 * fade)).toFixed(4));
          }
          if (!loaded || !Number.isFinite(video.duration)) return;
          const start = clip.start || 0;
          target = Math.max(.02, Math.min(video.duration - .06, start + playback * (video.duration - start)));
          video.pause(); seek();
          if (film === 'product') {
            // Reveal only after a frame at the intended time is decoded, never the opening close-up.
            if (!frameReady && video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - target) < .05) frameReady = true;
            const reveal = clamp((progress - .02) / .1);
            section.style.setProperty('--film-reveal', frameReady ? (reveal * reveal * (3 - 2 * reveal)).toFixed(4) : '0');
          }
        };
        const requestSync = () => {if (!raf) raf = requestAnimationFrame(sync);};
        const resize = () => {
          const height = document.querySelector('#streamaxHeader')?.getBoundingClientRect().height || 0;
          section.style.setProperty('--film-header', `${height}px`);
          requestSync();
        };
        const load = async () => {
          if (loaded || loading) return;
          loading = true;
          try {
            // Buffer compact clips to preserve seeking on static previews without HTTP Range support.
            let src = clip.src;
            if (location.protocol !== 'file:') {
              const response = await fetch(src, {signal: loader.signal});
              if (!response.ok) throw new Error('Film unavailable');
              const blob = await response.blob();
              if (destroyed) return;
              objectURL = URL.createObjectURL(blob); src = objectURL;
            }
            if (destroyed) return;
            video.preload = 'auto'; video.src = src; loaded = true; video.load(); requestSync();
          } catch (error) {
            if (error.name !== 'AbortError') section.dataset.mediaState = 'unavailable';
          }
        };
        const metadata = () => {video.pause(); requestSync();};
        const seeked = () => {seek(); requestSync();};
        const failed = () => {section.dataset.mediaState = 'unavailable';};
        video.addEventListener('seeked', seeked);
        video.addEventListener('loadedmetadata', metadata);
        video.addEventListener('loadeddata', requestSync);
        video.addEventListener('error', failed);
        const observer = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) {load(); observer.disconnect();}
        }, {rootMargin: '120% 0px', threshold: 0});
        observer.observe(section);
        window.addEventListener('scroll', requestSync, {passive: true});
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', requestSync);
        resize();
        document.fonts?.ready.then(() => {if (!destroyed) resize();});
        return () => {
          destroyed = true; loader.abort(); observer.disconnect(); cancelAnimationFrame(raf);
          window.removeEventListener('scroll', requestSync); window.removeEventListener('resize', resize);
          document.removeEventListener('visibilitychange', requestSync);
          video.pause(); video.removeEventListener('seeked', seeked);
          video.removeEventListener('loadedmetadata', metadata);
          video.removeEventListener('loadeddata', requestSync);
          video.removeEventListener('error', failed);
          if (objectURL) URL.revokeObjectURL(objectURL);
        };
      }, [film, reduced]);
      return jsx.jsxs('section', {
        ref: root, id: `${film}-film`, className: `product-film product-film--${film} ${reduced ? 'is-static' : ''}`,
        'aria-labelledby': `${film}-film-title`, children: [
          jsx.jsx('h2', {id: `${film}-film-title`, className: 'sr-only', children: clip.title}),
          jsx.jsx('div', {className: 'product-film-stage', children:
            jsx.jsx('div', {className: 'product-film-media', children: reduced
              ? jsx.jsx('img', {src: clip.poster, alt: clip.title, loading: 'lazy', width: 1440, height: 776})
              : jsx.jsx('video', {poster: clip.poster, muted: true, playsInline: true, preload: 'none', 'aria-label': clip.title})
            })
          })
        ]
      });
    };
  }
};
