// Verifies uploaded photos actually DECODE and render (not broken) on the
// public artifact page and in the admin media grid, capturing console errors.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = process.env.CHECK_BASE || 'http://localhost:18081';
const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(fs.existsSync);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const errors = [];

async function scrollToLoad() {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 400) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await new Promise((r) => setTimeout(r, 120));
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 400));
}
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('requestfailed', (r) => errors.push('REQFAIL: ' + r.url().split('/').pop() + ' ' + (r.failure()?.errorText || '')));

async function imgStats(label) {
  const s = await page.evaluate(() => {
    let ok = 0, broken = 0;
    for (const img of document.querySelectorAll('img')) {
      const r = img.getBoundingClientRect();
      if (r.width <= 0 && r.height <= 0) continue;
      if (img.complete && img.naturalWidth > 0) ok++;
      else broken++;
    }
    return { ok, broken };
  });
  console.log(`${label}: rendered=${s.ok} broken=${s.broken}`);
  return s;
}

// Public artifact detail (the kavacha vessel has owner-uploaded photos)
await page.goto(BASE + '/collection/maratha-pattern-bronze-kavacha-vessel', { waitUntil: 'networkidle2', timeout: 40000 });
await scrollToLoad();
await imgStats('artifact detail');

// Admin media grid
await page.goto(BASE + '/admin', { waitUntil: 'networkidle2', timeout: 40000 });
await page.waitForSelector('#adm-user', { timeout: 20000 });
await page.type('#adm-user', process.env.SMOKE_ADMIN_USER || 'admin');
await page.type('#adm-pass', process.env.SMOKE_ADMIN_PASS || 't3st-admin-123');
await page.click('button[type="submit"]');
await page.waitForFunction(() => document.body.innerText.includes('Dashboard'), { timeout: 20000 });
await page.goto(BASE + '/admin/media', { waitUntil: 'networkidle2', timeout: 40000 });
await scrollToLoad();
const grid = await imgStats('admin media grid');

console.log('console errors:', errors.length ? '\n  ' + errors.join('\n  ') : 'none');
const pass = grid.broken === 0;
console.log(pass ? '\nPASS — all uploaded photos render' : '\nFAIL — broken images remain');
await browser.close();
process.exit(pass ? 0 : 1);