import { writeFile } from 'node:fs/promises';

// A reproducible, transparent SVG sky: irregular stars and a quiet galactic band.
let seed = 92779;
const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
const round = n => n.toFixed(2);
const stars = [];
const colors = ['#e7edf9', '#c7d9fa', '#b8c9e8', '#e7dfd1'];
for (let i = 0; i < 950; i++) {
  const band = i > 670;
  const x = random() * 1700;
  const y = band ? 720 - x * .31 + (random() + random() - 1) * 260 : random() * 1100;
  if (y < 0 || y > 1100) continue;
  const prominent = i % 91 === 0;
  const r = prominent ? 1.3 + random() * .5 : .28 + Math.pow(random(), 3) * .85;
  const opacity = (prominent ? .68 : .1 + random() * .36) * (x < 760 && y < 480 ? .72 : 1);
  const color = colors[Math.floor(random() * colors.length)];
  stars.push(`<circle cx="${round(x)}" cy="${round(y)}" r="${round(r)}" fill="${color}" opacity="${round(opacity)}"/>`);
  if (prominent) stars.push(`<circle cx="${round(x)}" cy="${round(y)}" r="8" fill="url(#starlight)" opacity=".3"/><path d="M ${round(x-3.5)} ${round(y)} h 7 M ${round(x)} ${round(y-3.5)} v 7" stroke="${color}" stroke-width=".45" opacity=".16"/>`);
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1700" height="1100" viewBox="0 0 1700 1100">
<defs><filter id="haze" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="72"/></filter><radialGradient id="starlight"><stop stop-color="#d1dfff" stop-opacity=".55"/><stop offset="1" stop-color="#d1dfff" stop-opacity="0"/></radialGradient></defs>
<g filter="url(#haze)" transform="rotate(-17 1000 480)"><ellipse cx="1100" cy="460" rx="720" ry="85" fill="#839bdc" opacity=".075"/><ellipse cx="1300" cy="470" rx="300" ry="76" fill="#91b8c9" opacity=".065"/><ellipse cx="710" cy="470" rx="360" ry="58" fill="#ac9ccf" opacity=".045"/><ellipse cx="1050" cy="485" rx="620" ry="18" fill="#172139" opacity=".4"/></g>
${stars.join('\n')}
</svg>`;
await writeFile(new URL('../public/assets/night-sky.svg', import.meta.url), svg);
