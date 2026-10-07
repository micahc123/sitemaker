# Component menu

Pick 8–12 for the page. Each entry gives the numbers that make it look finished. Build them in the
page's own palette and fonts so they read as one system. Prefix block-internal class names
(`.price-bar`, not `.bar`) so two blocks never fight over one name.

**One hover gesture per control**: dim to .6, *or* lift 2px, *or* nudge an arrow 3–5px, *or* a
sliding fill. Not all four. Static hovers: `150ms cubic-bezier(.2,0,0,1)`.

---

### Chrome

**1. Preloader.** Full-screen curtain in the ground colour. A counter `000 → 100` (zero-padded,
`tabular-nums`) either big (4–7rem, display or mono) or small (12px, tracking .3em) next to a 1px
track that fills in the accent. Holds at ~92% until real readiness. Exit is a gesture, not a fade:
the curtain slides up (`yPercent:-100`, 0.9 s, `expo.inOut`), or clips away from the bottom, or an
aperture opens. Draw it in the brand's motif if you can (a filling silhouette, a dial).

**2. Nav pill.** Fixed, `top: 16–24px`. Glass pill: height 44px, radius 999px, fill
`rgba(0,0,0,.3)` (or 8% white on dark), `backdrop-filter: blur(12px)`, 1px border at 10–14%.
Links .875rem at .8 → 1 on hover. CTA is a solid pill in the ink or accent. Enters from
`y:-14px, opacity 0` right after the loader. Once the page scrolls past the hero, fade in a backing
(the glass pill, or a top scrim from the ground colour) so section titles never run under bare
nav text.

**3. HUD corners.** Four labels pinned to the hero's corners: mono 11–12px uppercase, tracking
.2em, ink at .6. Contents that feel live: coordinates, a running clock `[ 14:02:37 ]`, an index
`[ 01 / 06 ]`, a status dot (6px, accent, blinking on a 1.2s sine). Plus 12px corner brackets.

**4. Eyebrow.** A 6px dot or a 24px rule, then 12px uppercase at tracking .3em, ink at .6. Sits
above every section title. Optionally a bracketed index `( 02 )`.

**5. Buttons.** Primary: pill, `14px 24px`, .875rem 500, with a fill that slides in from the left
on hover (`scaleX 0→1`, origin left, 400ms `cubic-bezier(.33,0,0,1)`) and an arrow that nudges 4px.
Secondary: a text link with `underline-offset: 4px`. Bracketed variant: a 1px frame whose four
corner brackets converge 4px on hover, no fill.

**6. Bracketed chip.** `[ LABEL ]` in mono, 11px, tracking .2em, 1px border at 20%, padding
`6px 10px`. For tags, categories, specs.

**7. Grain + vignette.** Fixed overlay, `pointer-events:none`, SVG noise tile 160px at .08–.14
opacity with `mix-blend-mode: overlay`. Hero vignette: radial or rounded-box darkening to the
ground at the edges.

**8. Cursor.** Only if it adds something: a 6px dot that snaps + a 36px ring that follows on a
spring (stiffness ~0.15), growing to 64px over links with a word inside ("View", "Drag"). Hidden on
touch devices.

### Content blocks

**9. Marquee strip.** Two identical copies of a row in a track, `x: 0 → -50%`, 25–40 s linear, or
linked to scroll velocity. Big words in the display face, separated by a glyph in the accent
(✦ / ● / ✕). Pause on hover. A second row in reverse at .6 opacity adds depth.

**10. Stat counters.** A row of 3–4: value 3–4.5rem, light or display weight, leading 1, tracking
−.04em, `tabular-nums`; label .875rem at .6 below; a left hairline (1px, 20%) with padding-left
1.25rem. Count up over 1.8–2.4 s with `power4.out` when in view, or scramble through random digits
and lock in left to right.

**11. Bento / feature cards.** A grid of 4–6 cards with mixed spans. Radius 16–24px, padding
1.75–2rem, 1px border at 12%, fill 4–6% ink. **Cursor spotlight**: a radial gradient at the
pointer (`radial-gradient(360px at var(--mx) var(--my), rgb(accent / .14), transparent 60%)`).
**Tilt**: ±6° toward the pointer on a spring, `perspective: 900px`. Each card has one visual (an
icon drawn in SVG, a small image, a live number). Cards enter staggered 90–140ms.

**12. Image card with scrim.** Image fills the card; scrim `linear-gradient(to top, ground .9 0%,
transparent 62%)`; title in the display face; meta in mono 11px tracking .16em at .6. On enter the
image scales 1.12 → 1 over 1.2 s inside a `clip-path: inset(0 0 100% 0) → inset(0)` wipe.

**13. Sticky stacked panels.** 3–4 full-height panels, each `position: sticky; top: 0`. As the next
one slides over, the covered one scales to .9 and darkens to 55% (put the transform on an inner
wrapper, never on the sticky element itself). Great for "how it works" stages.

**14. Pinned horizontal gallery.** Section pinned with ScrollTrigger, a track translating
`x: -(trackWidth - viewport)` scrubbed. Cards 30–40vw wide. On phones, unpin and use native
horizontal swipe with `scroll-snap-type: x mandatory`.

**15. Editorial split.** Big index `( 01 )`, a section title with the second clause dimmed, a short
paragraph, and an image that parallaxes ±60px against the scroll. Alternate sides.

**16. Process rail.** A vertical line with a thread that fills with scroll (scaleY scrubbed), steps
along it that light up (accent dot, title to full ink) as the thread passes.

**17. Proof without testimonials.** Fictional partner names set as words in a marquee or a grid
(display face at .5 opacity, hover to 1), plus one big number. Never fake quotes from real people.

**18. Pricing with a spring toggle.** Monthly/yearly pill toggle, knob slides on a snappy spring
(or `back.out(1.4)` 0.5s). Prices roll digit by digit to the new value. Three tiers, the middle one
lifted with an accent border and a `[ MOST PICKED ]` chip.

**19. FAQ accordion.** Rows with a hairline between. Plus icon rotates 45° to an ×. Answer opens
with `grid-template-rows: 0fr → 1fr` over 500ms `cubic-bezier(.16,1,.3,1)`, text blur-rises in.
One open at a time. Real `<button aria-expanded>`.

**20. CTA band.** One huge line in the display face (second half dimmed), one primary button, the
hero subject or its light reappearing behind. The last thing before the footer.

**21. Giant wordmark footer.** The brand name at 18–22vw across the full width, letters rising in
one by one as the footer enters. Above it: 3–4 link columns (titles .75rem uppercase tracking .1em
at .5; links .875rem at .8), a newsletter form (a real `<form>`, email input, arrow submit),
generic links (Journal, Newsletter, Careers, Contact), `© 2026 Brand`. Never real social platforms.
