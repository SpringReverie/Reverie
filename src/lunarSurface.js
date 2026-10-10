import { sitePath } from './sitePath';
// Orthographic projection of the unlit NASA albedo map, with Lambert lighting.
// The terminator and crescent horns follow the sphere instead of a circular cutout.
const surfaces = new Map();
let albedoPromise;
const clamp = x => Math.min(1, Math.max(0, x));
const smooth = x => { const t = clamp(x); return t * t * (3 - 2 * t); };

function getAlbedo() {
  if (!albedoPromise) albedoPromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        resolve({ width: canvas.width, height: canvas.height, pixels: context.getImageData(0, 0, canvas.width, canvas.height).data });
      } catch (error) { reject(error); }
    };
    image.onerror = () => reject(new Error('Moon albedo could not load'));
    image.src = sitePath('assets/moon-color.jpg');
  });
  // Preserve the calculated phase if the texture is unavailable.
  return albedoPromise.catch(() => ({ width: 1, height: 1, pixels: new Uint8ClampedArray([145, 145, 145, 255]) }));
}

export function makeLunarSurface(phase) {
  if (!surfaces.has(phase)) surfaces.set(phase, getAlbedo().then(({ width, height, pixels }) => {
    const resolution = 768;
    const canvas = document.createElement('canvas');
    canvas.width = resolution; canvas.height = resolution;
    const context = canvas.getContext('2d');
    const output = context.createImageData(resolution, resolution);
    const radius = resolution / 2 - 1;
    const light = phase === 'crescent' ? [.85, .24, -.47] : [-.88, .18, -.40];
    const length = Math.hypot(...light);
    const [lx, ly, lz] = light.map(value => value / length);
    const sample = (u, v) => {
      const px = ((u % 1 + 1) % 1) * (width - 1);
      const py = clamp(v) * (height - 1);
      const x = Math.floor(px), y = Math.floor(py), dx = px - x, dy = py - y;
      const x1 = (x + 1) % width, y1 = Math.min(y + 1, height - 1);
      const a = pixels[(y * width + x) * 4], b = pixels[(y * width + x1) * 4];
      const c = pixels[(y1 * width + x) * 4], d = pixels[(y1 * width + x1) * 4];
      return ((a * (1 - dx) + b * dx) * (1 - dy) + (c * (1 - dx) + d * dx) * dy) / 255;
    };
    for (let py = 0; py < resolution; py++) for (let px = 0; px < resolution; px++) {
      const nx = (px + .5 - resolution / 2) / radius;
      const ny = (resolution / 2 - py - .5) / radius;
      const r2 = nx * nx + ny * ny;
      if (r2 >= 1) continue;
      const nz = Math.sqrt(1 - r2);
      const incidence = nx * lx + ny * ly + nz * lz;
      if (incidence <= 0) continue;
      const u = .5 + Math.atan2(nx, nz) / (2 * Math.PI);
      const v = .5 - Math.asin(ny) / Math.PI;
      const albedo = sample(u, v);
      const luminance = Math.pow(albedo, .65) * Math.pow(incidence, .48) * 1.75;
      const edge = clamp((1 - Math.sqrt(r2)) * radius);
      const index = (py * resolution + px) * 4;
      output.data[index] = Math.min(248, luminance * 246);
      output.data[index + 1] = Math.min(250, luminance * 250);
      output.data[index + 2] = Math.min(255, luminance * 258);
      output.data[index + 3] = Math.round(255 * edge * smooth(incidence / .095));
    }
    context.putImageData(output, 0, 0);
    return canvas.toDataURL('image/png');
  }));
  return surfaces.get(phase);
}
