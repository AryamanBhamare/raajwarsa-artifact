// Delivery-day hard check: pickup + standard orders end-to-end (with admin
// detail verification) AND admin photo upload → image renders live on the site.
// Cleans up the uploaded test image and test orders afterwards.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = process.env.DEMO_BASE || 'http://localhost:18081';
const ADMIN_PASS = process.env.SMOKE_ADMIN_PASS || 't3st-admin-123';
const SHOTS = 'C:/Users/aryam/AppData/Local/Temp/opencode/demo-check';
const ARTIFACT_NAME = 'Iron Tulwar with Bronze Overlay';
const ARTIFACT_PATH = '/collection/iron-tulwar-with-bronze-overlay';

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
  protocolTimeout: 240000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
});

let fail = 0;
const ok = (m) => console.error('  PASS', m);
const bad = (m) => { fail++; console.error('  FAIL', m); };
const hasText = (page, t, timeout = 25000) => page.waitForFunction(
  (txt) => document.body && document.body.innerText.includes(txt), { timeout }, t);
const noText = (page, t, timeout = 12000) => page.waitForFunction(
  (txt) => !(document.body && document.body.innerText.includes(txt)), { timeout }, t);
const shot = async (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png` }).catch(() => {});
const settle = (page) =>
  page.waitForFunction(() => !document.body.classList.contains('rw-loading'), { timeout: 10000 }).catch(() => {});

const artifactId = await fetch(`${BASE}/api/public/artifacts`).then((r) => r.json())
  .then((d) => d.items.find((a) => a.saleAvailable && a.price)?.id);

async function loginAdmin() {
  const admin = await browser.newPage();
  admin.setDefaultTimeout(20000);
  await admin.goto(`${BASE}/admin`, { waitUntil: 'networkidle2', timeout: 30000 });
  try {
    await admin.waitForSelector('#adm-user', { timeout: 8000 });
    await admin.type('#adm-user', 'admin');
    await admin.type('#adm-pass', ADMIN_PASS);
    await admin.click('button[type="submit"]');
  } catch {
    // already logged in (same browser session)
  }
  await hasText(admin, 'Dashboard');
  return admin;
}

async function addToCart(page, qtyTarget = 1) {
  await page.goto(`${BASE}${ARTIFACT_PATH}`, { waitUntil: 'networkidle2', timeout: 30000 });
  await settle(page);
  await page.waitForSelector('.artifact-buy__add', { timeout: 15000 });
  await page.click('.artifact-buy__add');
  await hasText(page, 'ADDED TO CART');
  if (qtyTarget > 1) {
    await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle2', timeout: 30000 });
    await settle(page);
    for (let i = 1; i < qtyTarget; i++) {
      await page.click('.cart__qty button:last-child');
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}

async function fillContact(page, name, phone) {
  await page.type('#co-name', name);
  await page.type('#co-phone', phone);
  await page.type('#co-email', `${name.replace(/\s+/g, '.').toLowerCase()}@example.com`);
}

try {
  // ---------- PHASE 1: admin photo upload → live site ----------
  console.error('PHASE 1 photo upload through admin → visible on site');
  const gen = await browser.newPage();
  await gen.setContent('<canvas id="c"></canvas>');
  const pngBytes = await gen.evaluate(async () => {
    const canvas = document.getElementById('c');
    canvas.width = 1400; canvas.height = 1050;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 1400, 1050);
    g.addColorStop(0, '#4a2f1b'); g.addColorStop(1, '#8a5a2b');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1400, 1050);
    ctx.strokeStyle = '#d9bc7a'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(700, 950); ctx.lineTo(700, 330); ctx.arc(700, 330, 70, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(700, 470); ctx.stroke();
    ctx.fillStyle = '#241507'; ctx.font = '700 54px serif'; ctx.textAlign = 'center';
    ctx.fillText('DEMO TULWAR', 700, 1000);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const fr = new FileReader();
    return await new Promise((res, rej) => {
      fr.onload = () => res(fr.result.split(',')[1]);
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
  });
  const upFile = `${SHOTS}/demo-upload.png`;
  fs.writeFileSync(upFile, Buffer.from(pngBytes, 'base64'));
  await gen.close();

  const admin = await loginAdmin();
  admin.on('pageerror', (e) => console.error('[admin pageerror]', e.message));
  admin.on('console', (m) => { if (m.type() === 'error') console.error('[admin console.error]', m.text()); });

  // Clean slate: strip any attached images before the upload test.
  await admin.goto(`${BASE}/admin/artifacts/edit/${artifactId}`, { waitUntil: 'networkidle2', timeout: 30000 });
  await admin.waitForSelector('.a-upload-btn-wrap input[type="file"]', { timeout: 15000 });
  await admin.evaluate(() => [...document.querySelectorAll('.a-upload-remove')].forEach((b) => b.click()));
  try {
    await admin.waitForFunction(() => document.querySelectorAll('.a-upload-thumb').length === 0, { timeout: 8000 });
    await admin.click('button[type="submit"]');
    await admin.waitForFunction(() => !location.pathname.includes('/edit/'), { timeout: 20000 });
    await admin.goto(`${BASE}/admin/artifacts/edit/${artifactId}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await admin.waitForSelector('.a-upload-btn-wrap input[type="file"]', { timeout: 15000 });
  } catch {
    // nothing to strip — already clean
  }

  const publicBefore = await (async () => {
    const p = await browser.newPage();
    await p.goto(`${BASE}${ARTIFACT_PATH}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await settle(p);
    await p.waitForSelector('.artifact-gallery__main img', { timeout: 15000 });
    const r = await p.$eval('.artifact-gallery__main img', (el) => ({ src: el.currentSrc || el.src, w: el.naturalWidth }));
    await p.close();
    return r;
  })();

  await admin.goto(`${BASE}/admin/artifacts/edit/${artifactId}`, { waitUntil: 'networkidle2', timeout: 30000 });
  await admin.waitForSelector('.a-upload-btn-wrap input[type="file"]', { timeout: 15000 });
  const thumbsBefore = await admin.evaluate(() => document.querySelectorAll('.a-upload-thumb img').length);
  console.error(`  [debug] edit page thumbs before upload: ${thumbsBefore}`);
  const fileInput = await admin.$('.a-upload-btn-wrap input[type="file"]');
  await fileInput.uploadFile(upFile);
  let grew = false;
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await admin.evaluate(() => ({
      thumbs: document.querySelectorAll('.a-upload-thumb img').length,
      err: document.querySelector('.a-alert--error')?.innerText || '',
      btn: (document.querySelector('.a-upload-btn-wrap .a-btn')?.innerText || '').trim(),
    }));
    if (i === 0 || st.thumbs > thumbsBefore) console.error(`  [debug] t+${(i + 1) * 5}s thumbs=${st.thumbs} err='${st.err}' btn='${st.btn}'`);
    if (st.thumbs > thumbsBefore) { grew = true; break; }
    if (st.err) break;
  }
  if (!grew) throw new Error('uploaded image never appeared as a thumbnail');
  await new Promise((r) => setTimeout(r, 2500));
  const newUrl = await admin.evaluate(() => {
    const imgs = [...document.querySelectorAll('.a-upload-thumb img')];
    return imgs[imgs.length - 1].getAttribute('src');
  });
  ok(`admin image upload → thumbnail rendered (${newUrl.split('/').pop()})`);
  await shot(admin, '1-edit-thumbs');

  console.error('  [step] clicking save…');
  await admin.click('button[type="submit"]');
  console.error('  [step] waiting for returning to artifacts list…');
  await hasText(admin, 'Artifacts');
  console.error('  [step] on artifacts list.');
  await shot(admin, '2-saved');
  await admin.close();

  const publicAfter = await (async () => {
    const p = await browser.newPage();
    p.on('pageerror', (e) => console.error('    [publicAfter pageerror]', e.message));
    await p.goto(`${BASE}${ARTIFACT_PATH}`, { waitUntil: 'networkidle2', timeout: 40000 });
    await settle(p);
    await new Promise((r) => setTimeout(r, 3000));
    const probe = await p.evaluate((u) => {
      const imgs = [...document.querySelectorAll('img')];
      const el = imgs.find((x) => (x.currentSrc || x.src).endsWith(u));
      return {
        found: el ? { src: el.currentSrc || el.src, w: el.naturalWidth } : null,
        imgs: imgs.map((x) => ({ src: x.getAttribute('src'), cur: x.currentSrc || x.src, w: x.naturalWidth })).slice(0, 6),
        textHead: document.body.innerText.slice(0, 120),
      };
    }, newUrl);
    if (!probe.found) console.error('    [debug] upload not visible in page —', JSON.stringify(probe));
    await shot(p, '3-public-with-photo');
    await p.close();
    return probe.found;
  })();

  if (publicAfter.src.endsWith(newUrl) && publicAfter.w > 0 && publicAfter.src !== publicBefore.src) {
    ok(`uploaded photo now renders live on the artifact page (${publicAfter.w}px wide)`);
  } else {
    bad(`uploaded photo NOT on live page (before=${publicBefore.src} after=${publicAfter.src})`);
  }

  // ---------- PHASE 2: PICKUP order ----------
  console.error('\nPHASE 2 pickup order (no delivery address)');
  const p1 = await browser.newPage();
  p1.setDefaultTimeout(20000);
  p1.on('pageerror', (e) => bad(`pickup pageerror: ${e.message}`));
  await addToCart(p1, 2);
  await p1.goto(`${BASE}/checkout`, { waitUntil: 'networkidle2', timeout: 30000 });
  await settle(p1);
  await p1.waitForSelector('#co-name', { timeout: 15000 });
  await p1.type('#co-name', 'Ashok Kulkarni');
  await p1.type('#co-phone', '9820112233');
  await p1.type('#co-email', 'ashok.kulkarni@example.com');
  await p1.click('.checkout__mode input[value="PICKUP"]');
  const addrGone = await p1.$('#co-address') === null;
  addrGone ? ok('pickup mode hides delivery address fields') : bad('address fields still visible for pickup');
  await hasText(p1, 'Collect in person at the Deo Wada studio');
  await p1.click('.checkout__pay-opt input[value="COD"]');
  await p1.click('button.checkout__place:not(.checkout__place--hidden)');
  await hasText(p1, 'PLACE ORDER');
  ok('pickup review step reached');
  await shot(p1, '4-pickup-review');
  await p1.click('button.checkout__place:not(.checkout__place--hidden)');
  await p1.waitForSelector('.checkout-done', { timeout: 20000 });
  await hasText(p1, 'CONFIRM ON WHATSAPP');
  const pickupOrderNo = (await p1.evaluate(() => document.querySelector('.checkout-done__sub')?.innerText || '').then((t) => t.match(/RW-\d{6}/) || [null]))[0];
  pickupOrderNo ? ok(`pickup order placed → ${pickupOrderNo}`) : bad('pickup order number missing');
  await hasText(p1, 'Deo Wada studio, Chinchwad');
  ok('pickup done screen shows studio pickup address');
  await shot(p1, '5-pickup-done');
  await p1.close();

  // ---------- PHASE 3: STANDARD order (delivery address required) ----------
  console.error('\nPHASE 3 standard delivery order (address enforced)');
  const p2 = await browser.newPage();
  p2.setDefaultTimeout(20000);
  p2.on('pageerror', (e) => bad(`standard pageerror: ${e.message}`));
  await addToCart(p2, 1);
  await p2.goto(`${BASE}/checkout`, { waitUntil: 'networkidle2', timeout: 30000 });
  await settle(p2);
  await p2.waitForSelector('#co-name', { timeout: 15000 });
  const addrShown = await p2.$('#co-address') !== null;
  addrShown ? ok('standard mode shows delivery address fields') : bad('address fields missing for standard');
  await fillContact(p2, 'Meera Deshmukh', '9890011223');
  await p2.click('button.checkout__place:not(.checkout__place--hidden)');
  await hasText(p2, 'Please enter your address');
  ok('checkout blocks standard order without an address');
  await shot(p2, '6-address-blocked');
  await p2.click('button.checkout__place:not(.checkout__place--hidden)'); // triggers the same validate again
  await p2.type('#co-address', '7 Sadashiv Peth, Lane 4');
  await p2.type('#co-city', 'Pune');
  await p2.select('#co-state', 'Maharashtra');
  await p2.type('#co-pin', '411030');
  await p2.click('button.checkout__place:not(.checkout__place--hidden)');
  await hasText(p2, 'PLACE ORDER');
  await p2.click('button.checkout__place:not(.checkout__place--hidden)');
  await p2.waitForSelector('.checkout-done', { timeout: 20000 });
  const stdOrderNo = (await p2.evaluate(() => document.querySelector('.checkout-done__sub')?.innerText || '').then((t) => t.match(/RW-\d{6}/) || [null]))[0];
  stdOrderNo ? ok(`standard order placed → ${stdOrderNo}`) : bad('standard order number missing');
  await hasText(p2, `Pune, Maharashtra · 411030`);
  ok('standard done screen shows delivery address');
  await shot(p2, '7-standard-done');
  await p2.close();

  // ---------- PHASE 4: admin orders show customer + cart details ----------
  console.error('\nPHASE 4 admin orders verify customer + cart detail');
  for (const [orderNo, name, phone, pieces, mode] of [
    [pickupOrderNo, 'Ashok Kulkarni', '9820112233', 2, 'PICKUP'],
    [stdOrderNo, 'Meera Deshmukh', '9890011223', 1, 'STANDARD'],
  ]) {
    const a = await browser.newPage();
    a.setDefaultTimeout(20000);
    await a.goto(`${BASE}/admin/orders`, { waitUntil: 'networkidle2', timeout: 30000 });
    await hasText(a, orderNo);
    const rowText = await a.evaluate((no) => {
      const rows = [...document.querySelectorAll('.a-table tbody tr')];
      const row = rows.find((r) => r.innerText.includes(no));
      return row?.innerText || '';
    }, orderNo);
    const rowChecks = [
      [rowText.includes(name), `admin order shows customer ${name}`],
      [rowText.includes(phone), `admin order shows phone ${phone}`],
      [rowText.includes(`${pieces} pieces`), `admin order shows ${pieces} pieces`],
    ];
    for (const [pass, msg] of rowChecks) pass ? ok(msg) : bad(`${msg} (row: ${rowText.slice(0, 160)})`);
    await a.evaluate((no) => {
      const rows = [...document.querySelectorAll('.a-table tbody tr')];
      const row = rows.find((r) => r.innerText.includes(no));
      row?.querySelector('.a-btn')?.click();
    }, orderNo);
    await a.waitForSelector('.a-order-detail', { timeout: 15000 });
    const detail = await a.evaluate(() => document.querySelector('.a-order-detail')?.innerText || '');
    const detailChecks = [
      [detail.includes(ARTIFACT_NAME), `admin order detail shows ${ARTIFACT_NAME}`],
      [detail.includes(`× ${pieces}`), `admin order detail shows quantity × ${pieces}`],
      [detail.includes(mode), `admin order detail shows mode ${mode}`],
    ];
    for (const [pass, msg] of detailChecks) pass ? ok(msg) : bad(`${msg} (detail: ${detail.slice(0, 200)})`);
    await shot(a, `8-admin-${mode}`);
    await a.close();
  }

  // ---------- PHASE 5: cleanup ----------
  console.error('\nPHASE 5 cleanup (remove test image, test orders stay for admin demo)');
  try {
    const a = await loginAdmin();
    await a.goto(`${BASE}/admin/artifacts/edit/${artifactId}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await a.waitForSelector('.a-upload-remove', { timeout: 15000 });
    const removed = await a.evaluate(() => {
      const thumbs = [...document.querySelectorAll('.a-upload-thumb')];
      thumbs.forEach((t) => t.querySelector('.a-upload-remove')?.click());
      return thumbs.length;
    });
    if (removed > 0) {
      await a.waitForFunction(() => document.querySelectorAll('.a-upload-thumb').length === 0, { timeout: 10000 });
      await a.click('button[type="submit"]');
      await a.waitForFunction(() => !location.pathname.includes('/edit/'), { timeout: 20000 });
    }
    await hasText(a, 'Artifacts');
    const back = await browser.newPage();
    await back.goto(`${BASE}${ARTIFACT_PATH}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await settle(back);
    await back.waitForSelector('.artifact-gallery__main img', { timeout: 15000 });
    const srcNow = await back.$eval('.artifact-gallery__main img', (el) => el.currentSrc || el.src);
    srcNow !== newUrl ? ok('test image removed — artifact back to placeholder') : bad('test image still attached');
    await back.close();
    await a.close();
  } catch (e) {
    bad(`cleanup failed: ${e.message.split('\n')[0]} — will revert manually`);
  }

  console.log('\nDELIVERY_CHECK', fail === 0 ? 'PASS' : 'FAIL', 'orders=' + [pickupOrderNo, stdOrderNo].filter(Boolean).join(','));
} catch (err) {
  fail++;
  console.error('FATAL', err.message.split('\n')[0]);
} finally {
  await browser.close();
}
process.exit(fail > 0 ? 1 : 0);