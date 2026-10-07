# Motion and the code patterns

Copy these patterns and adapt them. They are the parts that are easy to get subtly wrong.
Order inside the module: Lenis (5) → the WebGL scene and `sceneReady` (7) → the loader gate (2).
Text is split inside `leave()`, after the fonts have loaded (3, 4).

**The feel**: one ease for everything that isn't a spring, `expo.out` (CSS:
`cubic-bezier(.16,1,.3,1)`), 0.9–1.4 s. Springs for anything the pointer drives. No CSS
`@keyframes` entrances, no `transition: all`, no linear tweens except marquees.

| thing | numbers |
|---|---|
| headline letters | from `opacity 0, yPercent 45, blur 12px`; 1.2–1.4 s; stagger 20–40 ms |
| words (sub-lines, titles) | from `opacity 0, y 16–20px, blur 8–10px`; 1–1.1 s; stagger 45–70 ms (body: 15–25 ms) |
| blocks and cards | from `opacity 0, y 24–30px` (no blur); stagger 80–140 ms |
| subject | scale 1.06 → 1 over 2.5 s, or rise 120–200px over 2 s |
| counters | 1.8–2.4 s, `power4.out` |
| loader exit | curtain `yPercent -100`, 0.9 s, `expo.inOut` |
| hover | 150 ms `cubic-bezier(.2,0,0,1)` for colour; springs for movement |

## 1. Page skeleton and the failsafe

The loader covers everything. A **plain script** (not the module) opens the page after 12 s no
matter what, so a dead CDN or a WebGL crash never leaves people staring at a loader.

```html
<html lang="en" class="is-loading">
<body>
<div id="loader" aria-hidden="true">
  <span class="ld-num">000</span><i class="ld-bar"></i>
</div>
<!-- ...nav, main, footer... -->
<script>
  (function () {
    var c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) document.documentElement.classList.add('no-gl');
    setTimeout(function () {
      if (window.__revealed) return;
      var h = document.documentElement;
      h.classList.add('boot-fail'); h.classList.remove('is-loading');
      var l = document.getElementById('loader'); if (l) l.remove();
    }, 12000);
  })();
</script>
<script type="importmap">...</script>
<script type="module">/* everything else */</script>
```

```css
html.is-loading { overflow: hidden; }
#loader { position: fixed; inset: 0; z-index: 200; background: var(--ground); }
/* if the module dies half-way, show the final state of everything it may have hidden */
html.boot-fail .char, html.boot-fail .word, html.boot-fail [data-reveal] {
  opacity: 1 !important; transform: none !important; filter: none !important; }
html.no-gl .webgl { display: none; }          /* and show the still image instead */
```

Nothing is hidden by CSS before JS runs. GSAP sets the start states when the entrance is built,
while the loader still covers the page.

## 2. The loader gate (inside the module)

Counts real things, never just a timer. Holds near 92% until everything is ready, has a minimum
time so it doesn't flash, a rate cap so it never jumps, and a patience limit.

```js
const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, ms));
const MIN = reduce ? 0 : 1600, PATIENCE = 7000, t0 = performance.now();

const tasks = [
  document.fonts.load('400 1em "Anton"', 'GROWN NOT MADE'),   // the real face + the real text
  document.fonts.load('400 1em "General Sans"'),
  decode('assets/hero.jpg'),
  sceneReady,                                                // resolves after compile + first frame
].map(p => Promise.resolve(p).catch(() => {}));
let done = 0; tasks.forEach(p => p.then(() => done++));
let isReady = false;
Promise.race([Promise.all(tasks), wait(PATIENCE)]).then(() => { isReady = true; });

function decode(src) { const i = new Image(); i.src = src; return i.decode(); }

let shown = 0;
const num = document.querySelector('.ld-num'), bar = document.querySelector('.ld-bar');
function tickLoader(time, deltaMs) {
  const dt = Math.min(deltaMs, 64) / 1000;
  const target = isReady ? 1 : Math.min(.92, .12 + (done / tasks.length) * .8);
  shown += Math.min(Math.max(0, target - shown) * Math.min(1, dt * 4), .7 * dt);
  num.textContent = String(Math.round(shown * 100)).padStart(3, '0');
  bar.style.transform = `scaleX(${shown})`;
  if (isReady && shown > .995 && performance.now() - t0 > MIN) { gsap.ticker.remove(tickLoader); leave(); }
}
gsap.ticker.add(tickLoader);

function leave() {
  window.__revealed = true;
  html.classList.remove('is-loading');
  lenis?.start();
  if (reduce) { document.getElementById('loader').remove(); return; }
  gsap.timeline()
    .to('#loader', { yPercent: -100, duration: .9, ease: 'expo.inOut' })
    .add(entrance(), .12)                   // the hero starts as the curtain starts leaving
    .set('#loader', { display: 'none' });
}
```

`document.fonts.ready` is **not** a font gate: it can resolve before the stylesheet has even asked
for the face. Always `document.fonts.load()` with the family name and the real text.

## 3. Splitting text (after the fonts load)

```js
function split(root, by = 'chars') {
  root.setAttribute('aria-label', root.textContent.replace(/\s+/g, ' ').trim());
  const out = [];
  (function walk(node) {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(' ');
          const w = document.createElement('span');
          w.className = 'word'; w.setAttribute('aria-hidden', 'true');
          if (by === 'chars') [...part].forEach(ch => {
            const c = document.createElement('span'); c.className = 'char'; c.textContent = ch;
            w.append(c); out.push(c);
          });
          else { w.textContent = part; out.push(w); }
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  })(root);
  return out;
}
```

```css
.word { display: inline-block; white-space: nowrap; }
.char { display: inline-block; }
```

Child elements (`<span class="dim">`, `<br>`, `<em>`) survive, so you can dim the second clause.
Style them **by class** (`.hero-title .dim`), never `h1 span`: after splitting, every letter is a span.

## 4. The entrance

```js
function entrance() {                    // called from leave(), so the fonts are in
  const heroChars = split(document.querySelector('.hero-title'));
  const heroWords = split(document.querySelector('.hero-sub'), 'words');
  setupScrollReveals();
  const E = 'expo.out';
  return gsap.timeline()
    .fromTo('.hairline', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: E, stagger: .08 }, 0)
    .fromTo('.nav > *', { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: E, stagger: .06 }, .1)
    .fromTo('.hero-subject', { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.5, ease: E }, .2)
    .fromTo(heroChars, { opacity: 0, yPercent: 45, filter: 'blur(12px)' },
                       { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.3, ease: E, stagger: .028 }, .45)
    .fromTo(heroWords, { opacity: 0, y: 16, filter: 'blur(8px)' },
                       { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: E, stagger: .05 }, 1.0)
    .fromTo('.hero-cta, .hud', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1, ease: E, stagger: .08 }, 1.3);
}
```

Section reveals, once each, as they scroll in:

```js
function setupScrollReveals() {
  document.querySelectorAll('[data-split]').forEach(el => {
    const units = split(el, el.dataset.split);          // data-split="words" or "chars"
    gsap.fromTo(units, { opacity: 0, y: 18, filter: 'blur(10px)' }, {
      opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: .045,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  gsap.utils.toArray('[data-reveal]').forEach(el => gsap.fromTo(el, { opacity: 0, y: 28 }, {
    opacity: 1, y: 0, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
}
```

Under reduced motion: don't build the entrance or the scroll tweens at all, and skip Lenis.

## 5. Smooth scroll (Lenis on the GSAP ticker)

```js
gsap.registerPlugin(ScrollTrigger);
const lenis = reduce ? null : new Lenis({ lerp: .08 });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();                          // started again in leave()
  window.lenis = lenis;
}
// anchor links: lenis.scrollTo('#pricing', { offset: -80 }), never window.scrollTo
```

## 6. A cursor reaction with memory

Springs, not direct follow. Snap on the first contact so nothing glides in from the corner.

```js
const P = { x: .5, y: .5, tx: .5, ty: .5, vx: 0, vy: 0, seen: false };
addEventListener('pointermove', e => {
  P.tx = e.clientX / innerWidth; P.ty = e.clientY / innerHeight;
  if (!P.seen) { P.x = P.tx; P.y = P.ty; P.seen = true; }
}, { passive: true });

gsap.ticker.add((time, deltaMs) => {
  const dt = Math.min(deltaMs, 64) / 1000, k = 60, c = 16;   // stiffness, damping
  P.vx += ((P.tx - P.x) * k - P.vx * c) * dt; P.x += P.vx * dt;
  P.vy += ((P.ty - P.y) * k - P.vy * c) * dt; P.y += P.vy * dt;
  const dx = P.x - .5, dy = P.y - .5, bob = Math.sin(time * .8) * 6;
  subject.style.transform =
    `translate3d(${dx * -28}px, ${dy * -18 + bob}px, 0) rotateY(${dx * 8}deg) rotateX(${dy * -6}deg)`;
  // feed the same values to the WebGL light: uniforms.uPointer.value.set(P.x, 1 - P.y)
});
```

**Trail memory for shaders**: draw into a small 2D canvas every frame, fade it a little, stamp a
soft dot at the pointer, and use it as a `THREE.CanvasTexture` (a reveal mask, a light map, a
bend map). Where the cursor has been glows and slowly fades.

```js
const tc = document.createElement('canvas'); tc.width = tc.height = 256;
const tx = tc.getContext('2d'), trail = new THREE.CanvasTexture(tc);
function stampTrail() {
  tx.fillStyle = 'rgba(0,0,0,.05)'; tx.fillRect(0, 0, 256, 256);      // the fade = the memory
  const g = tx.createRadialGradient(P.x * 256, P.y * 256, 0, P.x * 256, P.y * 256, 40);
  g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  tx.fillStyle = g; tx.fillRect(0, 0, 256, 256); trail.needsUpdate = true;
}
```

On touch screens: drive the same values from taps (spring to the tap point, then back), plus a
slow ambient drift, so the hero is never frozen.

## 7. WebGL that behaves

```js
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
catch (e) { html.classList.add('no-gl'); }
renderer?.setPixelRatio(Math.min(devicePixelRatio, 1.5));
let inView = true;
new IntersectionObserver(([e]) => inView = e.isIntersecting).observe(canvas);
gsap.ticker.add(() => { if (renderer && inView && !document.hidden) render(); });
const sceneReady = renderer
  ? renderer.compileAsync(scene, camera).then(() => render())   // no shader hitch after the loader
  : Promise.resolve();
```

## 8. The phone menu

```html
<button class="menu-btn" aria-expanded="false" aria-controls="menu">Menu</button>
<div id="menu" class="menu-sheet" hidden>
  <a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
</div>
```

```css
.menu-btn { display: none; }
@media (max-width: 900px) { .nav-links { display: none; } .menu-btn { display: inline-flex; } }
.menu-sheet { position: fixed; inset: 0; z-index: 90; background: var(--ground);
  display: flex; flex-direction: column; justify-content: center; gap: 1.25rem; padding: 24px; }
.menu-sheet[hidden] { display: none; }
.menu-sheet a { font: 400 2.75rem/1 var(--display); color: var(--ink); text-decoration: none; }
/* the nav (with the button) sits above the sheet: z-index 100 */
```

```js
const btn = document.querySelector('.menu-btn'), sheet = document.getElementById('menu');
function setMenu(open) {
  btn.setAttribute('aria-expanded', open); btn.textContent = open ? 'Close' : 'Menu';
  sheet.hidden = !open;
  if (open) {
    lenis?.stop();
    gsap.fromTo([...sheet.children], { opacity: 0, y: 24, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8, ease: 'expo.out', stagger: .055 });
  } else lenis?.start();
}
btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
sheet.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  e.preventDefault(); setMenu(false);
  const id = a.getAttribute('href');
  lenis ? lenis.scrollTo(id, { offset: -60 }) : document.querySelector(id)?.scrollIntoView();
});
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
```

The button shows at the **same** width the links hide. A tablet with neither is a dead end.

## Gotchas that cost hours

- **Opacity fights.** If CSS sets `opacity: .6` to mute text and a tween animates `opacity` on the
  same element, one silently wins. Mute with colour alpha instead.
- **A JS transform replaces the CSS one.** If CSS centres something with
  `transform: translate(-50%,-50%)` and your cursor code writes `style.transform`, it jumps. Put the
  centring inside the JS string, or centre with `inset` + `margin: auto`.
- **Class collisions.** `.bar` in the nav and `.bar` in pricing, `.card` in two blocks: prefix
  per block. And a section and its inner mount point must not share an `id`.
- **Clipped reveals.** `overflow: hidden` on a line shaves descenders on tight leading. Skip the
  clip, or use `overflow: clip` with `padding-bottom: .12em`.
- **Phone overflow.** Grid and flex children need `min-width: 0`; long words need a smaller phone
  size; price rows need `flex-wrap: wrap`. Use `100svh`, not `100vh`, for the phone hero. Keep
  `html, body { overflow-x: clip }` as a backstop, but fix the cause: clipped text is still broken.
- **Huge blended layers.** A full-screen `mix-blend-mode` layer parked at `opacity: 0` can still
  render as a glitch; set `display: none` when it's off.
- **Videos** need `muted playsinline` to autoplay on phones, and H.264 (not HEVC) to show in Chrome.
- **Pages with ES modules don't run from `file://`.** Serve the folder (`npx serve .`).
