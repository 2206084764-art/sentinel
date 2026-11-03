import { useRef, useState } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Download, Expand, FileText, Play, Plus } from 'lucide-react';
import CountUp from './components/reactbits/CountUp';
import BlurCarousel from './components/originkit/BlurCarousel';
import { img } from './Media';
import { track, decorateUrl } from './runtime.mjs';
import { CompanyFooter } from './CompanyChrome';

const fieldSlides = Array.from({ length: 9 }, (_, i) => ({ image: { src: img(`cases/cap${i + 1}`), alt: `Sentinel field recording ${i + 1}: activity beside a parked vehicle` }, title: `FIELD RECORDING / ${String(i + 1).padStart(2, '0')}` }));
const films = [
  ['ai-pose', 'ai-still', 'Intent-aware AI', 'PRODUCT DEMO'],
  ['aov-loop', 'aov-still', 'Always-on. Always aware.', 'AOV DEMO'],
  ['case-ampenet', 'cases/cap1', 'Caught in the act', 'TANZANIA / FIELD FOOTAGE'],
  ['case-caught', 'cases/alert-night', 'A threat after dark', 'FIELD FOOTAGE'],
  ['theft-cctv', 'theft-fuel', 'The fuel-theft problem', 'REFERENCE FOOTAGE'],
  ['cargo theft cctv', 'theft-cargo', 'Cargo at risk', 'NEWS REFERENCE / FOX 7'],
];
const documents = [
  ['S5-Product-Specification.docx', 'Product specification', 'The details behind the device.', 'DOCX'],
  ['S5-User-Manual.docx', 'User manual', 'Configuration, operation and alerts.', 'DOCX'],
  ['S5-Installation-Guide.docx', 'Installation guide', 'Mounting, wiring and calibration.', 'DOCX'],
  ['Sentinel-Product-Presentation.pptx', 'Product presentation', 'The complete Sentinel story.', 'PPTX'],
];
const questions = [
  ['What will the launch webinar cover?', 'Explore Sentinel’s always-on video, intent-aware AI and Black Light Ultra, with product demonstrations, deployment considerations and time for questions. The final agenda and speakers will be announced with the event schedule.'],
  ['When can I register for the Zoom webinar?', 'The launch date, time and registration link will be confirmed here. Once registration opens, the launch CTA will take you to the official Zoom registration page.'],
  ['Can Sentinel work alongside my existing fleet system?', 'Sentinel is presented as a standalone vehicle-security device. Recorder integration, sensor compatibility and platform connectivity depend on the project and configuration. Talk to Streamax about your current setup.'],
  ['What should I plan for installation?', 'Plan for a suitable mounting position, vehicle power, connectivity, storage and detection-zone calibration. Installation conditions affect performance; follow the installation guide and confirm your configuration with Streamax.'],
];

export function FieldSection({ reduced = false, openVideo, openModal }) {
  const rail = useRef(null);
  const [edges, setEdges] = useState({ previous: false, next: true });
  const move = direction => rail.current?.scrollBy({ left: direction * rail.current.clientWidth * .78, behavior: reduced ? 'auto' : 'smooth' });
  const updateEdges = () => { const el = rail.current; setEdges({ previous: el.scrollLeft > 8, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 8 }); };
  const metric = value => reduced ? value : <CountUp to={value} duration={1.5}/>;
  return <section className="section field-section" id="field" aria-labelledby="field-title">
    <div className="field-heading">
      <div><span className="eyebrow">05 / FROM THE FIELD</span><h2 id="field-title">Real roads.<br/><em>Real stakes.</em></h2></div>
      <div className="field-map"><img src={img('world-dots')} alt="" loading="lazy"/><p>Beyond the demo.<br/>See Sentinel in the working world.</p><ArrowDownRight size={24} aria-hidden="true"/></div>
    </div>
    <div className="field-story">
      <div className="field-evidence"><div className="field-gallery" aria-label="Nine Sentinel field recording images">
        <BlurCarousel slides={fieldSlides} movement="horizontal" cardWidth={900} cardHeight={507} radius={0} tilt={reduced ? 0 : 8} blurAmount={reduced ? 0 : 12} arrowSize={28} autoplay={false} showTitle={true} titleFont={{ fontSize: 12, letterSpacing: '.08em', fontWeight: 500 }} titlePosition={{ position: 'topLeft', paddingTop: 22, paddingLeft: 24 }} transition={{ duration: reduced ? 0 : .4, ease: [.2, .8, .2, 1] }}/>
      </div><div className="field-image-note"><span>01—09 / ORIGINAL FIELD RECORDINGS</span><span>Use the arrows to explore</span></div></div>
      <article className="field-story-copy"><span className="field-location">AMPENET / TANZANIA</span><h3>From suspicion<br/>to a visible answer.</h3><p>During Ampenet’s pilot, Sentinel captured an employee siphoning fuel. The partner’s account describes two test units, followed by an order for 17 more.</p>
        <button className="text-button" onClick={() => openVideo('case-ampenet')}><span className="round-icon"><Play size={15} aria-hidden="true"/></span>Watch the field footage</button>
        <button className="field-poster" onClick={() => openModal({ image: 'cases/poster-ampenet', title: 'Ampenet Tanzania — original partner material' })}><img src={img('cases/poster-ampenet')} alt="Ampenet Sentinel customer poster" loading="lazy"/><span>See the partner story<Expand size={15} aria-hidden="true"/></span></button>
      </article>
    </div>
    <article className="field-results" aria-labelledby="results-title">
      <div className="field-results-intro"><span className="eyebrow">SINGLE-VEHICLE CASE STUDY</span><h3 id="results-title">A measurable difference.<br/><em>One truck at a time.</em></h3><p>Texas, Kenya — comparing six months before installation with four months after.</p></div>
      <div className="field-stat"><strong role="img" aria-label="97 percent lower fuel loss"><span aria-hidden="true">{metric(97)}<small>%</small></span><ArrowDownRight size={27} aria-hidden="true"/></strong><span>Lower monthly fuel loss</span><p>929 L / 6 months → 16 L / 4 months</p></div>
      <div className="field-stat"><strong role="img" aria-label="88 percent lower incident rate"><span aria-hidden="true">{metric(88)}<small>%</small></span><ArrowDownRight size={27} aria-hidden="true"/></strong><span>Lower monthly incident rate</span><p>26 / 6 months → 2 / 4 months</p></div>
      <p className="fineprint field-result-note">Reported case-study results, rounded and normalized to monthly rates across unequal observation periods. One vehicle, not a controlled study or a guarantee of future results.</p>
    </article>
    <div className="field-records"><div><span className="eyebrow">THE EVIDENCE TRAIL</span><h3>Context beyond the alert.</h3><p>Inspect the original fuel records supplied with the product materials.</p></div>
      {[['0308', '8 March 2026'], ['0327', '27 March 2026']].map(([key, date]) => <button className="field-record" key={key} onClick={() => openModal({ image: `cases/curve-${key}`, title: `Original fuel record — ${date}` })}><span>FUEL RECORD / {date}<Expand size={15} aria-hidden="true"/></span><img src={img(`cases/curve-${key}`)} alt={`Fuel-level chart dated ${date}`} loading="lazy"/></button>)}
    </div>
    <div className="field-library-heading"><div><span className="eyebrow">THE FILM LIBRARY</span><h3>Don’t just read it.<br/><em>See it.</em></h3></div><div className="field-rail-controls"><button disabled={!edges.previous} aria-label="Previous films" aria-controls="field-film-rail" onClick={() => move(-1)}><ArrowLeft size={20}/></button><button disabled={!edges.next} aria-label="Next films" aria-controls="field-film-rail" onClick={() => move(1)}><ArrowRight size={20}/></button></div></div>
    <div className="field-film-rail" id="field-film-rail" ref={rail} onScroll={updateEdges} aria-label="Product demonstrations and reference films">
      {films.map(([id, poster, title, category], i) => <button className="field-film" key={id} onClick={() => openVideo(id)} aria-label={`Play ${title}`}><span className="field-film-image"><img src={img(poster)} alt="" loading="lazy"/><span className="field-film-play"><Play size={22} aria-hidden="true"/></span><span className="field-film-index">0{i + 1}</span></span><span className="field-film-meta">{category}</span><span className="field-film-title">{title}<ArrowUpRight size={19} aria-hidden="true"/></span></button>)}
    </div>
    <p className="fineprint field-film-note">Demonstration and field footage are identified above. Theft and news reference clips illustrate the problem; they are not recordings made by Sentinel.</p>
  </section>;
}

export function ResourcesSection({ openModal, attrs = {} }) {
  const contactUrl = decorateUrl(window.SENTINEL_EVENT?.contactUrl || 'https://www.streamax.com/category/contactform.html', attrs);
  return <>
    <section className="section resources-section" id="resources" aria-labelledby="resources-title">
      <div className="resource-heading"><div><span className="eyebrow">THE PRODUCT BRIEFING</span><h2 id="resources-title">Everything behind<br/><em>the introduction.</em></h2></div><p>From first look to installation.<br/>Explore the original Sentinel documents.</p></div>
      <div className="resource-grid">{documents.map(([file, title, description, format], i) => <a className="resource-card" key={file} href={`./docs/${file}`} download onClick={() => track('file_download', { file_name: file, link_url: `./docs/${file}`, link_text: title })}><span className="resource-card-top"><FileText size={24} aria-hidden="true"/><span>{format} / 0{i + 1}</span></span><h3>{title}</h3><p>{description}</p><span className="resource-download">Download<Download size={18} aria-hidden="true"/></span></a>)}</div>
      <div className="resource-faq"><div><span className="eyebrow">A FEW MORE ANSWERS</span><h3>Before we go live.</h3><p>Have a deployment question?</p><a className="text-button" href={contactUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('outbound_click', { link_url: contactUrl, link_text: 'Talk to Streamax', placement: 'faq' })}>Talk to Streamax<ArrowUpRight size={17}/></a></div>
        <div className="resource-questions">{questions.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={19} aria-hidden="true"/></summary><p>{answer}</p></details>)}</div>
      </div>
    </section>
    <CompanyFooter attrs={attrs} openPrivacy={() => openModal('privacy')}/>
  </>;
}
