/* Original installation content and two independent coverage controls from the marketing reference. */
window.SENTINEL_INSTALLATION = {
  createComponent(React, jsx) {
    const html = `<div class="wrap">
      <div class="mount-grid"><div class="mount-copy">
        <div class="eyebrow reveal">Installation</div>
        <h2 class="reveal d1" id="installation-title">Mounts where it <span class="grad">sees the most.</span></h2>
        <p class="reveal d2" style="color:var(--grey);font-size:1.1rem;margin-top:1.1rem;max-width:520px;">Mounted on the <b style="color:#F6F8F2">cab roof, facing forward</b> — a clean sightline down the flank and the road ahead. The green volume shows the ground it watches. No recorder to wire into the cab.</p>
        <div class="mount-facts reveal d3">
          <div><b>Cab-roof</b><span>forward-facing<br>vantage point</span></div>
          <div><b>Tool-free</b><span>mount in<br>minutes</span></div>
          <div><b>Self-powered</b><span>runs on the<br>truck battery</span></div>
        </div>
      </div></div>
      <div class="mount-stage" data-state="poster">
        <img class="mount-poster" src="./assets/images/installation-mount-poster.png" alt="Sentinel cab-roof and rear units with their monitoring coverage" loading="lazy">
        <iframe id="mountModel" data-src="./assets/3d/marketing-installation.html" scrolling="no" title="Where Sentinel mounts on the truck"></iframe>
      </div>
      <div class="mount-toggles" id="mountToggles">
        <button type="button" class="mbtn on" data-unit="1" aria-pressed="true">Cab-roof unit</button>
        <button type="button" class="mbtn on" data-unit="2" aria-pressed="true">Rear unit</button>
        <span class="mhint">Click to show each unit&rsquo;s coverage</span>
      </div>
    </div>`;
    return function SentinelInstallation({reduced = false}) {
      const root = React.useRef(null), units = React.useRef([true, true]);
      React.useEffect(() => {
        const section = root.current, stage = section.querySelector('.mount-stage');
        const frame = section.querySelector('#mountModel'), buttons = [...section.querySelectorAll('.mbtn')];
        let visible = false, ready = false, failed = false, manual = false, timeout;
        const origin = location.protocol === 'file:' ? '*' : location.origin;
        const post = () => frame.contentWindow?.postMessage({type:'sent-set', units:units.current.slice()}, origin);
        const updateButtons = () => buttons.forEach((button,index) => {
          button.classList.toggle('on', units.current[index]); button.setAttribute('aria-pressed', String(units.current[index]));
        });
        const unload = () => {
          ready = false; clearTimeout(timeout); frame.classList.remove('is-ready');
          if (frame.hasAttribute('src')) frame.removeAttribute('src');
        };
        const sync = () => {
          if (visible && !document.hidden && !failed && (!reduced || manual)) {
            if (!frame.hasAttribute('src')) {
              stage.dataset.state = 'loading';
              frame.src = `./assets/3d/marketing-installation.html?units=${units.current.map(on=>on?'1':'0').join('')}${reduced?'&motion=reduce':''}`;
              timeout = setTimeout(error, 45000);
            }
          } else {unload(); stage.dataset.state = failed ? 'fallback' : 'poster';}
        };
        function error() {failed = true; sync();}
        const receive = event => {
          if (event.source !== frame.contentWindow || !frame.hasAttribute('src')) return;
          if (location.protocol !== 'file:' && event.origin !== location.origin) return;
          if (event.data?.type === 'sentinel-installation-ready') {
            clearTimeout(timeout); ready = true; frame.classList.add('is-ready'); stage.dataset.state = 'ready'; post();
          } else if (event.data?.type === 'sentinel-installation-error') error();
          else if (ready && event.data?.type === 'sent-state' && Array.isArray(event.data.units) && event.data.units.length === 2 && event.data.units.every(on=>typeof on==='boolean')) {
            units.current = event.data.units.slice(); updateButtons();
          }
        };
        const choose = event => {
          const button = event.target.closest('.mbtn'); if (!button) return;
          const index = buttons.indexOf(button); if (index < 0) return;
          units.current[index] = !units.current[index]; manual = true; failed = false; updateButtons();
          if (ready) post(); else sync();
        };
        updateButtons();
        section.querySelector('#mountToggles').addEventListener('click', choose);
        frame.addEventListener('error', error); window.addEventListener('message', receive);
        document.addEventListener('visibilitychange', sync);
        const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; sync();}, {rootMargin:'300px 0px'});
        observer.observe(stage);
        const reveal = new IntersectionObserver(entries => {
          entries.forEach(entry => {if (entry.isIntersecting) {entry.target.classList.add('in'); reveal.unobserve(entry.target);}});
        }, {threshold:.15});
        section.querySelectorAll('.reveal').forEach(element => {if (reduced) element.classList.add('in'); else reveal.observe(element);});
        return () => {
          observer.disconnect(); reveal.disconnect(); unload();
          section.querySelector('#mountToggles').removeEventListener('click', choose); frame.removeEventListener('error', error);
          window.removeEventListener('message', receive); document.removeEventListener('visibilitychange', sync);
        };
      }, [reduced]);
      return jsx.jsx('section', {
        ref:root, id:'installation', className:`section installation-section${reduced?' is-reduced':''}`,
        'aria-labelledby':'installation-title', dangerouslySetInnerHTML:{__html:html}
      });
    };
  }
};
