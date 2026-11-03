/* Countdown/reveal behavior adapted from the supplied DS100 reference.
   Sentinel's validated URLs, attribution and event names are passed in by the existing app. */
(() => {
  'use strict';
  let templates;
  const clampSeconds = n => Math.max(0, Math.floor(n));
  function parts(seconds) {
    const n=clampSeconds(seconds);
    return [Math.floor(n/86400),Math.floor(n%86400/3600),Math.floor(n%3600/60),n%60];
  }
  window.SENTINEL_WEBINAR_REFERENCE = {
    mount(root, {event, reduced, attrs, track, zoomUrl, safeUrl, decorate}) {
      const grid=root.querySelector('.webinar-grid');
      if(!templates)templates=Array.from(grid.children,card=>card.cloneNode(true));
      const sessions=Array.isArray(event.sessions)&&event.sessions.length?event.sessions:[{...event,id:"global",region:event.region||"Global",language:event.language||"English"}];
      grid.classList.toggle('is-single',sessions.length===1);
      function registration(card,session,now){
        const end=Date.parse(session.endISO),ended=Number.isFinite(end)&&end<=now;
        const url=ended?safeUrl(session.replayUrl):zoomUrl(session.zoomUrl);
        const status=ended?'ended':url?'open':'pending';
        if(card.dataset.eventStatus===status)return;
        const button=document.createElement(url?'a':'button');
        button.className='btn primary';button.dataset.registration='';
        if(url){button.href=decorate(url,attrs);button.target='_blank';button.rel='noopener noreferrer';button.textContent=ended?'Watch the Replay':'Register Now';}
        else{button.type='button';button.disabled=ended;button.textContent=ended?'Session Ended':'Register Now';}
        card.querySelector('[data-registration]').replaceWith(button);
        card.dataset.eventStatus=status;
      }
      const cards=sessions.map((session,index)=>{
        const original=templates.find(card=>card.dataset.sessionId===session.id)||templates[index%templates.length];
        const card=original.cloneNode(true);
        card.dataset.sessionId=session.id||String(index);
        const sameRegion=templates.some(t=>t.dataset.sessionId===session.id);
        if(session.region)card.querySelector('.webinar-country-mark b').textContent=session.region;
        if(session.language)card.querySelector('.webinar-country-mark em').textContent=session.language;
        if(!sameRegion&&session.region){
          card.querySelector('.webinar-flag-mini-v86').hidden=true;
          const image=card.querySelector('.webinar-photo img');image.src='./assets/images/world-dots.webp';image.alt='Sentinel webinar';image.removeAttribute('title');
        }
        card.querySelector('[data-session-date]').textContent=session.dateLabel||event.dateLabel||'Date to be announced';
        card.querySelector('[data-session-time]').textContent=[session.timeLabel||event.timeLabel||'Time to be announced',session.timezone].filter(Boolean).join(' · ');
        const start=Date.parse(session.startISO),end=Date.parse(session.endISO);
        registration(card,session,Date.now());
        card._session={session,index,start,end};
        return card;
      });
      grid.replaceChildren(...cards);
      function updateCountdowns(){
        const now=Date.now();
        for(const card of cards){
          const {session,start,end}=card._session;
          registration(card,session,now);
          const known=Number.isFinite(start),ended=Number.isFinite(end)&&end<=now;
          const values=known?parts((start-now)/1000):['--','--','--','--'];
          ['days','hours','minutes','seconds'].forEach((unit,i)=>{card.querySelector('[data-'+unit+']').textContent=String(values[i]).padStart(2,'0');});
          const countdown=card.querySelector('.webinar-countdown');
          countdown.setAttribute('aria-label',!known?'Schedule to be announced':ended?'Session ended':start<=now?'Session has started':'Time until this session');
          countdown.setAttribute('aria-live','off');
        }
      }
      updateCountdowns();
      const timer=cards.some(card=>Number.isFinite(card._session.start)||Number.isFinite(card._session.end))?setInterval(updateCountdowns,1000):null;
      const click=e=>{
        const button=e.target.closest('[data-registration]');if(!button||!button.href)return;
        const card=button.closest('.webinar-card');const {session,index}=card._session;
        track('webinar_cta_click',{placement:'event-card',session_id:session.id||String(index),region:session.region||'',language:session.language||'',event_status:card.dataset.eventStatus,link_url:button.href,link_text:button.textContent});
      };
      root.addEventListener('click',click);
      const reveals=root.querySelectorAll('[data-reveal]');
      let observer;
      if(reduced||!('IntersectionObserver' in window))reveals.forEach(node=>node.classList.add('show'));
      else{
        observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('show');observer.unobserve(entry.target);}}),{threshold:.08});
        reveals.forEach(node=>observer.observe(node));
      }
      return()=>{if(timer)clearInterval(timer);observer?.disconnect();root.removeEventListener('click',click);};
    }
  };
})();
