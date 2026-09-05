// Captures desktop + mobile screenshots of the main pages for the creative review.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.SMOKE_BASE || 'http://localhost:5173';
const OUT = path.join(process.env.TEMP || '/tmp', 'opencode', 'raaj-review');
fs.mkdirSync(OUT, { recursive: true });

const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe']
  .find(fs.existsSync);

const pages = [
  ['home', '/'],
  ['home-wide', '/', 1920],
  ['collection', '/collection'],
  ['artifact-detail', '/collection/maratha-pattern-bronze-kavacha-vessel'],
  ['heritage', '/heritage'],
  ['story', '/our-story'],
  ['journal', '/journal'],
  ['journal-detail', '/journal/the-house-of-raajwarasa-an-introduction'],
  ['enquire', '/enquire'],
  ['contact', '/contact'],
  ['legal', '/terms'],
  ['404', '/does-not-exist'],
];

const VIEWPORTS = [
  ['desktop', { width: 1280, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
];

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--window-size=1280,900', '--force-device-scale-factor=1'],
});

const page = await browser.newPage();
for (const [name, pathname, width] of pages) {
  if (width) {
    await page.setViewport({ width, height: 900 });
  } else {
    await page.setViewport(VIEWPORTS[0][1]);
  }
  for (const [view, vp] of VIEWPORTS) {
    if (width) break; // wide variants only desktop
    await page.setViewport(vp);
    await page.goto(BASE + pathname, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUT, `${name}-${view}.png`), fullPage: true });
  }
  if (width) {
    await page.setViewport({ width, height: 900 });
    await page.goto(BASE + pathname, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUT, `${name}-${width}.png`), fullPage: true });
  }
}

// Admin pages (mobile admin not required — desktop ok)
await page.setViewport({ width: 1280, height: 900 });
await page.goto(BASE + '/admin', { waitUntil: 'networkidle2', timeout: 30000 });
await page.waitForSelector('#adm-user', { timeout: 15000 });
await page.type('#adm-user', process.env.SMOKE_ADMIN_USER || 'admin');
await page.type('#adm-pass', process.env.SMOKE_ADMIN_PASS || 'rajvarsa@123');
await page.click('button[type="submit"]');
await page.waitForFunction(() => document.body.innerText.includes('Dashboard'), { timeout: 15000 });
await new Promise((r) => setTimeout(r, 1500));
for (const [name, pathname] of [
  ['admin-dashboard', '/admin'],
  ['admin-artifacts', '/admin/artifacts'],
  ['admin-artifact-form', '/admin/artifacts/new'],
  ['admin-inquiries', '/admin/inquiries'],
  ['admin-journal', '/admin/journal'],
  ['admin-media', '/admin/media'],
  ['admin-categories', '/admin/categories'],
  ['admin-settings', '/admin/settings'],
]) {
  await page.goto(BASE + pathname, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

await browser.close();
console.log('Screenshots written to', OUT);
fs.writeFileSync(path.join(OUT, '_count.txt'),
  fs.readdirSync(OUT).filter((f) => f.endsWith('.png')).length + ' png files');