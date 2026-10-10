# Site Maker: a Claude Code skill for high-end landing pages

Give Claude Code one reference image (a screenshot, a post you saved, a design you love) or a
one-line idea, and it builds a complete, animated landing page: a real loader, a huge layered
headline, smooth scroll, a hero that reacts to your cursor, 5–7 designed sections, and a phone
layout that actually works.

It doesn't stop at "it runs". It screenshots its own work at desktop and phone sizes, **looks at
the frames**, and fixes what's off, round after round, like a designer would.

**What you get:** one `index.html` (three.js, GSAP and Lenis from a CDN, no build step, no
framework), an `assets/` folder, a short `BRIEF.md`, and a `_shots/` folder with the contact sheet
and a thumbnail.

## How it works

1. **Reads your reference**: what's the one subject, how big is the headline, what's the colour
   world, what does the hero do.
2. **Writes a brief**: a fictional brand, a palette taken from the hero's light, two fonts from a
   short curated list, the sections, and 8–12 components.
3. **Makes the assets**: image prompts for a hero and supporting images that match each other
   (or a hero drawn entirely in code if you have no image tool).
4. **Builds the page**: loader with a failsafe, per-letter headline reveal, cursor reaction,
   section animations, phone menu.
5. **Captures and looks**: desktop and phone screenshots across the whole scroll, then fixes empty
   frames, covered or clipped text and phone overflow. 3–5 rounds.
6. **Thumbnail test**: the hero has to read at 320×180.
7. **Ship checklist**: errors, fonts, phone, reduced motion, and a check that every name is made up.

## Install

**Quickest:** clone this repo and copy the skill folder in:
```bash
git clone https://github.com/micahc123/sitemaker.git
mkdir -p ~/.claude/skills && cp -r sitemaker/site-maker ~/.claude/skills/
```

**Or by hand:**

1. Download `site-maker.zip` from this repo and unzip it.
2. Copy the `site-maker` folder into your Claude Code skills folder:
   ```bash
   mkdir -p ~/.claude/skills
   cp -r site-maker ~/.claude/skills/
   ```
   (Or into `.claude/skills/` inside one project if you only want it there.)
3. Restart Claude Code. To check it's there, type `/site-maker` (it should autocomplete) or ask
   *"which skills can you use?"*.

## Use it in 3 steps

1. Make a new empty folder and open Claude Code in it:
   ```bash
   mkdir my-site && cd my-site && claude
   ```
2. Drop your reference image into the folder (or paste it into the chat) and ask:
   > Build me a landing page like reference.jpg for a fictional trail-running brand.

   No reference? Just describe it:
   > Build me a landing page for a fictional cold-brew coffee brand. Dark, warm, premium.
3. Let it work. A full build with its review rounds takes roughly 20–40 minutes. When it's done,
   view the site:
   ```bash
   npx serve .
   ```
   and open the address it prints. (Opening `index.html` directly with a double-click won't work,
   because browsers block the 3D code on `file://` pages.)

Then just talk to it: *"make the headline bigger on phones"*, *"swap the orange for a deep blue"*,
*"add a pricing section"*. It will capture and look again after each change.

## Requirements

- **Claude Code.** That's the only hard requirement.
- **Node.js 18+** for the screenshot step. The first time, Claude will run
  `npm i -D playwright && npx playwright install chromium` in your project folder (about 150 MB,
  one time per project).
- **Optional: a Higgsfield account** for generated images. You have three options:

  | route | what happens |
  |---|---|
  | **No image tool** | Claude draws the hero in code (a lit, graded 3D scene, liquid metal, particles...). Free, and it looks good. |
  | **By hand in the Higgsfield web app** | Claude writes the exact prompts and file names into `BRIEF.md`. You open higgsfield.ai, pick **Image → Nano Banana Pro**, generate the hero first, then upload the hero as a reference image for every other prompt so they all match. Save each file into the project's `assets/` folder with the name from the table and tell Claude "the images are in". It builds on placeholders while you do this. |
  | **Higgsfield MCP** | If you've connected Higgsfield to Claude as an MCP server or connector (follow Higgsfield's own setup guide), Claude generates the images itself. It checks the cost before each image and you approve the spend. |

  Any other image tool works the same way as the by-hand route: generate, save into `assets/`,
  tell Claude.

## What's in the folder

```
site-maker/
  SKILL.md                  the 7-step process Claude follows
  references/
    brief.md                the brief template and a filled example
    look.md                 the font list, colour rules, type sizes
    components.md           21 components with the numbers that make them look right
    assets.md               image prompts, Higgsfield routes, video loops, code-drawn heroes
    motion.md               loader + failsafe, text reveals, springs, smooth scroll, phone menu
  scripts/
    capture.mjs             screenshots, contact sheet, thumbnail and a health report
```

## Tips

- **One strong reference beats five.** Pick a post where one subject and one huge headline carry
  the whole screen.
- **The brand is always made up.** Claude invents a fictional brand and copy, and never copies the
  reference's brand, logo or text. If you build for a real client, swap in their name and assets
  at the end.
- **Spend your effort on the hero image.** If the generated hero is weak, regenerate it before
  touching anything else.
- Ask for a short site if you want. A great hero plus two sections often beats a long page.

## License

MIT. Use it, change it, share it.
