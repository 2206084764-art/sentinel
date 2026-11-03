import { SceneManager } from './scene-manager.js';
import { EnergyField } from './energy.js';

const config=window.WEBINAR_CONFIG||{};
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const mobile=matchMedia('(max-width:767px)').matches;
const gsap=window.gsap, ScrollTrigger=window.ScrollTrigger;
if(gsap&&ScrollTrigger)gsap.registerPlugin(ScrollTrigger);
const query=new URLSearchParams(location.search),utmKeys=['utm_source','utm_medium','utm_campaign','utm_content'];
let entry={};
try{entry=JSON.parse(sessionStorage.getItem('sentinel-source')||'{}')}catch{}
const supplied=Object.fromEntries(utmKeys.map(key=>[key,(query.get(key)||'').slice(0,500)]).filter(([,value])=>value));
if(Object.keys(supplied).length||!entry.entry_path){
  entry={...supplied,referrer:document.referrer||'',entry_path:location.pathname,source:supplied.utm_source||(document.referrer?new URL(document.referrer).hostname:'direct'),medium:supplied.utm_medium||(document.referrer?'referral':'none')};
  try{sessionStorage.setItem('sentinel-source',JSON.stringify(entry))}catch{}
}
window.dataLayer=window.dataLayer||[];
function track(event,properties={}){if(config.analytics?.enabled===false)return;window.dataLayer.push({event,...entry,...properties});}
track('page_view',{page_title:document.title,page_path:location.pathname});track('source_entry');
const viewed=new Set();
const sectionObserver=new IntersectionObserver(entries=>{for(const item of entries){if(!item.isIntersecting)continue;const id=item.target.id;if(['agenda','registration'].includes(id)){scenes.disposeScene();energy.hide();}
if(!viewed.has(id)){track('section_view',{section_id:id});viewed.add(id);}document.querySelectorAll('.story-links a').forEach(a=>a.setAttribute('aria-current',String(a.hash==='#'+id)));}},{threshold:.18});
document.querySelectorAll('main>section').forEach(s=>sectionObserver.observe(s));

function webglAvailable(){try{const c=document.createElement('canvas');const gl=c.getContext('webgl2')||c.getContext('webgl');if(!gl)return false;gl.getExtension('WEBGL_lose_context')?.loseContext();return true}catch{return false}}
const webgl=webglAvailable();document.documentElement.dataset.webgl=String(webgl);
const scenes=new SceneManager({enabled:webgl,mobile,reduced});
const energy=new EnergyField(document.getElementById('energy-canvas'),{mobile,reduced});
const energyReady=webgl?energy.init():Promise.resolve(false);
document.addEventListener('sentinel:scene-ready',({detail})=>{if(detail.id==='installation-scene')scenes.command({action:'coverage',value:true});if(detail.id==='ai-scene'&&!reduced)scenes.command({action:'run',value:'pass'});});
window.SENTINEL_DEMO={scenes,energy,config,getState:()=>({webgl,reduced,mobile,activeScene:scenes.current?.slot.id,activeSource:scenes.current?.url,sceneReady:scenes.current?.ready,particles:!!energy.gl})};

function safeRegistrationURL(raw){
  if(!raw)return null;
  try{const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password)return null;
    for(const key of utmKeys){if(entry[key]&&!url.searchParams.has(key))url.searchParams.set(key,entry[key]);}return url;
  }catch{return null}
}
function text(tag,value,className){const node=document.createElement(tag);node.textContent=value;if(className)node.className=className;return node;}
function localDateInZone(date,time,zone){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return null;
  const desired=new Date(`${date}T${time}:00Z`);if(!Number.isFinite(+desired))return null;
  try{let estimate=+desired;for(let i=0;i<3;i++){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(estimate);
    const p=Object.fromEntries(parts.map(p=>[p.type,p.value]));const wall=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute);estimate+=+desired-wall;
  }return new Date(estimate)}catch{return null}
}
const countdownTimers=[];
function renderSessions(){
  const container=document.getElementById('webinar-sessions');container.replaceChildren();
  const sessions=config.sessions?.length?config.sessions:[{id:'global',region:'Global Webinar'}];
  for(const raw of sessions){
    const session={...raw};for(const key of ['date','time','timezone','language','zoomUrl','startISO','endISO'])session[key]=raw[key]||config[key]||'';
    session.timezone=session.timezone||'UTC';
    const start=session.startISO?new Date(session.startISO):localDateInZone(session.date,session.time,session.timezone);
    const validStart=start&&Number.isFinite(+start)?start:null;
    const url=safeRegistrationURL(session.zoomUrl);
    const card=text('article','', 'session-card');card.dataset.session=raw.id||'global';card.append(text('p','STREAMAX LIVE WEBINAR','session-label'),text('h3',raw.region||'Global Webinar'));
    const meta=document.createElement('dl');meta.className='session-meta';
    const dateBox=document.createElement('div'),timeBox=document.createElement('div'),languageBox=document.createElement('div');
    const dateValue=text('dd','To be announced'),timeValue=text('dd','To be announced');
    dateBox.append(text('dt','Date'),dateValue);timeBox.append(text('dt','Time'),timeValue);languageBox.append(text('dt','Language'),text('dd',session.language||'To be announced'));meta.append(dateBox,timeBox,languageBox);card.append(meta);
    const zoneWrap=text('div','','timezone-control'),label=text('label','Your timezone');const select=document.createElement('select');select.id=`timezone-${raw.id||'global'}`;label.htmlFor=select.id;
    let localZone='UTC';try{localZone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'}catch{}
    const zones=[...new Set([session.timezone,localZone,'UTC','Europe/London','Europe/Berlin','Asia/Singapore','Asia/Shanghai','America/New_York'])];
    for(const zone of zones){const option=text('option',zone.replaceAll('_',' '));option.value=zone;select.append(option)}select.value=localZone;
    function showTime(){if(!validStart)return;try{dateValue.textContent=new Intl.DateTimeFormat('en',{timeZone:select.value,dateStyle:'medium'}).format(validStart);timeValue.textContent=new Intl.DateTimeFormat('en',{timeZone:select.value,hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(validStart)}catch{dateValue.textContent='Schedule to be confirmed';timeValue.textContent='To be announced'}}
    select.addEventListener('change',showTime);showTime();zoneWrap.append(label,select);card.append(zoneWrap);
    if(validStart&&+validStart>Date.now()){
      const countdown=text('div','','countdown');countdown.setAttribute('role','timer');countdown.setAttribute('aria-label','Time until the webinar');
      const update=()=>{const diff=Math.max(0,+validStart-Date.now());const values=[Math.floor(diff/86400000),Math.floor(diff/3600000)%24,Math.floor(diff/60000)%60,Math.floor(diff/1000)%60];countdown.replaceChildren(...values.map((v,i)=>{const n=text('span',String(v).padStart(2,'0'));n.append(text('small',['d','h','m','s'][i]));return n}));};update();countdownTimers.push(setInterval(update,1000));card.append(countdown);
    }
    if(url){const register=text('a','REGISTER NOW ↗','button magnetic');register.href=url.href;register.target='_blank';register.rel='noopener noreferrer';register.addEventListener('click',()=>track('click_register',{placement:'session',session_id:raw.id||'global',link_url:url.href,registration_available:true}));card.append(register);card.append(text('p','Registration opens securely on Zoom.','fineprint'));}
    else{const button=text('button','Registration Coming Soon','button coming-soon');button.type='button';button.setAttribute('aria-describedby','registration-notice');button.addEventListener('click',()=>{const notice=document.getElementById('registration-notice');notice.textContent='Registration is not open yet. The date, language and official Zoom link will be announced here.';notice.classList.add('attention');notice.focus({preventScroll:true});track('click_register',{placement:'session',session_id:raw.id||'global',registration_available:false});});card.append(button);card.append(text('p',session.zoomUrl?'The registration link needs confirmation.':'The event schedule and Zoom registration link will be announced soon.','fineprint'));}
    container.append(card);
  }
  const speakers=[...(config.speaker||[]),...sessions.flatMap(s=>s.speaker||[])];
  const speakerList=document.getElementById('speaker-list');
  const unique=new Set();for(const person of speakers){if(!person?.name||unique.has(person.name))continue;unique.add(person.name);const box=text('div','','speaker-person');if(person.headshot){const img=document.createElement('img');img.src=person.headshot;img.alt=person.name;img.loading='lazy';box.append(img)}box.append(text('h3',person.name),text('p',[person.jobTitle,person.company].filter(Boolean).join(', ')));if(person.introduction)box.append(text('p',person.introduction));speakerList.append(box)}
  if(unique.size){const p=document.querySelector('.speaker-panel>p');p.hidden=true;}
}
renderSessions();

const intro=document.getElementById('intro');let introTimeline, introTimer,introDone=false;
function dismissIntro(){
  if(introDone)return;introDone=true;clearTimeout(introTimer);introTimeline?.kill();energy.hide();intro.hidden=true;document.body.classList.remove('intro-playing');scenes.unlock();try{sessionStorage.setItem('sentinel-intro-seen','1')}catch{}
  if(gsap&&!reduced)gsap.fromTo('.hero-enter',{y:20},{y:0,duration:1,stagger:.1,ease:'power3.out'});
  scenes.schedule();startAmbient();
}
function startAmbient(){if(!introDone||reduced||mobile||document.hidden)return;const r=document.getElementById('hero').getBoundingClientRect();if(r.bottom<120||r.top>innerHeight)return;energyReady.then(ok=>{if(!ok||!introDone)return;energy.canvas.classList.add('ambient');energy.show();energy.set('sphere',0,.25);});}
const heroObserver=new IntersectionObserver(([entry])=>{if(!introDone)return;if(entry.isIntersecting)startAmbient();else if(energy.canvas.classList.contains('ambient')){energy.hide();energy.canvas.classList.remove('ambient');}},{threshold:.15});heroObserver.observe(document.getElementById('hero'));
let seen=false;try{seen=sessionStorage.getItem('sentinel-intro-seen')==='1'}catch{}
if(!seen&&!reduced&&webgl&&config.demo?.autoplayIntro!==false&&!location.hash){
  intro.hidden=false;document.body.classList.add('intro-playing');scenes.lock('intro-globe');
  energyReady.then(ok=>{if(!ok||introDone)return;energy.show();energy.set('sphere',0,1)});
  if(gsap){
    const burst={progress:0};introTimeline=gsap.timeline({onComplete:dismissIntro});
    introTimeline.fromTo('.intro-caption',{opacity:0,y:16},{opacity:1,y:0,duration:.8},.2)
      .to('#intro-globe',{opacity:1,scale:1,duration:1.3},.8)
      .to(burst,{progress:1,duration:1.2,onUpdate:()=>energy.set('burst',burst.progress,1-burst.progress*.7)},.8)
      .to('#intro-globe',{scale:1.65,opacity:0,duration:1.5,ease:'power2.in'},mobile?2:3.2)
      .to('.intro-caption',{opacity:0,duration:.5},mobile?2.7:4.3);
  }
  introTimer=setTimeout(dismissIntro,mobile?3600:5600);
}else{introDone=true;intro.hidden=true;scenes.schedule();startAmbient()}
document.getElementById('skip-intro').addEventListener('click',dismissIntro);
document.querySelectorAll('[data-register]').forEach(a=>a.addEventListener('click',()=>{dismissIntro();track('click_register',{placement:a.closest('.intro')?'intro':a.closest('.hero')?'hero':a.closest('nav')?'navigation':'page',registration_available:false,destination:'registration-section'});}));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const destination=document.querySelector(a.hash);if(!destination)return;e.preventDefault();dismissIntro();history.replaceState(null,'',a.hash);destination.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}));

const videoObserver=new IntersectionObserver(entries=>{for(const entry of entries){const v=entry.target;if(!entry.isIntersecting){v.pause();continue;}if(v.closest('.threat-panel')&&!v.closest('.threat-panel').classList.contains('active'))continue;if(v.closest('.threat-panel')&&!reduced&&!threatPaused)playVideo(v);else prepareVideo(v);}},{threshold:.25});
const played=new Set(),completed=new Set();let threatPaused=reduced;
function prepareVideo(v){if(v?.dataset.src&&!v.src){v.src=v.dataset.src;v.load()}}
function playVideo(v){if(!v||document.hidden)return;prepareVideo(v);v.play().catch(()=>{});}
document.querySelectorAll('video').forEach(v=>{videoObserver.observe(v);v.addEventListener('play',()=>{const id=v.dataset.videoId;if(!played.has(id)){track('video_play',{video_id:id});played.add(id)}});v.addEventListener('ended',()=>{const id=v.dataset.videoId;if(!completed.has(id)){track('video_complete',{video_id:id});completed.add(id)}});v.addEventListener('error',()=>{v.setAttribute('aria-label','Video is unavailable. Reference image shown.')});});
document.querySelectorAll('.threat-select').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.threat-panel').forEach(panel=>{const active=panel===button.closest('article');panel.classList.toggle('active',active);panel.querySelector('button').setAttribute('aria-expanded',String(active));const video=panel.querySelector('video');if(active&&!threatPaused)playVideo(video);else video.pause();})}));
const threatButton=document.getElementById('toggle-threat-video');threatButton.textContent=threatPaused?'Play footage':'Pause footage';threatButton.addEventListener('click',()=>{threatPaused=!threatPaused;threatButton.textContent=threatPaused?'Play footage':'Pause footage';const v=document.querySelector('.threat-panel.active video');if(threatPaused)v.pause();else playVideo(v)});

const hotspots={lens:['A clear view around the vehicle.','The wide-angle lens captures visual context for vehicle security monitoring.'],connect:['Connectivity in one device.','Explore positioning, remote communication and video access. Confirm the configuration for your deployment.'],mount:['Positioned for your application.','Mounting position, power and camera calibration should be planned with a qualified installer.']};
document.querySelectorAll('[data-hotspot]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-hotspot]').forEach(b=>b.classList.toggle('selected',b===button));const [title,body]=hotspots[button.dataset.hotspot];const detail=document.getElementById('hotspot-detail');detail.querySelector('h3').textContent=title;detail.querySelector('p').textContent=body;scenes.loadScene('explorer-scene');scenes.command({action:'zoom',value:true})}));
let zoomed=false;
document.querySelectorAll('[data-model-view]').forEach(button=>button.addEventListener('click',()=>{const inside=button.dataset.modelView==='internal';document.querySelectorAll('[data-model-view]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button))});document.querySelectorAll('.hotspot').forEach(b=>b.hidden=inside);document.getElementById('explorer-scene').dataset.scene=inside?'sentinel-soc.html?el=15&fit=1.1':'product-view.html';scenes.loadScene('explorer-scene');}));
document.getElementById('zoom-model').addEventListener('click',event=>{scenes.loadScene('explorer-scene');zoomed=!zoomed;scenes.command({action:'zoom',value:zoomed});event.target.setAttribute('aria-pressed',String(zoomed));event.target.textContent=zoomed?'Zoom −':'Zoom +'});
document.getElementById('reset-model').addEventListener('click',()=>{scenes.command({action:'view',value:'front'});scenes.command({action:'zoom',value:false});zoomed=false;const zoom=document.getElementById('zoom-model');zoom.textContent='Zoom +';zoom.setAttribute('aria-pressed','false');});
document.querySelectorAll('[data-load-scene]').forEach(b=>b.addEventListener('click',()=>{scenes.loadScene(b.dataset.loadScene);b.textContent='Drag to explore'}));
const compare=document.getElementById('night-compare');document.getElementById('night-slider').addEventListener('input',e=>{compare.style.setProperty('--reveal',e.target.value+'%');e.target.setAttribute('aria-valuetext',e.target.value+' percent Sentinel image');});
document.querySelectorAll('[data-night]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('night-before').src=`assets/images/${b.dataset.night==='phone'?'nv-iphone':'nv-blacklight'}.webp`;document.querySelectorAll('[data-night]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b))})}));
document.querySelectorAll('[data-system]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-system]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b))});const internal=b.dataset.system==='device';const slot=document.getElementById('intelligence-scene');slot.dataset.scene=internal?'sentinel-soc.html?el=15&fit=1.1':'truck64-iot.html?mode=wireframe';scenes.loadScene(slot.id);scenes.command({action:'mode',value:internal?'solid':'wireframe'});}));
document.querySelectorAll('[data-run]').forEach(button=>button.addEventListener('click',()=>{scenes.loadScene('ai-scene');scenes.command({action:'run',value:button.dataset.run});}));
document.querySelectorAll('[data-rail]').forEach(button=>button.addEventListener('click',()=>{const rail=document.querySelector('.image-rail');rail.scrollBy({left:(button.dataset.rail==='next'?1:-1)*rail.clientWidth*.8,behavior:reduced?'instant':'smooth'})}));
const dialog=document.getElementById('media-dialog');const dialogContent=dialog.querySelector('.dialog-content');let lastMediaTrigger;
function closeMedia(){dialog.querySelector('video')?.pause();dialogContent.replaceChildren();dialog.close();lastMediaTrigger?.focus({preventScroll:true});scenes.activateScene();}
document.getElementById('close-dialog').addEventListener('click',closeMedia);dialog.addEventListener('cancel',e=>{e.preventDefault();closeMedia()});dialog.addEventListener('click',e=>{if(e.target===dialog)closeMedia()});
document.querySelectorAll('[data-video],[data-image]').forEach(b=>b.addEventListener('click',()=>{lastMediaTrigger=b;dialogContent.replaceChildren();document.getElementById('media-dialog-title').textContent=b.dataset.videoTitle||'Internal field recording';
 if(b.dataset.video){const v=document.createElement('video');v.src='assets/videos/'+b.dataset.video;v.poster='assets/images/'+b.dataset.poster;v.controls=true;v.playsInline=true;v.autoplay=!reduced;v.dataset.videoId=b.dataset.video;v.addEventListener('play',()=>track('video_play',{video_id:b.dataset.video,placement:'gallery'}));v.addEventListener('ended',()=>track('video_complete',{video_id:b.dataset.video,placement:'gallery'}));dialogContent.append(v)}else{const img=document.createElement('img');img.src=b.dataset.image;img.alt=b.querySelector('img').alt;dialogContent.append(img)}scenes.pauseScene();dialog.showModal();}));

const cleanup=[];let motionMedia;
if(gsap&&ScrollTrigger){
  if(!reduced){gsap.utils.toArray('.reveal').forEach(el=>{const tween=gsap.fromTo(el,{y:28},{y:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}});cleanup.push(()=>tween.kill())});}
  ScrollTrigger.create({trigger:document.body,start:'top top',end:'bottom bottom',onUpdate:self=>{document.querySelector('.nav-progress').style.transform=`scaleX(${self.progress})`;scenes.schedule();}});
  motionMedia=gsap.matchMedia();
  motionMedia.add('(min-width:1024px) and (prefers-reduced-motion:no-preference)',()=>{
    gsap.to('.hero-scene',{scale:1.08,y:40,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.gap-track',{x:()=>-innerWidth*2,ease:'none',scrollTrigger:{id:'gap-scroll',trigger:'.gap-pin',start:'top top',end:()=>'+='+innerWidth*1.7,pin:true,scrub:1,invalidateOnRefresh:true}});
    const aovState={p:0};const aovFilm=document.querySelector('.aov-film');let activeStep=-1;
    gsap.to(aovState,{p:1,ease:'none',scrollTrigger:{trigger:'.aov-pin',start:'top top',end:()=>'+='+innerHeight*1.8,pin:true,scrub:.65,onUpdate:self=>{
      const p=self.progress;scenes.progress('aov-scene',p);document.querySelector('.day-night').style.setProperty('--day-progress',p);
      const index=Math.min(2,Math.floor(p*3));if(index!==activeStep){activeStep=index;document.querySelectorAll('.aov-steps article').forEach((el,i)=>{el.classList.toggle('active',i===index);gsap.to(el,{opacity:i===index?1:0,y:i===index?0:12,duration:.35})})}
      const film=p>.72;if(film&&!aovFilm.classList.contains('visible'))playVideo(document.getElementById('aov-film'));gsap.set(aovFilm,{opacity:film?1:0,y:film?0:20});aovFilm.classList.toggle('visible',film);if(film)prepareVideo(document.getElementById('aov-film'));else document.getElementById('aov-film').pause();
    }}});
    const aiPanel=document.querySelector('.ai-video-panel');let aiPhase=-1;
    ScrollTrigger.create({trigger:'.ai-pin',start:'top top',end:()=>'+='+innerHeight*1.6,pin:true,scrub:1,onUpdate:self=>{
      const p=self.progress;const phase=p<.36?0:p<.57?1:2;
      if(phase!==aiPhase){aiPhase=phase;if(phase===0){energy.hide();scenes.command({action:'run',value:'steal'});}if(phase===1){energyReady.then(ok=>{if(ok&&aiPhase===1)energy.show(true)});}if(phase===2){energy.hide();playVideo(document.getElementById('ai-film'));}}
      if(phase===1)energy.set('converge',(p-.36)/.21,Math.sin((p-.36)/.21*Math.PI));
      gsap.set(aiPanel,{opacity:phase===2?1:0,scale:phase===2?1:.93});aiPanel.classList.toggle('visible',phase===2);
      gsap.set('.ai-concept',{opacity:phase===2?0:1,pointerEvents:phase===2?'none':'auto'});
      if(phase!==2)document.getElementById('ai-film').pause();
    },onLeave:()=>energy.hide(),onLeaveBack:()=>energy.hide()});
    // Word opacity follows progress, explaining why context matters before the live footage.
    const words=document.querySelector('.ai-bottom');const original=words.innerHTML;words.innerHTML=words.textContent.trim().split(/\s+/).map(w=>`<span class="scrub-word">${w}</span>`).join(' ');
    gsap.fromTo(words.children,{opacity:.16},{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:'.ai-pin',start:'top 35%',end:'+=650',scrub:true}});
    gsap.utils.toArray('.deployment-card').forEach((card,i)=>gsap.fromTo(card,{opacity:.25,y:30},{opacity:1,y:0,ease:'none',scrollTrigger:{trigger:card,start:'top 85%',end:'top 55%',scrub:1}}));
    gsap.fromTo('.evidence-gallery',{scale:.9,opacity:.3},{scale:1,opacity:1,ease:'none',scrollTrigger:{trigger:'.evidence-gallery',start:'top bottom',end:'top 40%',scrub:1}});
    gsap.to('.evidence-gallery',{opacity:.25,ease:'none',scrollTrigger:{trigger:'.evidence-gallery',start:'bottom 20%',end:'bottom top',scrub:1}});
    ScrollTrigger.create({trigger:'.explorer-stage',start:'top 145px',end:'+=450',pin:true,anticipatePin:1});
    gsap.fromTo('.explorer-stage',{scale:.92},{scale:1,ease:'none',scrollTrigger:{trigger:'.explorer-stage',start:'top 90%',end:'top 20%',scrub:1}});
    return ()=>{words.innerHTML=original;energy.hide()};
  });
  motionMedia.add('(max-width:1023px), (prefers-reduced-motion:reduce)',()=>{
    // Mobile and reduced-motion retain the full narrative without scroll pinning.
    ScrollTrigger.create({trigger:'#aov',start:'top 65%',end:'bottom 40%',onUpdate:self=>scenes.progress('aov-scene',self.progress)});
  });
  ScrollTrigger.refresh();
}
let gapIndex=0;
function advanceGap(direction){gapIndex=(gapIndex+direction+3)%3;const st=ScrollTrigger?.getById('gap-scroll');if(st){window.scrollTo({top:st.start+(st.end-st.start)*(gapIndex/2),behavior:reduced?'instant':'smooth'})}else{document.querySelector('.gap-track').scrollTo({left:innerWidth*gapIndex,behavior:reduced?'instant':'smooth'})}}
document.querySelector('[data-gap-prev]').addEventListener('click',()=>advanceGap(-1));document.querySelector('[data-gap-next]').addEventListener('click',()=>advanceGap(1));
if(!mobile&&!reduced&&gsap){
  document.querySelectorAll('.magnetic').forEach(el=>{
    const x=gsap.quickTo(el,'x',{duration:.5,ease:'power3.out'}),y=gsap.quickTo(el,'y',{duration:.5,ease:'power3.out'});
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();x((e.clientX-r.left-r.width/2)*.08);y((e.clientY-r.top-r.height/2)*.08)});el.addEventListener('pointerleave',()=>{x(0);y(0)});
  });
  const hero=document.getElementById('hero');hero.addEventListener('pointermove',event=>{if(scenes.current?.slot.id!=='hero-scene')return;const x=event.clientX/innerWidth*2-1;scenes.command({action:'pointer',x});gsap.to('.hero-halo',{x:x*18,duration:1.1})});
}
function suspend(){scenes.pauseScene();energy.hide();document.querySelectorAll('video').forEach(v=>v.pause());}
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else scenes.activateScene()});
window.addEventListener('pagehide',()=>{suspend();scenes.disposeScene();});
window.addEventListener('pageshow',event=>{if(event.persisted)scenes.schedule()});
window.addEventListener('beforeunload',()=>{motionMedia?.revert();cleanup.forEach(fn=>fn());ScrollTrigger?.getAll().forEach(t=>t.kill());sectionObserver.disconnect();videoObserver.disconnect();heroObserver.disconnect();countdownTimers.forEach(clearInterval);scenes.destroy();energy.destroy();});
