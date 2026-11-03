"""Patch the supplied package and merge native Artifact Tool slide objects.

Original masters, theme, layouts, presentation IDs and order stay in place.
Only slide content/rels, notes and newly embedded media are rewritten.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
from PIL import Image
import posixpath, re, json, hashlib

ROOT=Path(__file__).resolve().parent.parent
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
REL='http://schemas.openxmlformats.org/package/2006/relationships'
CT='http://schemas.openxmlformats.org/package/2006/content-types'
NS={'p':P,'a':A,'r':R}
def q(tag):return '{'+NS[tag.split(':')[0]]+'}'+tag.split(':')[1]
def xml(data):return E.fromstring(data)
def dump(el):return E.tostring(el,encoding='UTF-8',xml_declaration=True,standalone=True)
def sub(parent,tag,**attrs):return E.SubElement(parent,q(tag),{k:str(v) for k,v in attrs.items()})
with ZipFile(ROOT/'Sentinel-Product-Presentation.pptx') as z:parts={x:z.read(x) for x in z.namelist()}
original=parts.copy()
def tree(s):return s.find('p:cSld/p:spTree',NS)
def shape(s,id):return next(x for x in tree(s) if x.xpath('.//p:cNvPr/@id',namespaces=NS)==[str(id)])
def sid(s):return max([int(v) for v in s.xpath('.//p:cNvPr/@id',namespaces=NS)]+[1])+1
def geom(s,x,y,w,h):
 t=s.find('p:spPr/a:xfrm',NS)
 if t is None:t=s.find('p:spPr',NS);t=sub(t,'a:xfrm')
 for c in list(t):t.remove(c)
 sub(t,'a:off',x=round(x*914400),y=round(y*914400));sub(t,'a:ext',cx=round(w*914400),cy=round(h*914400))
def settext(s,copy,size=None,color=None,bold=None):
 body=s.find('p:txBody',NS)
 if body is None:return
 old=body.find('a:p/a:r/a:rPr',NS)
 props=deepcopy(old) if old is not None else E.Element(q('a:rPr'))
 if size:props.set('sz',str(round(size*100)))
 if bold is not None:props.set('b','1' if bold else '0')
 if color:
  for e in props.findall('a:solidFill',NS):props.remove(e)
  fill=E.Element(q('a:solidFill'));sub(fill,'a:srgbClr',val=color);props.insert(0,fill)
 if props.find('a:latin',NS) is None:sub(props,'a:latin',typeface='Arial')
 bp=body.find('a:bodyPr',NS)
 if bp is not None:
  bp.set('wrap','square')
  for c in list(bp):bp.remove(c)
  sub(bp,'a:noAutofit')
 for p in body.findall('a:p',NS):body.remove(p)
 for line in copy.split('\n'):
  p=sub(body,'a:p');pp=sub(p,'a:pPr',algn='l');sub(pp,'a:buNone')
  r=sub(p,'a:r');r.append(deepcopy(props));t=sub(r,'a:t');t.text=line
def edit(s,id,text,**kwargs):settext(shape(s,id),text,**kwargs)
def remove(s,*ids):
 for i in ids:
  try:tree(s).remove(shape(s,i))
  except StopIteration:pass
def text(s,name,copy,x,y,w,h,size=20,color='FFFFFF',bold=False):
 el=deepcopy(shape(xml(original['ppt/slides/slide2.xml']),6));c=el.find('p:nvSpPr/p:cNvPr',NS);c.set('id',str(sid(s)));c.set('name',name)
 settext(el,copy,size,color,bold);geom(el,x,y,w,h);tree(s).append(el);return el
def relroot(num):return xml(parts[f'ppt/slides/_rels/slide{num}.xml.rels'])
def addrel(rels,type,target):
 ids={e.get('Id') for e in rels};i=1
 while f'rId{i}' in ids:i+=1
 rid=f'rId{i}';E.SubElement(rels,'{'+REL+'}Relationship',Id=rid,Type=type,Target=target);return rid
def picture(s,rels,file,name,x,y,w,h):
 ext=Path(file).suffix.lower();media='ppt/media/'+name+ext;parts[media]=Path(file).read_bytes()
 rid=addrel(rels,R+'/image','../media/'+name+ext)
 el=deepcopy(shape(xml(original['ppt/slides/slide2.xml']),2));c=el.find('p:nvPicPr/p:cNvPr',NS);c.set('id',str(sid(s)));c.set('name',name);c.attrib.pop('descr',None)
 el.find('p:blipFill/a:blip',NS).set('{'+R+'}embed',rid)
 if name in ['cover-product','overview-product']:
  im=Image.open(file);bbox=im.getbbox();iw,ih=im.size
  crop=E.Element(q('a:srcRect'),l=str(round(bbox[0]/iw*100000)),t=str(round(bbox[1]/ih*100000)),r=str(round((iw-bbox[2])/iw*100000)),b=str(round((ih-bbox[3])/ih*100000)))
  el.find('p:blipFill',NS).insert(1,crop)
 geom(el,x,y,w,h);tree(s).append(el);return el
def replacepic(s,rels,id,file,name):
 ext=Path(file).suffix;parts['ppt/media/'+name+ext]=Path(file).read_bytes();rid=addrel(rels,R+'/image','../media/'+name+ext)
 shape(s,id).find('p:blipFill/a:blip',NS).set('{'+R+'}embed',rid)
def empty(s):
 for el in list(tree(s))[2:]:
  keep=el.tag==q('p:pic') and el.xpath('.//p:cNvPr/@id',namespaces=NS)==['2']
  if not keep:tree(s).remove(el)
def notes(num,copy):
 name=f'ppt/notesSlides/notesSlide{num}.xml';s=xml(original[name]);b=s.xpath('.//p:sp[p:nvSpPr/p:nvPr/p:ph[@type="body"]]',namespaces=NS)
 if b:settext(b[0],copy,12,'000000',False)
 parts[name]=dump(s)
def video(s,rels,name,x,y,w,h):
 file=ROOT/'deliverables/video-backup'/f'{name}.mp4';poster=ROOT/'work/posters'/f'{name}.jpg'
 if not file.exists():return
 parts['ppt/media/'+name+'.mp4']=file.read_bytes();parts['ppt/media/'+name+'-poster.jpg']=poster.read_bytes()
 vr=addrel(rels,R+'/video','../media/'+name+'.mp4');mr=addrel(rels,'http://schemas.microsoft.com/office/2007/relationships/media','../media/'+name+'.mp4');pr=addrel(rels,R+'/image','../media/'+name+'-poster.jpg');id=sid(s)
 el=xml(f'''<p:pic xmlns:p="{P}" xmlns:a="{A}" xmlns:r="{R}"><p:nvPicPr><p:cNvPr id="{id}" name="Video {name}"><a:hlinkClick r:id="" action="ppaction://media"/></p:cNvPr><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr><a:videoFile r:link="{vr}"/><p:extLst><p:ext uri="{{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}}"><p14:media xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" r:embed="{mr}"/></p:ext></p:extLst></p:nvPr></p:nvPicPr><p:blipFill><a:blip r:embed="{pr}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1" cy="1"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>''')
 geom(el,x,y,w,h);tree(s).append(el)
 for old in s.findall('p:timing',NS):s.remove(old)
 timing=xml(f'''<p:timing xmlns:p="{P}"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:video><p:cMediaNode vol="80000"><p:cTn id="2" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="{id}"/></p:tgtEl></p:cMediaNode></p:video></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>''')
 s.append(timing)
 for link in el.xpath('.//a:hlinkClick',namespaces=NS):link.attrib.pop('{'+R+'}id',None)

mapping=[1,2,4,3,5,6,7,9,10,12,8,11,15,14,13,16]
slides={};rels={}
for i,src in enumerate(mapping,1):
 slides[i]=xml(original[f'ppt/slides/slide{src}.xml']);rels[i]=xml(original[f'ppt/slides/_rels/slide{src}.xml.rels'])
 for r in rels[i]:
  if r.get('Type')==R+'/notesSlide':r.set('Target',f'../notesSlides/notesSlide{i}.xml')
 for el in slides[i].xpath('.//p:cNvPr',namespaces=NS):el.attrib.pop('descr',None)
 try:edit(slides[i],3,f'{i:02}')
 except StopIteration:pass

# Opening: reuse hero, logo and text styles, with supplied product artwork.
s=slides[1];remove(s,9,10,11,12,13,14)
edit(s,5,'STREAMAX WEBINAR',size=14,color='2AF598');geom(shape(s,5),.8,1.65,6,.35)
edit(s,6,'Sentinel S5',size=58);geom(shape(s,6),.74,2.16,7.0,1.05)
edit(s,7,'Fuel Asset Security',size=29,color='FFFFFF');geom(shape(s,7),.8,3.36,6.7,.65)
edit(s,8,'Monitoring parked vehicles and reviewing video evidence',size=18);geom(shape(s,8),.8,4.2,6.6,.9)
text(s,'Speaker','Speaker: [Name / Title]',.8,6.12,7,.45,17,'C7D2DE')
text(s,'Overview','Customer challenges   /   Product demos   /   Applications',.8,5.36,7.5,.5,16,'C7D2DE')
picture(s,rels[1],ROOT/'素材/Sentinel Keynote HTML/Images/sentinel-side.png','cover-product',8.0,1.65,4.4,3.864)
notes(1,'Welcome to the Sentinel S5 webinar on fuel asset security. Introduce the speaker, preview customer challenges, product demonstrations and applications, then hand over to the product expert. Replace speaker name and title before presenting.')

s=slides[2];edit(s,5,'CUSTOMER CHALLENGE');edit(s,6,'Fuel loss at night',size=36)
replacepic(s,rels[2],7,ROOT/'work/media-frames/product-10.jpg','parked-truck');replacepic(s,rels[2],11,ROOT/'work/media-frames/product-30.jpg','staged-night-scenario')
edit(s,9,'Overnight parking',size=20,color='FFFFFF');edit(s,10,'Driver rest periods leave parked vehicles\nwithout active supervision.',size=16)
edit(s,13,'Unattended vehicles',size=20,color='FFFFFF');edit(s,14,'Small, repeated fuel losses can go unnoticed.\nVideo evidence may be unavailable.',size=16)
geom(shape(s,10),1.08,5.98,5.1,.8);geom(shape(s,14),7.13,5.98,5.1,.8)
notes(2,'Discuss overnight parking, driver rest periods and unattended vehicles. Explain that small, repeated losses may be difficult to distinguish from normal consumption and that suspicious activity may lack video evidence. Images are staged frames from the supplied product video, not customer incident evidence.')

s=slides[3];edit(s,5,'EXISTING SOLUTIONS');edit(s,6,'Trade-offs in existing solutions',size=35)
edit(s,7,'Fuel sensors support monitoring with low power. Continuous video provides visual context but can increase power demand.',size=17);geom(shape(s,7),.78,2.38,11.6,.62)
edit(s,10,'VIDEO EVIDENCE',size=12);edit(s,11,'POWER EFFICIENCY',size=12)
edit(s,13,'VIDEO CAMERAS',size=14);edit(s,14,'Visual evidence\nHigher power demand',size=13)
edit(s,16,'SENTINEL S5',size=14);edit(s,17,'Low-power monitoring\nwith event video',size=13)
edit(s,19,'FUEL SENSORS',size=14);edit(s,20,'Low-power signals\nVideo may be separate',size=13)
edit(s,21,'Illustrative positioning\nConfiguration dependent',size=12)
edit(s,22,'Long-duration\nmonitoring\nwith video\nevidence',size=20)
notes(3,'The original editable comparison diagram is retained. Positioning is qualitative. Fuel sensors can provide low-power signals, while continuous video may require more power. Results depend on the devices, power design and configuration. Avoid first, only, guaranteed runtime or court-ready evidence claims.')

# Merge five freshly authored native slides into original slide parts/layouts.
with ZipFile(ROOT/'work/native-additions.pptx') as z:
 for target,src in [(4,1),(11,2),(13,3),(14,4),(15,5)]:
  s=slides[target];empty(s);incoming=xml(z.read(f'ppt/slides/slide{src}.xml'));objs=list(tree(incoming))[2:]
  # Rebase IDs and actual connector targets so package references stay unique.
  idmap={el.get('id'):str(int(el.get('id'))+100) for ob in objs for el in ob.xpath('.//p:cNvPr',namespaces=NS)}
  for ob in objs:
   ob=deepcopy(ob)
   for el in ob.xpath('.//p:cNvPr',namespaces=NS):el.set('id',idmap[el.get('id')])
   for el in ob.xpath('.//a:stCxn|.//a:endCxn',namespaces=NS):el.set('id',idmap[el.get('id')])
   tree(s).append(ob)
  text(s,'Slide number',f'{target:02}',12.23,.3,.6,.25,9,'44566E')
  note=xml(z.read(f'ppt/notesSlides/notesSlide{src}.xml'));copy='\n'.join(note.xpath('.//p:sp[p:nvSpPr/p:nvPr/p:ph[@type="body"]]//a:t/text()',namespaces=NS));notes(target,copy)

s=slides[5];empty(s)
text(s,'Product reveal title','Sentinel S5',.76,.60,8,.65,34,'FFFFFF',True)
text(s,'Playback instruction','Product reveal   /   Click video to play',8.2,.8,4.35,.4,14,'A7B5C5')
video(s,rels[5],'product-reveal',1.30,1.42,10.73,6.0356)
notes(5,'Click the video to start the supplied product film. It introduces the device and a staged parked-vehicle scenario. Source: 素材/product.mp4. The embedded copy is H.264 30 fps with AAC stereo. The film is independent of external files.')

s=slides[6];edit(s,5,'PRODUCT OVERVIEW');edit(s,6,'Sentinel S5 product overview',size=36)
remove(s,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22)
picture(s,rels[6],ROOT/'素材/Sentinel Keynote HTML/Images/sentinel-front.png','overview-product',.75,2.3,4.3,3.8)
features=[('Low-power monitoring','Monitoring during vehicle downtime'),('Night-time detection','Human activity under low light'),('Behavior-based alerts','Events for fleet review'),('Integrated design','Connectivity and storage in one device'),('Video recording','Footage associated with events'),('Deployment setup','Mounting, power and camera calibration')]
for j,(head,body) in enumerate(features):
 id=24+j*2;remove(s,id-1);geom(shape(s,id),5.5,2.35+j*.64,6.8,.32);edit(s,id,head,size=18,color='FFFFFF',bold=True)
 text(s,f'Overview detail {j}',body,5.5,2.68+j*.64,6.8,.32,13,'A7B5C5')
edit(s,35,'Documented interfaces: 4G, Wi-Fi, GNSS, local storage, RS232 and I/O',size=15);geom(shape(s,35),.78,6.78,11.8,.4)
notes(6,'The overview uses functional descriptions instead of unverified numerical performance claims. Sources: latest webinar outline and supplied S5 Product Specification. Documented interfaces include 4G, Wi-Fi, GNSS, local storage, RS232 and I/O. Firmware and launch configuration require product-team confirmation.')

s=slides[7];edit(s,6,'AOV MONITORING');edit(s,7,'AOV low-power\nmonitoring',size=34);edit(s,8,'Monitoring continues after ignition-off\nusing different recording modes.',size=18);geom(shape(s,8),.78,2.92,5.5,.9)
edit(s,10,'Vehicle ignition-off',size=19);edit(s,11,'Monitoring remains active under configured conditions',size=14)
edit(s,13,'Low-frame-rate sampling',size=19);edit(s,14,'Reduced sampling while no person is detected',size=14)
edit(s,16,'Full-frame-rate recording',size=19);edit(s,17,'Person detection changes the recording mode',size=14)
for id in [11,14,17]:geom(shape(s,id),1.12,{11:4.73,14:5.51,17:6.29}[id],4.9,.55)
remove(s,4,18,19,20);video(s,rels[7],'aov-demo',6.36,2.24,6.15,3.4594)
text(s,'AOV media label','Click to play: day / night 3D and AOV footage',6.36,5.94,6.15,.45,16,'2AF598')
text(s,'AOV condition','Illustrative mechanism. Runtime depends on power,\nactivity, storage and configuration.',6.36,6.46,6.15,.65,14,'A7B5C5')
notes(7,'Play the day-to-night 3D recording, followed by anonymized AOV demonstration footage. Explain ignition-off, low-frame-rate sampling, person detection and full-frame-rate recording. Do not imply guaranteed standby duration, power consumption or complete full-frame capture. Sources: 5-AOV.html, 3D/truck-day-night.html, Videos/aov-loop.mp4 and current webinar outline.')

s=slides[8];edit(s,5,'NIGHT-TIME DETECTION');edit(s,6,'Night-time detection',size=36)
edit(s,7,'Low-light human detection supports monitoring. Identification depends on lighting, distance, motion and installation.',size=17);geom(shape(s,7),.78,2.35,11.6,.65)
edit(s,10,'Phone reference',size=16);edit(s,11,'Supplied reference image',size=14)
edit(s,14,'Camera reference',size=16);edit(s,15,'Supplied reference image',size=14)
edit(s,18,'Black Light Ultra',size=16);edit(s,19,'Supplied reference image',size=14)
edit(s,20,'Detection is different from identification. Comparison conditions require confirmation.',size=17);geom(shape(s,20),.78,6.55,11.8,.65)
notes(8,'Original night-image comparison retained. Comparison setup, exposure and ambient illumination are not independently verified. The images illustrate supplied material, not a controlled performance benchmark. Distinguish detecting a person from identifying them. Source: original slide 9 and 7-BlackLightUltra.html. Do not quote the old lux threshold or guarantee face or plate recognition.')

s=slides[9];edit(s,6,'BEHAVIOR-BASED ALERT DEMO');edit(s,7,'Behavior-based\nalert demo',size=34);edit(s,8,'Review the difference between a person\npassing by and activity near the fuel tank.',size=18);geom(shape(s,8),.78,2.88,5.75,.9)
for id,copy in [(11,'Walking past'),(12,'Observe routine movement around the vehicle'),(15,'Suspicious activity'),(16,'Flag behavior near a monitored area'),(19,'Event review'),(20,'Check video evidence and on-site information')]:edit(s,id,copy,size=19 if id in [11,15,19] else 14)
for id in [12,16,20]:geom(shape(s,id),1.30,{12:4.73,16:5.45,20:6.17}[id],5.3,.55)
remove(s,4,21,22);video(s,rels[9],'ai-detection',6.55,2.35,6.0,3.375)
text(s,'AI clip description','Click to play: 3D scenario and anonymized AI footage',6.55,5.95,6.0,.6,16,'2AF598')
text(s,'AI qualification','Illustrative demo. An alert requires operational review.',6.55,6.63,6.0,.45,14,'A7B5C5')
notes(9,'Click to play the existing 3D runner scenario showing walking past and suspicious activity, then the supplied anonymized AI pose demo. The footage demonstrates detection overlays and alert generation, not an accuracy benchmark or a verified customer theft. Source: 6-IntentAI.html, 3D/truck-sentinel-runner.html and Videos/ai-pose.mp4. Review video and on-site information before operational follow-up.')

s=slides[10];edit(s,5,'INSTALLATION');edit(s,6,'Installation & vehicle compatibility',size=34)
edit(s,7,'Mounting position and angle determine the monitored area around the fuel tank.',size=18);geom(shape(s,7),.78,2.37,11.6,.65)
remove(s,8,9,10,11,12,13,14,15,16,17,18,19,20,21)
text(s,'Mounting locations','Mounting positions',.78,3.25,5.1,.4,21,'FFFFFF',True)
text(s,'Mounting detail','Roof, side or mirror-area candidates\nrequire vehicle-specific validation.',.78,3.75,4.9,.85,17,'A7B5C5')
text(s,'Installation checks','Camera angle and clear view\n12V / 24V vehicle power\nConnectivity and commissioning',.78,4.9,5.0,1.5,18,'FFFFFF')
video(s,rels[10],'installation',6.1,3.02,6.45,3.6281)
text(s,'Installation demo label','Click to play mounting and monitored-area demo',6.1,6.81,6.45,.4,14,'2AF598')
notes(10,'Sources: original slide 12, 10-EasyInstall.html, 3D/truck-sentinel-mount.html and supplied S5 Installation Guide / Product Specification. The specification documents 12V and 24V vehicles. Validate the actual mounting method, angle, obstruction, power wiring, available network and calibration for each vehicle. Roof, side and mirror-area positions are candidates, not a universal approval. The 3D field of view is illustrative.')

s=slides[12];edit(s,6,'SENSOR INTEGRATION');edit(s,7,'Sensor integration\nuse cases',size=34)
edit(s,8,'Sensor signals and video can support\nevent verification.',size=18);geom(shape(s,8),.78,2.95,5.4,.8)
for id,copy in [(10,'Fuel sensors'),(11,'Fuel-level change for review'),(13,'Door sensors'),(14,'Door-state event for review'),(16,'Sensor signals'),(17,'Documented RS232 and I/O'),(19,'Video verification'),(20,'Check footage and event context')]:edit(s,id,copy,size=18 if id in [10,13,16,19] else 14)
for j,(l,b) in enumerate([(10,11),(13,14),(16,17),(19,20)]):
 geom(shape(s,l),1.10,4.06+j*.63,4.9,.32);geom(shape(s,b),1.10,4.40+j*.63,4.9,.35)
remove(s,4,21);video(s,rels[12],'iot-installation',6.25,2.48,6.3,3.5438)
text(s,'IoT qualification','Integration concept. Confirm sensor models,\nprotocols and launch support before deployment.',6.25,6.30,6.3,.8,16,'A7B5C5')
notes(12,'Sources: original slide 11, 9-IoTSynergies.html, 3D/truck64-iot.html, sentinel-soc.html and supplied S5 Product Specification. Only RS232 and I/O peripheral interfaces are explicitly documented in that specification. Fuel and door integrations are conceptual use cases pending confirmation of supported device models and protocols. Tire pressure and temperature sensors were removed from the recorded scene. No Bluetooth sensor compatibility is asserted.')

s=slides[16];remove(s,3,8,9)
edit(s,5,'SENTINEL S5',size=15);edit(s,6,'Q&A',size=66);geom(shape(s,6),.74,2.2,5.8,1.25)
edit(s,7,'Power & Deployment\nDetection & Alerts\nConnectivity & Integration',size=24,color='FFFFFF');geom(shape(s,7),.8,3.85,6.4,1.75)
edit(s,10,'Thank you for joining',size=18);geom(shape(s,10),.8,6.4,6.4,.5)
video(s,rels[16],'product-rotation',6.4,1.45,6.6,3.7125)
text(s,'Rotation label','Click for product rotation',7.4,5.55,5,.4,14,'A7B5C5')
notes(16,'Invite questions on power and deployment, detection and alerts, connectivity and integration. Use the optional product rotation video on click. It is a finite clip, not an automatic loop. Confirm any unanswered launch-scope question with the product team after the webinar. Source: 3D/sentinel-only.html.')

# Serialize slide content and keep only referenced image/media relationships.
for i,s in slides.items():
 used=set(s.xpath('.//@r:embed|.//@r:link|.//@r:id',namespaces=NS))
 for r in list(rels[i]):
  if r.get('Type') in [R+'/image',R+'/video','http://schemas.microsoft.com/office/2007/relationships/media'] and r.get('Id') not in used:rels[i].remove(r)
 parts[f'ppt/slides/slide{i}.xml']=dump(s);parts[f'ppt/slides/_rels/slide{i}.xml.rels']=dump(rels[i])
# Remove orphan original customer media, rather than shipping unused sensitive assets.
referenced=set()
for name,data in parts.items():
 if name.endswith('.rels'):
  base=posixpath.dirname(posixpath.dirname(name))
  for r in xml(data):
   if r.get('TargetMode')!='External':referenced.add(posixpath.normpath(posixpath.join(base,r.get('Target',''))))
for name in list(parts):
 if name.startswith('ppt/media/') and name not in referenced:del parts[name]
ct=xml(parts['[Content_Types].xml'])
seen=set()
for e in list(ct):
 if E.QName(e).localname=='Default':
  ext=e.get('Extension').lower()
  if ext in seen:ct.remove(e);continue
  seen.add(ext);e.set('Extension',ext)
  if ext in ['jpg','jpeg']:e.set('ContentType','image/jpeg')
existing=seen
for ext,mime in [('mp4','video/mp4'),('jpg','image/jpeg'),('png','image/png')]:
 if ext not in existing:E.SubElement(ct,'{'+CT+'}Default',Extension=ext,ContentType=mime)
for e in list(ct):
 if E.QName(e).localname=='Override' and e.get('PartName','').lstrip('/') not in parts:ct.remove(e)
parts['[Content_Types].xml']=dump(ct)
out=ROOT/'work/candidate.pptx'
with ZipFile(out,'w',ZIP_DEFLATED,compresslevel=6) as z:
 for n,d in parts.items():z.writestr(n,d)
print(out,'bytes',out.stat().st_size,'media',len([n for n in parts if n.endswith('.mp4')]))
