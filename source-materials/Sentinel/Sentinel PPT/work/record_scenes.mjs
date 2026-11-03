import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
await fs.mkdir('work/recordings',{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-gl=angle','--use-angle=metal']});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
const exposures={
 'truck-day-night':'window.__rec={renderer,scene,camera,controls,ready:()=>started};',
 'truck-sentinel-runner':'window.__rec={renderer,scene,camera,controls,startPath,ready:()=>started};',
 'truck-sentinel-mount':'window.__rec={renderer,scene,camera,controls,setUnit,ready:()=>started};',
 'truck64-iot':'window.__rec={renderer,scene,camera,controls,ITEMS,commLines,applyMode,ready:()=>loaded};',
 'sentinel-only':'window.__rec={renderer,scene,camera,ready:()=>ready};',
};
await page.route('**/3D/*.html*',async route=>{
 const url=new URL(route.request().url());const name=decodeURIComponent(path.basename(url.pathname,'.html'));
 let html=await fs.readFile(path.join(root,'素材/Sentinel Keynote HTML/3D',name+'.html'),'utf8');
 const injection=`\nscene.background=new THREE.Color(0x070B13); renderer.setClearColor(0x070B13,1); ${exposures[name]||''}\n`;
 const at=html.lastIndexOf('</script>');html=html.slice(0,at)+injection+html.slice(at);
 await route.fulfill({body:html,contentType:'text/html'});
});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
const scenes=[['truck-sentinel-mount',16,'installation']];
for(const [name,duration,out] of scenes){
 await page.goto('http://127.0.0.1:8765/'+encodeURI('素材/Sentinel Keynote HTML/3D/'+name+'.html'));
 await page.waitForFunction(()=>window.__rec?.ready(),{timeout:60000});
 await page.evaluate(name=>{
  const s=window.__rec;
  if(s.controls){s.controls.autoRotate=false;}
  if(name==='truck-day-night'){window.__dn.cfg.period=20;}
  if(name==='truck-sentinel-runner'){s.startPath('Wandering');}
  if(name==='truck-sentinel-mount'){s.setUnit(0,true);s.camera.clearViewOffset();s.camera.aspect=1920/1080;s.camera.updateProjectionMatrix();}
  if(name==='truck64-iot'){
   s.applyMode('wireframe');
   for(const i of [2,3]){s.ITEMS[i].vis=false;if(s.ITEMS[i].group)s.ITEMS[i].group.visible=false;}
   s.ITEMS[2].p.y=-100;s.ITEMS[3].p.y=-100;
   s.controls.autoRotate=true;s.controls.autoRotateSpeed=.45;
   s.controls.target.set(0,1.7,0);s.camera.position.set(6,4,10);s.camera.clearViewOffset();s.camera.updateProjectionMatrix();
   window.postMessage({type:'iot-lang',labels:[['Fuel sensor','Integration concept'],['',''],['',''],['Door sensor','Integration concept']]},'*');
  }
 },name);
 await page.waitForTimeout(500);
 await page.screenshot({path:`work/recordings/${out}-poster.png`});
 await page.evaluate(({name,duration})=>{
  const canvas=window.__rec.renderer.domElement;
  const stream=canvas.captureStream(30);const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:14000000});
  const chunks=[];window.__recorded=new Promise(resolve=>{
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   recorder.onstop=async()=>{const b=new Blob(chunks,{type:'video/webm'});const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(b);};
  });
  recorder.start(1000);
  if(name==='truck-sentinel-runner')setTimeout(()=>window.__rec.startPath('Stealing'),10000);
  if(name==='truck-sentinel-mount')setTimeout(()=>window.__rec.setUnit(1,true),6500);
  setTimeout(()=>recorder.stop(),duration*1000);
 },{name,duration});
 const data=await page.evaluate(()=>window.__recorded);
 await fs.writeFile(`work/recordings/${out}.webm`,Buffer.from(data,'base64'));
 console.log(JSON.stringify({scene:name,duration,bytes:Buffer.byteLength(data,'base64'),errors:errors.splice(0)}));
}
await browser.close();
