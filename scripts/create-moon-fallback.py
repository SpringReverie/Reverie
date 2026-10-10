from pathlib import Path
import numpy as np
from PIL import Image
size=900
color=np.asarray(Image.open('public/assets/moon-color.jpg').convert('RGB'))
y,x=np.mgrid[-1:1:complex(size),-1:1:complex(size)]
y=-y
valid=x*x+y*y<=1
z=np.sqrt(np.clip(1-x*x-y*y,0,1))
u=np.mod(np.arctan2(x,z)/(2*np.pi)+.5,1)
v=.5-np.arcsin(np.clip(y,-1,1))/np.pi
ix=(u*(color.shape[1]-1)).astype(int)
iy=(v*(color.shape[0]-1)).astype(int)
light=np.array([-3.3,1.6,3.5]); light=light/np.linalg.norm(light)
shade=np.maximum(0,x*light[0]+y*light[1]+z*light[2])*.92+.06
rgb=np.clip(color[iy,ix]*shade[:,:,None]*1.5,0,255).astype('uint8')
alpha=(valid*255).astype('uint8')
Image.fromarray(np.dstack([rgb,alpha])).save('public/assets/moon-fallback.png',optimize=True)
print('Moon fallback ready')
