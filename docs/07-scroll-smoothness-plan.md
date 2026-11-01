# 07 — Scroll scenes: smoothness and splash, final pass

**Status:** implemented (D62). Results in §6.

**Owner's brief (2026-10-31):**
- The walk has to be smooth from the first frame of the splash to the end of the last scene, in Chrome, Safari and Firefox, on desktop and on phones.
- Every kind of scroll has to work: slow, normal, fast, jerky, flick back up and touch.
- The visitor can't reach the scenes until everything is downloaded and ready. A full-speed scroll from top to bottom should feel like scrubbing a video, with no stutter, flicker or jumps.
- Fix the bug where the hero shows uncovered and the splash then appears on top of it.
- Validation first. There should be no way for a visitor to see the experience wrong, so the page has to lead them into it.

## 1. What we measured

### 1.1 The splash flash

**How it was measured:** screen recordings of both live sites (https://mas-aroma.vercel.app, https://mas-covy.vercel.app) at 10 fps, with the splash's computed styles logged on every animation frame.

**Aroma:**
- The splash's veil has **no background at all** (`background: none`, transparent).
- Its class `bg-[radial-gradient(...),color-mix(...)]` is an arbitrary value that Tailwind can't type, so no rule was generated.
- The only thing left covering the page is `backdrop-filter: blur(40px)`. Chrome applies that late, so for about 1.5 s the cup sits over a sharp, fully visible hero, the header and the cookie banner. Then the blur arrives and it looks as if the splash appeared on top.

**COVY:**
- Same mechanism, milder. The veil is 72% sand, so the hero poster shows through at 28%, sharp, until the blur arrives.

**Reloads (both sites):**
- On a reload in the same tab (the "known" mode, D45/D50), the splash is hidden by design and only appears if the visitor scrolls before the files are back in memory.
- That is the second way to see the page first and the splash later.

### 1.2 Scrubbing

**How it was measured:**
- Local production builds playing the real R2 files: 1920 × 1080 desktop videos, H.264 with a keyframe every 6 frames.
- On every display frame, the frame the scroll asks for is logged against the frame the browser actually presents (`requestVideoFrameCallback`).

| Scroll (1440 × 900) | Aroma: picture updates | Aroma: worst lag | COVY: picture updates | COVY: worst lag |
|---|---|---|---|---|
| slow wheel | every 50 ms (20 fps) | 13 frames | every 50 ms | 27 frames |
| normal wheel | every 67 ms (15 fps) | 30 frames | every 50 ms | 47 frames |
| fast wheel | every 50 ms | 67 frames | every 50 ms | 145 frames |
| jerky | every 67 ms | 106 frames | every 67 ms | 105 frames |
| flick back up | every 50 ms | 90 frames | every 67 ms | 160 frames |

**What this means:**
- The page asks for a new frame on every display frame (about 60 per second), but the picture changes only 15–20 times a second.
- On a fast scroll the picture falls 2–6 seconds of footage behind and then jumps 20–90 frames at once. That is the stutter and jumping.
- COVY isn't smoother in the engine. Its footage moves less per frame, so the same lag shows less.

**Why it happens:**
- Every scroll step goes through the browser's **seek pipeline**: set `currentTime`, flush the decoder, go back to the keyframe, decode forward, fire `seeked`. Only one seek can run at a time.
- This container decodes in software, so these are worst-case numbers, close to a mid-range phone.
- Published measurements (research summary in §7):

| Browser | Per seek |
|---|---|
| Chrome desktop, hardware decoding | about 17–19 ms |
| Firefox before version 154 | about 66–75 ms |
| Chrome and Firefox on Android | about 400 ms |
| Safari | may present a stale frame after `seeked` |

So no encoding setting makes seeking smooth everywhere.

### 1.3 Benchmark of the alternatives

Same 1080p Aroma morning clip, same container.

| Method | Time per frame | Size of this clip |
|---|---|---|
| `<video>` seek, keyframe every 6 (today) | 40 ms (p95 54) | 6.1 MB |
| `<video>` seek, every frame a keyframe | 31 ms | 12.2 MB |
| **WebCodecs, decoding continuously into a canvas** | **5.7 ms (175 fps)** | **6.1 MB (same file)** |
| JPEG stills | 15.6 ms | 46 MB |
| WebP stills | 30.6 ms | 29 MB |

## 2. The new design

### 2.1 Frame engine: WebCodecs into a canvas, `<video>` as the fallback

- **Same files.** The page keeps the MP4s it downloads today, so the size stays the same. The build tool adds a small sample index to each manifest: each frame's byte offset and size, whether it is a keyframe, and the decoder setup (`avcC`). The browser cuts frames straight out of the downloaded file. No demuxing library, no new dependency.
- **One decoder per scene, kept warm.**
  - Scrolling forward, the decoder runs ahead continuously, with no flush between frames.
  - A far jump goes to the nearest keyframe before the target and decodes forward from there, at most 5 extra frames.
  - Scrolling back uses a small ring of frames already decoded behind the current one, refilled one keyframe group at a time.
  - Decoded frames are copied to `ImageBitmap`s, and the decoder's own `VideoFrame`s are closed at once, as the spec requires.
- **Memory is bounded.** About 24 frames per scene, drawn at the canvas size:
  - desktop: about 200 MB at 1080p;
  - phone (1080 × 1350): about 140 MB.
  - Only the scene on screen and the first frames of the next one are kept.
- **A canvas instead of the `<video>` element.**
  - A frame is drawn the moment it is decoded, inside the animation frame.
  - No `seeked` event, no stale frames, no iOS play/pause unlock.
  - It works in Low Power Mode.
- **Smooth walk.**
  - The frame shown follows the scroll through a short time-based ease. A fast flick walks through the frames like a video playing fast instead of skipping.
  - Once the scroll stops, the exact frame for that position is shown within about 150 ms, so the same position always gives the same frame (skill rule).
- **Fallback.** Where WebCodecs or H.264 decoding isn't available (Firefox for Android; Safari older than 16.4), the scene plays the current `<video>` path, improved:
  - `requestVideoFrameCallback` decides when a frame is really on screen;
  - the same eased walk;
  - `fastSeek` while moving, then an exact seek once the scroll settles.
- **Handoffs between scenes.** The last frame of one scene and the first of the next are already identical (D43/D44). With the canvas, the next scene's first frame is decoded before the visitor arrives, so the cut can't show a blank stage or a poster.

### 2.2 The splash: a strict gate on every visit

- **An opaque panel.**
  - The panel gets a solid background painted in the first frame of the HTML: marble for Aroma, sand for COVY.
  - The frosted look becomes a gradient painted into the panel. No `backdrop-filter`, so nothing behind it can show through, in any browser, at any moment.
  - The boot script moves into `<head>`, so the page is locked before the body paints.
- **Ready means really ready.** The panel leaves only when all of these are true:
  1. every scene file has fully downloaded;
  2. every scene's decoder (or fallback video) is set up, and its first frames are decoded and drawn into the canvas off screen;
  3. fonts are ready (`document.fonts.ready`);
  4. the first scene's canvas shows exactly the frame for the current scroll position.

  If a check fails, that scene switches to the fallback path. If the fallback also fails, the visit goes to the still version (D61). The page never shows a half-ready scene.
- **Every page load, including reloads, goes through the gate.**
  - On a reload the files come back from the browser cache, so the gate passes in a fraction of a second.
  - It then shows a short version of the panel (no full cocoa animation) instead of nothing.
  - This replaces the "known" mode that kept the panel hidden and brought it up when the visitor scrolled (D45/D50).
- **The visit starts at the top.**
  - A reload or a back navigation to the landing page starts at the beginning of the walk: `history.scrollRestoration = "manual"`.
  - A link to a section (`#menu`, `#reserve` …) still goes straight there, after the gate.
- **The speed check (D61) and the "Continue without waiting" link (D48) stay** as they are.

### 2.3 No effects that redraw over the moving picture

- `backdrop-filter` over a picture that changes every frame makes the browser re-blur that area on every frame. WebKit and Firefox for Android are known to stutter with it.
- During the walk these become pre-rendered tints and gradients that look the same:
  - the header wash (both sites);
  - Aroma's lake caption card;
  - Aroma's night pill.
- The sand header on the rest of the page keeps its blur (there's no video behind it there).

### 2.4 What does not change

- Footage, scroll lengths, timing curves, overlays, copy, posters, the still version (LOW tier, reduced motion), and the speed check.
- No Higgsfield credits are needed.
- The MP4s are uploaded again only to a new revision folder (rev 3), because the manifests change. Visitors download the same bytes as today.

## 3. Validation

### 3.1 Acceptance criteria

The release passes only if every one of these holds:

| # | Check | Pass |
|---|---|---|
| V1 | Nothing of the page behind the splash is visible before the splash leaves | 0 frames (checked by recording + pixel diff against the panel colour) |
| V2 | The scenes can't be scrolled before the gate opens (wheel, touch, keys, scrollbar, `#hash`, restored position) | 0 scroll px |
| V3 | Picture updates during scrolling | ≥ 55 fps on desktop, ≥ 30 fps with a 4× CPU slowdown |
| V4 | Largest jump between two consecutive pictures | ≤ 4 frames (the eased walk) |
| V5 | Exact frame after the scroll stops | within 200 ms, every time |
| V6 | Blank, poster or wrong-scene picture at a handoff | 0 |
| V7 | Same scroll position gives the same frame (forward vs back) | 100% |
| V8 | Memory with all three scenes, desktop / phone | ≤ 350 MB / ≤ 250 MB of decoded frames |
| V9 | Fallback path (WebCodecs switched off) still meets V1, V2, V6, V7 | yes |
| V10 | Lighthouse performance / accessibility / best practices / SEO not lower than today | yes |

### 3.2 Automated matrix (Playwright, Chromium, on every PR)

- **Screens:**
  - 1440 × 900;
  - 1920 × 1080;
  - 1024 × 768 (tablet);
  - Pixel 7;
  - an iPhone-sized viewport (390 × 844, touch);
  - English and Arabic (RTL).
- **Conditions:**
  - CPU at 1×, 4× and 6× slowdown;
  - network fast, Fast 4G and Slow 3G (Slow 3G has to end on the still version, D61);
  - WebCodecs off, to force the fallback.
- **Scrolls:**
  - slow, normal, fast and jerky wheel;
  - a flick back up;
  - touch at normal and fast speed;
  - keyboard Space, PageDown and End;
  - a scrollbar jump straight to the middle of a scene.
- **Page events:**
  - reload in the middle of the walk;
  - opening a `#menu` link;
  - switching language;
  - resizing and rotating during the walk;
  - the back button from the privacy page.
- Each run records the per-frame data used in §1.2 and fails the build on any criterion in §3.1.

### 3.3 Real browsers I can't run here

This container has Chromium only. Safari (macOS and iOS) and Firefox (desktop and Android) need real devices.

- **A hidden on-page meter.** Opening the site with `?debug=scrub` shows a small panel on top with:
  - which engine each scene uses;
  - picture updates per second;
  - the largest jump and the current lag;
  - memory used;
  - the time the gate took and why it opened.

  The owner (or anyone) opens it on an iPhone, a Mac with Safari, Firefox and an Android phone, runs the same short list of scrolls, and sends a screenshot. I fix anything that fails and repeat until every device passes.
- **A device checklist (EN and AR)** in `docs/runbooks/` lists the exact steps and the expected numbers, so the check is the same every time.

## 4. Work order

| Phase | Work | Result |
|---|---|---|
| A | Splash: opaque panel, boot script in `<head>`, gate on every load, start at top. Both sites. | V1, V2 |
| B | Build tool: sample index in each manifest; upload rev 3 of all six scenes (no new footage). | Manifests ready |
| C | Frame engine in `@mas/motion`: WebCodecs to canvas, bounded ring, eased walk, gate signals; `<video>` fallback improved. Same props, so the scene components barely change. | V3–V9 |
| D | Replace `backdrop-filter` over the walk with tints. | Fewer redraws |
| E | Measurement matrix as a Playwright suite + `?debug=scrub` meter + device checklist. | §3 automated |
| F | Full matrix, Lighthouse, e2e; PR with the before/after numbers; owner's device check. | Sign-off |

Each phase is a separate commit on one branch, measured before moving on. COVY and Aroma share the engine, so both sites get every fix.

## 5. Risks and how they are handled

| Risk | Handling |
|---|---|
| A browser reports WebCodecs support but decodes badly (driver bugs) | The gate test-decodes the first frames and checks the time per frame. If it's slow or fails, that scene uses the fallback. Errors during the walk switch it over too, without a visible change. |
| Memory on older iPhones | The ring is sized from the screen and `deviceMemory`. Scenes that aren't near the screen release their frames. V8 is measured. |
| Firefox for Android has no WebCodecs | Fallback `<video>` path with the eased walk. Measured on a real device through the meter. If that is still not good enough, a shorter keyframe interval for the phone files only (a re-encode, no credits). |
| Keeping the gate on reloads feels slower | Cached files pass the gate in well under a second, and the short panel is designed for exactly that. |


## 6. Results (2026-10-31)

Measured on local production builds playing the real R2 files, in a container with no GPU: decoding and drawing run on the CPU, so these are worst-case numbers. On a device with a GPU, drawing is nearly free.

| # | Result | Status |
|---|---|---|
| V1 | 0 frames of the page shown before the panel. Checked in recordings of both sites and on every frame in `scenes.spec.ts`: first visit, reload in the middle of the walk, `#menu`, without WebCodecs. | Pass |
| V2 | 0 px scrolled while held. Nothing tried while the panel was up moves the page after it opens (wheel, keys, touch; checked under load). | Pass |
| V3 | In this container the picture updates about 35 times a second (about 11–15 with the old seeking, same container). The container can't reach 55, because every draw costs about 10 ms on the CPU. | To confirm on devices (runbook) |
| V4 | Largest step, p95: 4 slow, 6–7 normal, 4–5 touch, 11–14 fast touch, 24 fast wheel (old: 6–8 slow, 21–31 normal, 47–94 fast). | Pass for slow, normal and touch. On fast flicks the walk runs through the frames at the decoder's pace, as designed. |
| V5 | Exact frame after the scroll stops: 0–33 ms after the last movement in every scenario. A scrollbar jump to another part of the walk takes about 0.5 s. | Pass |
| V6 | Every scene has a drawn frame at its cut (`scenes.spec.ts`). | Pass |
| V7 | Same frame forward and back at four stops on both sites, desktop and phone. | Pass |
| V8 | Decoded frames kept: at most about 75 MB per scene near the screen on desktop (two at a cut), about 40 MB on phones. | Pass |
| V9 | Without WebCodecs: video element, same gate, same frames, steps p95 4 / 12 / 34 (old 6 / 21 / 47). | Pass |
| V10 | Lighthouse, mobile, local, two runs each. Aroma: 83 / 88 before, 87 / 85 after. COVY: 79 before, 80 after. Initial JS: COVY 179.6 KB, Aroma 178.4 KB (budget 180). | Pass |

**Changes from the plan:**
- The boot script is in `<head>` of the layout, and it only acts on the landing pages (`/`, `/ar`).
- The drawing code (engine, video fallback, meter) loads with the motion library after the page, to stay inside the 180 KB budget.
- The meter is plain DOM.

## 7. Sources

- Mozilla bug 2049301, seek latency in Firefox vs Chrome, desktop and Android: https://bugzilla.mozilla.org/show_bug.cgi?id=2049301
- WebKit bugs 236755, 236604 and 194986, stale frames after `seeked`: https://bugs.webkit.org/show_bug.cgi?id=236755
- WebCodecs spec (close frames promptly): https://www.w3.org/TR/webcodecs/
- Firefox for Android WebCodecs tracking bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1746557
- `requestVideoFrameCallback`: https://web.dev/articles/requestvideoframecallback-rvfc
- Apple-style canvas sequences: https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/
- `backdrop-filter` cost on Firefox Android: https://bugzilla.mozilla.org/show_bug.cgi?id=1732817
