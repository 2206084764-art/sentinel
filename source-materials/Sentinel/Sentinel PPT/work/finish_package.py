from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
ROOT=Path(__file__).resolve().parent.parent
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with ZipFile(ROOT/'work/mac-normalized.pptx') as z:parts={n:z.read(n) for n in z.namelist()}
with ZipFile(ROOT/'work/candidate.pptx') as z:
 for num,name in [(1,'cover-product'),(6,'overview-product')]:
  key=f'ppt/slides/slide{num}.xml';root=E.fromstring(parts[key]);source=E.fromstring(z.read(key))
  target=root.xpath('.//p:pic[p:nvPicPr/p:cNvPr[@name="'+name+'"]]',namespaces=NS)[0]
  item=source.xpath('.//p:pic[p:nvPicPr/p:cNvPr[@name="'+name+'"]]',namespaces=NS)[0]
  for old in target.findall('p:blipFill/a:srcRect',NS):old.getparent().remove(old)
  target.find('p:blipFill',NS).insert(1,deepcopy(item.find('p:blipFill/a:srcRect',NS)))
  old=target.find('p:spPr/a:xfrm',NS);old.getparent().replace(old,deepcopy(item.find('p:spPr/a:xfrm',NS)))
  parts[key]=E.tostring(root,encoding='UTF-8',xml_declaration=True,standalone=True)
key='ppt/slides/slide16.xml';root=E.fromstring(parts[key]);off=root.xpath('.//p:sp[p:nvSpPr/p:cNvPr[@id="5"]]/p:spPr/a:xfrm/a:off',namespaces=NS)[0];off.set('y',str(round(1.65*914400)));parts[key]=E.tostring(root,encoding='UTF-8',xml_declaration=True,standalone=True)
# Empty media action IDs are standard PowerPoint output, not missing links.
# An omitted optional ID is equivalent and keeps generic package validators clean.
for key in list(parts):
 if key.startswith('ppt/slides/slide') and key.endswith('.xml'):
  root=E.fromstring(parts[key]);r='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
  for h in root.findall('.//a:hlinkClick',NS):
   if h.get('{'+r+'}id')=='' and h.get('action')=='ppaction://media':h.attrib.pop('{'+r+'}id')
  for pr in root.xpath('.//a:rPr|.//a:defRPr|.//a:endParaRPr',namespaces=NS):
   latin=pr.find('a:latin',NS)
   if latin is None:
    latin=E.Element('{'+NS['a']+'}latin')
    index=next((i for i,c in enumerate(pr) if E.QName(c).localname in ['ea','cs','sym','hlinkClick','hlinkMouseOver','rtl','extLst']),len(pr))
    pr.insert(index,latin)
   latin.set('typeface','Arial')
  parts[key]=E.tostring(root,encoding='UTF-8',xml_declaration=True,standalone=True)
out=ROOT/'work/final-candidate.pptx'
with ZipFile(out,'w',ZIP_DEFLATED,compresslevel=6) as z:
 for n,data in parts.items():z.writestr(n,data)
print(out,out.stat().st_size)
