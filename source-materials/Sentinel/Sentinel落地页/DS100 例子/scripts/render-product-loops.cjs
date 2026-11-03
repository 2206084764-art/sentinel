/* Bake genuine 60fps frames from the existing scenes; no realtime screen recording. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const baseURL = process.argv[2] || 'http://127.0.0.1:8768';
const output = process.argv[3];
if (!output) throw new Error('Usage: node scripts/render-product-loops.cjs <preview URL> <output directory> [--preview]');
const preview = process.argv.includes('--preview');
const scenes = [
  {name:'hero', scene:'sentinel-only', width:960, height:800, fps:60, duration:18},
  {name:'globe', scene:'globe-sentinel', width:720, height:720, fps:60, duration:18},
];

function captureAPI(kind) {
  return `
const captureCanvas = document.createElement('canvas');
captureCanvas.width = renderer.domElement.width;
captureCanvas.height = renderer.domElement.height;
const captureContext = captureCanvas.getContext('2d', {alpha:false});
window.productLoopCapture = {
  ready: () => ready && !!sentEdges,
  frame(seconds) {
    const phase = ((seconds % 18) + 18) % 18;
    const ease = x => x*x*x*(x*(x*6-15)+10);
    const m = ${kind === 'hero' ? '1' : 'phase < 4 ? 0 : phase < 7 ? ease((phase-4)/3) : phase < 12 ? 1 : phase < 15 ? 1-ease((phase-12)/3) : 0'};
    updateCloud(m);
    const turn = phase / 18 * Math.PI * 2;
    cloud.rotation.y = turn;
    const opacity = Math.min(1, Math.max(0, m-.7)/.27);
    sentEdges.rotation.y = turn;
    sentEdges.material.opacity = opacity*.92;
    sentEdges.visible = opacity > .015;
    if (sentGhost) {
      sentGhost.rotation.y = turn;
      sentGhost.children.forEach(mesh => mesh.material.opacity = opacity*(mesh.userData.op || .16)*${kind === 'hero' ? '.35' : '1'});
      sentGhost.visible = opacity > .015;
    }
    cloud.material.opacity = m > .8 ? Math.max(0, 1-(m-.8)/.17) : 1;
    cloud.visible = cloud.material.opacity > .01;
    cloud.material.size = .02-.007*m;
    renderer.render(scene, camera);
    captureContext.fillStyle = '#000';
    captureContext.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    captureContext.drawImage(renderer.domElement, 0, 0);
    return captureCanvas.toDataURL('image/png').split(',')[1];
  }
};
`;
}

(async () => {
  fs.mkdirSync(output, {recursive:true});
  const browser = await chromium.launch({channel:'chrome', headless:true});
  try {
    for (const config of scenes) {
      const folder = path.join(output, config.name);
      fs.mkdirSync(folder, {recursive:true});
      const page = await browser.newPage({viewport:{width:config.width, height:config.height}});
      page.on('pageerror', error => {throw error;});
      await page.addInitScript(() => {
        let seed = 41221;
        Math.random = () => {seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296;};
        window.requestAnimationFrame = () => 0;
      });
      let html = fs.readFileSync(path.join('assets/3d', config.scene+'.html'), 'utf8');
      html = html.replace('antialias:true, alpha:true', 'antialias:true, alpha:true, preserveDrawingBuffer:true');
      html = html.replace(/renderer\.setPixelRatio\([^;]+;/, 'renderer.setPixelRatio(1);');
      const end = html.lastIndexOf('</script>');
      if (end < 0) throw new Error('Scene module missing');
      html = html.slice(0, end) + captureAPI(config.name) + html.slice(end);
      const url = baseURL+'/assets/3d/'+config.scene+'.html?loop-capture=1';
      await page.route(url, route => route.fulfill({contentType:'text/html', body:html}));
      await page.goto(url, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => window.productLoopCapture?.ready(), {}, {timeout:90000, polling:100});
      const count = config.fps * config.duration;
      const indices = preview ? [0, 240, 420, 660, 840, count-1] : Array.from({length:count}, (_,i) => i);
      for (const index of indices) {
        const png = await page.evaluate(t => window.productLoopCapture.frame(t), index/config.fps);
        fs.writeFileSync(path.join(folder, String(index).padStart(4,'0')+'.png'), Buffer.from(png, 'base64'));
        if (preview || index % 120 === 0) console.log(config.name, index+'/'+count);
      }
      // Save the exact closure frame to check seam continuity against frame zero.
      const seam = await page.evaluate(() => window.productLoopCapture.frame(18));
      fs.writeFileSync(path.join(folder, 'seam.png'), Buffer.from(seam, 'base64'));
      await page.close();
    }
    fs.writeFileSync(path.join(output, 'loops.json'), JSON.stringify(scenes, null, 2));
    console.log('RENDERED', output);
  } finally {await browser.close();}
})().catch(error => {console.error(error); process.exit(1);});
