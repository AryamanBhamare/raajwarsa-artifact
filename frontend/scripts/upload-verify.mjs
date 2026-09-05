// Proves the "any resolution upload" requirement end-to-end:
// a 5000x3200 photo uploaded through the real admin UI must be normalized
// (downscaled, aspect preserved) and then render on the site.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = 'http://localhost:5173';
const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(fs.existsSync);
const bigFile = 'C:\\Users\\aryam\\AppData\\Local\\Temp\\opencode\\huge-upload-test.png';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const gen = await browser.newPage();
await gen.setContent('<canvas id="c"></canvas>');
const pngBytes = await gen.evaluate(async () => {
  const canvas = document.getElementById('c');
  canvas.width = 5000; canvas.height = 3200;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 5000, 3200);
  g.addColorStop(0, '#b06030'); g.addColorStop(1, '#302010');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 5000, 3200);
  ctx.fillStyle = '#f0e0c0';
  for (let i = 0; i < 400; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 5000, Math.random() * 3200, 6 + Math.random() * 60, 0, Math.PI * 2);
    ctx.globalAlpha = 0.05 + Math.random() * 0.2;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
  const fr = new FileReader();
  return await new Promise((res, rej) => {
    fr.onload = () => res(fr.result.split(',')[1]);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
});
fs.writeFileSync(bigFile, Buffer.from(pngBytes, 'base64'));
const bytes = fs.statSync(bigFile).size;

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

// Login
await page.goto(BASE + '/admin', { waitUntil: 'networkidle2', timeout: 30000 });
await page.waitForSelector('#adm-user', { timeout: 15000 });
await page.type('#adm-user', process.env.SMOKE_ADMIN_USER || 'admin');
await page.type('#adm-pass', process.env.SMOKE_ADMIN_PASS || 'rajvarsa@123');
await page.click('button[type="submit"]');
await page.waitForFunction(() => document.body.innerText.includes('Dashboard'), { timeout: 15000 });

// Go to media library, snapshot current count, upload the huge file, wait for +1.
await page.goto(BASE + '/admin/media', { waitUntil: 'networkidle2', timeout: 30000 });
await page.waitForFunction(() => document.body.innerText.includes('Media'), { timeout: 15000 });
await new Promise((r) => setTimeout(r, 800));
const before = await page.evaluate(() => document.querySelectorAll('.a-media__img img').length);
const input = await page.$('input[type="file"]');
await input.uploadFile(bigFile);
await page.waitForFunction(
  (n) => document.querySelectorAll('.a-media__img img').length > n,
  { timeout: 60000 },
  before
);
await new Promise((r) => setTimeout(r, 2500));

const result = await page.evaluate(async () => {
  const thumbs = [...document.querySelectorAll('.a-media__img img')];
  const newest = thumbs[thumbs.length - 1];
  if (!newest) return { error: 'no thumbnail rendered' };
  await new Promise((r) => { newest.complete ? r() : newest.addEventListener('load', r, { once: true }); });
  return {
    rendered: newest.naturalWidth + 'x' + newest.naturalHeight,
    src: newest.getAttribute('src'),
    alt: newest.getAttribute('alt') || '(none)'
  };
});

console.log(`Uploaded file: 5000x3200    ${(bytes / 1048576).toFixed(1)} MB PNG`);
console.log('Served image :', result.rendered, '| aspect', (5000 / 3200).toFixed(3));
console.log('Src         :', result.src);
console.log('Expected    : max dimension <= 2048, aspect ~1.5625');
const [w, h] = result.rendered.split('x').map(Number);
const aspect = w / h;
const ok = w > 0 && h > 0 && Math.max(w, h) <= 2048 && Math.abs(aspect - 1.5625) < 0.01;
console.log(ok ? '\nPASS any-resolution upload ✓' : '\nFAIL normalization');
await browser.close();
process.exit(ok ? 0 : 1);