// Browser smoke test for the Raajwarasa site and admin panel.
// Drives a real system-installed browser (Chrome/Edge) through the public
// routes and the admin flows, asserting expected content renders while
// capturing console errors, uncaught exceptions and failed requests.
//
// Usage:
//   node scripts/smoke.mjs
// Env overrides:
//   SMOKE_BASE           site URL                    (default http://localhost:5173)
//   PUPPETEER_EXECUTABLE_PATH  browser binary        (auto-detect Chrome/Edge)
//   SMOKE_ADMIN_USER/PASS      admin credentials     (default admin / rajvarsa@123)
//   SMOKE_SHOTS          screenshot output dir
//
// Exit code 0 = clean, 1 = route/content failure, 2 = browser/runtime errors.

import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.SMOKE_BASE || 'http://localhost:5173';
const SHOTS = process.env.SMOKE_SHOTS || path.join(
  process.env.TEMP || process.env.TMPDIR || '/tmp', 'opencode', 'raaj-smoke');
fs.mkdirSync(SHOTS, { recursive: true });

const USER = process.env.SMOKE_ADMIN_USER || 'admin';
const PASS = process.env.SMOKE_ADMIN_PASS || 'rajvarsa@123';

// Content assertions are overridable so the smoke can run against any seeded DB.
const EXPECT = {
  collection: process.env.SMOKE_COLLECTION_TEXT || 'Kavacha',
  detailPath: process.env.SMOKE_DETAIL_PATH || '/collection/maratha-pattern-bronze-kavacha-vessel',
  detailText: process.env.SMOKE_DETAIL_TEXT || 'Maratha Pattern Bronze Kavacha Vessel',
  adminArtifact: process.env.SMOKE_ADMIN_ARTIFACT_TEXT || 'Kavacha',
};

const CANDIDATE_BROWSERS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium',
].filter(Boolean).find((p) => fs.existsSync(p));

if (!CANDIDATE_BROWSERS) {
  console.error('No Chrome/Edge found. Set PUPPETEER_EXECUTABLE_PATH.');
  process.exit(2);
}

const errors = new Set();
let routeFailures = 0;
let passed = 0;

const ok = (name, info = '') => {
  passed++;
  console.log(`  PASS  ${name}${info ? `  (${info})` : ''}`);
};
const fail = (name, why) => {
  routeFailures++;
  console.error(`  FAIL  ${name}: ${why}`);
};

async function newPage(browser) {
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', (e) => errors.add(`uncaught: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.add(`console: ${m.text()}`); });
  page.on('dialog', (d) => d.accept().catch(() => {}));
  return page;
}

async function hasText(page, t, timeout = 20000) {
  await page.waitForFunction(
    (txt) => document.body && document.body.innerText.includes(txt),
    { timeout }, t);
}

async function visit(browser, name, pathname, texts, shot = name) {
  const page = await newPage(browser);
  try {
    await page.goto(BASE + pathname, { waitUntil: 'networkidle2', timeout: 30000 });
    for (const t of texts) await hasText(page, t);
    await page.screenshot({ path: path.join(SHOTS, `${slug(shot)}.png`) }).catch(() => {});
    ok(name);
  } catch (err) {
    fail(name, err.message.split('\n')[0]);
  } finally {
    await page.close();
  }
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------------------------------------------------------------------------

const browser = await puppeteer.launch({
  executablePath: CANDIDATE_BROWSERS,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
});

try {
  console.log(`Smoke test @ ${BASE} (${path.basename(CANDIDATE_BROWSERS)})\n`);
  console.log('--- public site ---');

  await visit(browser, 'home', '/', ['Raajwarasa']);
  await visit(browser, 'collection', '/collection', ['Explore the Collection', EXPECT.collection]);
  await visit(browser, 'collection:search', '/collection?search=brass', ['Explore the Collection']);
  await visit(browser, 'artifact detail', EXPECT.detailPath,
    [EXPECT.detailText, 'The Story Behind the Object']);
  await visit(browser, 'story', '/our-story', ['A heritage carried forward']);
  await visit(browser, 'heritage', '/heritage', ['The values behind the collection']);
  await visit(browser, 'journal index', '/journal', ['Notes from the archive', 'An Introduction']);
  await visit(browser, 'journal detail', '/journal/the-house-of-raajwarasa-an-introduction',
    ['The House of Raajwarasa: An Introduction']);
  await visit(browser, 'enquire', '/enquire', ['Begin the conversation']);
  await visit(browser, 'contact', '/contact', ['Get in touch', "Let's talk heritage"]);
  await visit(browser, 'legal,terms', '/terms', ['Terms of Use']);
  await visit(browser, 'legal,privacy', '/privacy', ['Privacy Policy']);
  await visit(browser, '404 page', '/no-such-page', ['THE ARCHIVE HAS NO RECORD OF THIS PAGE']);

  console.log('--- cart & checkout ---');
  // fresh browser context means the cart starts empty
  await visit(browser, 'cart (empty)', '/cart', ['Your cart', 'Nothing in the cart yet']);
  await visit(browser, 'checkout redirects to cart when empty', '/checkout', ['Your cart']);

  console.log('--- in-app navigation (real clicks, not direct URLs) ---');
  const nav = await newPage(browser);
  await nav.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });
  await hasText(nav, 'Raajwarasa');
  await nav.evaluate(() => {
    const link = [...document.querySelectorAll('a')]
      .find((a) => a.getAttribute('href') === '/our-story');
    if (link) link.click();
  });
  await hasText(nav, 'A heritage carried forward');
  await nav.evaluate(() => {
    const link = [...document.querySelectorAll('a')]
      .find((a) => a.getAttribute('href') === '/collection');
    if (link) link.click();
  });
  await hasText(nav, 'Explore the Collection');
  ok('nav click-through (home → our-story → collection)');
  await nav.close();

  console.log('--- admin panel ---');

  const admin = await newPage(browser);
  const adminSteps = [];

  await admin.goto(BASE + '/admin', { waitUntil: 'networkidle2', timeout: 30000 });
  await admin.waitForSelector('#adm-user', { timeout: 15000 });
  await admin.type('#adm-user', USER);
  await admin.type('#adm-pass', PASS);
  await admin.click('button[type="submit"]');
  await hasText(admin, 'Dashboard');
  adminSteps.push('login → dashboard');
  await admin.screenshot({ path: path.join(SHOTS, 'admin-dashboard.png') });

  await admin.goto(BASE + '/admin/artifacts', { waitUntil: 'networkidle2', timeout: 30000 });
  await hasText(admin, 'Artifacts');
  await hasText(admin, EXPECT.adminArtifact);
  adminSteps.push('artifacts list');

  await admin.goto(BASE + '/admin/artifacts/new', { waitUntil: 'networkidle2', timeout: 30000 });
  await hasText(admin, 'New Artifact');
  await hasText(admin, 'Basics');
  adminSteps.push('new artifact form renders');

  await admin.goto(BASE + '/admin/inquiries', { waitUntil: 'networkidle2', timeout: 30000 });
  await hasText(admin, 'Inquiries');
  const haveInquiry = await admin.$('a.a-table__link');
  if (haveInquiry) {
    await haveInquiry.click();
    await hasText(admin, 'Customer Details');
    adminSteps.push('inquiries list → detail');
  } else {
    adminSteps.push('inquiries list (empty)');
  }

  await admin.goto(BASE + '/admin/journal', { waitUntil: 'networkidle2', timeout: 30000 });
  await hasText(admin, 'Journal Articles');
  await hasText(admin, 'An Introduction');
  adminSteps.push('journal list');

  await admin.goto(BASE + '/admin/media', { waitUntil: 'networkidle2', timeout: 30000 });
  await hasText(admin, 'Media Library');
  adminSteps.push('media library');

  await admin.goto(BASE + '/admin/settings', { waitUntil: 'networkidle2', timeout: 30000 });
  await hasText(admin, 'Settings');
  await hasText(admin, 'Administrator Account');
  adminSteps.push('settings');

  await admin.goto(BASE + '/admin/orders', { waitUntil: 'networkidle2', timeout: 30000 });
  await hasText(admin, 'Orders');
  adminSteps.push('orders');

  // category create → appears → delete  (full form POST + DELETE cycle)
  await admin.goto(BASE + '/admin/categories', { waitUntil: 'networkidle2', timeout: 30000 });
  await hasText(admin, 'Categories');
  const catName = `Smoke Test Cat ${Date.now()}`;
  const inputs = await admin.$$('.a-card input.a-input, .a-card textarea.a-input');
  await inputs[0].type(catName);
  await admin.click('.a-card button[type="submit"]');
  await hasText(admin, catName);
  adminSteps.push('category create → list shows it');

  const catRow = await admin.evaluateHandle((nm) => {
    const rows = [...document.querySelectorAll('.a-cat')];
    const row = rows.find((r) => r.querySelector('.a-cat__name')?.innerText === nm);
    return row;
  }, catName);
  if (catRow) {
    const del = await catRow.asElement().$('.a-btn--danger');
    await del.click();
    await admin.waitForFunction((nm) =>
      ![...document.querySelectorAll('.a-cat__name')].some((el) => el.innerText === nm),
      { timeout: 10000 }, catName);
    adminSteps.push('category delete removed it');
  } else {
    adminSteps.push('category row not found for delete');
  }

  ok('admin panel', adminSteps.join(' | '));
} finally {
  await browser.close();
}

const runtimeIssues = [...errors];
console.log(`\n${passed} groups checked, ${routeFailures} route failures.`);
if (runtimeIssues.length) {
  console.log(`Browser/runtime issues (${runtimeIssues.length}):`);
  for (const e of new Set(runtimeIssues)) console.log(`  - ${e}`);
}
console.log(`Screenshots: ${SHOTS}`);

if (routeFailures > 0) process.exit(1);
if (runtimeIssues.length > 0) process.exit(2);