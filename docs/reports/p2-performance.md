# P2 performance check (prototypes)

Measured on production builds (`next start`) in headless Chromium emulating a Pixel 7: 4× CPU slowdown, 4G-like network (9 Mbps down, 70 ms latency). Analytics consent was set to "rejected" so no third-party scripts loaded.

**Caveat:** headless Chromium here renders WebGL with SwiftShader, a software GPU. Frame rates and GPU-bound stalls on the 3D scenes are therefore worst-case and not what a phone with a real GPU will show. CPU, network, LCP and CLS numbers are meaningful. A check on a real mid-range Android phone is still needed (see the end).

## Results

| Page | LCP | CLS | JS transferred | Long tasks (max) | Scroll |
|---|---|---|---|---|---|
| MAS home | 436 ms | 0 | 217 KB | 3 (180 ms) | — |
| COVY home | 372 ms | 0 | 217 KB | 3 (182 ms) | — |
| Aroma home | 376 ms | 0 | 217 KB | 3 (178 ms) | — |
| MAS board (2 WebGL scenes + 1 sequence) | 500 ms | 0 | 464 KB | 9 (925 ms) | 20 fps on software GPU |
| COVY board (1 WebGL scene + 2 sequences) | 468 ms | 0 | 469 KB | 6 (342 ms) | 51 fps |
| Aroma board (2 sequences, SVG motion) | 424 ms | 0 | 220 KB | 5 (234 ms) | 59 fps |

The extra JavaScript on the MAS and COVY boards is the three.js chunk, which loads only after first paint and only on capable devices (HIGH/MID tier).

## Fixed during the check

- **MAS board froze for 5.3 s once.** Cause: the reflection map for the obsidian materials was built at 256 px with an extra blur pass. On the software GPU that blocked the main thread. Now built at 64 px with no blur (same look on dark stone): worst block 925 ms on the software GPU; on a real GPU this is a few tens of milliseconds.

## JavaScript budget (decided: keep 180 KB, D29)

The home pages first shipped 217 KB of initial JavaScript against the 180 KB budget. The motion library (GSAP, ScrollTrigger, SplitText, Lenis, ~52 KB) now loads after the page's load event, when the browser is idle, through `loadMotionLib()` in `@mas/motion`. Components run their animations with `useMotionEffect`, and every animated element renders its final, readable state before the library arrives.

| Route (all three sites) | Initial JS | Loaded after first paint |
|---|---|---|
| `/`, `/ar`, `/privacy` | **166 KB** | 53 KB (motion library) |

## Real-device check (owner)

On a mid-range Android phone (e.g. Samsung A-series or Redmi Note), open each preview's `/art-direction` page in Chrome and scroll slowly through every scene, then quickly back up. Things to report: stutter in the 3D scenes, frames lagging behind the finger in the sequences, the phone getting warm. [PageSpeed Insights](https://pagespeed.web.dev) on the preview URL gives a free second opinion.
