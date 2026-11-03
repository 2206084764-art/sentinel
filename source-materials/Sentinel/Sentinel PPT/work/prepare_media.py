from pathlib import Path
import subprocess,json
ROOT=Path(__file__).resolve().parent.parent
ff=(ROOT/'work/ffmpeg_path.txt').read_text()
out=ROOT/'deliverables/video-backup';post=ROOT/'work/posters';post.mkdir(exist_ok=True)
rec=ROOT/'work/recordings'
def run(args):
 r=subprocess.run([ff,'-hide_banner','-loglevel','error','-y',*map(str,args)],capture_output=True,text=True)
 if r.returncode:raise RuntimeError(r.stderr)
def encode(source,dest,vf='fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x070B13,setsar=1',audio=False,pre=[]):
 run([*pre,'-i',source,'-map','0:v:0','-vf',vf,'-c:v','libx264','-preset','fast','-crf','20','-profile:v','high','-level','4.1','-pix_fmt','yuv420p',*(['-map','0:a:0?','-c:a','aac','-b:a','192k','-ac','2','-ar','48000'] if audio else ['-an']),'-map_metadata','-1','-movflags','+faststart',dest])
encode(ROOT/'素材/product.mp4',out/'product-reveal.mp4',audio=True)
print('Product film encoded',flush=True)
for name in ['aov-day-night','ai-scenario','installation','iot-installation','product-rotation']:
 dest=out/(name+'.mp4') if name in ['installation','iot-installation','product-rotation'] else rec/(name+'.mp4')
 encode(rec/(name+'.webm'),dest)
 print(name,'encoded',flush=True)
# Blurring removes identifiable detail from supplied demonstration footage.
# Timestamp, location and vehicle metadata bands are covered as well.
privacy='gblur=sigma=13,drawbox=x=0:y=0:w=iw:h=100:color=0x070B13:t=fill,drawbox=x=0:y=ih-115:w=iw:h=115:color=0x070B13:t=fill,fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x070B13,setsar=1'
encode(ROOT/'素材/Sentinel Keynote HTML/Videos/aov-loop.mp4',rec/'aov-footage.mp4',privacy)
encode(ROOT/'素材/Sentinel Keynote HTML/Videos/ai-pose.mp4',rec/'ai-footage.mp4',privacy,pre=['-ss','3','-t','28'])
for name,clips in [('aov-demo',['aov-day-night','aov-footage']),('ai-detection',['ai-scenario','ai-footage'])]:
 listing=rec/(name+'.txt');listing.write_text(''.join("file '"+str(rec/(c+'.mp4'))+"'\n" for c in clips))
 run(['-f','concat','-safe','0','-i',listing,'-c','copy','-an','-movflags','+faststart',out/(name+'.mp4')])
 print(name,'assembled',flush=True)
for name,sec in [('product-reveal',73),('aov-demo',4),('ai-detection',14),('installation',4),('iot-installation',6),('product-rotation',3)]:
 run(['-ss',sec,'-i',out/(name+'.mp4'),'-frames:v','1','-q:v','2',post/(name+'.jpg')])
for f in out.glob('*.mp4'):
 r=subprocess.run([ff,'-hide_banner','-i',str(f)],capture_output=True,text=True)
 (ROOT/'work'/(f.stem+'-probe.txt')).write_text(r.stderr)
 print(f.name,f.stat().st_size,flush=True)
