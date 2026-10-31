# Sequence log

Every MAG generation for the scroll sequences, with its cost and review verdict. All work lives in the MAG project "MAS Websites — P2 sequences".

## Batch 1 (P2, approved by the owner: Kling 3.0 drafts, ceiling 5,800 credits)

Spent: **5,280 credits** (12 keyframes × 65 + 5 drafts × 900). Balance before: 365,361.

### Keyframes (Nano Banana 2.1, 2K, 16:9, 65 credits each)

| Sequence | Start frame | End frame | Notes |
|---|---|---|---|
| `covy.hero` | Client's facade render, COVY sign removed, widened to 16:9 | Client's blue-tree interior render, widened to 16:9 | Logo removed so it can sit on top as HTML (rule 4) |
| `covy.signature` | Tall glass of ice on terrazzo, navy backdrop | Same glass: layered iced coffee with cold foam and cocoa | End generated from the start frame for consistency |
| `aroma.hero` | Paella on walnut at golden hour, faint steam | Same scene, steam rising into the dark upper half | Upper half kept empty for the script logo |
| `aroma.terrace` | Garden lounge terrace by day | Same terrace at dusk, string lights on | First start frame rejected: it showed a Nile skyline, which the real City Stars terrace doesn't have |
| `mas.portal` | Obsidian corridor with crimson floor lines | Chamber with two arches: blue jungle (COVY) left, gold lounge (Aroma) right | |

### Drafts (Kling 3.0, 1080p, 10 s, start + end frame, no audio, 900 credits each)

| Sequence | Verdict | Next step |
|---|---|---|
| `covy.hero` | **Redone (batch 2).** v1 flew into the terrace tree, then cut to a different doorway | See batch 2 |
| `covy.signature` | Good. Milk, espresso ribbons, foam cap read clearly | Final at 1080p; add the ✦ sparkle on the foam |
| `aroma.hero` | Good. Steam builds steadily | Final as is |
| `aroma.terrace` | Good motion. Generated location | Prefer a start frame from a real photo of the terrace if the client has one |
| `mas.portal` | Good. Steady dolly, two arches resolve cleanly | Final as is |

Review previews (960×540, 96 frames, AVIF only) are in `apps/*/public/sequences/drafts/` and play on each app's `/art-direction` board. Finals will be encoded at full size and served from R2.

## Batch 2 (P2, approved by the owner: two-shot COVY hero redo)

Spent: **965 credits** (1 keyframe × 65 + 2 Kling 3.0 shots × 450). Quoted at up to 1,865 with 10-second shots; two 5-second shots give the same 10 s of footage for half the price.

| Item | Detail | Verdict |
|---|---|---|
| Doorway keyframe | Camera at the open glass doors, terrace tree at the left edge, interior visible ahead (generated from the facade and interior frames) | Good |
| Shot A | Facade → doorway, passing to the right of the tree (5 s) | Good |
| Shot B | Doorway → blue tree and mural (5 s) | Good |
| Joined clip | `ffmpeg` concat, no visible seam; shot B moves about 40% slower, so the camera settles at the door | **Approved for the board.** For the final, sample shot A more densely to even the pace |

## Full-size finals (P3)

Until higher-quality renders are approved, the 1080p drafts serve as the finals. Every source clip is in the MAG project "MAS Websites — P2 sequences". Downloading them costs no credits.

| Sequence | MAG creation | Source |
|---|---|---|
| `covy.hero` | `s7poaEFl8e` (`covy-hero-final.mp4`) | Shots A + B joined, shot B sped up 1.4× so the walk keeps one pace (uploaded, not generated) |
| `covy.signature` | `MBsx3d8DCm` | Kling 3.0 draft as is |
| `aroma.hero` | `3zufgGCREY` | Kling 3.0 draft as is |
| `aroma.terrace` | `kscnh8t16B` | Kling 3.0 draft as is |
| `mas.portal` | `nVKqyVZYQD` | Kling 3.0 draft as is |

### Batch 3: COVY upscale (approved by the owner, ~8,000 credits)

Spent: **8,194 credits** (Magnific Precision: hero 3,897 + signature 4,297). The request asked for 3840 px, but MAG's default resolution preset capped the output at **2588×1440**. That covers the 2560×1440 `desktop-xl` frames; a true 4K pass would cost about the same again for a small gain after downscaling. Detail is clearly sharper than the 1080p clips (mural veins, tree leaves, condensation on the glass).

| Sequence | Build from (MAG creation) | Size |
|---|---|---|
| `covy.hero` | `jUMXfUALD0` (upscaled from `s7poaEFl8e`) | 2588×1440, 8.6 s, 24 fps |
| `covy.signature` | `s7poEPPl8e` (upscaled from `MBsx3d8DCm`) | 2588×1440, 10 s, 24 fps |

The 1440p clips stay in MAG as a backup; the site is built from the true-4K clips below.

### Batch 4: COVY true 4K (approved by the owner, ~13,300 credits)

Spent: **13,260 credits** (Magnific Precision with the 4K preset: hero 6,297 + signature 6,963), upscaled from the original 1080p clips. Output is **3860×2146** (the source's 1.8:1 ratio doubled). The site still shows at most 2560×1440 frames (owner's choice): building them from 4K masters gives the crispest result at the same download size.

| Sequence | Build from (MAG creation) | Size |
|---|---|---|
| `covy.hero` | `Bh79tUdoQR` (upscaled from `s7poaEFl8e`) | 3860×2146, 8.6 s, 24 fps, 63 MB |
| `covy.signature` | `Bh79tO8oQR` (upscaled from `MBsx3d8DCm`) | 3860×2146, 10 s, 24 fps, 17 MB |

Build and upload with default settings (150 frames; 1920×1080 desktop, 2560×1440 desktop-xl, 1080×1350 mobile; focal 0.5,0.5):

```bash
pnpm sequence:build --input covy-hero-4k.mp4 --id covy.hero --out out/sequences
pnpm sequence:build --input covy-signature-4k.mp4 --id covy.signature --out out/sequences
pnpm sequence:upload --dir out/sequences
```

The upload needs the `R2_*` variables from `docs/runbooks/r2-setup.md`. After it finishes, set `NEXT_PUBLIC_MEDIA_URL` on the Vercel project and redeploy.

**Built and uploaded on 2026-10-30.** Each sequence is 150 desktop + 150 desktop-xl + 75 mobile frames in AVIF and WebP, plus a poster and manifest (753 files; hero 91 MB, signature 35 MB). Building from the 4K clips takes about an hour per sequence. Every file in both manifests loads from the bucket's public development URL `https://pub-c0d0df16ce96450a88b8e96c3b0bc44d.r2.dev` with the right content type and `Access-Control-Allow-Origin: *`; manifests are cached for 5 minutes, frames and posters for one week. The custom domain `media.mas.com` is not connected yet (see the R2 runbook).

### Batch 5: COVY connector and the signature at the real bar (Higgsfield, approved by the owner, 387 credits)

From here sequences are made with Higgsfield (D37). The connector replaces the static Story section and follows the floor plan in the client's 3D interior presentation (D38): from the hero's last frame the camera turns left along the mural to the barista bar, then pushes in on a glass of ice on the pastry case. The signature clip was re-edited so the glass stands on that pastry case with the real bar blurred behind it. No text, signage or logos in any frame.

| Step | Higgsfield job | Tool | Credits |
|---|---|---|---|
| Signature: studio backdrop and terrazzo → blurred bar, black marble | `ec9f0fe5` | Kling 3.0 Omni Edit, 4K | 60 |
| Bar keyframe (4 options) and nameplate cleanup | `e3944896`, `b5973850` | Nano Banana 2.1, 4K | 15 |
| Connector shots 1 and 2, first version | `eff267f0`, `1f7481c8` | Kling 3.0 Omni Frames, 4K, 10 s | 120 |
| Final bar keyframe: glass on the pastry case, croissants fixed (4 options, used `82d091d9`) | `82d091d9` | Nano Banana 2.1, 4K | 12 |
| Signature: glass moved onto the pastry case top | `26622a85` | Kling 3.0 Omni Edit, 4K | 60 |
| Connector shot 1: hero's last frame → bar | `200b2a3f` | Kling 3.0 Omni Frames, 4K, 10 s | 60 |
| Connector shot 2: push-in to the signature's first frame | `e7af79e9` | Kling 3.0 Omni Frames, 4K, 10 s | 60 |

The first version (195 credits) was dropped: the glass stood on the marble counter and moved onto the pastry case in shot 2, and the case showed grey pastries copied from the renders. Two edit jobs failed on input checks (a clip 0.04 s over 10 s and a reference image wider than 2.5:1) and were refunded.

Both connector shots start and end on exact frames: shot 1 starts on the hero clip's last frame (cropped to 16:9 like the build) and shot 2 starts on shot 1's last frame and ends on the edited signature's first frame. Seam differences, mean of 255: 0.8 between the shots, 3.1 into the signature (less than one frame of camera motion).

| Sequence | Build from | Size |
|---|---|---|
| `covy.connector` | shots `200b2a3f` + `e7af79e9` joined (shot 2's first frame dropped) | 3840×2160, 20 s, 24 fps |
| `covy.signature` (uploaded as `covy.signature.r2`) | `26622a85` | 3840×2160, 10 s, 24 fps |

```bash
pnpm sequence:build --input covy-connector-4k.mp4 --id covy.connector --out out/sequences --max-frames 180
pnpm sequence:build --input covy-signature-bar-4k.mp4 --id covy.signature.r2 --out out/sequences
pnpm sequence:upload --dir out/sequences --only covy.connector,covy.signature.r2
```

The signature goes to a new path because frames are cached for a week under the same names; the site asks for it with `sequenceSource("covy.signature", { rev: 2 })`. The 960×540 drafts in `apps/covy/public/sequences/drafts` were rebuilt from the same clips (96 frames).

**Built and uploaded on 2026-10-30.** `covy.connector`: 180 desktop + 180 desktop-xl + 90 mobile frames (903 files); `covy.signature.r2`: 150 + 150 + 75 (753 files), both AVIF and WebP with poster and manifest. Every file loads from the public bucket URL with the right content type and `Access-Control-Allow-Origin: *`.

### Rebuild: hero and connector picked by motion (no credits, D41)

No new footage. The same 4K clips were rebuilt with `--motion-step`, which keeps about one frame per step of image change instead of sampling evenly in time, and writes a `timing` curve into each manifest so the player scrubs at an even camera speed. Measured on the clips (mean absolute difference of 192×108 greyscale frames): the connector's first shot moved about 2.3× as much per screen of scroll as the hero, and its frames were 2.7 source frames apart; the last 3.5 s of the hero clip has uneven pacing (big and small steps alternating).

| Sequence | Frames before → after | Step | Build from |
|---|---|---|---|
| `covy.hero.r2` | 150 → 200 (mobile 101) | 6 | `covy-hero-4k.mp4` (207 source frames) |
| `covy.connector.r2` | 180 → 329 (mobile 165) | 8 | `covy-connector-4k.mp4` (481 source frames) |

```bash
pnpm sequence:build --input covy-hero-4k.mp4 --id covy.hero.r2 --out out/sequences --motion-step 6 --ease-out 0.06
pnpm sequence:build --input covy-connector-4k.mp4 --id covy.connector.r2 --out out/sequences --motion-step 8 --ease-in 0.06 --ease-out 0.12
pnpm sequence:upload --dir out/sequences --only covy.hero.r2,covy.connector.r2
```

The connector's section grows from 400vh to 560vh so its camera moves at about the hero's speed per scroll. Easing keeps the old slow landings: the hero eases out over the last 6% of its move into the hold, and the connector eases in over its first 6% and out over its last 12% onto the glass. `covy.signature.r2` is unchanged (static camera; the player now blends its frames too).

**Built and uploaded on 2026-10-31.** `covy.hero.r2`: 1,005 files; `covy.connector.r2`: 1,649 files (AVIF and WebP, poster and manifest).

### COVY as scroll videos (no credits, D43)

The same three clips, encoded as H.264 MP4s for hardware-decoded scrubbing: every source frame, a keyframe every 6 frames, no B-frames, `+faststart`, no audio. Timing as in D41 (motion-based, eased) for the hero and connector; even for the signature (static camera).

| Video | Frames | Desktop 1920×1080 | Mobile 1080×1350 |
|---|---|---|---|
| `covy.hero` | 207 | 10.4 MB | 6.0 MB |
| `covy.connector` | 481 | 14.3 MB | 7.5 MB |
| `covy.signature` | 241 | 3.5 MB | 2.5 MB |

```bash
pnpm sequence:video --input covy-hero-4k.mp4 --id covy.hero --out out/videos --motion --ease-out 0.06
pnpm sequence:video --input covy-connector-4k.mp4 --id covy.connector --out out/videos --motion --ease-in 0.06 --ease-out 0.12
pnpm sequence:video --input covy-signature-bar-4k.mp4 --id covy.signature --out out/videos
pnpm sequence:upload --dir out/videos --prefix videos
```

Seams, mean difference of 255: hero's last frame to the connector's first 5.0, connector's last to the signature's first 3.1 (the same as the image frames). **Uploaded on 2026-10-31** under `videos/`, 5 files each, `video/mp4` with range requests and `Access-Control-Allow-Origin: *`.

## Aroma Lounge: "A day at Aroma" (Higgsfield, D52/D53, ceiling 300 credits)

Balance before: 568.75 credits. References are Aroma's own posts and frames from their reels (owner's Drive folder): overhead marble tables, leaf placemats, the shakshuka pan, sunset drinks, the lake and fountain, the deck railing, the night terrace. Flyer frames with text over them were cropped or left out.

### Keyframes (Nano Banana 2.1, 4K, 16:9, 3 credits each)

| Keyframe | Job(s) | Credits | Verdict |
|---|---|---|---|
| K1 empty table from above, morning sun (2 options) | `fb6c0831`, `1da4a41a` | 6 | **`1da4a41a`**: the table runs down the centre like Aroma's own plates reel, and it crops well for phones |
| K2 the same table with breakfast; cappuccino in the centre with plain foam (2 options) | `9af63408`, `229f3046` | 6 | **`229f3046`**: keeps K1's herb, glasses and placemats in place, so S1 has nothing jumping |
| K3 eye level at golden hour: a hand raises the sunset drink against the lake and fountain (2 options) | `ac1a56cf`, `80151650` | 6 | **`80151650`**: the camera looks down the length of K2's table (shakshuka, feteer, herb, placemats in the same order), so S2's move from overhead to eye level makes sense; it also shows the restaurant frontage |
| K4 the same view at blue hour: lamps and string lights on, the fountain lit, a guitarist on the deck seen from behind (2 options) | `6a36824c`, `32f2cb4e` | 6 | **`6a36824c`**: closest framing to K3, so S3 is night falling on a still camera; the guitarist's face isn't visible |

Keyframes spent: **24 credits**. The owner approves K1–K4 before any shot.

### Shots (Kling 3.0, 4K, 10 s, start and end frame, no audio, 60 credits each; approved by the owner)

| Shot | From → to | Job | Credits | Verdict |
|---|---|---|---|---|
| S1 `aroma.morning`: hands set the breakfast down, the cappuccino last | K1 → K2 | `ed907a92` | 60 | **Approved**: dishes arrive in order, held in hand; ends on K2 |
| S2 `aroma.lake`: overhead → eye level toward the lake, morning → golden hour, the sunset drink raised | K2 → K3 | `78e9912f` | 60 | **Rejected**: at 3–4 s the dishes fly off the table with debris |
| S2 re-shot: hands clear the dishes first with the camera still, then the move | K2 → K3 | `1cfcb8b8` | 60 | pending |
| S3 `aroma.night`: dusk falls, lamps on, the guitarist starts | K3 → K4 | `d42ef40e` | 60 | **Approved**: the table change is a soft time-lapse dissolve; the guitarist is seen from the side and behind, out of focus |

Two of the three were first held back by the tool's preset suggestion ("IN THE DARK"); it was declined and they were resubmitted unchanged, no credits spent on the held ones.
