export class SceneManager {
  constructor({enabled=true,mobile=false,reduced=false}={}) {
    this.enabled=enabled;this.mobile=mobile;this.reduced=reduced;this.current=null;this.locked=null;this.pending=null;this.generation=0;
    this.slots=[...document.querySelectorAll('.scene[data-scene]')];this.visibility=new Map();
    this.observer=new IntersectionObserver(entries=>{for(const e of entries)this.visibility.set(e.target,e.intersectionRatio);this.schedule()},{threshold:[0,.08,.25,.5,.75,1]});
    this.slots.forEach(slot=>{this.observer.observe(slot);if(!enabled)this.status(slot,'3D unavailable. Product image shown.');});
    this.resizeObserver=new ResizeObserver(()=>this.onResize());
    this.slots.forEach(slot=>this.resizeObserver.observe(slot));
    this.onMessage=this.onMessage.bind(this);window.addEventListener('message',this.onMessage);
    this.onVisibility=()=>document.hidden?this.pauseScene():this.activateScene();document.addEventListener('visibilitychange',this.onVisibility);
  }
  status(slot,text=''){const status=slot?.querySelector('.scene-status');if(status)status.textContent=text;}
  schedule(){if(this.pending)return;this.pending=requestAnimationFrame(()=>{this.pending=null;this.choose()});}
  choose(){
    if(!this.enabled||document.hidden)return;
    if(this.locked){this.loadScene(this.locked);return;}
    if(this.mobile||this.reduced){if(this.current&&this.visibility.get(this.current.slot)<.02)this.disposeScene();return;}
    let best=null,score=-Infinity;
    for(const slot of this.slots){
      if(slot.closest('[hidden]')||(this.visibility.get(slot)||0)<.05)continue;
      const r=slot.getBoundingClientRect();const s=(this.visibility.get(slot)||0)*1.5-Math.abs(r.top+r.height/2-innerHeight/2)/innerHeight;
      if(s>score){best=slot;score=s;}
    }
    if(best){if(this.current?.slot!==best){if(this.candidate!==best){this.candidate=best;this.candidateSince=performance.now();clearTimeout(this.switchTimer);this.switchTimer=setTimeout(()=>this.schedule(),220);return;}if(performance.now()-this.candidateSince<200)return;}this.loadScene(best.id);}else{this.candidate=null;this.disposeScene();}
  }
  lock(id){this.locked=id;return this.loadScene(id);}
  unlock(){this.locked=null;this.schedule();}
  loadScene(id,source){
    const slot=document.getElementById(id);if(!slot||!this.enabled)return;
    const url='assets/3d/'+(source||slot.dataset.scene);
    if(this.current?.slot===slot&&this.current.url===url)return this.current;
    this.disposeScene();const frame=document.createElement('iframe');
    frame.title=slot.dataset.title||'Sentinel interactive 3D scene';frame.setAttribute('allow','fullscreen');frame.setAttribute('loading','eager');
    if(slot.dataset.interactive!=='true')frame.style.pointerEvents='none';
    const generation=++this.generation;this.current={slot,frame,url,ready:false,generation,commands:new Map()};slot.classList.remove('unavailable');slot.classList.add('loading');this.status(slot,'Loading interactive 3D…');slot.append(frame);frame.src=url;
    this.timer=setTimeout(()=>{if(this.current?.generation===generation&&!this.current.ready){slot.classList.add('unavailable');slot.classList.remove('loading');this.status(slot,'3D could not load. Product image shown.');this.disposeScene();}},45000);
    return this.current;
  }
  onMessage(event){
    const c=this.current;if(!c||event.origin!==location.origin||event.source!==c.frame.contentWindow||event.data?.channel!=='sentinel')return;
    if(event.data.type==='scene-ready'){
      clearTimeout(this.timer);c.ready=true;c.slot.classList.remove('loading');c.slot.classList.add('ready');this.status(c.slot);
      this.command({action:'interactive',value:c.slot.dataset.interactive==='true'});
      const progress=c.slot.dataset.progress;if(progress)this.command({action:'progress',value:Number(progress)});
      for(const command of c.commands.values())this.command(command);c.commands.clear();
      document.dispatchEvent(new CustomEvent('sentinel:scene-ready',{detail:{id:c.slot.id,source:c.url}}));
    }
    if(event.data.type==='scene-error'){c.slot.classList.remove('loading');c.slot.classList.add('unavailable');this.status(c.slot,'3D unavailable. Product image shown.');this.disposeScene();}
  }
  command(data){if(this.current&&!this.current.ready&&!['pause','dispose'].includes(data.action)){this.current.commands.set(data.action,data);return;}try{this.current?.frame.contentWindow?.postMessage({channel:'sentinel',...data},location.origin)}catch{}}
  progress(id,value){const slot=document.getElementById(id);if(slot)slot.dataset.progress=String(value);if(this.current?.slot.id===id)this.command({action:'progress',value});}
  activateScene(){if(this.current&&!document.hidden)this.command({action:'activate'});}
  pauseScene(){this.command({action:'pause'});}
  disposeScene(){clearTimeout(this.timer);if(!this.current)return;const {slot,frame}=this.current;this.command({action:'dispose'});slot.classList.remove('ready','loading');this.status(slot);frame.remove();this.current=null;}
  onResize(){this.schedule();}
  destroy(){clearTimeout(this.switchTimer);if(this.pending)cancelAnimationFrame(this.pending);this.disposeScene();this.observer.disconnect();this.resizeObserver.disconnect();window.removeEventListener('message',this.onMessage);document.removeEventListener('visibilitychange',this.onVisibility);}
}
