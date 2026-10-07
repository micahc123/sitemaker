# Assets

The hero image carries the site. Spend your effort there. Everything else supports it.

## The hero plate prompt

Build every prompt from the same six parts. Be concrete; vague prompts make soft images.

```
[ONE subject, concrete]  a lone free-diver in a matte black wetsuit, arms open, hair drifting
[placement + room]       large, in the right half of the frame, cropped at the knees,
                         the left half is open water for a big headline
[light: key + rim]       hard lime-white light from the surface above, a deep teal rim light
                         from behind-left, dark falloff below
[colour world]           deep bottle-green water, almost black at the edges
[camera]                 shot on a 50mm lens, slightly low angle, crisp detail on the subject,
                         gentle depth of field
[finish]                 high-end commercial photography, graded, fine film grain.
                         No text, no logos, no watermark. 16:9.
```

Rules that keep it from looking like AI slop:
- **One subject.** Not a scene full of things. Organic and material subjects (a figure, fabric,
  liquid, glass, food, plants, an animal, smoke) come out better than precise machines with
  exact parts.
- **Two coloured lights**, warm against cool. One flat light gives a flat image.
- **Leave room for the headline** and say where.
- **Ask for 2K or 4K**, and never upscale a small image to fill the hero.
- **No text in the image.** Image models garble letters. The type is HTML.

## Keep the set consistent

Make the hero first. Then give the hero as a **reference image** to every later generation:

- Supporting images: *"Same world, same lighting and colour grade as the reference image. A
  close-up of the kelp sheet's texture, backlit."*
- **Layers** for the sandwich, as edits of the hero: *"The exact same image. Only change: remove
  the diver; keep the water exactly as it is."* (a background plate). For the subject on its own
  layer, run a background-removal tool on the hero and save a PNG with transparency.
- **Phone version**: *"The same subject and lighting as the reference, recomposed for a tall 9:16
  phone screen, the subject filling the lower two-thirds, open space at the top for the headline."*
  A 16:9 image squeezed into a phone with `object-fit: cover` keeps only the middle quarter;
  generate a tall one or set `object-position` per breakpoint.
- **States**: night version, lights off, a second colourway: always "the exact same image, only
  change X", so they line up pixel for pixel and you can cross-fade between them.

File names: `assets/hero.jpg`, `assets/hero-phone.jpg`, `assets/hero-bg.jpg`,
`assets/subject.png`, `assets/detail-1.jpg`... Export as WebP or JPG around quality 82; hero
around 2560px wide and under 500 KB, phone around 1080×1920.

## Video (optional, and always bounded)

A generated video as the whole hero looks soft and smeary. Use motion *on top of* a sharp still
(parallax, light, shader) instead. If you do want a loop:

- Image-to-video from the hero, with the **same image as the start and the end frame**, so it loops
  without a jump. Ask for one small motion: "a slow camera push-in, the hair drifts, light ripples".
  (Asking for "slow motion" usually gives an almost frozen clip.)
- Use it **bounded**: inside a card or panel, on a screen in the scene, or as a quiet layer behind
  the cut-out subject. Always with a poster image and `muted playsinline autoplay loop`.
- **Re-encode every video** before use. Downloads are often HEVC, which Chrome shows as black:
  ```bash
  ffmpeg -i in.mp4 -c:v libx264 -pix_fmt yuv420p -crf 23 -preset slow -movflags +faststart -an assets/loop.mp4
  ```

## The three routes

**1. Higgsfield MCP (Claude generates).** If the session has Higgsfield tools (names like
`generate_image`, `generate_video`, `remove_background`), use them: generate the hero first with
Nano Banana Pro at 2K, look at it, regenerate if it's weak, then pass it as the reference image for
every later image. Check the price before each submit (the tools can quote it), stay inside the
user's budget, and wait for jobs to finish before moving on. Download results into `assets/`.
If the credit balance looks like almost nothing, the wrong workspace may be selected; ask the user.

**2. By hand in the Higgsfield web app (the user generates).** Write a table in `BRIEF.md`: file
name, aspect ratio, and the exact prompt, hero first. Tell the user:
> Open higgsfield.ai → Image → Nano Banana Pro. Generate the hero first. For every other image,
> upload the hero as a reference image, paste the prompt, and save the result into `assets/` with
> the file name in the table. Tell me when they're in.

Meanwhile, build the whole page on placeholders (a gradient in the brief's colours at the same
aspect ratio). When the files land, swap them in, re-sample the palette from the real hero, and
capture again.

**3. No image tool (draw the world in code).** A lit, graded code scene is better than a weak
image. Pick one of these as the hero's world and give it a subject with a real material:

| world | how | good for |
|---|---|---|
| Liquid wave field | full-screen shader: 3 directional sine waves, each warped by the last, time × .08; colour from two sheen terms (`pow(1-abs(f-a),2.5)` wide + `pow(1-abs(f-b),8)` crisp) over a 4-stop palette that is almost black except the crests | silk, oil, metal, sand, satin |
| Glossy blob | `IcosahedronGeometry(1, 64)` displaced by 3D noise in the vertex shader; `MeshPhysicalMaterial` (chrome: metalness 1, roughness .08; or glass: transmission 1, thickness 2, ior 1.5); `RoomEnvironment` for reflections; the cursor dents it on a spring | tech, audio, beauty, "the product is a feeling" |
| Mesh gradient | 8–11 soft gaussian blobs blended in a shader, slow domain warp, one hot glow blob in the accent, cursor pushes them | fintech, AI, calm brands |
| Contour lines | iso-lines of a slow 4-sine field, `fwidth` for crisp 1px lines, 8–12% ink on the ground | maps, outdoor, data, weather |
| Particle form | 20k–80k points sampled from a shape (`MeshSurfaceSampler` on a text or torus-knot mesh), lit by two coloured lights in the shader, cursor scatters them and they spring back | AI, science, music |
| Motes | 400–2000 additive points drifting up, two temperatures matching the two lights, depth fade | adds life to any of the above |

**Grade it.** An ungraded three.js scene looks like a demo. Render to a target and finish with one
full-screen pass:

```glsl
// after tone mapping, in display space
vec3 c = texture2D(tScene, vUv).rgb;
c = (c - .5) * 1.2 + .5;                                  // contrast
float l = dot(c, vec3(.2126, .7152, .0722));
c = mix(vec3(l), c, 1.3);                                  // saturation
c = mix(c, c * uCool, (1. - smoothstep(.0, .55, l)) * .5); // shadows toward the cool light
c = mix(c, c * uWarm, smoothstep(.45, 1., l) * .4);        // highlights toward the warm light
vec2 q = vUv - .5; c *= 1. - dot(q, q) * .9;               // vignette
c += (fract(sin(dot(vUv + fract(uTime), vec2(12.9898, 78.233))) * 43758.5453) - .5) * .04; // grain
gl_FragColor = vec4(clamp(c, 0., 1.), 1.);
```

Use `ACESFilmicToneMapping` with exposure tuned by eye (1.0–2.0), fog in the ground colour, low
ambient light, and bloom only on things that should glow (a high threshold), never as a haze over
everything.
