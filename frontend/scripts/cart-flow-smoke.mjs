// One-off E2E: add tulwar to cart → checkout → place order → verify in admin.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = 'http://localhost:18081';
const SHOTS = 'C:/Users/aryam/AppData/Local/Temp/opencode/cart-flow';

const browserPath = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p));

if (!browserPath) { console.error('No browser'); process.exit(2); }
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: browserPath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
});

let fail = 0;
const ok = (m) => console.error('  PASS', m);
const bad = (m) => { fail++; console.error('  FAIL', m); };
const hasText = (page, t, timeout = 20000) => page.waitForFunction(
  (txt) => document.body && document.body.innerText.includes(txt), { timeout }, t);
const shot = async (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png` }).catch(() => {});
const settle = (page) =>
  page.waitForFunction(() => !document.body.classList.contains('rw-loading'), { timeout: 10000 }).catch(() => {});

try {
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', (e) => bad(`pageerror: ${e.message}`));

  page.on('console', (m) => { if (m.type() === 'error') bad(`console: ${m.text()}`); });

  // 1. Add tulwar to cart from the detail page
  console.error('STEP 1 add-to-cart…');
  await page.goto(`${BASE}/collection/iron-tulwar-with-bronze-overlay`, { waitUntil: 'networkidle2', timeout: 30000 });
  await settle(page);
  await page.waitForSelector('.artifact-buy__add', { timeout: 15000 });
  console.error('STEP 1b clicking add…');
  await page.click('.artifact-buy__add');
  await hasText(page, 'ADDED TO CART');
  const badge = await page.$eval('.nav__cart-badge', (el) => el.textContent).catch(() => null);
  badge === '1' ? ok('add-to-cart → badge shows 1') : bad(`badge shows ${badge}`);
  await shot(page, '1-added');

  // 2. Cart page shows the piece
  console.error('STEP 2 cart…');
  await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle2', timeout: 30000 });
  await settle(page);
  await hasText(page, 'Iron Tulwar with Bronze Overlay');
  await hasText(page, '₹26,500'); // qty 1
  await page.click('.cart__qty button:last-child'); // + → 2
  await page.waitForFunction(() => document.querySelector('.cart__line')?.innerText.includes('₹53,000'),
    { timeout: 10000 });
  await hasText(page, 'PROCEED TO CHECKOUT');
  ok('cart page renders item + totals');
  await shot(page, '2-cart');

  // 3. Checkout form
  await page.click('a[href="/checkout"]');
  await page.waitForSelector('#co-name', { timeout: 15000 });
  await page.type('#co-name', 'Smoke Shopper');
  await page.type('#co-phone', '9876001234');
  await page.type('#co-email', 'shopper@example.com');
  await page.type('#co-address', '22 Heritage Lane, Model Colony');
  await page.type('#co-city', 'Pune');
  await page.select('#co-state', 'Maharashtra');
  await page.type('#co-pin', '411022');
  await page.click('.checkout__mode input[value="PICKUP"]');
  await page.click('.checkout__pay-opt input[value="COD"]');
  await page.click('button.checkout__place:not(.checkout__place--hidden)');
  await hasText(page, 'PLACE ORDER'); // review step reached
  ok('checkout form validates + review step reached');
  await shot(page, '3-review');

  // 4. Place order
  await page.click('button.checkout__place');
  await page.waitForSelector('.checkout-done', { timeout: 20000 });
  const orderText = await page.evaluate(() => document.querySelector('.checkout-done__sub')?.innerText || '');
  const orderNo = (orderText.match(/RW-\d{6}/) || [])[0];
  orderNo ? ok(`order placed → ${orderNo}`) : bad('no order number found');
  await hasText(page, 'CONFIRM ON WHATSAPP');
  await shot(page, '4-done');

  // 5. Visible in admin orders
  const admin = await browser.newPage();
  await admin.goto(`${BASE}/admin`, { waitUntil: 'networkidle2', timeout: 30000 });
  await admin.waitForSelector('#adm-user', { timeout: 15000 });
  await admin.type('#adm-user', 'admin');
  await admin.type('#adm-pass', 't3st-admin-123');
  await admin.click('button[type="submit"]');
  await hasText(admin, 'Dashboard');
  await admin.goto(`${BASE}/admin/orders`, { waitUntil: 'networkidle2', timeout: 30000 });
  await hasText(admin, orderNo);
  ok('order visible in admin orders');
  await shot(admin, '5-admin-orders');

  console.log('\nFLOW_RESULT', fail === 0 ? 'PASS' : 'FAIL', `order=${orderNo}`);
} catch (err) {
  fail++;
  console.error('FATAL', err.message.split('\n')[0]);
} finally {
  await browser.close();
}
process.exit(fail > 0 && !process.env._NOEXIT ? 1 : 0);