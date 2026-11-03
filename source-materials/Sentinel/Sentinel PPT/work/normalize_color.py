from pathlib import Path
import subprocess,concurrent.futures
ROOT=Path(__file__).resolve().parent.parent
ff=(ROOT/'work/ffmpeg_path.txt').read_text();out=ROOT/'work/color-fixed';out.mkdir(exist_ok=True)
names=['aov-demo','ai-detection','installation','iot-installation','product-rotation']
def convert(name):
 source=ROOT/'deliverables/video-backup'/(name+'.mp4');dest=out/(name+'.mp4')
 cmd=[ff,'-hide_banner','-v','error','-y','-i',str(source),'-map','0:v:0','-vf','scale=in_range=full:out_range=limited,format=yuv420p','-r','30','-c:v','libx264','-preset','fast','-crf','18','-profile:v','high','-level','4.1','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-an','-map_metadata','-1','-movflags','+faststart',str(dest)]
 subprocess.run(cmd,check=True)
 r=subprocess.run([ff,'-hide_banner','-i',str(dest)],capture_output=True,text=True)
 if ' yuv420p(tv' not in r.stderr:raise RuntimeError('Unexpected color format '+name+' '+r.stderr)
 (ROOT/'work'/(name+'-probe.txt')).write_text(r.stderr)
 print(name,'yuv420p / tv',dest.stat().st_size,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(convert,names))
