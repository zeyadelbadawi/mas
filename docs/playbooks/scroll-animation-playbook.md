# Scroll animation sections: the playbook

A reference for building **cinematic scroll-scrubbed scenes**: a camera move generated as video, tied frame-for-frame to the scroll, with the copy and marks layered on top in HTML, a splash that only lets the page open when every scene is ready, and a still version for devices that should not play it.

It was written after building three production sites with this method (a restaurant group's corporate site, a café and a lounge). It is **subject-agnostic**: a smart-home product, a hotel, a car, a skincare line, a real-estate project all use the same pipeline. Only the story and the pictures change.

> **For the agent reading this:** read the whole file before proposing anything. Follow the phases in order and stop at every **approval gate** (marked ⛔). Do not skip the measurement and test steps: every rule here exists because skipping it broke something on a real device. When the project has its own rules file (CLAUDE.md or similar), it wins on conventions; this file wins on how the scenes work.

---

## 0. The result in one paragraph

The visitor opens the page and sees a branded splash, already covering the page from the first paint. Behind it, the scene videos download in page order, and each scene decodes and draws its first frame. When everything is ready, the splash leaves and the page is free. Each scene is a full-screen **sticky stage** inside a tall section (for example 300 screen heights of scroll). As the visitor scrolls, the stage stays pinned and the video advances exactly with the scroll, forwards and backwards. The same scroll position always shows the same frame. Headlines, logos and buttons are HTML layered over the footage, faded and moved by the same scroll progress. Consecutive scenes hand over on an identical frame, so the walk reads as one continuous shot. With reduced motion, Save-Data or a 2G connection, there is no splash and no video: each scene is a still poster with its copy, in normal flow.

---

## 1. Rules that are never broken

1. **Scroll is the only clock.** Progress comes from the scroll position, never from time, autoplay or wheel deltas. The same position always shows the same frame.
2. **No text, logos, UI or numbers inside generated footage.** Every word and mark is HTML/SVG over the video, so it is sharp, translatable (RTL included), accessible and editable. Prompts say so explicitly, and every frame is checked for fake lettering.
3. **Video, not image sequences.** H.264 MP4 with a keyframe every 6 frames and no B-frames, decoded with WebCodecs into a canvas. Image sequences (hundreds of AVIF/WebP files) were the first approach: they are heavier, slower to decode and stutter. Use video.
4. **Download whole, then play from memory.** Never scrub a file that is still streaming from the network (that falls back to streaming only when the visitor outruns the download).
5. **The page never shows half-ready.** The splash covers the first paint and locks scrolling until every scene file is downloaded and every scene has drawn its frame.
6. **Always a still version.** Reduced motion, Save-Data and 2G get posters in normal flow, with no splash and no lock. The page must be complete and readable without JavaScript.
7. **Consecutive scenes share a frame.** Scene B's first frame is scene A's last frame, pixel for pixel. You build this into the generation and keep it in the encoding.
8. **Measure before fixing.** Every smoothness, splash or navigation problem was found by measuring on the built site (Playwright, a debug meter, frame comparisons), never by guessing. The same applies to the next project.
9. **Cost before generation.** Generation spends money or credits. Announce the exact cost (from the tool's own estimate) and get approval before every generation job ⛔.

---

## 2. Phase 1: the concept ⛔

### 2.1 Think in camera moves, not slideshows

A scene is **one continuous camera move between two strong frames**: a start frame and an end frame. The scroll drives the camera through that move. Good scenes:

- **Reveal:** start on a detail and pull back to the whole. Nothing appears or disappears; the wider view reveals it.
- **Approach:** walk toward a subject, a door or a product until it fills the frame.
- **Turn:** pan or orbit from one subject to the next in the same space.
- **Transform:** the same framing while the state changes, for example day to night, empty to furnished, lights off to on, closed to open. Use it carefully: models morph objects badly. Lighting changes work best.
- **Pour/assemble:** a product action filmed close, such as a pour, a click into place or an unfold.

**Avoid:**

- Two scenes with the same move back to back (walk forward, then walk forward again): the owner will say "it's the same idea".
- Moves where near objects stay still while far ones slide. That reads as the world coming at the viewer instead of the viewer moving in. If the visitor should feel they walk forward, the whole picture must expand from the centre.
- Things appearing out of nowhere (furniture popping in on the first scroll).
- People's faces close up, brands and signage in the footage, and lettering.

### 2.2 Write the scene plan

For each scene, write:

| Field | Example (smart home) |
|---|---|
| id | `brand.hero`, `brand.morning`, `brand.security` (lowercase `brand.scene`) |
| Story beat | "The house wakes up" |
| Start frame | A dark living room at dawn, blinds closed, seen from the hallway |
| End frame | Same room, blinds open, warm light, coffee machine glowing, camera now at the window |
| Camera move | Slow dolly forward and slight turn right, 10 s |
| Copy over it | Headline at the start, a line of copy during the move, a CTA in the hold |
| Marks over the footage | e.g. thin line icons that appear next to each device as it turns on (SVG, positioned on the frame) |
| Handoff | End frame = start frame of `brand.security` |
| Scroll length | 300vh moving + 80vh hold on the last frame |

Typical structures:

- **One hero scene:** start → end, with a hold at the end for the headline and the main CTA.
- **A walk of 2–3 chained scenes:** for example hero → connector → product close-up. Each handoff is on a shared frame.
- **Separated scenes:** for example a hero at the top and a second scene lower down, with normal sections between them. Each scene needs its own start and end, with no shared frame.

**Smart-home example walk:**
1. `home.hero`: from the street at dusk to the front door, which unlocks as the camera arrives (the lock's light turns green, done as an HTML/SVG mark on the frame, not in the footage).
2. `home.inside`: the door's view into the hall, then a turn into the living room as the lights come up in sequence.
3. `home.control`: push in on a wall panel or phone in a hand. The screen in the footage is **blank or dark**, and the UI is an HTML overlay tracked to it.

⛔ **Approval gate:** present the scene plan (beats, frames, moves, copy placement, scroll lengths) and the expected generation cost before generating anything.

---

## 3. Phase 2: generating the footage ⛔

### 3.1 Tools used (check what is current before relying on names or prices)

| Step | Tool used | Settings that worked |
|---|---|---|
| Keyframes (start/end frames) | Nano Banana 2.1 (on Higgsfield or Magnific) | 2K–4K, 16:9; reference images for consistency |
| Shot between two frames | Kling 3.0 with start + end frame | 4K, 10 s, no audio |
| Edit existing footage | Kling 3.0 Omni Edit | 4K |

Prices seen in 2026 (verify each time with the tool's cost estimate):
- Higgsfield: Kling 3.0 4K 10 s = 60 credits; Nano Banana 2.1 = 1.5 (1K) / 2 (2K) / 3 (4K).
- Magnific: Nano Banana 2.1 = 65 (2K) / 145 (4K).

Failed jobs were refunded or not charged. Confirm by checking the balance before and after.

### 3.2 The order that works

1. **Generate the end frame first.** It is usually the "hero" picture (the whole room, the product in place), so it gets the most care.
2. **Generate the start frame from the end frame**, using the end frame as the reference image ("the same room, a close-up on …", "the same street, from the corner"). This keeps materials, light and objects identical between the two.
3. **For a chained scene, the next scene's start frame is literally the previous scene's last video frame.** Extract it from the rendered shot with ffmpeg (not from the keyframe), so the handoff is exact.
4. **Generate the shot** from start frame to end frame.
5. **Review** (§3.4) before building anything. If it fails, fix the frame or the prompt and regenerate. Tell the owner the cost of each retry before running it.

### 3.3 Prompt pattern

Keep a fixed **style block** reused in every prompt of the project, plus a per-scene subject block.

```
[Subject and moment, one or two sentences]
[Camera: lens (35mm wide / 85mm close), move, speed, where it starts and ends]
[Visual world: materials, palette as named colours, light sources, the brand's motif if it has one
 (for example "a thin blade of warm gold light crosses the frame at about 50 degrees")]
[Composition notes: where the subject sits; which side stays calm and dark for text]
[Style: low-key cinematic editorial photography, rich blacks, fine film grain ...]
Absolutely no text, letters, numbers, logos, labels, signs, screens with content or readable faces anywhere in the image.
```

Rules learned:

- **Name the composition for the copy.** For example: "the left 45% is calm, darker and uncluttered to hold headline text". Without this, the subject lands under the headline.
- **Say what must not change** in a shot, such as "the doors stay where they are; only the camera moves".
- **Keep screens blank** (dark glass) and put the UI over them in HTML.
- **Use a style reference.** Upload the project's best existing frame (the hero poster) as a style reference for every later image, so the series stays consistent.
- **If the brand has a motif** (an angle, a line, a colour), put it in every frame as light, an inlay or a shadow. That is what makes the series look designed rather than stock.
- **Ask for "no people" or "faces out of frame"** unless people are the point. Hands at work tell a story without the uncanny-face problem.

### 3.4 Review checklist (every shot, before encoding)

Extract frames and look at them. Don't trust the thumbnail.

```bash
ffmpeg -i shot.mp4 -vf "select='not(mod(n\,24))',scale=640:-1,tile=4x3" -frames:v 1 contact.jpg   # contact sheet, 1 frame per second
ffmpeg -sseof -0.05 -i shot.mp4 -frames:v 1 last.png   # last frame (handoff check)
```

- [ ] **No text, logos or fake lettering** anywhere (zoom into signs, screens, packaging and reflections).
- [ ] **The last frame matches the planned end frame**, and the next scene starts on it.
- [ ] **Even motion:** frame-to-frame change has no spikes. A quick check is the mean absolute difference of small greyscale frames. In good shots the mean was about 4.8 and the max about 6.2. Spikes mean jumps or morphs.
- [ ] **The direction reads right:** for a walk forward, the picture expands from the centre (left edge moves left, right edge right, floor down). Optical flow, or simply watching the edges, shows it.
- [ ] **No morphing:** objects keep their shape, and counts don't change (chairs, glasses, fingers).
- [ ] **The composition leaves room for the copy** where the layout needs it.

⛔ Show the owner the contact sheet or a short preview before building and integrating.

---

## 4. Phase 3: encoding a shot into a scroll video

### 4.1 Outputs per scene

```
<id>/
  desktop.mp4     1920×1080, 16:9          (CRF 24–28)
  mobile.mp4      1080×1350, 4:5 crop      (CRF 26–28), full height, cropped around the focal point
  poster.avif     first frame (LCP image while the video loads; the still version)
  poster.webp
  manifest.json
```

The phone variant is a **crop**, not the 16:9 frame letterboxed: portrait screens (width/height < 0.9) get the 4:5 file. The shape is chosen once per visit when the page opens, so a resize never triggers a new download.

### 4.2 Encoding settings (the important part)

```bash
ffmpeg -i shot.mp4 -an \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080" \
  -c:v libx264 -preset slow -crf 24 \
  -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 \
  -profile:v high -pix_fmt yuv420p -movflags +faststart -tag:v avc1 \
  desktop.mp4

# 4:5 phone crop around focal x (0..1), full height
ffmpeg -i shot.mp4 -an \
  -vf "crop=ih*1080/1350:ih:(iw-ih*1080/1350)*0.5:0,scale=1080:1350:flags=lanczos" \
  [same x264 flags, -crf 26] mobile.mp4
```

What each setting is for:

- `-g 6 -keyint_min 6 -sc_threshold 0`: a keyframe every 6 frames (a quarter second at 24 fps). Any frame is at most 5 decodes from a keyframe, in both directions. The file stays far smaller than one image per frame.
- `-bf 0`: no B-frames, so frame *i* is sample *i* and is shown at exactly *i / fps*. The player depends on this.
- `+faststart`: the index sits at the front of the file.
- **Verify the frame count** of each output equals the source (`ffprobe -count_packets`).

Sizes seen: 10 s / 241 frames at 4K source gave desktop 4.9–6.3 MB and mobile 2.9 MB. A 20 s scene at CRF 24 was about 15 MB. Re-encoding at CRF 28 took 25 MB down to 16 MB with no visible change.

### 4.3 Timing curve (even camera speed per scroll)

AI shots rarely move at a constant speed. Spread evenly over the scroll, the camera speeds up and slows down by itself, and a handoff between two scenes shows a jump in speed. The fix:

1. Downscale every frame to 192×108 greyscale and measure the mean absolute difference between neighbours (the "change").
2. Each frame's place along the move = the cumulative change (with a floor, for example 3, so still stretches still take some scroll), normalised to 0..1.
3. Optionally **ease** the ends (for example 6% ease-in, 12% ease-out, down to 30% speed) so the camera settles into a hold.
4. Store this as `timing[]` (one number per frame, rising 0..1) in the manifest. The player maps scroll progress through it (§5.3).

### 4.4 Frame index for WebCodecs

So the browser can decode frames straight out of the downloaded file without an MP4 parser, the manifest carries, per variant:

```ts
type VideoDecodeIndex = {
  codec: string;                 // WebCodecs codec string, e.g. "avc1.640032" (from the avcC profile/compat/level bytes)
  description: string;           // the avcC decoder configuration record, base64 (from the stream's extradata)
  keys: number[];                // indices of keyframes
  samples: [number, number][];   // per frame: [byte offset, byte size] in the MP4
};
```

All of this comes from `ffprobe` (stream extradata, and each packet's position, size and key flag).

### 4.5 Manifest

```ts
type VideoManifest = {
  id: string;
  kind: "video";
  fps: number;                         // 24
  frameCount: number;                  // e.g. 241
  focal: { x: number; y: number };     // 0..1, the crop/object-position centre
  poster: { avif: string; webp: string; width: number; height: number };
  variants: {
    name: "desktop" | "mobile";
    width: number; height: number;
    src: string;                       // "desktop.mp4"
    bytes: number;                     // for download progress before headers arrive
    decode: VideoDecodeIndex;
  }[];
  timing: number[];                    // one per frame, 0..1
};
```

Also build **draft** versions (960×540 and 432×540, CRF 32–34), committed to the repo, so previews, CI and local work run without the CDN.

---

## 5. Phase 4: hosting

- Put the scene files on object storage behind a CDN (for example Cloudflare R2 with its public URL, later a custom domain such as `media.example.com`). The app reads the base from an env var (for example `NEXT_PUBLIC_MEDIA_URL`), and falls back to the committed drafts when it isn't set.
- **Revision folders:** every new cut goes to a new folder, `videos/<id>.r<N>/`, and the code points at the revision (`videoSource("brand.hero", { rev: 2 })`). Files in a revision folder never change, so they can be cached for a year (`public, max-age=31536000, immutable`); `manifest.json` gets `max-age=300`. Never overwrite a file in place: browsers and CDNs will keep serving the old one.
- Correct `Content-Type` for each file (video/mp4, image/avif, image/webp, application/json).
- **CORS:** request the videos **without** `crossOrigin` unless you must read pixels from them. With it, some CDNs only send `Access-Control-Allow-Origin` when the request carries an `Origin`, and cached responses without the header broke playback.
- Upload with a small script (S3-compatible API, 8 uploads in parallel).

---

## 6. Phase 5: the player

### 6.1 Layout

```html
<section style="height: calc(var(--scroll-vh) * 1lvh)">          <!-- e.g. 300 + hold -->
  <div class="sticky top-0 h-lvh w-full overflow-hidden" style="container-type: size">
    <picture><img poster ... class="absolute inset-0 object-cover"></picture>   <!-- LCP, still version -->
    <canvas  class="absolute inset-0 object-cover" style="opacity: 0|1">         <!-- WebCodecs frames -->
    <video   class="absolute inset-0 object-cover" muted playsinline style="opacity: 0|1">  <!-- fallback -->
    <div class="frame-overlay">  marks that sit ON the footage (positioned on the 16:9 frame)  </div>
    <div class="absolute inset-0">  copy layer (headlines, CTA)  </div>
  </div>
</section>
```

- **Use `lvh`, not `svh` or `vh`,** for the section and the stage. On phones the browser bars grow and shrink, so the stage stays at the largest height. The scroll range is the stage's real pinned travel (`section.offsetHeight - stage.offsetHeight`), not "bottom bottom".
- **The poster is the real `<img>`** (eager, `fetchpriority=high` for the first scene). The canvas or video fades in over it only once it has painted a frame.
- The **frame overlay** is sized as the full 16:9 frame (`max(100cqw, 100cqh*16/9)` for cover) and centred, so a mark positioned at, say, 62% / 40% stays on the same spot of the footage at every screen shape. On the phone crop, size it from the crop's shape.
- **Optional `panX: [from, to]`:** shifts `object-position` across the move on narrow screens, to follow a subject that leaves the centre.

### 6.2 Device tier (decided once per page load)

```
reduced motion                         → STATIC  (posters, no motion library, no splash)
Save-Data or effectiveType 2g/slow-2g  → LOW     (posters, no splash)
coarse pointer, width < 1024 or ≤4 GB  → MID     (scenes, smaller frame ring)
otherwise                              → HIGH
```

Lessons:

- **Do not drop to stills on a "3g" estimate.** Chrome reports 3g on ordinary Wi-Fi (rtt 700 ms), and a whole country of visitors saw stills. Measure the real speed in the splash instead (§7).
- **Do not require WebGL** for scroll videos. Chrome turns WebGL off by itself after GPU errors. Only 3D scenes check WebGL.
- Before hydration, keep the scroll layout (tier unknown) so the page doesn't jump.

### 6.3 Progress → frame

Each section has an optional **lead** (scroll that stays on the first frame), the **move**, and a **hold** on the last frame (for the headline/CTA):

```ts
const travel = leadVh + scrollVh + holdVh - 100;               // section height minus one screen
const framesStart = leadVh / travel;
const framesEnd = holdVh > 0 ? (leadVh + scrollVh - 100) / travel : 1;

onScroll(p /* 0..1 over the pinned travel */) {
  const frames = clamp01((p - framesStart) / (framesEnd - framesStart));   // the move
  const hold = framesEnd < 1 ? clamp01((p - framesEnd) / (1 - framesEnd)) : 0;
  overlays.style.setProperty("--seq-progress", frames.toFixed(4));          // only when changed
  overlays.style.setProperty("--seq-hold", hold.toFixed(4));
  want = progressToPosition(frames, frameCount, timing);                    // fractional frame
}

function progressToPosition(p, frameCount, timing) {
  // Binary search the last frame whose timing ≤ p, then the fraction to the next one.
  // Without timing: p * (frameCount - 1).
}
```

Scroll progress comes from GSAP ScrollTrigger (`start: "top top"`, `end: () => "+=" + pinnedTravel`, `invalidateOnRefresh`). A plain scroll listener with `getBoundingClientRect` works too.

### 6.4 The walk (smoothness)

The drawn frame does **not** jump straight to `want`. It walks there with a short exponential ease, so a fast flick runs through the frames like footage played fast and settles exactly on the frame for the position:

```ts
const WALK_MS = 55, WALK_SNAP = 0.35;
step(now) {
  const dt = Math.min(64, now - lastT); lastT = now;
  const gap = want - walk;
  walk = Math.abs(gap) < WALK_SNAP ? want : walk + gap * (1 - Math.exp(-dt / WALK_MS));
  draw(Math.round(walk));
  if (walk !== want) requestAnimationFrame(step);
}
```

**Don't blend between frames.** Crossfading neighbours was tried and made the footage look soft and ghosted.

### 6.5 Drawing frames: WebCodecs engine (primary)

- The whole MP4 is in memory (§6.7). For frame *i*, slice `samples[i]` out of the bytes into an `EncodedVideoChunk` (key or delta from `keys`) and feed a `VideoDecoder` configured with `{ codec, description, codedWidth, codedHeight, optimizeForLatency: true }`. Check `VideoDecoder.isConfigSupported` first.
- **Moving forward:** keep feeding. **Far jump:** start again at the keyframe before the target (at most a GOP of extra decodes). **Moving back:** decode whole GOPs and keep them.
- **Keep a ring of decoded frames** around the position as compact copies, never the decoder's own `VideoFrame`s. Those must be closed at once or the decoder stalls. Ring size: 24 on desktop, 18 on phones, 12 on devices with ≤ 4 GB (a 1080p YUV copy is about 3 MB).
- **Draw only toward the target.** A late frame must never make the picture step back.
- Watch for stalls: no output for 120 ms while frames are in flight means flush. If the first frame isn't drawn within 6 s, or errors repeat, fall back to the video element.
- **Far from the screen** (more than one screen away, using an IntersectionObserver with `rootMargin: "100% 0px"`), close the decoder and free the ring. Keep only the first frame ready.
- Draw into a 2D canvas (`{ alpha: false }`) at the video's size, scaled by CSS `object-fit`.

### 6.6 Drawing frames: video element (fallback)

Use this for Firefox for Android, Safari < 16.4, or a decoder that fails or is too slow.

- Play the file from a `blob:` URL of the downloaded bytes, never from the network.
- **One seek in flight at a time.** When it lands, seek to the walk's current frame. Seek to mid-frame, `(i + 0.5) / fps`, so rounding never lands on the neighbour.
- Wait for the frame itself with `requestVideoFrameCallback` where it exists, with `seeked` as the backstop. Safari reports seeks done before the frame is painted. Add a timeout guard so a lost seek can't block the next one.

### 6.7 Downloading

- **One file at a time, in page order** (the first scene first). Report bytes loaded and total for the splash.
- **Start early:** an inline script in `<head>` starts the downloads right after the first paint, at `priority: "low"`, before any JS bundle. The player adopts those downloads with their progress when it hydrates. On a throttled phone the files started at 0.45 s instead of about 2 s.
- The inline script applies the same tier rules (no download for reduced motion, Save-Data or 2G) and picks the variant by screen shape.
- Load the drawing code (decoder engine, walk, fallback) **after** the page, with the motion library, so the first JS bundle stays within budget (we kept 180 KB initial JS).

### 6.8 Chaining scenes (handoffs)

- The next section starts **one screen early** (`margin-top: -100lvh`) and its stage stays **invisible until its section reaches the top of the screen**. There it pins over the previous stage, which shows the identical last frame, so the cut is invisible.
- Drive that reveal with a **scroll-driven animation** (`ViewTimeline`, range `entry 0%` → `entry 100%`, with **`inset: "0px"`**). The default range is measured inside `scroll-padding-top` (the header gap), which revealed the stage 72 px early and made the cut jump. The script toggle is only a fallback.
- Give a continuing scene a short **lead** (around 15vh on its first frame) and the previous one a short hold. On a fast scroll back up, the video then has time to land on the shared frame before the cut.
- The camera speed must match across the cut: use the timing curves (§4.3), and ease the end of A and the start of B the same way.

### 6.9 Overlays: copy and marks driven by CSS variables

Everything over the footage reads `--seq-progress` (0..1 over the move) and `--seq-hold` (0..1 over the hold). The scroll handler sets two custom properties and the CSS does the rest, with no React re-render on scroll:

```tsx
const P = "var(--seq-progress, 0)";
const HOLD = "var(--seq-hold, 0)";

// fade a tagline in between 72% and 89% of the move
<p style={{ opacity: `clamp(0, calc((${P} - 0.72) * 6), 1)` }}>…</p>

// draw an SVG outline as the camera moves (each path a tenth after the previous)
<path pathLength={1} strokeDasharray={1}
      style={{ strokeDashoffset: `calc(1 - clamp(0, calc((${P} - ${0.06 + i * 0.1}) * 2.5), 1))` }} />

// headline + CTA appear during the hold, over a dark floor wash
<div style={{ opacity: `clamp(0, calc(${HOLD} * 3), 1)` }}>…</div>
```

- Put a **dark wash** under copy that sits on bright footage (a radial pool behind a logo, or a gradient at the foot). Check contrast at the brightest frame.
- In the still version (`data-animated="false"`, reduced motion) every overlay shows its **final state** (`opacity: 1`, stroke drawn).
- **Marks tracked to objects** (an icon next to a lamp, a petal on a cup, UI on a screen) live in the frame overlay, positioned in % of the 16:9 frame, and can move with `calc()` on `--seq-progress` to follow the object.
- A **header over the scenes** can read the footage's brightness behind it a few times a second and switch between a light and a dark tone. Use hysteresis (switch only for a clearly better contrast, held for 300 ms) so it never flickers.

---

## 7. Phase 6: the splash gate

### 7.1 Why

Without a gate, the visitor sees the poster, then a jump when the canvas paints, scrolls before the file is in, and lands mid-scene. The gate guarantees that by the time the page can scroll, every scene plays from memory.

### 7.2 Boot script (inline in `<head>`, before the body)

Only on pages with scenes (for example `/` and the localized home):

```js
try {
  var d = document.documentElement;
  if (/^\/(ar\/?)?$/.test(location.pathname)) {                 // the scene pages
    history.scrollRestoration = "manual";                        // every visit starts at the top
    var c = navigator.connection, low = !!c && (c.saveData === true || /(^|-)2g$/.test(c.effectiveType || ""));
    if (low || matchMedia("(prefers-reduced-motion: reduce)").matches) d.dataset.splash = "seen";   // no panel
    else {
      d.dataset.splash = "hold";                                 // CSS: overflow hidden + an opaque cover
      setTimeout(function () { if (d.dataset.splash === "hold" && !d.dataset.splashJs) delete d.dataset.splash; }, 10000); // failsafe
    }
  }
} catch (e) {}
```

CSS:

```css
html[data-splash="hold"], html[data-splash="leaving"] { overflow: hidden; }
html[data-splash="hold"]::after { content: ""; position: fixed; inset: 0; background: <panel colour>; z-index: <below the panel>; }
```

The lock comes from the boot script, **not** from JS that attaches later: the first wheel used to slip through before the script attached (300 px), and scrolling reopened during the exit (to 6,300 px).

### 7.3 The gate's rules

The panel leaves only when all of these hold:

1. Every scene's file has downloaded.
2. Every scene has **decoded and drawn its frame for the current scroll position** in its own canvas (each scene reports `ready` to a small shared store).
3. The fonts are loaded.
4. The panel's minimum time has passed: about 2–2.3 s on a first visit, counted from navigation start, so its animation completes.

While it is up:

- Block wheel, touch and scroll keys in the capture phase, stop the smooth-scroll engine, and make the page behind it `inert`.
- **Never give up on its own.** A "Continue without waiting" link appears only on a problem: no progress for 8 s, or the whole wait passing 30 s.
- **Measure the real line speed** over the first 2.5 s of the downloads. If the rest would take more than 30 s, abort all downloads and switch the visit to the still version (posters), instead of keeping the visitor on the splash. At 1.3 Mbps that meant stills after about 10 s instead of 100–180 s of waiting.

**Coming back in the same session** (logo, back button, reload) is a separate case. Set a `sessionStorage` key per video variant once all scenes have loaded (for example `brand-ready-desktop`). The next load gets a **quick cover**: 0.25 s minimum and a 0.4 s fade. The full exit took 2.2 s for files that were ready in 0.2 s.

**On release:**

- Scroll to the top, or to the `#hash` target if there is one (minus `scroll-padding-top`).
- Move the smooth-scroll engine there immediately (`lenis.scrollTo(y, { immediate: true, force: true })`), so nothing it picked up meanwhile carries the page on.

### 7.4 Design

The splash belongs to the page, not a loading screen pasted on top. Patterns that worked:

- The brand mark is written out stroke by stroke. The mark **is** the progress indicator: it fills like a pour, or a light sweeps along it, as the bytes arrive. A thin line keeps moving so a slow download still looks alive.
- The panel is frosted or tinted over the page itself. On exit the mark rises away and the veil clears onto the scene's first frame.
- Respect reduced motion: there is no panel then.

---

## 8. Smooth scroll and navigation

- Use **one** smooth-scroll engine (Lenis), driven from GSAP's ticker: `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`, and `lenis.on("scroll", ScrollTrigger.update)`. Run it on HIGH/MID only. Set `anchors: { offset: -<header height> }`.
- Load GSAP and Lenis **after first paint, when idle**. The page must work before they load.
- Call `ScrollTrigger.refresh()` after fonts load (layout changes).
- **Bug to prevent: a link clicked while the page is still gliding.** Lenis keeps easing toward its old target after the router has moved the new page to the top, so the page opens halfway down. This happens in normal use, because the glide lasts about a second after every wheel or trackpad scroll. Fix:

```ts
document.addEventListener("click", (e) => {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element)?.closest?.("a[href]");
  if (!(a instanceof HTMLAnchorElement) || a.hasAttribute("download") || (a.target && a.target !== "_self")) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname === location.pathname) return;
  lenis.scrollTo(lenis.scroll, { immediate: true, force: true });     // drop the glide
}, { capture: true });
```

- With a client-side router, links in the header shown over the scenes should not prefetch other pages while the scene videos download (it cost about 6 KB of JS and bandwidth during the critical download).

---

## 9. Accessibility, fallbacks, performance

- **Reduced motion:** no splash, no lock, no motion library. Each scene is the poster in a screen-tall stage, with its copy and marks in their final state, in normal flow.
- **No JS:** posters and copy render from the server. The boot script's lock lets go after 10 s if the app script never takes over.
- Headings, copy and CTAs are real HTML in reading order. Videos and canvases are `aria-hidden`. The poster `<img>` carries the alt text.
- Nothing traps scrolling or keyboard focus after the gate opens. Never ask for precise pointer input.
- **Budgets we held:** initial JS ≤ 180 KB (measured in e2e). The first scene's poster is the LCP candidate. The drawing code, GSAP and Lenis load after the page.
- Bundle the scene drawing code separately from the first bundle: pass shared functions into it instead of importing them, so the bundler doesn't pull them into the first chunk.

---

## 10. Testing

### 10.1 Automated (Playwright, Chromium)

Write these tests (all exist in the reference implementation):

1. The page is covered from the first frame and can't scroll until every scene is ready (wheel during the splash leaves `scrollY === 0`).
2. Scenes decode with WebCodecs where the browser can (the scenes report `engine`).
3. **The same scroll position always shows the same frame, both ways:** scroll to positions forwards, then backwards, and compare the drawn frame index.
4. Each scene takes over from the previous one on a drawn frame (no blank or poster at the cut).
5. A reload in the middle of the walk starts again at the top, behind the gate.
6. A link to a section (`/#menu`) lands there once the gate opens.
7. Without WebCodecs (stub it out), the scenes play from the video element behind the same gate.
8. Reduced motion: no panel, no lock, still pictures.
9. Initial JS stays within budget.
10. A link clicked while the page is still gliding opens the next page at the top.

To check a test catches its bug, run it **against a build without the fix and see it fail**, then with the fix and see it pass. One test passed both ways at first, and that was only caught this way.

Expose each scene's state for the tests and the meter, for example a small store with `{ mode, ready, shown, want, presented, maxStep }` per scene id.

### 10.2 On real devices (a `?debug=scrub` meter)

A tiny overlay, loaded only with `?debug=scrub`, shows:

- the refresh rate;
- "lagging still" (the share of frames where the drawn frame trails the scroll);
- the max step;
- each scene's mode (engine/video) and ready state;
- the gate's outcome;
- the memory kept in the frame ring.

Pass criteria:

| Check | Pass |
|---|---|
| Refresh | ≥ 55/s on a computer, ≥ 50/s on a phone |
| Lagging still | < 10% |
| Max step | ≤ 4 on a slow scroll, ≤ 12 on a fast flick |
| Stopping | The picture comes to rest within a fraction of a second |
| Memory | Frames kept < 350 MB on a computer, < 250 MB on a phone |

Test on:

- Safari on iPhone and Mac, and Chrome and Firefox on Android and desktop;
- slow, fast, jerky and back-up scrolls;
- a reload mid-walk, a `#hash` link, and Data Saver / Low Power Mode.

---

## 11. Pitfalls we hit (and the fix)

| Symptom | Cause | Fix |
|---|---|---|
| Footage "flips like photos", jumps at a cut | Uneven AI camera speed; frames spread evenly | Timing curve by image change (§4.3); matching ease across cuts |
| Delay and stutter while scrubbing | Seeking a `<video>` (15–20 seeks/s at best, ~400 ms on Android) or decoding image sequences | WebCodecs engine from an in-memory MP4 with a 6-frame GOP (§6.5) |
| A frame of the next scene flashes on a fast scroll back | Next stage visible before it pins | ViewTimeline reveal with `inset: 0`, plus a lead on the first frame (§6.8) |
| Picture jumps at every handoff | Reveal range measured inside `scroll-padding-top` | `ViewTimeline({ inset: "0px" })` |
| Scenes shorter than the screen on phones | `svh`/`vh` with browser bars | Size on `lvh`; range = the stage's real pinned travel |
| Page scrolls under the splash, lands mid-walk | Lock attached late; reopened during the exit | Lock from the boot script before the first paint; release only after the exit finishes (§7.2) |
| Everyone on a normal line sees stills | Tier dropped on Chrome's "3g" estimate | Only Save-Data and 2G drop the tier; measure the real speed in the splash (§6.2, §7.3) |
| A capable desktop sees stills | Tier required WebGL | Videos don't need WebGL (§6.2) |
| Scenes stuck on their first frame | `crossOrigin` + a CDN that omits CORS headers on some cached responses | Request videos without `crossOrigin` (§5) |
| Coming back to the page shows a 2 s splash for nothing | First-visit exit animation on every load | Session key → quick cover (§7.3) |
| New page opens halfway down | Lenis glide continues after navigation | Drop the glide on link click (§8) |
| "The doors come at me" instead of "I walk to the doors" | Near objects static while far ones slide | Regenerate so the whole picture expands from the centre; check edges and flow (§3.4) |
| Owner: "same idea as the other scene" | Two scenes with the same move | Plan contrasting moves (reveal vs approach) (§2.1) |
| Fake lettering in reflections, signs and screens | Model hallucination | "No text…" line in every prompt; zoom check; blank screens + HTML UI |
| Old video still served after re-render | Overwrote files in place, long cache | Revision folders (`.r2`, `.r3`) and immutable caching (§5) |

---

## 12. Claude Code skills and connectors

These are the agent skills and tools this method was built with. In a new project, install them **before Phase 1**, then invoke the right one at each phase. Skills live in the project's `.claude/skills/<name>/SKILL.md`. Keep a `SOURCES.md` next to them listing the repo, commit and license of each.

### 12.1 Installing

- Search and install with the Skills CLI, as the `find-skills` skill describes:
  - `npx skills find <query>` to search;
  - `npx skills add <owner/repo>` to install;
  - `npx skills update` to update.
- Or copy the skill folders from the source repos below, or from the MAS repo's `.claude/skills/`.
- **Vet every skill before installing it.** Check the install count on skills.sh (prefer 1K+), the repo's stars, the license and any security audit. Read the `SKILL.md`: a skill is instructions the agent will follow, so treat it like code you are adding.
- Record each one in `.claude/skills/SOURCES.md` (skill, repo URL, commit, license). Mention in the project's CLAUDE.md which skills to use for what.

### 12.2 The skills, by phase

| Phase | Skill | Source repo | Use it for |
|---|---|---|---|
| Concept (§2) | `brainstorming` | github.com/obra/superpowers | Before any creative work: explore the scene ideas, the story and the moves with the owner before committing |
| Concept, design | `frontend-design` | github.com/anthropics/skills | A distinctive visual direction (palette, type, layout) that isn't a template; the splash and overlay design |
| Concept, design | `build-awwwards-quality-sites` | github.com/mengto/skills | Art direction for motion-led marketing sites: heroes, choreography, performance safeguards |
| Player (§6) | `scroll-scrubbed-visual-sequence` | github.com/mengto/skills | The scroll-stage pattern: sticky stage, normalized progress, reversible scrubbing, reduced-motion fallback, verification list |
| Player, smooth scroll (§6, §8) | `cinematic-gsap-lenis-motion-system` | github.com/mengto/skills | GSAP + ScrollTrigger + Lenis set up as one system (pins, reveals, one scroll engine) |
| Player, overlays | `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-plugins`, `gsap-react`, `gsap-performance` | github.com/greensock/gsap-skills | Official GSAP guidance: ScrollTrigger pin/scrub/refresh, timelines, SplitText/plugins, `useGSAP` cleanup in React, transforms over layout |
| Overlays, splash review | `review-animations` | github.com/emilkowalski/skills | Review motion code against a high craft bar (easing, duration, purpose) before shipping |
| Optional 3D | `threejs-react-three-fiber`, `threejs-fundamentals`, `threejs-shaders` | github.com/cloudai-x/threejs-skills | Only if a scene is real-time 3D instead of video. Check WebGL in that scene only, never for the video scenes |
| UI kit | `shadcn` | github.com/shadcn-ui/ui | Components around the scenes (menus, forms, dialogs) |
| Quality | `audit-ai-design-slop` | github.com/mengto/skills | Audit the finished page for generic "AI-made" design patterns and remove them |
| Quality | `web-design-guidelines` | github.com/vercel-labs/agent-skills | Review the UI against interface guidelines |
| Quality | `ux-heuristics` | github.com/wondelai/skills | Usability review (navigation, splash way-out, clarity) |
| Accessibility (§9) | `accessibility` | github.com/addyosmani/web-quality-skills | WCAG 2.2 audit: reduced motion, focus while the splash is up, contrast of copy over footage |
| Performance (§9) | `core-web-vitals` | github.com/addyosmani/web-quality-skills | LCP (the poster), CLS (stage sizing), INP; reading field and lab data |
| Performance | `vercel-react-best-practices` | github.com/vercel-labs/agent-skills | Bundle splitting (the drawing code after the page), React/Next.js performance patterns |
| Security | `security-and-hardening` | github.com/addyosmani/agent-skills | Inline scripts, CSP, forms, third-party code |
| Copy | `copywriting`, `humanizer`, `no-ai-slop` | github.com/coreyhaines31/marketingskills, github.com/blader/humanizer, github.com/petergyang/no-ai-slop | Headlines and lines over the scenes that sound human and specific, not generated |
| SEO | `seo-audit`, `schema`, `ai-seo` | github.com/coreyhaines31/marketingskills | Titles, descriptions, structured data, AI-search readiness. The scene pages must stay crawlable: the copy is HTML, not baked into video |
| Email (if forms) | `resend` | github.com/resend/resend-skills | Form emails through Resend |
| Discovery | `find-skills` | (from the Skills CLI ecosystem; check skills.sh) | Finding and vetting new skills when a phase needs one |

Suggested order of use in a new project:

1. `brainstorming` → `frontend-design` / `build-awwwards-quality-sites` (the concept and the look, then the ⛔ gate).
2. Generation with the connectors below.
3. `scroll-scrubbed-visual-sequence` + `cinematic-gsap-lenis-motion-system` + the `gsap-*` skills (build the player and the overlays, following this playbook).
4. `review-animations` → `accessibility` → `core-web-vitals` → `audit-ai-design-slop` (review before shipping).
5. `copywriting`/`humanizer` and `seo-audit`/`schema` (the copy and the metadata).

### 12.3 Connectors (MCP) used for generation

- **Higgsfield:** Kling 3.0 shots (start + end frame, 4K, 10 s), Kling 3.0 Omni Edit, Nano Banana 2.1 keyframes. Used for every scene video.
- **Magnific (MAG):** Nano Banana 2.1 / Magnific One images. Use its cost estimate tool (`simulate_cost`) before every job and its balance tool before and after. To use a local file as a reference, upload it, or import it from a public URL (for example the scene poster already on the CDN) if the upload endpoint fails.
- Before using either one, check it is connected in the session. Price every job with the tool's own estimate and get approval (rule 9). Log each job (id, model, settings, credits) in the project's sequence log.

---

## 13. Definition of done

- [ ] ⛔ Scene plan approved (beats, frames, moves, copy placement, scroll lengths, cost).
- [ ] ⛔ Each generation's cost announced and approved; balance checked before and after.
- [ ] Every shot reviewed: no text, even motion, the right direction, handoff frames identical.
- [ ] Encoded: desktop 16:9 + mobile 4:5, GOP 6, no B-frames, frame counts verified, poster, timing curve, decode index, manifest; drafts committed.
- [ ] Uploaded to a new revision folder with the right types and cache headers; code points at the revision.
- [ ] Player: sticky `lvh` stage, poster first, WebCodecs engine with the video fallback, walk, ring, near/far freeing, handoffs with ViewTimeline.
- [ ] Overlays: all text and marks are HTML/SVG on `--seq-progress`/`--seq-hold`; readable on the brightest frame; final state without motion; RTL checked.
- [ ] Splash gate: boot-script lock, readiness rules, minimum time, quick return, stall/slow way out, speed measurement → stills, release to top or `#hash`.
- [ ] Tier rules, reduced motion, no-JS and Save-Data all produce a complete page.
- [ ] Navigation: scroll restoration manual on scene pages; glide dropped on link clicks.
- [ ] e2e suite (§10.1) green, including tests proven to fail without their fix.
- [ ] Real-device check with the meter (§10.2) on Safari iOS/Mac, Chrome and Firefox desktop/Android.
- [ ] Decisions and credits logged in the project's docs.
- [ ] The skills in §12 installed, vetted and listed in `.claude/skills/SOURCES.md`; the review skills run before shipping.

---

## 14. Reference implementation (if you have the MAS monorepo)

| Piece | Path |
|---|---|
| Player (sticky stage, progress, overlays, handoffs) | `packages/motion/src/client/scroll-video.tsx` |
| Walk + driver (engine or video fallback) | `packages/motion/src/client/scene-driver.ts` |
| WebCodecs frame engine | `packages/motion/src/client/frame-engine.ts` |
| Download queue + adopting the inline prefetch | `packages/motion/src/client/video-preload.ts`, `packages/motion/src/video-prefetch.ts` |
| Splash gate hook | `packages/motion/src/client/splash-gate.ts` |
| Boot script (lock before first paint) | `packages/motion/src/splash-boot.ts` |
| Scene readiness store | `packages/motion/src/client/scene-status.ts` |
| Device tier | `packages/motion/src/device-tier.ts` |
| Smooth scroll provider (Lenis + GSAP, glide fix) | `packages/motion/src/client/motion-provider.tsx` |
| Progress → frame with timing | `packages/motion/src/frame-math.ts` (`progressToPosition`) |
| Manifest types, media URLs | `packages/motion/src/manifest.ts`, `packages/motion/src/media.ts` |
| Debug meter | `packages/motion/src/client/scrub-meter.ts` |
| Build a scroll video | `tools/sequences/build-video.mjs` (`pnpm sequence:video --input clip.mp4 --id brand.scene --motion [--ease-in 0.06 --ease-out 0.12] [--focal 0.5,0.5] [--draft]`) |
| Timing curve | `tools/sequences/timing.mjs` |
| Decode index | `tools/sequences/sample-index.mjs` (`pnpm sequence:reindex` to add it to existing files) |
| Upload to R2 | `tools/sequences/upload-r2.mjs` (`pnpm sequence:upload --dir out/videos --prefix videos`) |
| A scene with overlays | `apps/mas/src/components/home/hero.tsx`, `apps/mas/src/components/home/doors.tsx` |
| A splash | `apps/mas/src/components/splash.tsx` (and COVY's/Aroma's in their apps) |
| e2e | `e2e/scenes.spec.ts`, `e2e/mas.spec.ts` |
| Device check runbook | `docs/runbooks/scroll-scenes-check.md` |
| Installed skills and their sources | `.claude/skills/`, `.claude/skills/SOURCES.md` |
| Why each choice was made | `docs/00-decisions.md` (D37–D62, D64–D72), `docs/07-scroll-smoothness-plan.md`, `docs/assets/sequence-log.md` |

Stack it was built on: Next.js App Router (TypeScript strict), Tailwind CSS, GSAP ScrollTrigger + Lenis, Playwright. Nothing in the method depends on Next.js: the player is a client component, and the boot and prefetch scripts are plain inline strings.
