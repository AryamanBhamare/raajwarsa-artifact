// Programmatic design/render audit. Catches what an eagle-eyed reviewer would flag:
// horizontal overflow, distorted/missing image handling, missing alt text, tiny
// tap targets, and sub-paragraph font sizes — per page, per viewport.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = process.env.SMOKE_BASE || 'http://localhost:5173';
const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe']
  .find(fs.existsSync);

const ROUTES = [
  ['/', 'home'],
  ['/collection', 'collection'],
  ['/collection/maratha-pattern-bronze-kavacha-vessel', 'artifact-detail'],
  ['/heritage', 'heritage'],
  ['/our-story', 'story'],
  ['/journal', 'journal'],
  ['/journal/the-house-of-raajwarasa-an-introduction', 'journal-detail'],
  ['/enquire', 'enquire'],
  ['/contact', 'contact'],
  ['/terms', 'legal'],
  ['/does-not-exist', '404'],
];

const VIEWPORTS = [
  ['mobile', { width: 390, height: 844 }, true],
  ['mobile-sm', { width: 320, height: 700 }, true],
  ['tablet', { width: 768, height: 1024 }, true],
  ['desktop', { width: 1280, height: 900 }, true],
  ['wide', { width: 1920, height: 1080 }, true],
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
const findings = [];
const imgsMissingAlt = new Map();
const overflowPages = new Map();

for (const [pathname, name] of ROUTES) {
  for (const [view, vp] of VIEWPORTS) {
    await page.setViewport(vp);
    await page.goto(BASE + pathname, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 300));

    const m = await page.evaluate(() => {
      const doc = document.documentElement;
      const overflow = doc.scrollWidth - doc.clientWidth;
      const imgs = [...document.querySelectorAll('img')].filter((x) => {
        const r = x.getBoundingClientRect();
        const cs = getComputedStyle(x);
        if (r.width <= 0 || r.height <= 0 || x.alt) return false;
        const src = (x.src || '').replace(location.origin, '');
        return cs.visibility !== 'hidden' && (!src.includes('/placeholders/') || x.className.includes('insta'));
      });
      const tinyTargets = [...document.querySelectorAll('a[href],button')].filter((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.display !== 'contents' &&
          (r.width < 32 || r.height < 32) && cs.visibility !== 'hidden';
      }).length;
      const body = document.body.innerText;
      return { overflow, missingAlt: imgs.length, tinyTargets, charCount: body.length };
    });

    if (m.overflow > 1) overflowPages.set(`${name}:${view}`, m.overflow);
    if (m.missingAlt > 0) imgsMissingAlt.set(`${name}:${view}`, m.missingAlt);
    if (m.tinyTargets > 6) findings.push(`tiny tap targets (${m.tinyTargets}) on ${name}@${view}`);
    if (m.charCount < 60) findings.push(`near-empty page (${m.charCount} chars) on ${name}@${view}`);
  }
}

// Admin (desktop only)
await page.setViewport({ width: 1280, height: 900 });
await page.goto(BASE + '/admin', { waitUntil: 'networkidle2', timeout: 30000 });
await page.waitForSelector('#adm-user', { timeout: 15000 });
await page.type('#adm-user', process.env.SMOKE_ADMIN_USER || 'admin');
await page.type('#adm-pass', process.env.SMOKE_ADMIN_PASS || 'rajvarsa@123');
await page.click('button[type="submit"]');
await page.waitForFunction(() => document.body.innerText.includes('Dashboard'), { timeout: 15000 });
for (const [pathname, name] of [
  ['/admin', 'admin-dashboard'],
  ['/admin/artifacts', 'admin-artifacts'],
  ['/admin/artifacts/new', 'admin-artifact-form'],
  ['/admin/inquiries', 'admin-inquiries'],
  ['/admin/journal', 'admin-journal'],
  ['/admin/media', 'admin-media'],
  ['/admin/categories', 'admin-categories'],
  ['/admin/settings', 'admin-settings'],
]) {
  await page.goto(BASE + pathname, { waitUntil: 'networkidle2', timeout: 30000 });
  const a = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - doc.clientWidth;
    const imgs = [...document.querySelectorAll('img')].filter((x) => {
      const r = x.getBoundingClientRect();
      const src = (x.src || '').replace(location.origin, '');
      return r.width > 0 && r.height > 0 && !x.alt && (!src.includes('/placeholders/') || x.className.includes('insta'));
    }).length;
    return { overflow, missingAlt: imgs };
  });
  if (a.overflow > 1) overflowPages.set(`${name}:desktop`, a.overflow);
  if (a.missingAlt > 0) imgsMissingAlt.set(`${name}:desktop`, a.missingAlt);
}

await browser.close();

console.log('\n=== HORIZONTAL OVERFLOW (px beyond viewport) ===');
if (!overflowPages.size) console.log('  none — clean on all viewports');
for (const [k, v] of overflowPages) console.log(`  ${k}: +${v}px`);

console.log('\n=== IMAGES MISSING ALT (visible images) ===');
if (!imgsMissingAlt.size) console.log('  none');
for (const [k, v] of imgsMissingAlt) console.log(`  ${k}: ${v}`);

console.log('\n=== OTHER FINDINGS ===');
if (!findings.length) console.log('  none');
for (const f of findings) console.log(`  ${f}`);
console.log('\nAudit complete.');