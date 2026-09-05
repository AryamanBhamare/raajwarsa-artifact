// Reproduce admin media upload exactly as the user does, against the compose stack.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = 'http://localhost:18081';
const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(fs.existsSync);
const FILE = 'C:\\Users\\aryam\\AppData\\Local\\Temp\\opencode\\huge-upload-test.png';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('requestfailed', (r) => errors.push('REQUESTFAILED: ' + r.url() + ' ' + (r.failure()?.errorText || '')));

await page.setViewport({ width: 1280, height: 900 });
await page.goto(BASE + '/admin', { waitUntil: 'networkidle2', timeout: 40000 });
await page.waitForSelector('#adm-user', { timeout: 20000 });
await page.type('#adm-user', 'admin');
await page.type('#adm-pass', 't3st-admin-123');
await page.click('button[type="submit"]');
await page.waitForFunction(() => document.body.innerText.includes('Dashboard'), { timeout: 20000 });

await page.goto(BASE + '/admin/media', { waitUntil: 'networkidle2', timeout: 40000 });
await new Promise((r) => setTimeout(r, 1000));
const before = await page.evaluate(() => document.querySelectorAll('.a-media__img img').length);
const input = await page.$('input[type="file"]');
await input.uploadFile(FILE);
await new Promise((r) => setTimeout(r, 8000));

const after = await page.evaluate(() => ({
  count: document.querySelectorAll('.a-media__img img').length,
  errorText: document.querySelector('.a-alert--error')?.innerText || '(no error)',
  bodySnippet: document.body.innerText.slice(0, 120).replace(/\n/g, ' | ')
}));

console.log('items before:', before, ' after:', after.count);
console.log('error alert :', after.errorText);
console.log('console errors:', errors.length ? errors.join('\n  ') : 'none');

const status = after.count > before ? 'PASS — upload succeeded in browser' : 'FAIL — upload did not register';
console.log(status);
await browser.close();
process.exit(after.count > before ? 0 : 1);