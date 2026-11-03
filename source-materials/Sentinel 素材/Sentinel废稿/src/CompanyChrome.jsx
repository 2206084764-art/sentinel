import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Globe2, Menu, Pause, Play, X } from 'lucide-react';
import { decorateUrl, track } from './runtime.mjs';
import './company-chrome.css';

const home = 'https://www.streamax.com/';
// Navigation and destinations from the DS100 example's official Streamax chrome.
const navigation = [
  { label: 'Home', path: '' },
  { label: 'Solutions', path: 'category/solutions.html', children: [
    ['About Solution', 'category/solutions.html'],
    ['Trucking Solution', 'category/trucking-solution.html'],
    ['Public Transit Solution', 'category/public-transit-solution.html'],
    ['School Bus Solution', 'category/school-bus-solution.html'],
    ['Taxi Solution', 'category/taxi-solution.html'],
    ['Mining Solution', 'category/mining-solution.html'],
    ['OEM Solution', 'category/oem-solution.html'],
  ] },
  { label: 'Products', path: 'category/products.html', children: [
    ['About Product', 'category/products.html'], ['View All Products', 'category/products-list.html'],
  ] },
  { label: 'Technology', path: 'category/technology.html' },
  { label: 'Resources', path: 'resources/blog.html', children: [
    ['Company News', 'resources/company-news.html'], ['Blog', 'resources/blog.html'],
    ['Cases', 'resources/case.html'], ['FAQ', 'resources/faq.html'],
  ] },
  { label: 'About', path: 'category/about.html', children: [
    ['About Us', 'category/about.html'], ['Events', 'about/events.html'],
  ] },
];

function CompanyLink({ href, attrs, placement, children, ...props }) {
  const destination = decorateUrl(href, attrs);
  return <a {...props} href={destination} onClick={() => track('outbound_click', {
    link_url: destination, link_text: props['aria-label'] || (typeof children === 'string' ? children : href), placement,
  })}>{children}</a>;
}

export function CompanyHeader({ attrs, reduced, paused, setPaused }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const header = useRef(null);
  const toggle = useRef(null);
  useEffect(() => {
    const close = event => { if (!header.current?.contains(event.target)) { setOpen(false); setActive(null); } };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  const linkProps = { attrs, placement: 'header' };
  const dropdownEvents = id => ({
    onMouseEnter: () => { if (matchMedia('(hover: hover)').matches) setActive(id); },
    onMouseLeave: event => { if (!event.currentTarget.contains(document.activeElement)) setActive(null); },
    onBlur: event => { if (!event.currentTarget.contains(event.relatedTarget)) setActive(null); },
    onKeyDown: event => {
      if (event.key === 'Escape' && active === id) {
        event.stopPropagation(); setActive(null);
        event.currentTarget.querySelector('button')?.focus();
      }
    },
  });
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="company-header" ref={header} onKeyDown={event => {
      if (event.key === 'Escape') { setOpen(false); setActive(null); toggle.current?.focus(); }
    }}>
      <div className="company-header-inner">
        <CompanyLink {...linkProps} href={home} className="company-logo" aria-label="Streamax home"><img src="./assets/branding/streamax.webp" alt="Streamax" width="165" height="21"/></CompanyLink>
        <nav className={`company-nav ${open ? 'is-open' : ''}`} id="company-navigation" aria-label="Main navigation">
          <ul>{navigation.map(item => <li key={item.label} {...dropdownEvents(item.label)}>
            <div className="company-nav-row"><CompanyLink {...linkProps} href={home + item.path}>{item.label}</CompanyLink>
              {item.children && <button className="company-submenu-toggle" aria-label={`${item.label} submenu`} aria-expanded={active === item.label} aria-controls={`company-${item.label}`} onClick={() => setActive(active === item.label ? null : item.label)}><ChevronDown size={14} aria-hidden="true"/></button>}
            </div>
            {item.children && <ul className="company-dropdown" id={`company-${item.label}`} hidden={active !== item.label}>{item.children.map(([label, path]) => <li key={label}><CompanyLink {...linkProps} href={home + path}>{label}</CompanyLink></li>)}</ul>}
          </li>)}</ul>
        </nav>
        <div className="company-header-actions">
          <CompanyLink {...linkProps} href={home + 'category/contactform.html'} className="company-contact">Get in Touch<ArrowUpRight size={17} aria-hidden="true"/></CompanyLink>
          <div className="company-language" {...dropdownEvents('languages')}>
            <button className="company-icon" aria-label="Select language" aria-expanded={active === 'languages'} aria-controls="company-languages" onClick={() => setActive(active === 'languages' ? null : 'languages')}><Globe2 size={21}/></button>
            <ul className="company-dropdown" id="company-languages" hidden={active !== 'languages'}><li><CompanyLink {...linkProps} href="https://cn.streamax.com/" lang="zh" target="_blank" rel="noopener noreferrer">中文</CompanyLink></li><li><CompanyLink {...linkProps} href="https://jp.streamax.com/" lang="ja" target="_blank" rel="noopener noreferrer">日本語</CompanyLink></li></ul>
          </div>
          <button className="company-icon" onClick={() => setPaused(!paused)} aria-label={paused ? 'Enable animations (system preference still respected)' : 'Pause animations and automatic video'} aria-pressed={reduced} title={reduced ? 'Motion reduced' : 'Pause motion'}>{reduced ? <Play size={16}/> : <Pause size={16}/>}</button>
          <button ref={toggle} className="company-icon company-menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="company-navigation" onClick={() => { setOpen(!open); setActive(null); }}>{open ? <X size={23}/> : <Menu size={23}/>}</button>
        </div>
      </div>
    </header>
  </>;
}

export function CompanyFooter({ attrs, openPrivacy }) {
  const linkProps = { attrs, placement: 'footer' };
  const social = (href, label) => ({ href, 'aria-label': label, target: '_blank', rel: 'noopener noreferrer', onClick: () => track('outbound_click', { link_url: href, link_text: label, placement: 'footer' }) });
  return <footer className="company-footer">
    <div className="company-footer-inner">
      <div className="company-footer-top">
        <div className="company-footer-contact"><h3><CompanyLink {...linkProps} href={home + 'category/contactform.html'}>Contact Us</CompanyLink></h3><a className="company-phone" href="tel:4009982970">400-998-2970</a><p>6 Temasek Blvd, 35-02 Suntec Tower 4, Singapore 038986, Singapore, SG</p></div>
        <nav className="company-footer-columns" aria-label="Footer navigation">{navigation.slice(1).map(item => <div key={item.label}><h3><CompanyLink {...linkProps} href={home + item.path}>{item.label}</CompanyLink></h3>{item.children && <ul>{item.children.map(([label, path]) => <li key={label}><CompanyLink {...linkProps} href={home + path}>{label}</CompanyLink></li>)}</ul>}</div>)}</nav>
      </div>
      <div className="company-social"><p>You can also follow us on social media</p><div>
        <a {...social('https://www.linkedin.com/company/streamax-technology/', 'Streamax on LinkedIn')}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.96V9.2h2.97v9.55ZM6.44 7.9a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12.31 10.85h-2.97V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.47V9.2h2.85v1.3h.04c.4-.75 1.37-1.55 2.82-1.55 3.02 0 3.57 1.99 3.57 4.58v5.22Z"/></svg></a>
        <a {...social('https://www.youtube.com/@StreamaxMDVR', 'Streamax on YouTube')}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/></svg></a>
      </div></div>
      <div className="company-footer-bottom">
        <CompanyLink {...linkProps} href={home} className="company-footer-logo" aria-label="Streamax home"><img src="./assets/branding/streamax.webp" alt="Streamax" width="202" height="26" loading="lazy"/></CompanyLink>
        <nav aria-label="Policies">{[['Cookie Policy', 'category/cookie-policy.html'], ['Privacy Policy', 'privacy.html'], ['Product Policy', 'category/product-policy.html'], ['Service Agreement', 'category/service-agreement.html']].map(([label, path]) => <CompanyLink {...linkProps} key={label} href={home + path}>{label}</CompanyLink>)}<button onClick={openPrivacy}>Privacy & analytics</button></nav>
        <p>Copyright 2014-{new Date().getFullYear()} Streamax Technology Co.,Ltd</p>
        <a className="company-icp" {...social('https://beian.miit.gov.cn', '粤ICP备10239636号')}>粤ICP备10239636号</a>
      </div>
    </div>
  </footer>;
}
