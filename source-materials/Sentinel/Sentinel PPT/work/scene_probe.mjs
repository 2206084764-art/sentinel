import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-gl=angle','--use-angle=metal']});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,500));});
for(const name of ['truck64-iot','truck-day-night','truck-sentinel-runner','truck-sentinel-mount','globe-sentinel','sentinel-only','sentinel-soc','globe-only']){
 await page.goto('http://127.0.0.1:8765/'+encodeURI('素材/Sentinel Keynote HTML/3D/'+name+'.html'));
 await page.waitForTimeout(6500);
 await page.screenshot({path:`work/${name}.png`});
 console.log(name,await page.locator('canvas').count(),errors.splice(0));
}
await browser.close();
