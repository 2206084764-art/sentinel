"""Rebuild the standalone IoT scene from the untouched marketing reference and local Three.js."""
from pathlib import Path
import base64, json, re
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / '素材/Sentinel Keynote HTML/3D/truck64-iot.html'
VENDOR = ROOT / 'assets/3d/vendor/three'
OUTPUT = ROOT / 'assets/3d/marketing-iot.html'
html = SOURCE.read_text()
# Keep model data byte-for-byte intact while adapting the scene's colors and runtime.
models = {}
def hold(match):
    key = 'SENTINEL_EMBEDDED_MODEL_' + str(len(models))
    models[key] = match.group(0)
    return key
html = re.sub(r"const (?:TRUCK|SENT)_GLB_URL\s*=\s*'data:[^']+';", hold, html)
assert len(models) == 2
for old, new in {
    '#FFC53D':'#C4E63C', '#009EFD':'#AACC03', '#FF3B30':'#D5ED82', '#FF7A1A':'#7F9D35',
    '#2AF598':'#AACC03', 'rgba(8,12,20,.86)':'rgba(5,7,6,.9)',
    '0xffb43a':'0xc4e63c', '0xd06a00':'0x607500', '0x3aa0ff':'0xaacc03', '0x1050a0':'0x485a00',
    '0xff4436':'0xd5ed82', '0xa01008':'0x647630', '0x49c96a':'0x7f9d35', '0x0d7a2a':'0x3e5118',
    '0xFF3B30':'0xD5ED82', '0x65d7ff':'0xAACC03', '0x5ec8ff':'0xAACC03', '0x49b6e8':'0xAACC03'
}.items():
    html = html.replace(old, new)
html = html.replace('</head>', '''<link rel="stylesheet" href="../fonts/harmonyos.css">
<script>
(()=>{
  const fail=()=>parent.postMessage({type:'sentinel-iot-error'},location.protocol==='file:'?'*':location.origin);
  addEventListener('error',fail);addEventListener('unhandledrejection',fail);
})();
</script>
<style>
html,body{background:transparent!important}
#labels{font-family:inherit}
.slabel .nm{font-size:clamp(9px,1.5vh,15px)}
.slabel .inf{font-size:clamp(8px,1.3vh,13px)}
@media(max-width:480px){.slabel:last-child{--off:11vh}}
</style></head>''')
html = html.replace('function applyViewShift(){ camera.aspect=innerWidth/innerHeight;', 'function applyViewShift(){ camera.aspect=innerWidth/innerHeight; camera.zoom=Math.min(1,camera.aspect/1.1);')
old = 'controls.target.set(0,1.7,0); controls.autoRotate=false; controls.autoRotateSpeed=0.5;'
assert old in html
html = html.replace(old, old + '''
controls.enableZoom=false; controls.enablePan=false;
renderer.domElement.style.touchAction='pan-y pinch-zoom';
renderer.domElement.style.cursor='grab';
controls.addEventListener('start',()=>{renderer.domElement.style.cursor='grabbing';});
controls.addEventListener('end',()=>{renderer.domElement.style.cursor='grab';});
const reducedMotion=new URLSearchParams(location.search).get('motion')==='reduce';
let readySent=false;
const hostOrigin=location.protocol==='file:'?'*':location.origin;
const tellHost=type=>parent.postMessage({type},hostOrigin);
renderer.domElement.addEventListener('webglcontextlost',()=>tellHost('sentinel-iot-error'));
''')
html = html.replace("textContent='Could not parse the embedded model.';", "textContent='Could not parse the embedded model.';tellHost('sentinel-iot-error');")
html = html.replace("    ITEMS[0].group.add(r);\n  });", "    ITEMS[0].group.add(r);\n  },undefined,()=>tellHost('sentinel-iot-error'));")
old='(function animate(){ requestAnimationFrame(animate); const dt=Math.min(0.05,clock.getDelta()); updateCommLines(dt); controls.update(); renderer.render(scene,camera); updateLabels(); })();'
assert old in html
html = html.replace(old, '''(function animate(){
  requestAnimationFrame(animate);
  const dt=reducedMotion?0:Math.min(0.05,clock.getDelta());
  updateCommLines(dt); controls.update(); renderer.render(scene,camera); updateLabels();
  if(!readySent && loaded && ITEMS[0].group?.children.length){readySent=true;tellHost('sentinel-iot-ready');}
})();''')
# Keep the mode shortcuts; let page-navigation keys keep their normal browser behavior.
html = re.sub(r"  else if\(\['ArrowRight'.*?\n  \}", '', html, count=1, flags=re.S)
old="window.addEventListener('message',e=>{ const d=e.data||{};"
assert old in html
html = html.replace(old, "window.addEventListener('message',e=>{ if(e.source!==parent || (location.protocol!=='file:' && e.origin!==location.origin))return; const d=e.data||{};")
html = html.replace("if(d&&d.type==='iot-set') applyMode(d.mode);", "if(d&&d.type==='iot-set' && ['solid','wireframe','particles'].includes(d.mode)) applyMode(d.mode);")
for key, value in models.items():
    html = html.replace(key, value)
# Embed the existing module graph as data URLs, so file:// never imports a blocked local ES module.
imports, visited = {}, set()
pattern = re.compile(r"(^\s*(?:import|export)\s+(?:[\w*$ {},\s]+?\s+from\s+)?['\"])([^'\"\n]+)(['\"])", re.M)
def module_key(path):
    path = path.resolve()
    if path == (VENDOR / 'build/three.module.js').resolve(): return 'three'
    return 'three/addons/' + path.relative_to((VENDOR / 'examples/jsm').resolve()).as_posix()
def collect(path):
    path = path.resolve(); key = module_key(path)
    if key in visited: return
    visited.add(key)
    code = path.read_text()
    def rewrite(match):
        spec = match.group(2)
        if spec == 'three': dependency = VENDOR / 'build/three.module.js'
        elif spec.startswith('three/addons/'): dependency = VENDOR / 'examples/jsm' / spec[len('three/addons/'):]
        elif spec.startswith('.'): dependency = path.parent / spec
        else: raise ValueError('Unexpected module import: '+spec)
        collect(dependency)
        return match.group(1) + module_key(dependency) + match.group(3)
    code = pattern.sub(rewrite, code)
    code = re.sub(r'^//# sourceMappingURL=.*$', '', code, flags=re.M)
    imports[key] = 'data:text/javascript;base64,' + base64.b64encode(code.encode()).decode()
main = re.search(r'<script type="module">(.*?)</script>', html, re.S).group(1)
for match in pattern.finditer(main):
    spec = match.group(2)
    if spec == 'three': collect(VENDOR / 'build/three.module.js')
    elif spec.startswith('three/addons/'): collect(VENDOR / 'examples/jsm' / spec[len('three/addons/'):])
map_script = '<script type="importmap">'+json.dumps({'imports':imports},separators=(',',':'))+'</script>'
html, count = re.subn(r'<script type="importmap">.*?</script>', lambda _: map_script, html, count=1, flags=re.S)
assert count == 1
OUTPUT.write_text(html)
print('Built',OUTPUT.relative_to(ROOT),len(html.encode()),'bytes;',len(imports),'embedded local modules; original source unchanged.')
