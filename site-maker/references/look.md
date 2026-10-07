# The look: fonts, colour, type

## Fonts: the short list

Pick **one display face + one text face**, plus a mono for small labels if the design wants one.
Never two display faces. Load only the weights you use. Every link below is checked and works.

### Display (the voice)

| face | feels like | weights | link |
|---|---|---|---|
| **Anton** | huge condensed caps: sport, gear, launches | 400 | `https://fonts.googleapis.com/css2?family=Anton&display=swap` |
| **Archivo** (expanded) | wide and heavy: cars, tech, industrial | wdth 125, 800 | `https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800&display=swap` (use `font-stretch:125%`) |
| **Syne** | editorial poster, a little strange: studios, culture | 700 / 800 | `https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap` |
| **Oswald** | condensed, technical: motorsport, scoreboards | 500 / 700 | `https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap` |
| **Bricolage Grotesque** | chunky, friendly, characterful: food, apps, kids | 700 / 800 | `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap` |
| **Instrument Serif** | editorial serif, the italic is a spark | 400 + italic | `https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap` |
| **Fraunces** | soft warm serif: food, craft, hospitality | 340 / 400 | `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,340;9..144,400&display=swap` |
| **Italiana** | thin high-contrast: luxury, perfume, museum | 400 | `https://fonts.googleapis.com/css2?family=Italiana&display=swap` |
| **Melodrama** | wide light serif, very expensive-looking at 4rem+ | 300 | `https://api.fontshare.com/v2/css?f[]=melodrama@300&display=swap` |
| **Chakra Petch** | instrumentation, HUDs, sci-fi | 400 / 600 | `https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600&display=swap` |

Match the face to the subject's *material*: heavy condensed for gear and speed, wide for machines,
thin didone for glass and perfume, soft serif for food and craft.

### Text (the quiet grotesque under it)

| face | weights | link |
|---|---|---|
| **General Sans** (the safe answer) | 400 / 500 | `https://api.fontshare.com/v2/css?f[]=general-sans@400,500&display=swap` |
| **Mulish** | 300 / 400 / 500 | `https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;500&display=swap` |
| **Inter Tight** | 400 / 500 | `https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&display=swap` |
| **Space Grotesk** | 400 / 500 | `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500&display=swap` |

### Mono (labels, counters, HUD; furniture, not a third voice)

Space Mono `https://fonts.googleapis.com/css2?family=Space+Mono&display=swap` ·
DM Mono `https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&display=swap` ·
JetBrains Mono `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap`

**Never** Inter, Roboto, Poppins, Montserrat or a system font as the display face. They are the
fastest way to look generated. If you want italic, load the italic (Instrument Serif has one); a
browser-faked slant is a giveaway.

---

## Colour that isn't lifeless

- **Start from the light, not from a palette generator.** Decide the hero's key light and rim light
  (warm against cool: lime and teal, orange and blue, pink and violet). The UI colours come from them.
- **Ground is tinted**, never pure `#000` or `#fff`: `#05070b`, `#0b0614`, `#04140f`, `#f4f1ec`, `#eef1f7`.
- **Ink is a colour**: cream `#fff4e8` over warm scenes, mint `#e6fff6` in cool ones, deep navy
  `#0a0f2c` on light grounds. Pure white text on a coloured scene looks pasted on.
- **One accent, used as a spark**: the CTA fill, one chip, a coloured full stop, the loader bar,
  the marquee separators. Under 2% of the page. Its big appearance is as light *in the hero*.
- **Muted = the ink at an alpha** (`.8 / .6 / .4`), never a separate grey. Hairlines `.12–.2`.
- **Dim the second clause** of a headline or section title to `.4–.6`. Composed, not typed.
  Do it with colour (`color: rgb(var(--ink-rgb) / .5)`), not `opacity`, which fights the reveal.
- **Commit.** One colour world for the whole page. Light sections can alternate with dark ones,
  but the accent and the ink family stay the same.

Sample the palette from your hero image once it exists: the ground from its darkest large area, the
accent from its brightest saturated light, the ink from its highlights pushed toward white.

---

## Type roles and sizes

| role | desktop | phone (390) | weight | leading | tracking |
|---|---|---|---|---|---|
| hero display | 10–20vw | sized so the **longest word** fits ~340px | the face's display weight | .8–.95 | −.02 to −.05em |
| section title | 4–7rem | 2.6–3.4rem | same face | .9–1 | −.02 to −.03em |
| stat figure | 3–4.5rem | 2.5–3rem | light or display | 1 | −.04 to −.08em, `tabular-nums` |
| body | 1–1.25rem | 1rem | 400 | 1.45–1.6 | 0 |
| label / eyebrow | 11–12px uppercase | 11–12px | 500 | 1.2 | .12em (counters) to .35em (eyebrows) |

- **Small uppercase is always tracked** (wide .2–.35em, or tight −.02em). Default tracking is a tell.
- **Headline layout**: break lines on purpose (`<br>` or a span per line), and size so each line
  spans most of the width. On phones re-stack to 2–3 lines and make it *bigger* relative to the
  screen.
- **Wide faces need care on phones**: Archivo at 125% width and Syne 800 caps run ~0.9–1em per letter.
  Size the phone headline by the longest single word, or it overflows and gets clipped.
- `text-wrap: balance` on short paragraphs; `font-variant-numeric: tabular-nums` on every number.
- Use `rem` for layout and `clamp()`/`vw` for display type. Keep a 12px floor on labels.

## Surfaces

- **Chrome is hairlines and corner brackets, not boxes.** 1px rules at 12–20% ink. 10–16px corner
  brackets on panels and the hero frame.
- **Glass only over a busy ground**: fill ≤ 20% (`rgba(255,255,255,.08)` or `rgba(0,0,0,.3)`),
  border 8–20%, `backdrop-filter: blur(8–16px)`. No `filter` or `opacity` on any parent of the
  glass or the blur stops working.
- **Grain + vignette** over everything (pointer-events none): SVG `feTurbulence baseFrequency .9,
  numOctaves 2` as a 160px tile at opacity .08–.14, and a soft vignette on the hero.
- **Radius**: pick one family. Pills (999px) for buttons and nav, 14–24px for cards. Or sharp
  everything for an industrial register. Don't mix.
