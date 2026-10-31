# 06 — Aroma Lounge re-plan

**Status:** draft for the owner's approval (2026-10-31). Once approved, it replaces §4.3 of `03-experience-design.md`, the Aroma rows of `docs/assets/asset-manifest.md`, and the City Stars location in `packages/content`. Research and sources: `docs/research/aroma/README.md`.

## 1. Why we are re-planning

The first Aroma plan came from the brand guide and a client deck: dark wood, steam over a paella pan, a terrace from dusk to night, City Stars. The owner rejected both scenes. The client has since given us their logo, their digital menu and 78 posts (photos, videos and captions). These show a different place:
- Aroma today is **two branches**: Mivida's Lake District, on the water, and Madinaty's The Strip Mall.
- It is **bright**: white marble, sun on the lake, golden hour, layered sunset drinks.
- It is **social**: tables filling up with plates to share, live guitar on Thursdays and Fridays, match nights.

**Goal (owner's words):** the whole site, from the first second to the footer, should feel like Aroma, so a regular guest knows it is Aroma's site even without seeing the logo. The copy and SEO use the same voice as Aroma's social media.

## 2. Goals, non-goals, anti-goals

**Goals**
- A regular guest recognises the place: the lake, the white tables, the sunset drink, the cappuccino with the petal, the guitar at night.
- A new guest can quickly find the menu (all 195 real items), the two branches, what's on this week, and how to book.
- The site is written the way Aroma talks on social: warm, short, plain, inviting.
- Both branches can be found on Google in English and Arabic.

**Non-goals**
- Online ordering (Aroma uses talabat; we link to it).
- A blog or news section.
- Rebuilding the brand: we use the client's logo, colours and voice as they are.

**Anti-goals (a failure even if it works)**
- A generic "luxury lounge" look: dark, moody, gold. That is not Aroma.
- Invented places: scenes that show a room Aroma doesn't have.
- Copy that sounds like an agency or an AI, or a voice different from Aroma's posts.
- Fake reviews or invented events presented as real.

## 3. Constraints

- **Project rules (CLAUDE.md):** no code before approval; zero new spend; placeholders until real images exist (exceptions below need the owner's OK); no text or logos baked into generated frames; placeholder data labelled; EN + AR with RTL; free fonts; forms send email only; analytics after consent.
- **Same methodology as COVY:**
  - Higgsfield (D37): Nano Banana 2.1 keyframes at 4K, Kling 3.0 Omni Frames shots at 4K, start and end frames.
  - Scroll-scrubbed H.264 videos (D43): read from R2 and played through `ScrollVideo` with leads and holds (D44), `lvh` sizing (D45), the splash gate (D45, D48–D50), and the walk header (D47, D51).
- **Deploys:** pushes are batched (Vercel Hobby limit, 100 deploys a day).
- **Sources:** the client's social photos top out at 1080 px. That is fine for cards and galleries, not for full-bleed backgrounds.

## 4. Approaches considered (owner picked A)

| | Approach | Trade-off |
|---|---|---|
| **A** ✅ | **"A day at Aroma"**: one camera through a day at Mivida. Morning table → afternoon by the lake → night with live music | Follows the rhythm Aroma itself posts (breakfast → long afternoons → nights). Shows the real place and the lake. Needs a time-of-day change in footage, which is the hardest shot. |
| B | **"The table"**: a fixed overhead camera on one table all day | Cheaper and the most consistent; matches their overhead reels. Doesn't show the place or the lake. |
| C | **"The two branches"**: Mivida by day, Madinaty at night, then the cup | Shows both branches, but jumps location between scenes. Madinaty has few interior references, so more would be invented. |

**A was picked by the owner.** Madinaty gets its own section with real photos (§5, A4).

## 5. The page, top to bottom

| # | Section | What the visitor sees | Layer |
|---|---|---|---|
| — | **Splash** | The logo's petal flower forms from cocoa dust while the scenes download (§6.4) | Motion |
| A1 | **Morning at the lake** (hero) | An overhead white marble table on Mivida's terrace in morning sun. Hands set the breakfast down plate by plate; a cappuccino lands in the middle, and the petal is dusted onto it in cocoa | Seq `aroma.morning` |
| A2 | **Long afternoons** | The camera lifts from the table and turns to the lake. A hand raises the layered sunset drink against the low sun; the fountain plays behind | Seq `aroma.lake` |
| A3 | **Nights** | Dusk falls on the same view: the terrace lamps come on and a guitarist plays on the deck. This week's nights appear: Thursday Madinaty, Friday Mivida, 9–11 PM | Seq `aroma.night` |
| A4 | **Two places to find us** | Mivida (by the lake, enter from gates 6 or 7) and Madinaty (The Strip Mall, B11). Each has its own photos, hours, directions, call and WhatsApp | Motion |
| A5 | **Menu** | Breakfast · Food · Drinks · Dessert · Kids: all 195 real items with prices and their photos; search; sticky categories; "Book a table" always in reach | Motion |
| A6 | **What's on** | Live music weekly (Thursday Madinaty, Friday Mivida, 9–11 PM, with the performer named here and only here). Match nights "on Egypt's match days" on big screens, with no fixed date. Aroma Nights as occasional nights with a DJ, "dates on our Instagram". Each links to booking | Motion |
| A7 | **Our story** | A short paragraph: the City Stars rooftop where it started, the two branches today, the motto "Good food comes from good hearts, we aspire for both." | Motion |
| A8 | **By guests** | A wall of real moments from Aroma's posts: friends laughing, drinks raised, plates shared. These are photos, not reviews | Motion |
| A9 | **Book / Feedback** | The COVY forms, with a **branch choice** first | UI |
| A10 | **Find us** | Both branches side by side, social links (Instagram, Facebook, talabat), footer | UI |

**Header:** the COVY scene header (D47, D51) in Aroma's colours, with a marble-white wash over bright frames and a night-green wash over dark ones. Its links are Menu, Branches, What's on and Our story, plus a Book button.

**Order logic:** the three scenes tell the day. Then the practical part, in the order a guest needs it: where (A4), what to eat (A5), when to come (A6). Story and guests build trust; booking closes the page.

## 6. The scroll scenes

### 6.1 Shots (Higgsfield, COVY method)

The sequence is four keyframes (stills) and three 10-second shots between them. Each scene ends on the frame the next one starts on, so the handoffs are invisible (D38, D44).

| Keyframe | Content (no text, no logos in the image) |
|---|---|
| K1 | Overhead: an empty white marble table on Mivida's terrace in morning sun, with long shadows. Leaf-pattern placemats (no wording), cutlery and a small plant |
| K2 | The same table, full: breakfast tray, shakshuka pan, feteer, a layered juice, and a cappuccino in the centre with plain foam (the petal is added in HTML, §6.2) |
| K3 | Eye level by the same table at golden hour: a hand raises a layered sunset iced tea in front of the lake; the fountain behind; the table edge in the foreground |
| K4 | The same view at blue hour: the glass now on the table, the terrace lamps on, the fountain lit, and a guitarist on the deck, seen from behind and out of focus at the side of the frame. Nobody in the scenes is recognisable, and the scenes never name a performer (§12) |

| Shot | From → to | Becomes |
|---|---|---|
| S1 | K1 → K2: hands set the plates down one by one, and the cappuccino lands last | `aroma.morning` (A1) |
| S2 | K2 → K3: the camera lifts and tilts from the table to the lake while the light warms to golden hour | `aroma.lake` (A2) |
| S3 | K3 → K4: dusk, the lamps switch on, and the guitarist starts | `aroma.night` (A3) |

References for every keyframe are the client's own photos (lake, tables, drinks, deck, the night terrace), so Higgsfield redraws Aroma's real place. S2 is the risky shot (a camera move and a light change together). If it doesn't hold, we split it into two 5-second shots for the same price per second.

**Credit estimate** (Higgsfield rates from batch 5):
- Keyframes: 4 options each at about 3 credits per image, so about 48 credits.
- Shots: 3 × 60 credits, so 180.
- Spare: one re-shot, 60.
- **Ceiling: 300 credits.** Nothing is generated before the owner approves, and I check the balance first. The owner picks keyframes before any shot is made.

### 6.2 What sits on top (HTML/SVG, never in the frames)

| Scene | Overlay |
|---|---|
| A1 | The Aroma Lounge logo and Aroma's own line "We believe in quality ingredients. We believe in quality times." As the cappuccino lands, the petal is dusted onto the foam: an SVG of fine cocoa grains, tracked to the cup the way COVY's glass print is (D35, D38). Then the logo scrolls out on the hold (D44) |
| A2 | "It's the moments around the table that turn a meal into a memory." (their caption) and "By the lake at Mivida" |
| A3 | "Come for dinner. Stay for the atmosphere." (their caption), this week's nights, and a Book button |

### 6.3 Lengths and phones

Same player and rules as COVY: about 300vh for A1 with a 90vh hold, about 400vh for A2 with leads and holds, about 300vh for A3. Each scene has a desktop and a phone cut from the same clips (portrait crop). Reduced motion shows one still per scene, with the copy always visible.

### 6.4 Splash (same mechanism as COVY, Aroma's own design)

**Mechanism (unchanged from COVY):**
- It waits until every scene video for this screen shape has downloaded (D45).
- It doesn't come back in the session once that shape is ready.
- Nothing scrolls underneath; the lock is set before the first paint (D50).
- The skip appears only on a stall or after 30 s (D48).
- It doesn't show with reduced motion.

**Design (new):**
- A marble-white screen with a soft morning light.
- The logo's **petal flower forms from cocoa dust**, one petal at a time as the videos download. The flower is the progress bar.
- When the last petal is in, the script wordmark writes itself underneath.
- The splash then lifts, and the dust settles into the morning table of A1. That is the same flower the guest will see dusted onto the cappuccino at the end of A1.

This uses the cappuccino ritual from Aroma's reels, so it reads as theirs and not as a generic loader.

## 7. Look and feel

### 7.1 Colour (from the logo file and the photos; contrast checked in the build)

| Token | Value | Use |
|---|---|---|
| `--aroma-green` | `#8FC741` (logo) | The petal, highlights, active states, the reel-style green frame. **Not for text on white** (about 2:1) |
| `--leaf` | deeper green, set in the build to reach 4.5:1 on marble | Links, buttons and labels on light backgrounds |
| `--night` | very dark green | Night sections (A3, A6), the night header tone |
| `--marble` | warm off-white | Page background, cards |
| `--sunset` | amber | The drink gradient, small accents |
| `--ember` | red | The bottom of the drink gradient, sparingly |
| `--ink` | `#202722` (guide charcoal) | Body text |
| `--stone` | `#959595` (logo grey) | Wordmark only |

The **sunset gradient** (ember → sunset → gold) is the one signature effect: the night section's horizon, a hairline under headings, and the Book button's hover.

### 7.2 Type

Unchanged (D4): Hanken Grotesk for English and Alexandria for Arabic. The client's script wordmark is used only as the logo SVG and never retyped. Headlines are set large and plain; their warmth comes from the words, not a script font.

### 7.3 Motifs

- The **petal** (from the logo): splash, cocoa dust, section markers, the loading state of menu photos.
- The **leaf pattern** from the placemats: section dividers, the Book sheet background.
- **Light on water**: a slow shimmer in A4 behind Mivida's card only.
- Photos are always real Aroma moments (§9).

### 7.4 Motion

One orchestrated moment per section, never a fade-up on every card. The three scenes carry the motion; the rest is calm: menu categories slide, photo walls drift at two depths, and the night section's horizon glows as it enters.

## 8. Words and search

### 8.1 Voice

Aroma's English on social is warm, short and second person, and it ends with an invitation. We write the site the same way, reusing their own lines where they fit (A1–A3 use three of them verbatim). We avoid agency phrases like "culinary journey" and "elevate your senses", and we run every page through the `humanizer` and `copywriting` skills.

**Arabic** is written for Egyptian guests in light, warm Modern Standard Arabic with an Egyptian ear. It is not a word-for-word translation: each English line gets an Arabic line that does the same job.

Draft lines (for review in P3):
- Hero: "We believe in quality ingredients. We believe in quality times." / «بنآمن بجودة المكوّنات… وبجودة الوقت.»
- Menu intro: "Breakfast till late, plates made for sharing, and the drinks you know us for."
- Nights: "Your night plans are set." (their line) + the week's schedule.
- Book: "Save your table. We'll call to confirm."

### 8.2 SEO

- **One page per language**, with titles and descriptions built on what people search:
  - English: Aroma Lounge, Mivida, Lake District, Madinaty, The Strip, breakfast, live music, New Cairo.
  - Arabic: أروما لاونج، مفيدا، ليك ديستريكت، مدينتي، ذا ستريب، فطار، مزيكا لايف، التجمع.
  - Draft title (EN): "Aroma Lounge — Mivida Lake District & Madinaty | Breakfast, Dinner, Live Music".
- **Structured data:**
  - An Organization for Aroma Lounge, plus **two Restaurant entries** (one per branch) with address, geo (from Maps), cuisine, price range, menu URL and opening hours once confirmed.
  - A `Menu` with all sections and items.
  - Recurring live music as an `Event` series, only when the client confirms the schedule.
- **Google Business Profiles** link to the site's branch anchors (`#mivida`, `#madinaty`) and the site links back. The client does this on their accounts; we hand over the links.
- **Menu content** is real HTML (already the COVY pattern), so all 195 dishes are indexable in both languages.

## 9. Images and rule 3

| Image | Source | Status |
|---|---|---|
| Scene frames (A1–A3) | Generated with Higgsfield from the client's photos | Allowed by rule 4 |
| Branch photos (A4), "What's on" (A6), "By guests" (A8) | **The client's own posts** (Drive) | **Needs the owner's OK**: an exception to rule 3, like D39/D46, but with real photos instead of generated ones |
| Menu item photos (A5) | **The client's digital menu** (155 of 195 items) | **Needs the owner's OK**; items without a photo show the petal placeholder |
| Social share image | Generated or cropped from a scene frame | Placeholder until then |

Flyers (posts with text baked in) are never used as photos. The rest of the image slots stay `<ImageSlot>` placeholders until the designer delivers.

## 10. Data and code changes

| Change | Impact |
|---|---|
| **Branches:** `locations` becomes a list per brand; Aroma has `aroma-mivida` and `aroma-madinaty`, and COVY keeps one | Shared package. The reservation form shows a **branch choice** when a brand has more than one, and the email subject carries it (`[Aroma · Mivida] Table · Fri 6 Nov · 20:00 · 4 guests`). Events and schema follow. COVY behaviour is unchanged (covered by its tests) |
| **Menu import:** a script turns the client's digital menu into `packages/content/src/menus/aroma.ts` (names, EN/AR descriptions, prices, photos); it can be re-run when the menu changes. **One menu for both branches** (the digital menu is one venue); to confirm with the client | **Arabic names are our translation** (the menu has none), flagged for the client to review. Zero prices are dropped |
| **Recurring events:** events get an optional weekly rule (day, time, branch); match nights and Aroma Nights have no date, just a line | "What's on" shows the next date for weekly nights; old dated sample events are removed |
| **New slots** in the asset manifest for the scenes, branches and the share image; the MAG drafts `aroma.hero` and `aroma.terrace` are retired | Docs only |
| The apps/aroma demo pages (art direction, kitchen sink, demo scene) | Removed when the landing lands; the COVY landing components are reused with Aroma styling |

## 11. Phases

| Phase | Work | Owner checkpoint |
|---|---|---|
| P0 | This plan, plus answers to §12 | Approve the plan |
| P1 | Keyframes K1–K4 (about 48 credits) | Pick keyframes |
| P1b | Shots S1–S3 (180–240 credits), build videos, upload to R2 | Approve the footage |
| P2 | Data: branches, menu import with Arabic names, recurring events, slots; COVY regression check | — |
| P3 | Page: sections, splash, header, copy EN/AR, SEO and structured data | Preview on Vercel |
| P4 | Reviews: UX heuristics, accessibility, web design guidelines, AI-slop audit, humanizer and copywriting, SEO audit, schema, Core Web Vitals; e2e | Fix list |
| P5 | PR, owner tests the deploy, merge | Merge |

## 12. Decisions

**Decided by the owner**
- Re-plan the whole Aroma site from the client's real material (2026-10-31).
- Scroll scenes: approach A, "A day at Aroma" (2026-10-31).
- A splash with COVY's loading mechanism and its own design (2026-10-31).
- Copy and SEO in Aroma's social voice (2026-10-31).
- Higgsfield for the scenes; the same methodology as COVY.

**My calls (open to change)**
- The scenes are set at Mivida, because the lake is the place regulars know. Madinaty gets its own section with real photos.
- The splash idea: the petal forming from cocoa dust.
- Fonts unchanged (D4).
- The 3D leaf ring is **not** used for Aroma, because it doesn't match the bright lakeside feel. It stays in the repo.
- Colours as in §7.1, tuned for contrast in the build.
- Hands are fine in the scenes, as in Aroma's reels. The guitarist in A3 is seen from behind and out of focus, and the scenes never name a performer: a generated figure next to a real musician's name would mislead.
- Match nights and Aroma Nights have no fixed dates on the site; only the weekly live music does.
- One menu for both branches until the client says otherwise.

**Open for the owner**
1. **Real photos:** may we use the client's social photos and digital-menu photos on the site (exception to rule 3)? Some show guests' faces. My suggestion: only photos Aroma posted on its own account, and the client confirms they're cleared to reuse.
2. **The 3D leaf ring:** D42 kept it to rework for Aroma. I suggest leaving it out (it fights the bright lakeside feel and costs about 240 KB of 3D). Keep or drop?
3. **Facts from Aroma's posts** (branches, gates 6/7, unit B11, the live music schedule, the City Stars start): treat them as client-provided data, marked for the client to confirm before launch, with no "Sample" badge on the page? Hours and phone stay placeholders until confirmed (we only have "Mivida closes 1:30 AM" and one number from a reel).
4. **Arabic menu names:** OK for us to translate them, marked for the client to review?
