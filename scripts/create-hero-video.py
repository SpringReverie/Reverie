"""Generate an original seamless orbital study; no external media required."""
from pathlib import Path
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'assets'
W, H, FPS, SECONDS = 1280, 720, 24, 10
command = [imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-f', 'rawvideo', '-vcodec', 'rawvideo', '-s', f'{W}x{H}', '-pix_fmt', 'rgb24', '-r', str(FPS), '-i', '-', '-an', '-vcodec', 'libx264', '-preset', 'fast', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(OUT / 'orbital-study.mp4')]
proc = subprocess.Popen(command, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

def project(points, angle):
    x, y, z = points.T
    xr, zr = x * math.cos(angle) + z * math.sin(angle), -x * math.sin(angle) + z * math.cos(angle)
    yt = y * math.cos(.62) - zr * math.sin(.62)
    zt = y * math.sin(.62) + zr * math.cos(.62)
    s = 480 / (4.4 - zt)
    return np.column_stack((xr * s + 930, yt * s + 355)), zt

for frame in range(FPS * SECONDS):
    phase = frame / (FPS * SECONDS) * math.tau
    im = Image.new('RGB', (W,H), '#101212')
    glow = Image.new('RGB', (W,H), '#000000')
    gd = ImageDraw.Draw(glow)
    gd.ellipse((650,80,1250,650), fill=(19,23,19))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    im = Image.fromarray(np.minimum(np.array(im).astype(int)+np.array(glow).astype(int),255).astype('uint8'))
    draw = ImageDraw.Draw(im)
    lines = []
    for u in np.linspace(0, math.tau, 76, endpoint=False):
        v = np.linspace(0, math.tau, 100)
        r = 1.63 + .56 * np.cos(v)
        points = np.column_stack((r * np.cos(u), .56 * np.sin(v), r * np.sin(u)))
        p, depth = project(points, phase)
        lines.append((float(depth.mean()), p, True))
    for v in np.linspace(0, math.tau, 20, endpoint=False):
        u = np.linspace(0, math.tau, 200)
        r = 1.63 + .56 * math.cos(v)
        points = np.column_stack((r * np.cos(u), np.full_like(u,.56 * math.sin(v)), r * np.sin(u)))
        p, depth = project(points, phase)
        lines.append((float(depth.mean()), p, False))
    for depth, p, rib in sorted(lines, key=lambda a:a[0]):
        light = int(44 + (depth+2.2)/4.4 * (130 if rib else 58))
        draw.line([tuple(x) for x in p], fill=(light,light+5,min(255,light+2)), width=1)
    marker, _ = project(np.array([[2.34*math.cos(phase), 0, 2.34*math.sin(phase)]]), 0)
    x,y = marker[0]
    draw.ellipse((x-3,y-3,x+3,y+3),fill='#d5ed91')
    if frame == 0:
        im.save(OUT / 'orbital-poster.jpg', quality=92)
    proc.stdin.write(im.tobytes())
proc.stdin.close()
if proc.wait() != 0:
    raise RuntimeError('Video encoding failed')
print('Created orbital-study.mp4 and orbital-poster.jpg')
