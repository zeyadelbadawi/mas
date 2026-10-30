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

Build and upload, with default settings (150 frames, 1920×1080 desktop, 1080×1350 mobile, focal 0.5,0.5):

```bash
pnpm sequence:build --input covy-hero-final.mp4 --id covy.hero --out out/sequences
pnpm sequence:build --input covy-signature.mp4 --id covy.signature --out out/sequences
pnpm sequence:upload --dir out/sequences
```

The upload needs the `R2_*` variables from `docs/runbooks/r2-setup.md`. After it finishes, set `NEXT_PUBLIC_MEDIA_URL` on the Vercel project and redeploy.
