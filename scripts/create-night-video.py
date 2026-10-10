"""Create a subtle looping night sky for the lunar portfolio's body hero."""
from pathlib import Path
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw
import imageio_ffmpeg

OUT = Path(__file__).resolve().parents[1] / 'public' / 'assets'
W, H, FPS, SECONDS = 1280, 720, 24, 12
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
x /= W
y /= H
rng = np.random.default_rng(73)
stars = [(float(a), float(b), float(c), float(d)) for a, b, c, d in rng.random((220, 4))]
command = [imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-f', 'rawvideo', '-vcodec', 'rawvideo', '-s', f'{W}x{H}', '-pix_fmt', 'rgb24', '-r', str(FPS), '-i', '-', '-an', '-vcodec', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(OUT / 'moonlit-drift.mp4')]
proc = subprocess.Popen(command, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
try:
    for frame in range(FPS * SECONDS):
        phase = frame / (FPS * SECONDS) * math.tau
        blue = np.exp(-(((x - .72 - .025 * math.sin(phase)) / .34) ** 2 + ((y - .46 - .03 * math.cos(phase)) / .48) ** 2))
        violet = np.exp(-(((x - .23 - .035 * math.cos(phase)) / .35) ** 2 + ((y - .81) / .42) ** 2))
        arr = np.empty((H, W, 3), dtype=np.float32)
        for channel, (base, blue_strength, violet_strength) in enumerate([(16, 18, 12), (24, 25, 7), (44, 37, 24)]):
            arr[:, :, channel] = base + blue * blue_strength + violet * violet_strength
        im = Image.fromarray(arr.astype('uint8'))
        draw = ImageDraw.Draw(im, 'RGBA')
        for sx, sy, size, offset in stars:
            px, py = sx * W, sy * H
            radius = .45 + size * .7
            alpha = int((25 + size * 75) * (.78 + .22 * math.sin(phase + offset * math.tau)))
            draw.ellipse((px - radius, py - radius, px + radius, py + radius), fill=(202, 215, 246, alpha))
        if frame == 0:
            im.save(OUT / 'moonlit-poster.jpg', quality=94)
        proc.stdin.write(im.tobytes())
finally:
    proc.stdin.close()
if proc.wait() != 0:
    raise RuntimeError('Night video encoding failed')
print('Created moonlit-drift.mp4 and moonlit-poster.jpg')
