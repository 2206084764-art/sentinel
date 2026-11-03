import { useEffect, useRef, useState } from 'react';
import { Play, Pause, ArrowUpRight } from 'lucide-react';
import { track } from './runtime.mjs';

export const img = name => `./assets/images/${name}.webp`;
export const video = name => `./assets/videos/${encodeURIComponent(name)}.mp4`;

export function InViewVideo({ name, poster, label, reduced, className = '' }) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [manualPlay, setManualPlay] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = ref.current;
    const loader = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNear(true); loader.disconnect(); } }, { rootMargin: '250px' });
    let visible = false;
    const syncPlayback = () => {
      if (visible && (!reduced || manualPlay) && !manualPause && !document.hidden) element.play().catch(() => {});
      else element.pause();
    };
    const playback = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.35 });
    const visibility = syncPlayback;
    loader.observe(element); playback.observe(element); document.addEventListener('visibilitychange', visibility);
    return () => { loader.disconnect(); playback.disconnect(); element.pause(); document.removeEventListener('visibilitychange', visibility); };
  }, [near, reduced, manualPause, manualPlay]);
  useEffect(() => { if (reduced) setManualPlay(false); }, [reduced]);
  return <div className={`inline-video ${className}`}>
    <video ref={ref} src={near ? video(name) : undefined} poster={img(poster)} muted loop playsInline preload="none" aria-label={label} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)}/>
    <div className="media-caption"><span>{label}</span><button className="icon-button" disabled={failed} aria-label={`${playing ? 'Pause' : 'Play'} ${label}`} onClick={() => {
      if (playing) { setManualPause(true); setManualPlay(false); ref.current.pause(); }
      else { setNear(true); setManualPause(false); setManualPlay(true); ref.current.play().catch(() => {}); track('video_play', { video_title: label }); }
    }}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button></div>
    {failed && <p className="media-error">Video unavailable. The reference image is shown.</p>}
  </div>;
}

const chapters = [
  ['01 / OBSERVE', 'Movement is only', 'the beginning.', 'A person near a parked truck isn’t always a threat. Sentinel keeps watching, without treating every movement the same.'],
  ['02 / UNDERSTAND', 'See the behavior.', 'Read the intent.', 'On-device AI looks at posture and behavior around the vehicle to distinguish suspicious activity from everyday movement.'],
  ['03 / RESPOND', 'The right alert.', 'At the right moment.', 'Surface suspicious activity with visual context, helping your team respond and review what actually happened.'],
];

export function ScrollFilm({ reduced, openVideo }) {
  const section = useRef(null), film = useRef(null), target = useRef(0);
  const [near, setNear] = useState(false), [progress, setProgress] = useState(0), [ready, setReady] = useState(false);
  const [small, setSmall] = useState(() => matchMedia('(max-width: 760px), (max-height: 650px), (pointer: coarse)').matches);
  useEffect(() => {
    const mq = matchMedia('(max-width: 760px), (max-height: 650px), (pointer: coarse)');
    const update = () => setSmall(mq.matches); mq.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNear(true); observer.disconnect(); } }, { rootMargin: '400px' });
    observer.observe(section.current);
    return () => { observer.disconnect(); mq.removeEventListener('change', update); };
  }, []);
  const scrub = !small && !reduced;
  useEffect(() => {
    if (!scrub) return;
    let frame;
    const update = () => {
      frame = null;
      const rect = section.current.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height - innerHeight)));
      setProgress(p); target.current = p;
      const media = film.current;
      if (media && Number.isFinite(media.duration) && !media.seeking) media.currentTime = p * Math.max(0, media.duration - 0.15);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule); update();
    return () => { removeEventListener('scroll', schedule); removeEventListener('resize', schedule); cancelAnimationFrame(frame); };
  }, [scrub, ready]);
  const chapter = Math.min(2, Math.floor(progress * 3));
  return <section className={`scroll-story ${scrub ? 'scrubbing' : 'manual'}`} id="intelligence" ref={section}>
    <div className="story-sticky"><div className="story-topline"><span>02 / INTENT-AWARE AI</span><span>{scrub ? 'SCROLL TO ADVANCE THE FILM' : 'REAL PRODUCT DEMONSTRATION'} <ArrowUpRight size={13}/></span></div>
      <div className="story-screen"><video ref={film} src={near ? video('ai-pose') : undefined} poster={img('ai-still')} muted playsInline controls={!scrub} preload={near ? 'metadata' : 'none'} aria-label="Sentinel intent-aware AI demonstration" onTimeUpdate={e => { if (!scrub && e.currentTarget.duration) setProgress(e.currentTarget.currentTime / e.currentTarget.duration); }} onLoadedMetadata={() => setReady(true)} onSeeked={() => {
        if (!scrub || !film.current) return;
        const t = target.current * (film.current.duration - 0.15);
        if (Math.abs(film.current.currentTime - t) > 0.1) film.current.currentTime = t;
      }}/><div className="story-shade"/><div className="recording-label"><span/>PRODUCT DEMO / INTENT AI</div>
      <div className="story-copy" aria-live="off"><span className="eyebrow">{chapters[chapter][0]}</span><h2>{chapters[chapter][1]}<br/><em>{chapters[chapter][2]}</em></h2><p>{chapters[chapter][3]}</p><button className="text-button" onClick={() => openVideo('ai-pose')}><Play size={15}/>Watch the full film</button></div>
      <div className="story-steps">{chapters.map((part, i) => <button key={part[0]} className={i === chapter ? 'active' : ''} aria-label={`Show ${part[0]}`} aria-pressed={i === chapter} onClick={() => {
        if (scrub) { const top = section.current.getBoundingClientRect().top + scrollY; window.scrollTo({ top: top + (section.current.offsetHeight - innerHeight) * ((i + 0.2) / 3), behavior: 'smooth' }); }
        else { setProgress((i + 0.2) / 3); if (film.current?.duration) film.current.currentTime = ((i + .2) / 3) * film.current.duration; }
      }}><span>0{i + 1}</span><b>{['Observe', 'Understand', 'Respond'][i]}</b><i style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress * 3 - i))})` }}/></button>)}</div></div>
      <div className="story-footnote">Actual demonstration footage. Detection behavior varies with installation, configuration and operating conditions.<a href="#night-vision">Skip to night vision ↓</a></div>
    </div>
  </section>;
}

const models = [
  ['sentinel-only', 'Sentinel / product', 'sentinel-front'],
  ['truck-sentinel-mount', 'Vehicle installation', 'truck-xray'],
  ['truck-sentinel-runner', 'Intent AI simulation', 'ai-still'],
  ['truck64-iot', 'Connected sensors', 'truck-xray'],
  ['truck-day-night', 'Day / night operation', 'hero-truck'],
  ['sentinel-soc', 'Inside the device', 'sentinel-side'],
  ['globe-sentinel', 'Global to Sentinel', 'world-dots'],
  ['globe-only', 'Global coverage', 'world-dots'],
  ['fuel-sensor-wire', 'Fuel sensor', 'truck-xray'],
  ['cctv-camera-wire', 'Conventional camera', 'theft-fuel'],
  ['camera-pod-wire', 'Camera anatomy', 'sentinel-dim'],
];

export function ModelLab({ reduced }) {
  const [model, setModel] = useState(0), [enabled, setEnabled] = useState(false), [visible, setVisible] = useState(false), [loaded, setLoaded] = useState(false), [failure, setFailure] = useState(false);
  const host = useRef(null), frame = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(host.current); return () => observer.disconnect();
  }, []);
  useEffect(() => { setLoaded(false); setFailure(false); }, [model, visible, enabled]);
  useEffect(() => {
    if (!enabled || !visible || loaded) return;
    const ready = e => { if (e.origin === location.origin && e.source === frame.current?.contentWindow && ['s5ready', 'soc-ready'].includes(e.data?.type)) setLoaded(true); };
    addEventListener('message', ready);
    const timeout = setTimeout(() => setFailure(true), 45000);
    return () => { removeEventListener('message', ready); clearTimeout(timeout); };
  }, [enabled, visible, loaded, model]);
  useEffect(() => { if (reduced) setEnabled(false); }, [reduced]);
  const send = payload => frame.current?.contentWindow?.postMessage(payload, location.origin);
  return <div className="model-lab" ref={host}>
    <div className="lab-toolbar"><label htmlFor="model-select">EXPLORE IN 3D</label><select id="model-select" value={model} onChange={e => { setModel(Number(e.target.value)); setEnabled(true); track('model_select', { model: models[Number(e.target.value)][0] }); }}>{models.map((m, i) => <option value={i} key={m[0]}>{m[1]}</option>)}</select></div>
    <div className="model-stage">
      {enabled && visible && !failure ? <><iframe key={models[model][0]} ref={frame} src={`./assets/3d/${models[model][0]}.html${model === 0 && reduced ? '?spin=0' : ''}`} title={`Interactive 3D: ${models[model][1]}`} onLoad={() => { if (![0, 5, 6].includes(model) && frame.current?.contentDocument?.querySelector('canvas')) setLoaded(true); }} onError={() => setFailure(true)} allow="fullscreen"/><div className="lab-status">{loaded ? 'Drag to explore · Concept visualization' : 'Loading 3D scene…'}</div></> : <><img src={img(models[model][2])} alt={models[model][1]} loading="lazy"/>{failure ? <p className="lab-status" role="status">3D could not load on this device. The product image is shown.</p> : <button className="button model-load" onClick={() => { setEnabled(true); track('model_open', { model: models[model][0] }); }}><Play size={16}/>Explore the 3D scene</button>}</>}
    </div>
    <div className="lab-controls">{enabled ? <><span>{models[model][1]}</span>{model === 2 && <><button onClick={() => send({ type: 'runner-toggle' })}>Walk nearby</button><button onClick={() => send({ type: 'runner-steal' })}>Simulate theft</button></>}{model === 6 && <><button onClick={() => send({ type: 's5deploy' })}>Form Sentinel</button><button onClick={() => send({ type: 's5rewind' })}>Return to globe</button></>}{model === 3 && <button onClick={() => send({ type: 'iot-mode' })}>Switch sensor mode</button>}<button onClick={() => setEnabled(false)}>Close 3D</button></> : <span>11 original interactive scenes · Loaded only when you choose</span>}</div>
  </div>;
}
