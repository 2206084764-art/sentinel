"""Port the original installation model with embedded local modules for file:// playback."""
from pathlib import Path
import base64
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / '素材/Sentinel Keynote HTML/3D/truck-sentinel-mount.html'
OUTPUT = ROOT / 'assets/3d/marketing-installation.html'
VENDOR = ROOT / 'assets/3d/vendor/three'
html = SOURCE.read_text()
models = {}

def hold(match):
    key = 'INSTALLATION_EMBEDDED_MODEL_' + str(len(models))
    models[key] = match.group(0)
    return key

html = re.sub(r"const (?:TRUCK_GLB|SENT_GLB)\s*=\s*'data:[^']+';", hold, html)
assert len(models) == 2

def replace(old, new):
    global html
    assert old in html, old
    html = html.replace(old, new)

for old, new in {'0x2AF598':'0xAACC03', '0xBFFFE8':'0xD5ED82', '#49b6e8':'#AACC03', '#9aca3c':'#C4E63C'}.items():
    html = html.replace(old, new)
replace('</head>', '''<link rel="stylesheet" href="../fonts/harmonyos.css">
<script>
(()=>{const fail=()=>parent.postMessage({type:'sentinel-installation-error'},location.protocol==='file:'?'*':location.origin);
addEventListener('error',fail);addEventListener('unhandledrejection',fail);})();
</script></head>''')
replace('Math.min(devicePixelRatio,2)', 'Math.min(devicePixelRatio,1.5)')
replace('controls.target.set(0,2.6,0); controls.autoRotate=true; controls.autoRotateSpeed=0.5;', '''controls.target.set(0,2.6,0); controls.autoRotate=true; controls.autoRotateSpeed=0.5;
const reducedMotion=new URLSearchParams(location.search).get('motion')==='reduce';
const initialUnits=(new URLSearchParams(location.search).get('units')||'11').split('').map(value=>value==='1');
controls.autoRotate=!reducedMotion; controls.enableZoom=false; controls.enablePan=false;
renderer.domElement.style.touchAction='pan-y pinch-zoom'; renderer.domElement.style.cursor='grab';
controls.addEventListener('start',()=>renderer.domElement.style.cursor='grabbing');
controls.addEventListener('end',()=>renderer.domElement.style.cursor='grab');
const tellHost=type=>parent.postMessage({type},location.protocol==='file:'?'*':location.origin);
let readySent=false, settingUnits=false;
renderer.domElement.addEventListener('webglcontextlost',()=>tellHost('sentinel-installation-error'));
''')
replace('function fail(){', "function fail(){ tellHost('sentinel-installation-error');")
replace('hideAllUnits();                                   // revealed by R / T', '''initialUnits.forEach((on,index)=>setUnit(index,on));
  renderer.shadowMap.autoUpdate=false; renderer.shadowMap.needsUpdate=true;''')
replace("try{ parent.postMessage({type:'sent-state',units:shown.slice()},'*'); }catch(_){}", "if(!settingUnits){try{parent.postMessage({type:'sent-state',units:shown.slice()},location.protocol==='file:'?'*':location.origin);}catch(_){}}")
replace('const dt=Math.min(0.05, clock.getDelta()); elapsed+=dt;', 'const dt=reducedMotion?0:Math.min(0.05, clock.getDelta()); elapsed+=dt;')
replace('controls.update(); renderer.render(scene,camera);', '''controls.update(); renderer.render(scene,camera);
  if(started&&!readySent){readySent=true;tellHost('sentinel-installation-ready');}''')
replace('const MNT_SHIFT=0.16;', 'const MNT_SHIFT=0;')
replace('function applyViewShift(){ camera.aspect=innerWidth/innerHeight;', 'function applyViewShift(){ camera.aspect=innerWidth/innerHeight; camera.zoom=Math.min(1,camera.aspect/1.55);')
html = re.sub(r"  if\(\['ArrowRight'.*?\n  \}", '', html, count=1, flags=re.S)
replace("window.addEventListener('message',e=>{ const d=e.data||{};", "window.addEventListener('message',e=>{ if(e.source!==parent || (location.protocol!=='file:' && e.origin!==location.origin))return; const d=e.data||{};")
replace("if(d&&d.type==='sent-toggle') toggleUnit(d.unit===2?1:0);", '''if(d&&d.type==='sent-toggle') toggleUnit(d.unit===2?1:0);
  if(d.type==='sent-set' && Array.isArray(d.units) && d.units.length===2 && d.units.every(value=>typeof value==='boolean')){
    settingUnits=true;d.units.forEach((on,index)=>setUnit(index,on));settingUnits=false;
    parent.postMessage({type:'sent-state',units:shown.slice()},location.protocol==='file:'?'*':location.origin);
  }''')
for key, value in models.items():
    html = html.replace(key, value)

# A data-URL import map reuses the installed Three.js graph without blocked local module imports.
imports, visited = {}, set()
pattern = re.compile(r"(^\s*(?:import|export)\s+(?:[\w*$ {},\s]+?\s+from\s+)?['\"])([^'\"\n]+)(['\"])", re.M)

def module_key(path):
    path = path.resolve()
    if path == (VENDOR / 'build/three.module.js').resolve():
        return 'three'
    return 'three/addons/' + path.relative_to((VENDOR / 'examples/jsm').resolve()).as_posix()

def collect(path):
    path = path.resolve()
    key = module_key(path)
    if key in visited:
        return
    visited.add(key)
    code = path.read_text()

    def rewrite(match):
        spec = match.group(2)
        if spec == 'three':
            dependency = VENDOR / 'build/three.module.js'
        elif spec.startswith('three/addons/'):
            dependency = VENDOR / 'examples/jsm' / spec[len('three/addons/'):]
        elif spec.startswith('.'):
            dependency = path.parent / spec
        else:
            raise ValueError('Unexpected import: ' + spec)
        collect(dependency)
        return match.group(1) + module_key(dependency) + match.group(3)

    code = pattern.sub(rewrite, code)
    code = re.sub(r'^//# sourceMappingURL=.*$', '', code, flags=re.M)
    imports[key] = 'data:text/javascript;base64,' + base64.b64encode(code.encode()).decode()

main = re.search(r'<script type="module">(.*?)</script>', html, re.S).group(1)
for match in pattern.finditer(main):
    spec = match.group(2)
    collect(VENDOR / ('build/three.module.js' if spec == 'three' else 'examples/jsm/' + spec[len('three/addons/'):]))
map_script = '<script type="importmap">' + json.dumps({'imports':imports}, separators=(',',':')) + '</script>'
html, count = re.subn(r'<script type="importmap">.*?</script>', lambda _: map_script, html, count=1, flags=re.S)
assert count == 1
assert all(value in html for value in models.values())
OUTPUT.write_text(html)
print('Built', OUTPUT.relative_to(ROOT), len(html.encode()), 'bytes;', len(imports), 'embedded modules; original models unchanged.')
