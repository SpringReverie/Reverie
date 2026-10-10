from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
paths=sorted([p for p in Path('.').glob('*.jpg') if len(p.stem)>25 and all(c in '0123456789abcdef' for c in p.stem)])
sheet=Image.new('RGB',(1200,700),'#1c1f24'); draw=ImageDraw.Draw(sheet)
for i,p in enumerate(paths):
 image=Image.open(p); image=ImageOps.contain(image,(380,280)); x=(i%3)*400+(400-image.width)//2; y=(i//3)*350; sheet.paste(image,(x,y)); draw.text(((i%3)*400+15,y+285),str(i+4)+' '+p.name,fill='white')
sheet.save('photo-inventory.jpg');print('\n'.join(p.name for p in paths))
