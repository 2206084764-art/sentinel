/* Original Alerts markup and interaction timings from Sentinel-Marketing.html. */
window.SENTINEL_ALERTS = {
  createComponent(React, jsx) {
    const html = "<section class=\"sec alerts\" id=\"alerts\" aria-labelledby=\"alerts-title\">\n  <div class=\"wrap\">\n    <div class=\"alert-grid\">\n      <div>\n        <div class=\"eyebrow reveal\">Alerts</div>\n        <h2 class=\"reveal d1\" id=\"alerts-title\">The truck is in Kenya.<br><span class=\"grad\">You are not.</span></h2>\n        <p class=\"reveal d2\" style=\"color:var(--grey);font-size:1.1rem;margin-top:1.1rem;max-width:520px;\">When Sentinel decides a behaviour is suspicious, the alert is on your phone in seconds — with the footage already attached. No logging in, no hunting for the clip.</p>\n        <div class=\"alert-steps reveal d3\">\n          <div class=\"astep\"><div class=\"n\">1</div><div class=\"tx\"><b>Sentinel decides it is real</b><span>Posture-level AI filters out the passer-by, the animal, the headlights.</span></div></div>\n          <div class=\"astep\"><div class=\"n\">2</div><div class=\"tx\"><b>The alert leaves over 4G</b><span>No gateway, no separate telematics box — the camera sends it itself.</span></div></div>\n          <div class=\"astep\"><div class=\"n\">3</div><div class=\"tx\"><b>You get the evidence, not a ping</b><span>Plate, location and the clip arrive together, ready to forward.</span></div></div>\n        </div>\n        <div class=\"alert-cta reveal d3\">\n          <button class=\"abtn\" id=\"alertPlay\">Trigger an alert</button>\n          <span class=\"ahint\">or tap the phone</span>\n        </div>\n      </div>\n\n      <div class=\"phone-wrap reveal d2\">\n        <div class=\"phone\" id=\"phone\" role=\"button\" tabindex=\"0\" aria-label=\"Play the alert sequence\">\n          <div class=\"screen\">\n            <div class=\"island\"></div>\n            <div class=\"lock\">\n              <div class=\"day\">Tuesday, 4 August</div>\n              <div class=\"clock\">02:14</div>\n            </div>\n            <div class=\"notes\">\n              <div class=\"note warn\">\n                <div class=\"ni\">!</div>\n                <div class=\"nb\">\n                  <div class=\"nt\"><span>Sentinel</span><em>now</em></div>\n                  <div class=\"nh\">Suspicious activity at the fuel tank</div>\n                  <div class=\"np\">KDG 412M · Nairobi depot · person at tank 40 s</div>\n                  <div class=\"thumb\" style=\"background-image:url('./assets/images/cases/alert-night.webp')\"></div>\n                </div>\n              </div>\n              <div class=\"note warn\">\n                <div class=\"ni\">▼</div>\n                <div class=\"nb\">\n                  <div class=\"nt\"><span>Fuel sensor</span><em>now</em></div>\n                  <div class=\"nh\">Main tank −18 L in 4 minutes</div>\n                  <div class=\"np\">156 L → 138 L · engine off</div>\n                </div>\n              </div>\n              <div class=\"note\">\n                <div class=\"ni\">✓</div>\n                <div class=\"nb\">\n                  <div class=\"nt\"><span>Sentinel</span><em>1 min ago</em></div>\n                  <div class=\"nh\">Clip saved and shared with your fleet team</div>\n                  <div class=\"np\">18 s · full colour · 0.02 lux</div>\n                </div>\n              </div>\n            </div>\n            <div class=\"tapme\">TAP TO REPLAY</div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</section>";
    return function SentinelAlerts({reduced = false}) {
      const root = React.useRef(null);
      React.useEffect(() => {
        const section = root.current.querySelector('#alerts');
        const phone = section.querySelector('#phone'), button = section.querySelector('#alertPlay');
        let busy = false, timer;
        const play = () => {
          if (busy) return;
          busy = true;
          phone.classList.remove('on');
          void phone.offsetWidth;
          phone.classList.add('on');
          timer = setTimeout(() => {busy = false;}, 1900);
        };
        const keydown = event => {
          if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); play();}
        };
        const trigger = event => {event.stopPropagation(); play();};
        phone.addEventListener('click', play);
        phone.addEventListener('keydown', keydown);
        button.addEventListener('click', trigger);
        section.classList.toggle('is-reduced', reduced);
        let entrance, reveal;
        if (reduced) {
          section.querySelectorAll('.reveal').forEach(element => element.classList.add('in'));
          phone.classList.add('on');
        } else {
          entrance = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {play(); entrance.disconnect();}
          }, {threshold: .4});
          entrance.observe(phone);
          reveal = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {entry.target.classList.add('in'); reveal.unobserve(entry.target);}
            });
          }, {threshold: .15});
          section.querySelectorAll('.reveal').forEach(element => reveal.observe(element));
        }
        return () => {
          clearTimeout(timer); entrance?.disconnect(); reveal?.disconnect();
          phone.removeEventListener('click', play); phone.removeEventListener('keydown', keydown);
          button.removeEventListener('click', trigger);
        };
      }, [reduced]);
      return jsx.jsx('div', {ref: root, className: 'alerts-slot', dangerouslySetInnerHTML: {__html: html}});
    };
  }
};
