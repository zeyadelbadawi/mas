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
| `covy.hero` | **Redo.** The camera flies into the terrace tree, then cuts to a different doorway | Split into two shots (facade → doors beside the tree, doors → interior) or add a mid keyframe; quote before running |
| `covy.signature` | Good. Milk, espresso ribbons, foam cap read clearly | Final at 1080p; add the ✦ sparkle on the foam |
| `aroma.hero` | Good. Steam builds steadily | Final as is |
| `aroma.terrace` | Good motion. Generated location | Prefer a start frame from a real photo of the terrace if the client has one |
| `mas.portal` | Good. Steady dolly, two arches resolve cleanly | Final as is |

Review previews (960×540, 96 frames, AVIF only) are in `apps/*/public/sequences/drafts/` and play on each app's `/art-direction` board. Finals will be encoded at full size and served from R2.
