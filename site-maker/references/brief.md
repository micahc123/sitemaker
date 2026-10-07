# The brief

Copy this into `BRIEF.md` and fill it in. Under a page. Every later decision points back here.

```markdown
# <Brand>: <the headline>

## The reference (what makes it work)
- Subject:
- Headline:
- Colour world:
- Interaction:
What I'm taking: the level. What I'm not: its brand, copy, layout.

## Concept
<Brand> is a <what> for <who>. One idea: <the single thing it promises>.
Headline (2–4 words): "<...>"   Sub-line (one sentence, under 16 words): "<...>"

## Light and palette
Key light: <colour, direction>     Rim light: <colour, direction>
--ground: #......   (tinted, never pure #000 or #fff)
--ink:    #......   (the text colour, tinted toward the key light)
--accent: #......   (the rim or the hottest light; used as a spark, <2% of the page)
Muted text = ink at .8 / .6 / .4. Hairlines = ink at .12–.2.

## Type
Display: <face> <weight>   Text: <face> <weights>   Mono (labels): <face or none>
| role    | size (desktop / phone) | weight | leading | tracking |
| display | 14vw / 22vw            |        | .85     | -.04em   |
| body    | 1.125rem / 1rem        |        | 1.5     | 0        |
| label   | 12px uppercase         |        | 1.2     | .22em    |
| stat    | 4.5rem / 3rem          |        | 1       | -.05em   |

## Hero
Subject: <what, where in the frame>   Layering: <which letters it covers>
Interaction: <one sentence, with memory>
Entrance: <what arrives first, from where>

## Sections (5–7 after the hero)
1. <name>: <its job> / <its visual> / <component>
...

## Components (8–12 from components.md)
preloader, nav pill, ...

## Assets
| file | what | prompt |
| assets/hero.jpg | 16:9 hero plate | "..." |
| assets/hero-phone.jpg | 9:16 version | "same image as hero, recomposed tall..." |
...
```

---

## A filled example (fictional)

```markdown
# Kelpwright: Grown, not made

## The reference (what makes it work)
- Subject: one diver in a dark wetsuit, hanging in green water, lit from above
- Headline: 3 words, heavy condensed caps at ~16vw; the diver's arm crosses the first word
- Colour world: deep bottle green, a hot lime caustic light from the surface
- Interaction: caustic light follows the cursor across the diver
What I'm taking: the level. What I'm not: its brand, copy, layout.

## Concept
Kelpwright is a seaweed-based packaging material for food brands. One idea: packaging you can
grow in six weeks and compost in six more.
Headline: "Grown, not made"   Sub-line: "Packaging farmed from kelp. Six weeks to grow, six to disappear."

## Light and palette
Key light: pale lime #d9ff7a from above   Rim light: deep teal #1f8f86 from behind-left
--ground: #04140f   --ink: #eafbe0   --accent: #c6ff3d
Muted = ink at .8/.6/.4. Hairlines = ink at .14.

## Type
Display: Anton 400 (caps)   Text: General Sans 400/500   Mono: DM Mono 400
| display | 15vw / 24vw | 400 | .84 | -.01em |
| body    | 1.125rem / 1rem | 400 | 1.5 | 0 |
| label   | 12px caps | 500 | 1.2 | .24em |
| stat    | 4.5rem / 3rem | 400 | 1 | -.02em |

## Hero
Subject: a kelp frond spiralling up the right third, backlit; a cut-out layer covers the "N" of GROWN
Interaction: a caustic light pattern (shader) follows the cursor with a 0.8 s lag and leaves a fading trail
Entrance: water ground fades up, frond rises 120px and settles, headline letters blur-rise left to right

## Sections
1. Marquee strip: "compostable / home-grown / ocean-positive" in the accent
2. How it grows: 3 sticky stacked panels, each a stage (seed line, harvest, sheet)
3. Numbers: 4 counters (6 weeks, 0 plastic, 92% less CO2, 40 partner farms)
4. Formats: bento of 5 product cards with cursor spotlight + tilt
5. Pricing: 3 tiers with a monthly/yearly spring toggle
6. FAQ: 6 questions on a spring accordion
7. Footer: giant KELPWRIGHT wordmark, newsletter form, Journal / Newsletter / Contact

## Components
preloader (counter + curtain), nav pill, HUD corner labels, eyebrow, sliding-fill button,
marquee, sticky stack, stat counters, bento + spotlight, pricing toggle, FAQ accordion, wordmark footer
```

## Picking sections

A landing page tells one story: **hook → what it is → why it's different → proof → how it works
or what you get → price or offer → last call → footer.** Pick 5–7 that serve that story. A short
page that looks great beats a long one that sags halfway down. Give every section ONE visual
idea (a pinned image, a stack, a counter row, a bento), never just a heading and a paragraph.
