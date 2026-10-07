---
name: site-maker
description: Build a high-end, animated landing page as one index.html (three.js, GSAP and Lenis from a CDN, no build step), starting from a single reference image or a one-line idea. Use when someone says "build me a landing page", "make a site like this reference / screenshot / post", "design a hero for my brand", "make it look premium / Awwwards-level", or drops an image and asks for a website in that style. Covers the brief, fonts and colour, generated or code-drawn visuals, the loader, motion, the phone layout, and a capture-and-look review loop.
---

# Site Maker

You are going to build one landing page that looks like a top studio made it. Not "nice for AI".
The kind of site people screenshot and share.

The whole job is seven steps. Do them in order and don't skip the looking.

1. **Read the reference**: name what makes it work.
2. **Write the brief**: concept, palette, fonts, sections, components.
3. **Make the assets**: a hero image (generated, or drawn in code) and a few supporting images.
4. **Build `index.html`**: one file, real loader, real motion, a working phone menu.
5. **Capture and look**: screenshot desktop and phone, fix what you see, 3–5 rounds.
6. **Thumbnail test**: the hero must read at 320×180.
7. **Ship checklist.**

Work in the user's current folder. The finished project looks like this:

```
index.html        the whole site
BRIEF.md          the brief from step 2
assets/           images, video, models (hero.jpg, hero-phone.jpg, ...)
_shots/           captures from step 5 (sheet.png, thumb.png, ...)
```

If the user gave no reference and no idea, ask one question: *"What's the brand, and do you have a
reference image?"* Otherwise don't ask. Make good calls and keep moving.

---

## 1. Read the reference

Open the reference image (a screenshot, a post, a dribbble shot). Write four lines about it in
`BRIEF.md` before anything else:

- **The subject.** What ONE thing fills the hero? (A figure in a technical jacket, a black car on
  black, a glass bottle, a moon.) Sites that go viral have one striking subject, never a collage.
- **The headline.** How big, what face, how it locks with the subject. The best ones are huge
  (10–20vw), tight, two to four words, and *layered*: the subject sits in front of some letters.
- **The colour world.** One committed world: a saturated ground, or deep black with one hot accent.
  Name the light/dark split.
- **The one interaction.** What does the hero do when you move the mouse? (Tilt, light follows the
  cursor, parallax layers, a mask reveal, draw-to-reveal.)

The reference sets the **level**, not the layout. Never copy its brand, logo, copy or section
order. Make your own fictional brand and your own structure, and aim to beat it.

## 2. Write the brief

Fill in `references/brief.md`'s template into `BRIEF.md`. Keep it under a page. It decides:

- **Concept**: the fictional brand, what it sells, its one idea, the headline (2–4 words).
- **Palette from the light**: pick the hero's two lights first (a key and a rim, warm against cool),
  then derive the ground, the ink and ONE accent from them. Rules in `references/look.md`.
- **Fonts**: one display face + one text face (+ an optional mono for labels), from the short list
  in `references/look.md`. Nothing off the list.
- **3–4 type roles**: display, body, label (and maybe a stat figure). Sizes, weights, tracking.
- **The hero interaction**: one sentence, with memory (it eases, trails or springs back).
- **Sections**: hero plus 5–7 sections, each with a job and a visual. One visual language.
- **Components**: pick 8–12 blocks from `references/components.md` and keep their numbers.

Then show the user the brief in a few lines and carry on (unless they asked to approve it first).

## 3. Make the assets

Read `references/assets.md`. Short version:

- **The hero plate is the most important file in the project.** One subject, lit with a key and a
  coloured rim, on the colour world from the brief, with room for the headline. No text in the
  image.
- **Supporting images** (3–6): pass the hero as a reference image to every later generation so
  the light, grade and world match. Ask for "the exact same image, only change X" when you need
  layers (subject cut-out, background without the subject, a night version).
- **A phone version** of the hero (9:16) so the subject survives on a tall screen.
- **Video is optional and bounded.** A short loop inside a panel, or a subtle camera push behind
  the subject. Never a soft AI film as the whole hero.
- **Three routes**, in this order of preference:
  1. The user has a Higgsfield MCP connector: generate directly (check the cost first).
  2. The user generates by hand: write the exact prompts into `BRIEF.md`, tell them which file
     names to save into `assets/`, and build on placeholders while they do it.
  3. No image tool at all: draw the world in code (three.js shader or lit scene). The recipes are
     in `references/assets.md`. A graded, lit code scene beats a weak generated image.

Never wait on assets. Build the page on placeholders (a gradient in the right colours at the right
size) and swap the files in when they land.

## 4. Build `index.html`

One file. Read `references/motion.md` for the code patterns before you write any JS. Stack:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.css">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.min.js"></script>
<script type="importmap">{"imports":{
  "three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
  "three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
```

Build in this order: tokens (colours, type roles as CSS variables) → the hero (ground, subject,
headline, the layer sandwich) → nav → sections → footer → loader → entrance → cursor reaction →
phone layout. Requirements, every site:

- **A real loader** that counts real things (fonts, hero images decoded, the first WebGL frame),
  holds near 92% until they're ready, has a minimum time (about 1.6 s) so it never flashes, and a
  **failsafe**: a plain `<script>` watchdog that opens the page even if the CDN or WebGL dies.
  The entrance starts *as the curtain starts to leave*, not after.
- **One entrance timeline** gated on the loader: hairlines and nav → subject (scale 1.06→1 over
  ~2.5 s) → headline → sub-line → stats → CTA. Elements arrive from different directions.
- **Per-letter blur-rise headline**: each letter from `opacity 0, y .4em, blur 12px`, 20–40 ms
  stagger, an expo-out ease (or a spring). No `overflow:hidden` clip on the line, it shaves
  descenders.
- **Motion is springs or one expo-out curve.** No CSS `@keyframes` entrances, no
  `transition: all`. Every section gets an entrance (word blur-rise, staggered cards, counters).
- **A cursor reaction with memory**: tilt, light, parallax or a reveal mask that eases toward the
  pointer and keeps a trail, snaps to the first pointer position, and settles when the mouse stops.
  On touch, swap hover for tap (and a slow ambient drift so nothing is ever frozen).
- **Nothing is static at rest**: a slow bob, drifting motes, grain, a breathing light.
- **A working phone menu**: a button that opens a full-screen sheet, links that scroll to their
  section and close it, Esc closes it. The button appears at the same width the links disappear.
- **Phone layout designed, not squeezed**: at 390×844 the headline re-stacks to 2–3 lines and
  *grows*, the subject stays big, nothing overflows sideways.
- **Reduced motion** shows the final state (no intro, no smooth scroll, no tilt).
- **Performance**: cap device pixel ratio at 1.5, render WebGL only while it's on screen and the
  tab is visible, compile shaders before the loader leaves.

### The layer sandwich (how the subject sits in front of the headline)

```
z 0  ground      CSS gradient, the background plate, or a WebGL canvas
z 1  headline    the huge display type
z 2  subject     a transparent cut-out PNG, or a WebGL canvas with alpha:true
z 3  UI          nav, labels, buttons, HUD corners
```

Put the subject on its own layer and let it cover part of the headline. That one move is most of
the "expensive poster" look. If the subject hides letters people need to read, add a thin outline
copy of the headline *above* the subject (transparent fill, 1–2px stroke in the ink), so the
covered letters still read as line drawing. If a stacked text copy misbehaves over a WebGL canvas,
draw the outline inside the scene instead.

## 5. Capture and LOOK (3–5 rounds)

Numbers passing is the floor. The page is done when you have looked at it. Run:

```bash
node <this skill's folder>/scripts/capture.mjs .
```

It serves the folder, waits for the loader, scrolls with a real mouse wheel, and writes
`_shots/sheet.png` (desktop frames across the scroll + phone frames + the phone menu open),
`_shots/thumb.png` (1280×720 hero) and `_shots/thumb-small.png` (320×180). It also prints console
errors, fonts that fell back, 404s and phone overflow. If it says Playwright is missing, run
`npm i -D playwright && npx playwright install chromium` in the project folder and run it again.

**Open `_shots/sheet.png` and look at it** (use the Read tool on the image). Then look for these
rough spots and fix every one you find:

- an **empty frame** mid-scroll (a black or blank screen between sections)
- the **headline covered** where it needs to read, or text sitting on busy art without a scrim
- section titles **sliding under the nav** with nothing behind it (give the nav a backing once
  you're past the hero)
- **clipped text**: cut descenders, a word running off the phone screen, a line mask eating letters
- **sideways overflow** at 390 px, or anything touching the screen edge
- a hero that is **centred but not composed** (subject small, type small, no layering)
- **lifeless colour**: white or grey text that has nothing to do with the scene's light
- **soft mush**: blurry upscaled images, blotchy textures, blown-out glow
- the **loader still showing**, or content that never revealed
- sections that look like a **different site** (another palette, another button style)

Fix, capture again, look again. Three rounds minimum, five if the hero isn't there yet. Say what
you changed each round in one line. The user will judge by eye, so you must too.

Two habits that save time: a counter or a reveal can be caught mid-animation in a frame, so check
its final value before "fixing" it; and if a visual bug survives two experiments, simplify the
effect rather than chasing it.

## 6. Thumbnail test

Open `_shots/thumb-small.png` (the hero at 320×180). It must read in one glance: one subject lit and
filling a third of the frame or more, one colour idea with a clear light/dark split, the headline
legible or deliberately part of the image. If it's a grey haze with small text, the hero fails,
and it fails as a site too. Go back to step 3 or 4.

## 7. Ship checklist

Run through it and tick each line in your final message:

- [ ] Loader leaves within ~4 s on a normal connection; the watchdog opens the page within 12 s
      even with the CDN blocked
- [ ] No console errors, no 404s, fonts loaded (the capture report says so)
- [ ] 390 px: overflow 0 at every scroll stop, headline fits, phone menu opens and every link works
- [ ] ~900 px (tablet): there is still a way to navigate (links or the menu button)
- [ ] No empty frames, no text on busy art without a scrim, every section has an entrance
- [ ] Reduced motion shows a good still
- [ ] Thumbnail reads at 320×180
- [ ] **Every name is fictional.** Search the brand name to make sure it isn't a real company in the
      same field. No real platforms in the footer (use Journal, Newsletter, Contact). Emails use
      `@example.com`. No real product names, trademarks or spec sheets in the copy.
- [ ] `<title>`, meta description, an inline SVG favicon, `lang` set, one `<h1>`
- [ ] Images compressed (hero ≤ 500 KB webp/jpg), any video is H.264 MP4

Finish by telling the user how to view it: `npx serve .` or `python3 -m http.server 8000` in the
folder, then open `http://localhost:8000` (a module page won't run from `file://`).

---

## Red flags: stop and fix

| you're about to... | instead |
|---|---|
| use Inter or a system font for the headline | pick a display face from `references/look.md` |
| make the hero a generated video | a still plate with real motion on top (parallax, light, shader) |
| put white text on a coloured scene | ink tinted from the scene's light, one accent as a spark |
| fade sections up with an observer | per-word or per-letter blur-rise, staggered, on a curve or spring |
| leave the hero still when the mouse stops | something always breathes: bob, motes, grain, light |
| say "done" without opening the captures | open `_shots/sheet.png`, then decide |
| copy the reference's layout to be safe | same level, your own structure |
| use a real brand, product or platform name | invent one, then search it |

## Files

| file | read it when |
|---|---|
| `references/brief.md` | step 2: the brief template and a filled example |
| `references/look.md` | step 2: fonts (the short list), colour, type sizes |
| `references/components.md` | step 2: the component menu with the numbers that make each one look right |
| `references/assets.md` | step 3: image prompts, Higgsfield (by hand or MCP), video loops, code-drawn worlds |
| `references/motion.md` | step 4: loader + failsafe, splitter, entrance, springs, cursor, Lenis, phone menu, gotchas |
| `scripts/capture.mjs` | step 5: screenshots, contact sheet, thumbnail, and a health report |
