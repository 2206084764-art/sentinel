/* Original IoT markup, view controls and lazy loading from Sentinel-Marketing.html. */
window.SENTINEL_IOT = {
  createComponent(React, jsx) {
    const html = "<section class=\"sec iotsec\" id=\"connected\" aria-labelledby=\"connected-title\">\n  <div class=\"wrap\">\n    <div class=\"iot-grid\">\n      <div class=\"iot-copy\">\n        <div class=\"eyebrow reveal\">IoT Synergies</div>\n        <h2 class=\"reveal d1\" id=\"connected-title\">One camera.<br><span class=\"grad\">Full asset awareness.</span></h2>\n        <p class=\"reveal d2\" style=\"color:var(--grey);font-size:1.1rem;margin-top:1.1rem;max-width:500px;\">Sentinel is the hub, not just the eyes. It links the truck&rsquo;s onboard sensors over Wi&#8209;Fi and Bluetooth into one unified alert stream &mdash; <b style=\"color:#F6F8F2\">no second gateway, no second SIM.</b></p>\n        <div class=\"iot-sensors reveal d3\">\n          <div><i style=\"--c:#C4E63C\"></i><b>Fuel sensor</b><span>Tank level and drain rate</span></div>\n          <div><i style=\"--c:#AACC03\"></i><b>Tire pressure</b><span>Per-axle bar and temperature</span></div>\n          <div><i style=\"--c:#D5ED82\"></i><b>Temp &amp; humidity</b><span>Cold-chain cargo hold</span></div>\n          <div><i style=\"--c:#7F9D35\"></i><b>Cargo door</b><span>Open, closed and seal time</span></div>\n        </div>\n        <p class=\"iot-foot reveal d3\">Every sensor alert arrives with Sentinel footage attached &mdash; <b>the data tells you what happened, the video shows you who.</b></p>\n      </div>\n    </div>\n    <div class=\"iot-stage\" data-state=\"poster\">\n      <img class=\"iot-poster\" src=\"./assets/images/iot-marketing-wireframe.png\" alt=\"Sentinel connected to vehicle sensors\" loading=\"lazy\"><iframe id=\"iotModel\" data-src=\"./assets/3d/marketing-iot.html?mode=wireframe\" scrolling=\"no\" title=\"Sentinel as the truck&rsquo;s IoT hub &mdash; 3D model\"></iframe>\n    </div>\n    <div class=\"iot-toggles\" id=\"iotToggles\">\n      <button class=\"mbtn on\" data-mode=\"wireframe\" aria-pressed=\"true\">Wireframe</button>\n      <button class=\"mbtn\" data-mode=\"solid\" aria-pressed=\"false\">Solid</button>\n      <button class=\"mbtn\" data-mode=\"particles\" aria-pressed=\"false\">Point cloud</button>\n      <span class=\"mhint\">Drag to orbit &middot; switch the view</span>\n    </div>\n  </div>\n</section>";
    return function SentinelIoT({reduced = false}) {
      const root = React.useRef(null), selected = React.useRef('wireframe');
      React.useEffect(() => {
        const section = root.current.querySelector('#connected'), stage = section.querySelector('.iot-stage');
        const frame = section.querySelector('#iotModel'), buttons = [...section.querySelectorAll('.mbtn')];
        let visible = false, ready = false, failed = false, manual = false, timeout;
        const origin = location.protocol === 'file:' ? '*' : location.origin;
        const post = () => frame.contentWindow?.postMessage({type: 'iot-set', mode: selected.current}, origin);
        const unload = () => {
          ready = false; clearTimeout(timeout); frame.classList.remove('is-ready');
          if (frame.hasAttribute('src')) frame.removeAttribute('src');
        };
        const sync = () => {
          if (visible && !document.hidden && !failed && (!reduced || manual)) {
            if (!frame.hasAttribute('src')) {
              stage.dataset.state = 'loading';
              frame.src = `./assets/3d/marketing-iot.html?mode=${selected.current}${reduced ? '&motion=reduce' : ''}`;
              timeout = setTimeout(error, 45000);
            }
          } else {unload(); stage.dataset.state = failed ? 'fallback' : 'poster';}
        };
        function error() {failed = true; sync();}
        const receive = event => {
          if (event.source !== frame.contentWindow || !frame.hasAttribute('src')) return;
          if (location.protocol !== 'file:' && event.origin !== location.origin) return;
          if (event.data?.type === 'sentinel-iot-ready') {
            clearTimeout(timeout); ready = true; frame.classList.add('is-ready'); stage.dataset.state = 'ready'; post();
          } else if (event.data?.type === 'sentinel-iot-error') error();
          else if (ready && event.data?.type === 'iot-state' && ['solid', 'wireframe', 'particles'].includes(event.data.mode)) {
            selected.current = event.data.mode; updateButtons();
          }
        };
        function updateButtons() {
          buttons.forEach(button => {const on = button.dataset.mode === selected.current; button.classList.toggle('on', on); button.setAttribute('aria-pressed', String(on));});
        }
        const choose = event => {
          const button = event.target.closest('.mbtn'); if (!button) return;
          selected.current = button.dataset.mode; manual = true; failed = false; updateButtons();
          if (ready) post(); else sync();
        };
        updateButtons(); section.classList.toggle('is-reduced', reduced);
        section.querySelector('#iotToggles').addEventListener('click', choose);
        frame.addEventListener('error', error); window.addEventListener('message', receive);
        document.addEventListener('visibilitychange', sync);
        const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; sync();}, {rootMargin: '300px 0px'});
        observer.observe(stage);
        const reveal = new IntersectionObserver(entries => {
          entries.forEach(entry => {if (entry.isIntersecting) {entry.target.classList.add('in'); reveal.unobserve(entry.target);}});
        }, {threshold: .15});
        section.querySelectorAll('.reveal').forEach(element => {if (reduced) element.classList.add('in'); else reveal.observe(element);});
        return () => {
          observer.disconnect(); reveal.disconnect(); unload();
          section.querySelector('#iotToggles').removeEventListener('click', choose); frame.removeEventListener('error', error);
          window.removeEventListener('message', receive); document.removeEventListener('visibilitychange', sync);
        };
      }, [reduced]);
      return jsx.jsx('div', {ref: root, className: 'iot-reference-slot', dangerouslySetInnerHTML: {__html: html}});
    };
  }
};
