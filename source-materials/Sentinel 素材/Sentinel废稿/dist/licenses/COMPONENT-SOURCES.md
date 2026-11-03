# Sentinel component source audit — 2026-09-20

These are specific components obtained from official public pages for incorporation into the Sentinel site, not a mirror or standalone library distribution.

## React Bits

Source registry URLs (official copy-ready payloads):

- `https://reactbits.dev/r/BlurText-JS-CSS` → `BlurText.jsx`; dependency `motion@^12.23.12`.
- `https://reactbits.dev/r/SpotlightCard-JS-CSS` → `SpotlightCard.jsx` + `SpotlightCard.css`; React only.
- `https://reactbits.dev/r/CountUp-JS-CSS` → `CountUp.jsx`; dependency `motion@^12.23.12`.
- `https://reactbits.dev/r/Magnet-JS-CSS` → `Magnet.jsx`; React only.

License: MIT + Commons Clause, copyright David Haz 2026. Include `reactbits-LICENSE.md` in the real site repository and identify adapted components. Incorporation into an application/site is allowed; standalone component redistribution is restricted.

Official license: https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md

## OriginKit

Downloaded public page HTML includes React export source in its server-rendered payload. `extract-sources.cjs` selects only the individual chosen component source records. TSX files preserve the official exported code before site-specific changes.

### Compare Slider

- Page/source: https://www.originkit.dev/components/compare-slider
- File: `compare-slider.tsx`; React only; 9.6 KB.
- Props: `beforeImage`, `afterImage` accept string or `{src}`; `start` percentage; `followHover`; `handleColor`, `arrowColor`, `handleSize`, `lineWidth`, `rounded`, `showLabels`, `beforeLabel`, `afterLabel`, `labelFont`, `labelColor`, `labelFill`, `style`.
- Recommended: local night-vision imagery, `start={50}`, `followHover={false}`, `handleSize={48}`, `lineWidth={2}`, lime handle, dark arrows, label font 12–13px.
- Parent needs explicit height/aspect ratio because internal height is 100%.
- Required adaptations: replace default Unsplash photos; change container `touchAction` from `none` to `pan-y`; supply meaningful image/slider labels; add `aria-valuetext` if useful. Existing Left/Right, Shift+arrow, Home/End keyboard handlers already work.

### Blur Carousel

- Page/source: https://www.originkit.dev/components/blurcarousel
- File: `blurcarousel-3.tsx` is the direct component, 17.2 KB. `blurcarousel.tsx` adds an unnecessary preset wrapper. React only, no animation dependency.
- Props: `slides=[{image:{src,alt},title}]`, `movement`, `cardWidth`, `cardHeight`, `radius` (0–20 relative, NOT pixels), `tilt`, `blurAmount`, `arrowColor`, `arrowInactiveColor`, `arrowSize`, `autoplay`, `transition`, `showTitle`, `titleFont`, `titleColor`, `titlePosition`, `style`.
- Recommended: `movement="horizontal"`, `tilt={8}`, `blurAmount={12}`, `arrowSize={28}` (46px target), `autoplay={false}`, `transition={{duration:.45,ease:[.2,.8,.2,1]}}`, 16:9 local evidence photos.
- Required adaptations: remove hardcoded imagedelivery.net demo photos; make frame width `100%` with `maxWidth:cardWidth` and responsive aspect ratio; remove root `outline:none`; name carousel; hide inactive images/titles from accessibility tree; add current-slide announcement.
- Arrows are currently `div role="button"` with pointer handlers only. Add keyboard Enter/Space handlers and tabIndex or use native buttons. Do not combine the existing pointerup navigation with onClick navigation or it will advance twice.
- Root currently supports Left/Right keys. Component lacks reduced-motion handling; set transition duration and tilt to 0 under preference. Do not enable autoplay without pause/visibility handling (official autoplay disables pointer navigation and runs continuously).

### Arrow Reveal Button

- Page/source: https://www.originkit.dev/components/arrow-reveal-button
- File: `arrow-reveal-button.tsx`; 30.1 KB; `motion/react` plus React.
- Props: `label`, `font`, `padding`, `rounded` (0–100 percentage), `colors:{fill,textColor,hoverFill,hoverTextColor}`, `border`, `icon`, `gap`, `link`, `newTab`, `transition`, `style`.
- Recommended: `label="Reserve your seat"`, `link="#register"`, `newTab={false}`, `rounded={100}`, `padding="8px 20px 8px 8px"`, `gap={22}`, `font={{fontSize:15,fontWeight:600}}`, `icon={{type:'icon',icon:'arrow',side:'right',size:18,badgeSize:36,padding:9,background:'#c6fb50',color:'#101410',restAngle:0,hoverAngle:-45}}`.
- Already respects reduced motion, disconnects ResizeObserver, and uses noopener noreferrer for new-tab links. No external image is fetched with built-in icon mode.
- Add an `onClick` prop forwarded to the internal Tag for reliable CTA tracking/modal behavior; not currently exposed. Add focus-visible ring and onFocus/onBlur using the existing enter/leave handlers. Reset press on pointercancel. Keep label readable if a hovered badge obscures it too aggressively for the primary conversion CTA.

## OriginKit license

Official terms: https://www.originkit.dev/docs/licensing (updated 2026-08-19).

The custom license permits use/modification in commercial marketing sites, client work, and actual open-source application/site repositories. Attribution is optional. It is not an MIT component license. Do not redistribute as templates, starter kits, component catalogs, or standalone assets. A specific Sentinel product site with locally adapted source is permitted; describe the package as the Sentinel site, not a reusable website template.

Demo fonts/images are not included in OriginKit's license. All demo image URLs above must be removed/replaced with Sentinel-owned images, even though currently supplied props would override them.

License saving via a subsequent curl was blocked by an account-usage approval error; license content was already readable in the official web search result. No blocked request was bypassed.
