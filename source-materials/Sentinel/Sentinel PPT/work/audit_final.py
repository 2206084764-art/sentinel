from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
from hashlib import sha256
import json,posixpath,re,subprocess
ROOT=Path(__file__).resolve().parent.parent
file=ROOT/'deliverables/Sentinel_S5_Webinar_Mac_Animated_Demo.pptx'
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
REL='http://schemas.openxmlformats.org/package/2006/relationships'
audit={'file':file.name,'bytes':file.stat().st_size,'sha256':sha256(file.read_bytes()).hexdigest(),'errors':[],'external_relationships':[],'slides':[],'videos':[],'sources':{}}
before=json.loads((ROOT/'work/source_inventory.json').read_text())
for name,info in before.items():
 actual=sha256((ROOT/name).read_bytes()).hexdigest();audit['sources'][name]={'sha256':actual,'unchanged':actual==info['sha256']}
with ZipFile(file) as z:
 if z.testzip():audit['errors'].append('ZIP CRC error')
 names=set(z.namelist());audit['xml_parts']=0
 for name in names:
  if name.endswith(('.xml','.rels')):
   E.fromstring(z.read(name));audit['xml_parts']+=1
  if name.endswith('.rels'):
   source=posixpath.join(posixpath.dirname(posixpath.dirname(name)),posixpath.basename(name)[:-5]);base=posixpath.dirname(source)
   rels=E.fromstring(z.read(name))
   for rel in rels:
    target=rel.get('Target','')
    if rel.get('TargetMode')=='External':audit['external_relationships'].append({'part':name,'target':target});continue
    resolved=posixpath.normpath(posixpath.join(base,target)).lstrip('/')
    if resolved not in names:audit['errors'].append('Missing part '+resolved)
 for i in range(1,17):
  part=f'ppt/slides/slide{i}.xml';s=E.fromstring(z.read(part));rels=E.fromstring(z.read(f'ppt/slides/_rels/slide{i}.xml.rels'));lookup={r.get('Id'):r for r in rels}
  ids=s.xpath('.//p:cNvPr/@id',namespaces=ns)
  if len(ids)!=len(set(ids)):audit['errors'].append('Duplicate shape ID slide '+str(i))
  empty_media_actions=0
  for e in s.iter():
   for attr,v in e.attrib.items():
    if attr.startswith('{'+ns['r']+'}'):
     if not v and E.QName(e).localname=='hlinkClick' and e.get('action')=='ppaction://media':empty_media_actions+=1;continue
     if v not in lookup:audit['errors'].append(f'Missing relationship slide {i}: {v}')
  text=s.xpath('.//a:t/text()',namespaces=ns)
  record={'slide':i,'editable_text_shapes':int(s.xpath('count(.//p:sp[p:txBody])',namespaces=ns)),'text_runs':len(text),'video_objects':int(s.xpath('count(.//a:videoFile)',namespaces=ns)),'connectors':int(s.xpath('count(.//p:cxnSp)',namespaces=ns)),'entrance_effects':int(s.xpath('count(.//p:cTn[@presetClass="entr"])',namespaces=ns)),'empty_media_action_ids':empty_media_actions}
  audit['slides'].append(record)
  for v in s.findall('.//a:videoFile',ns):
   rid=v.get('{'+ns['r']+'}link');rel=lookup[rid];target=posixpath.normpath(posixpath.join('ppt/slides',rel.get('Target')))
   digest=sha256(z.read(target)).hexdigest();match=[p.name for p in (ROOT/'deliverables/video-backup').glob('*.mp4') if sha256(p.read_bytes()).hexdigest()==digest]
   audit['videos'].append({'slide':i,'package_part':target,'embedded':rel.get('TargetMode')!='External','bytes':z.getinfo(target).file_size,'backup_match':match})
  for pattern in ['97%','88%','603%','98.67%','3,800','August 2026','PEMEX','FEMSA','Petronas','Petrolimex','312 bugs']:
   if pattern in '\n'.join(text):audit['errors'].append(f'Unapproved legacy text on slide {i}: '+pattern)
audit['slide_count']=len(audit['slides']);audit['embedded_videos']=len(audit['videos']);audit['status']='PASS' if not audit['errors'] else 'FAIL'
(ROOT/'deliverables/preview/PACKAGE_AUDIT.json').write_text(json.dumps(audit,indent=2))
print(json.dumps(audit,indent=2))
