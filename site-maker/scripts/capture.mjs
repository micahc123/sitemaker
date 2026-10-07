#!/usr/bin/env node
// capture.mjs: screenshot a site at desktop and phone sizes so you can LOOK at it.
//
//   node capture.mjs [folder-or-url] [--out _shots] [--frames 8] [--wait 12000]
//
// Serves the folder itself (no server needed), waits for the loader, scrolls with a real mouse
// wheel (smooth-scroll libraries ignore scrollTo), and writes into <out>/:
//   sheet.png        contact sheet: desktop frames across the scroll, phone frames, menu open,
//                    and the reduced-motion hero
//   thumb.png        the hero at 1280x720       thumb-small.png   the same at 320x180
//   d-*.jpg, p-*.jpg the single frames, for a closer look
//   report.txt       console errors, failed requests, fonts that fell back, phone overflow,
//                    the phone-menu test, loader time
// Then OPEN sheet.png and thumb-small.png and judge them by eye.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const target = positional[0] || '.';
const isUrl = /^https?:\/\//.test(target);
const OUT = path.resolve(flag('out', isUrl ? '_shots' : path.join(target, '_shots')));
const FRAMES = Math.max(3, +flag('frames', 8));
const WAIT = +flag('wait', 12000);
fs.mkdirSync(OUT, { recursive: true });

// ---- playwright: resolve from the project folder first (the script lives in the skill folder)
async function loadPlaywright() {
  for (const base of [process.cwd(), isUrl ? null : path.resolve(target)].filter(Boolean)) {
    try { return createRequire(path.join(base, 'noop.js'))('playwright'); } catch {}
  }
  try { return await import('playwright'); } catch {}
  console.error('\nPlaywright is missing. In the project folder run:\n\n' +
    '  npm i -D playwright && npx playwright install chromium\n\nthen run this again.\n');
  process.exit(3);
}

// ---- a tiny static server with range support (video needs it)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml',
  '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.txt': 'text/plain' };
function serve(root) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(root, p);
      if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      const size = fs.statSync(f).size, type = TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream';
      const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
      if (m) {
        const start = +m[1] || 0, end = m[2] ? +m[2] : size - 1;
        res.writeHead(206, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': end - start + 1,
          'content-range': `bytes ${start}-${end}/${size}` });
        fs.createReadStream(f, { start, end }).pipe(res);
      } else {
        res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': size });
        fs.createReadStream(f).pipe(res);
      }
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

const { chromium } = await loadPlaywright();
let server, URL_ = target;
if (!isUrl) {
  const root = path.resolve(target);
  if (!fs.existsSync(path.join(root, 'index.html'))) { console.error(`No index.html in ${root}`); process.exit(2); }
  server = await serve(root);
  URL_ = `http://127.0.0.1:${server.address().port}/`;
}

const gpu = ['--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'];
if (process.platform === 'darwin') gpu.push('--use-angle=metal');
let browser;
try { browser = await chromium.launch({ headless: true, channel: 'chromium', args: gpu }); }
catch { browser = await chromium.launch({ headless: true, args: gpu }); }

const report = [];
const issues = { console: new Set(), failed: new Set() };
function watch(page) {
  page.on('pageerror', e => issues.console.add('page error: ' + e.message.slice(0, 180)));
  // 'Failed to load resource' repeats what the response listener below reports, with the URL
  page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/i.test(m.text())) issues.console.add(m.text().slice(0, 180)); });
  page.on('response', r => { if (r.status() >= 400 && !/favicon/i.test(r.url())) issues.failed.add(`${r.status()} ${r.url()}`); });
  page.on('requestfailed', r => { if (!/favicon/i.test(r.url())) issues.failed.add(`failed ${r.url()} (${r.failure()?.errorText})`); });
}

// wait until the loader is gone (or window.__revealed), then let the entrance play
async function ready(page, settle = 2600) {
  const t0 = Date.now();
  while (Date.now() - t0 < WAIT) {
    const ok = await page.evaluate(() => {
      if (window.__revealed) return true;
      const el = document.querySelector('#loader,#preloader,.loader,.preloader,[data-loader]');
      if (!el) return document.readyState === 'complete';
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      return cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .02 ||
        r.bottom <= 1 || r.top >= innerHeight - 1 || r.width === 0;
    }).catch(() => false);
    if (ok) { await page.waitForTimeout(settle); return Date.now() - t0; }
    await page.waitForTimeout(150);
  }
  return -1;
}

// smooth scrolling keeps moving after the wheel stops: wait until scrollY holds still
async function settled(page) {
  let last = -1, same = 0, y = 0;
  for (let i = 0; i < 40 && same < 3; i++) {
    await page.waitForTimeout(150);
    y = await page.evaluate(() => scrollY);
    same = Math.abs(y - last) < 1 ? same + 1 : 0; last = y;
  }
  await page.waitForTimeout(500);   // let scroll-triggered reveals finish
  return y;
}
const maxScroll = page => page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
async function scrollTo(page, y) {
  const vp = page.viewportSize();
  await page.mouse.move(vp.width / 2, vp.height / 2);
  for (let k = 0; k < 3; k++) {
    let cur = await page.evaluate(() => scrollY);
    let left = y - cur, guard = 0;
    while (Math.abs(left) > 2 && guard++ < 400) {
      const d = Math.max(-500, Math.min(500, left));
      await page.mouse.wheel(0, d); left -= d;
      await page.waitForTimeout(16);
    }
    cur = await settled(page);
    if (Math.abs(cur - y) < 40) return;
  }
  // wheel did not get there (touch emulation, scroll lock): fall back to the API
  await page.evaluate(y => window.lenis ? window.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y), y);
  await settled(page);
}

// horizontal overflow and elements running off the screen (ignores things inside clipping parents)
const overflowCheck = page => page.evaluate(() => {
  const W = innerWidth, out = [];
  const clipped = el => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
    const o = getComputedStyle(a).overflowX; if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return true; } return false; };
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || (r.right <= W + 1 && r.left >= -1)) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.visibility === 'hidden' || +cs.opacity === 0 || clipped(el)) continue;
    if (!el.children.length || el.matches('img,video,canvas,h1,h2,h3,p,a,button')) {
      const name = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList[0] ? '.' + el.classList[0] : '');
      out.push(`${name} (${Math.round(r.left)}..${Math.round(r.right)})`);
    }
  }
  return { scrollWidth: document.documentElement.scrollWidth, W, offenders: [...new Set(out)].slice(0, 6) };
});

const fontCheck = page => page.evaluate(() => {
  const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-\w+|-apple-system|blinkmacsystemfont|arial|helvetica|helvetica neue|times|times new roman|georgia|menlo|monaco|courier|courier new|consolas|sf mono|segoe ui|inherit)$/i;
  const loaded = new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, '').toLowerCase()));
  const used = new Set();
  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,a,button,li,span,label,input,dd,dt')) {
    if (!el.textContent.trim()) continue;
    used.add(getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/["']/g, ''));
  }
  const fell = [...used].filter(f => !generic.test(f) && !loaded.has(f.toLowerCase()));
  return { used: [...used], fell };
});

const shot = async (page, name) => { const f = path.join(OUT, name); await page.screenshot({ path: f, type: 'jpeg', quality: 82 }); return f; };
const tiles = { desk: [], phone: [], extra: [] };

// ---------------- desktop
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage(); watch(page);
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  const t = await ready(page);
  report.push(t < 0 ? `LOADER: still up after ${WAIT} ms (desktop)` : `loader: page revealed after ~${(t / 1000).toFixed(1)} s`);
  const meta = await page.evaluate(() => ({
    title: document.title, h1: document.querySelectorAll('h1').length,
    desc: !!document.querySelector('meta[name="description"]'), lang: document.documentElement.lang }));
  report.push(`title: "${meta.title}" | h1 count: ${meta.h1} | meta description: ${meta.desc ? 'yes' : 'MISSING'} | lang: ${meta.lang || 'MISSING'}`);
  // poke the hero so the cursor reaction shows
  for (let i = 0; i <= 12; i++) { await page.mouse.move(720 + i * 22, 450 - i * 12); await page.waitForTimeout(30); }
  await page.waitForTimeout(500);
  const H = await maxScroll(page);
  for (let i = 0; i < FRAMES; i++) {
    const y = Math.round((i / (FRAMES - 1)) * H);
    if (i) await scrollTo(page, y);
    const pct = Math.round((i / (FRAMES - 1)) * 100);
    tiles.desk.push({ f: await shot(page, `d-${String(i).padStart(2, '0')}.jpg`), label: `desktop ${pct}%` });
  }
  const fc = await fontCheck(page);
  report.push(fc.fell.length ? `FONTS FELL BACK (never loaded): ${fc.fell.join(', ')}` : `fonts: all loaded (${fc.used.join(', ')})`);
  await ctx.close();
}

// ---------------- phone
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); watch(page);
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  const t = await ready(page);
  if (t < 0) report.push(`LOADER: still up after ${WAIT} ms (phone)`);
  const H = await maxScroll(page);
  const stops = [0, .25, .5, .75, 1];
  const over = [];
  for (const s of stops) {
    if (s) await scrollTo(page, Math.round(s * H));
    tiles.phone.push({ f: await shot(page, `p-${Math.round(s * 100)}.jpg`), label: `phone ${Math.round(s * 100)}%` });
    const o = await overflowCheck(page);
    if (o.scrollWidth > o.W || o.offenders.length) over.push(`${Math.round(s * 100)}%: scrollWidth ${o.scrollWidth}/${o.W}${o.offenders.length ? ', off-screen: ' + o.offenders.join(', ') : ''}`);
  }
  report.push(over.length ? 'PHONE OVERFLOW:\n  ' + over.join('\n  ') : 'phone 390: no overflow at 5 scroll stops');

  // menu test: open, screenshot, tap the first new link, check it closed and scrolled
  await scrollTo(page, 0);
  const visibleLinks = () => page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
    .filter(a => { const r = a.getBoundingClientRect(), cs = getComputedStyle(a);
      return r.width && r.height && r.bottom > 0 && r.top < innerHeight && cs.visibility !== 'hidden' && +cs.opacity > .05; })
    .map(a => a.getAttribute('href')));
  const before = new Set(await visibleLinks());
  const btn = await page.evaluateHandle(() => [...document.querySelectorAll(
    'button[aria-controls],button[aria-expanded],.menu-btn,.menu-toggle,.burger,.hamburger,[aria-label*="menu" i]')]
    .find(b => { const r = b.getBoundingClientRect(); return r.width && r.height && getComputedStyle(b).visibility !== 'hidden'; }) || null);
  if (!(await btn.evaluate(b => !!b))) report.push('PHONE MENU: no visible menu button at 390 px');
  else {
    await btn.click(); await page.waitForTimeout(1000);
    tiles.phone.push({ f: await shot(page, 'p-menu.jpg'), label: 'phone menu open' });
    const fresh = (await visibleLinks()).filter(h => !before.has(h) && h.length > 1);
    if (!fresh.length) report.push('PHONE MENU: opened, but no in-page links appeared');
    else {
      const y0 = await page.evaluate(() => scrollY);
      await page.locator(`a[href="${fresh[0]}"]:visible`).first().click();
      await page.waitForTimeout(600); await settled(page);
      const y1 = await page.evaluate(() => scrollY);
      const closed = await page.evaluate(([b, h]) => b.getAttribute('aria-expanded') === 'false' ||
        ![...document.querySelectorAll(`a[href="${h}"]`)].some(a => { const r = a.getBoundingClientRect(), cs = getComputedStyle(a);
          return r.width && r.bottom > 0 && r.top < innerHeight && cs.visibility !== 'hidden' && +cs.opacity > .05; }), [btn, fresh[0]]);
      report.push(`phone menu: opened, tapped ${fresh[0]} -> scrolled ${y0} -> ${Math.round(y1)}, closed: ${closed ? 'yes' : 'NO'}` +
        (Math.abs(y1 - y0) < 50 ? '  (LINK DID NOT SCROLL)' : ''));
    }
  }
  await ctx.close();
}

// ---------------- reduced motion still + thumbnail
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage(); watch(page);
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  await ready(page, 1500);
  tiles.extra.push({ f: await shot(page, 'reduced-motion.jpg'), label: 'reduced motion' });
  await ctx.close();

  const tctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const tp = await tctx.newPage();
  await tp.goto(URL_, { waitUntil: 'domcontentloaded' });
  await ready(tp, 3500);
  for (let i = 0; i <= 10; i++) { await tp.mouse.move(640 + i * 18, 360 - i * 10); await tp.waitForTimeout(30); }
  await tp.waitForTimeout(600);
  await tp.screenshot({ path: path.join(OUT, 'thumb.png') });
  const b64 = fs.readFileSync(path.join(OUT, 'thumb.png')).toString('base64');
  await tp.setViewportSize({ width: 320, height: 180 });
  await tp.setContent(`<body style="margin:0"><img src="data:image/png;base64,${b64}" style="width:320px;height:180px;display:block">`);
  await tp.screenshot({ path: path.join(OUT, 'thumb-small.png') });
  await tctx.close();
}

// ---------------- contact sheet
{
  const img = t => `<figure><img src="data:image/jpeg;base64,${fs.readFileSync(t.f).toString('base64')}"><figcaption>${t.label}</figcaption></figure>`;
  const html = `<!doctype html><style>
    body{margin:0;padding:16px;background:#151515;font:12px/1.3 ui-monospace,Menlo,monospace;color:#aaa}
    .row{display:grid;gap:10px;margin-bottom:14px} .d{grid-template-columns:repeat(4,1fr)}
    .p{grid-template-columns:repeat(${tiles.phone.length + tiles.extra.length},auto);justify-content:start;align-items:end}
    figure{margin:0} img{display:block;width:100%;border:1px solid #333} .p img{height:380px;width:auto}
    figcaption{padding-top:4px}</style>
    <div class="row d">${tiles.desk.map(img).join('')}</div>
    <div class="row p">${[...tiles.phone, ...tiles.extra].map(img).join('')}</div>`;
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await page.setContent(html); await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, 'sheet.png'), fullPage: true });
  await ctx.close();
}

await browser.close(); server?.close();

report.push(issues.console.size ? 'CONSOLE ERRORS:\n  ' + [...issues.console].slice(0, 10).join('\n  ') : 'console: no errors');
report.push(issues.failed.size ? 'FAILED REQUESTS:\n  ' + [...issues.failed].slice(0, 10).join('\n  ') : 'requests: none failed');
const text = report.join('\n');
fs.writeFileSync(path.join(OUT, 'report.txt'), text + '\n');
const shown = path.relative(process.cwd(), OUT);
console.log(`\n${text}\n\nWrote ${shown && !shown.startsWith('..') ? shown : OUT}/: sheet.png, thumb.png, thumb-small.png, report.txt and single frames.`);
console.log('Now OPEN sheet.png and thumb-small.png and look. Lines in CAPITALS above need fixing.');
