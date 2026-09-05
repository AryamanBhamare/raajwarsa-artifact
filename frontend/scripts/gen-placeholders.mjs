import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'placeholders');
mkdirSync(outDir, { recursive: true });

const label = (text) => {
  const clean = text.toUpperCase().replace(/["&<>]/g, '');
  return spawn(clean);
};

function spawn(text) {
  return text;
}

const frames = [
  { name: 'bronze-vessel', tint: '#a9823c', title: 'Bronze Vessel', desc: 'Metalwork' },
  { name: 'maratha-sword', tint: '#8b1e2d', title: 'Maratha Era', desc: 'Heritage' },
  { name: 'stone-carv', tint: '#5d6650', title: 'Stone Carving', desc: 'Sculpture' },
  { name: 'urn-plate', tint: '#b08d57', title: 'Heritage Urn', desc: 'Metalwork' },
  { name: 'idol', tint: '#9c7c3c', title: 'Traditional Idol', desc: 'Sculpture' },
  { name: 'fort-arch', tint: '#6b4a2b', title: 'Fort Remnant', desc: 'Architecture' },
  { name: 'textile', tint: '#7a2e32', title: 'Heritage Textile', desc: 'Textiles' },
  { name: 'manuscript', tint: '#8a7040', title: 'Manuscript', desc: 'Documentation' },
  { name: 'lamp', tint: '#a9823c', title: 'Oil Lamp', desc: 'Metalwork' },
  { name: 'shield', tint: '#5c4630', title: 'Royal Shield', desc: 'Heritage' },
  { name: 'astronomical', tint: '#2e4a52', title: 'Astronomical Instrument', desc: 'Documentation' },
  { name: 'coins', tint: '#8d7a4a', title: 'Coinage', desc: 'Numismatics' }
];

for (const f of frames) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 1500">
<defs>
  <radialGradient id="glow" cx="50%" cy="42%" r="70%">
    <stop offset="0%" stop-color="${f.tint}" stop-opacity="0.85"/>
    <stop offset="45%" stop-color="${f.tint}" stop-opacity="0.28"/>
    <stop offset="100%" stop-color="#080605" stop-opacity="0.95"/>
  </radialGradient>
  <radialGradient id="flare" cx="35%" cy="30%" r="60%">
    <stop offset="0%" stop-color="#f0d9a8" stop-opacity="0.35"/>
    <stop offset="100%" stop-color="#f0d9a8" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0b0908"/>
    <stop offset="100%" stop-color="#14100c"/>
  </linearGradient>
  <filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>
</defs>
<rect width="1200" height="1500" fill="url(#bg)"/>
<ellipse cx="600" cy="760" rx="560" ry="700" fill="url(#glow)"/>
<rect width="1200" height="1500" fill="url(#flare)"/>
<g opacity="0.5" filter="url(#soft)">
  <circle cx="400" cy="300" r="14" fill="#f0d9a8" opacity="0.7"/>
  <circle cx="900" cy="520" r="8" fill="#f0d9a8" opacity="0.4"/>
  <circle cx="700" cy="1150" r="12" fill="#f0d9a8" opacity="0.3"/>
  <circle cx="300" cy="1200" r="6" fill="#f0d9a8" opacity="0.45"/>
</g>
<rect x="70" y="70" width="1060" height="1360" fill="none" stroke="${f.tint}" stroke-opacity="0.18" stroke-width="2"/>
<rect x="82" y="82" width="1036" height="1336" fill="none" stroke="${f.tint}" stroke-opacity="0.1" stroke-width="1"/>
<circle cx="600" cy="720" r="150" fill="none" stroke="${f.tint}" stroke-opacity="0.22" stroke-width="1.5"/>
<circle cx="600" cy="720" r="215" fill="none" stroke="${f.tint}" stroke-opacity="0.12" stroke-width="1"/>
<text x="600" y="720" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-size="56" letter-spacing="6" fill="#e8d5b0" opacity="0.9">${label(f.title)}</text>
<text x="600" y="780" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="20" letter-spacing="8" fill="${f.tint}" opacity="0.75">${label(f.desc)}</text>
<text x="600" y="1400" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="15" letter-spacing="4" fill="#c9b18a" opacity="0.5">RAAJWARASA · ARCHIVE PLATE</text>
<line x1="470" y1="855" x2="730" y2="855" stroke="${f.tint}" stroke-opacity="0.45" stroke-width="1"/>
</svg>`;
  writeFileSync(resolve(outDir, `${f.name}.svg`), svg);
  console.log('wrote', f.name + '.svg');
}