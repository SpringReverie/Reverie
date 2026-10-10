from pathlib import Path
from PIL import Image, ImageOps
import json
root=Path.cwd().resolve()
new=sorted([p for p in root.glob('*.jpg') if len(p.stem)>25 and all(c in '0123456789abcdef' for c in p.stem)])
original=[root/f'摄影作品{i}.jpg' for i in range(1,4)]
rename_log=[]
for i,p in enumerate(original+new,1):
 target=root/f'摄影作品{i:02d}.jpg'
 if p.exists():
  if target.exists(): raise RuntimeError(f'Already exists: {target}')
  p.rename(target);rename_log.append({'original':p.name,'renamed':target.name})
if rename_log:(root/'scripts/photography-renames.json').write_text(json.dumps(rename_log,ensure_ascii=False,indent=2),encoding='utf-8')
photo_dir=root/'public/assets/photography';photo_dir.mkdir(parents=True,exist_ok=True)
titles=['春日近观','山风与云','日落之前','江畔夜色','夜行光廊','树与屋檐','水上灯火','月下海岸','街巷深处']
photos=[]
for i,p in enumerate(sorted(root.glob('摄影作品??.jpg')),1):
 image=ImageOps.exif_transpose(Image.open(p)).convert('RGB');image.thumbnail((2200,2200))
 name=f'photography-{i:02d}.webp';image.save(photo_dir/name,quality=88,method=6)
 thumb=image.copy();thumb.thumbnail((850,850));thumb.save(photo_dir/f'photography-{i:02d}-thumb.webp',quality=82,method=6)
 photos.append({'id':f'{i:02d}','title':titles[i-1],'src':f'/assets/photography/{name}','thumb':f'/assets/photography/photography-{i:02d}-thumb.webp','original':p.name})
cert_names=['ai训练师初级证书.png','ai训练师高级证书.png','阿里云大模型.jpg','阿里云RAG.jpg','阿里云Spring AI.jpg','阿里云Vision进阶.jpg','基于百炼平台构建智能体应用.jpg','基于通义灵码实现高效AI编码实践.jpg','基于PAI ArtLab的AIGC设计基础.jpg','VISION人工智能设计(入门).jpg','科大微调工程师.jpg','科大智能体工程师.jpg','科大Prompt工程师.jpg','科大RAG工程师.jpg','华为AI智能语音识别.png','人工智能初识微认证.jpg','Bh Python.png']
cert_dir=root/'public/assets/certificates';cert_dir.mkdir(parents=True,exist_ok=True)
certs=[]
for i,name in enumerate(cert_names,1):
 image=ImageOps.exif_transpose(Image.open(root/name)).convert('RGB');image.thumbnail((1900,1900))
 filename=f'certificate-{i:02d}.webp';image.save(cert_dir/filename,quality=90,method=6)
 thumb=image.copy();thumb.thumbnail((700,700));thumb.save(cert_dir/f'certificate-{i:02d}-thumb.webp',quality=83,method=6)
 certs.append({'id':f'{i:02d}','title':Path(name).stem,'src':f'/assets/certificates/{filename}','thumb':f'/assets/certificates/certificate-{i:02d}-thumb.webp','original':name})
(root/'src/media.js').write_text('export const photographs = '+json.dumps(photos,ensure_ascii=False,indent=2)+';\n\nexport const certificates = '+json.dumps(certs,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print(f'{len(photos)} photographs, {len(certs)} certificates prepared')
