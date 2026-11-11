# 09 — Stash: plan for a new website

**Status:** approved by the owner in full on 2026-11-11 (D77–D79): brown as the primary colour, the logo as drawn, Magnific, scene 2 option A, and every other recommendation. Revised before approval after an independent review (`docs/reports/stash-plan-critique.md`: 13 findings, all addressed below). Nothing is built or generated until the owner approves it (CLAUDE.md rule 1). Every phase has its own approval, and every generation step has its own cost gate (rule 2).

**Sources (all read in full):**
- `Stash_Brand_identity.pdf` (9 pages): the logo, the colours, the type and five logo variations.
- `Stash Presentation.pdf` (18 pages, from the owner's Google Drive). It covers:
  - the brand statement;
  - the "S" monogram (p.2);
  - six logo variations;
  - the pattern (p.12);
  - five pages of product mockups (pp.13–17, about seven photos).
- The owner's list of the eight services, with one line each.
- The three references the owner sent, studied page by page:
  - Vegware: home, category, product, custom print, samples, materials;
  - Yaseen Packaging: products, the custom cup configurator, quote form, ordering process;
  - Huhtamaki's July 2025 catalogue (56 pages).
- Our own method: `docs/playbooks/scroll-animation-playbook.md` and how MAS was built (`docs/08-mas-replan.md`).

---

## 1. What Stash is (from the presentation)

> **"Designed by you. Made by STASH."**
> STASH is a website where any business or person designs the exact box they need, sees it before it is made, and gets it produced by the STASH factory.
>
> Personality: **Precise · Easy · Premium** · Serves: **B2B + B2C · Egypt** · Primary touchpoint: **the website**

This is the most important line in the brand files. For Stash, the website is the product's front door: the place where a café owner or a person designs packaging, sees it, and asks for it to be made.

So the site needs two things that MAS did not have:
- a **product catalogue** (the eight ranges and what is in each);
- a **Design Studio** where a visitor puts their own logo on a box, cup or bag and sees it in 3D before asking for a quote.

Everything else follows the MAS model:
- several pages;
- English and Arabic;
- two scroll scenes on the home page.

## 2. The identity, and two things to confirm

| Item | What the files say | What we'll use |
|---|---|---|
| Wordmark | Custom letters: heavy stems against hairlines, rounded outer corners. The descriptor reads PACKAGING (Poppins ExtraBold) SOLUTIONS (Poppins Medium), framed by two short rules. | The vector logo, taken straight from the PDF as SVG (it is vector in both files, so no redrawing). |
| Monogram | The "S" alone (presentation p.2). | Favicon, app icon, splash, loader. |
| Pattern | The caption says "the S of the wordmark repeated in staggered rows". The drawn page (p.12) and the tissue mockup actually repeat the **whole STASH wordmark**, with every other row mirrored, all tone-on-tone. | We build the pattern **as drawn**: the whole wordmark, alternating mirrored rows, tone-on-tone, as SVG. It goes on section backgrounds and the footer. |
| Type | Poppins for everything. ExtraBold for headlines, SemiBold for subheads, Medium for labels, Regular for body. | Poppins (free, OFL). Poppins has no Arabic letters, so Arabic uses **Tajawal** (free, OFL): geometric like Poppins, weights up to 900 to match ExtraBold, and not used by our other three sites. |
| Colours | Primary · Light Beige `#EDE6D8` · Light Pistachio `#C5D3AE` · Off-white `#F7F5F0` (the identity says it is for the website) · Orange `#EE6A2C` (accent: rules, highlights). | As listed, with the primary colour still to confirm (below). |

**⚠️ Confirm 1: the primary colour.**
- The label in both files says **navy `#1C2A44`**.
- Every page actually shows **brown `#5B4537`**: the swatch, the logo pages and all the mockups (I measured the pixels).
- The labels look like they were left over from an earlier version.
- **Recommendation:** brown `#5B4537`, because it is what the client's designs show everywhere.

**⚠️ Confirm 2: the logo's rules and letters.**
- The text says the two short rules beside the descriptor are orange.
- In every rendered logo they are the same colour as the letters.
- The orange variation is labelled "navy letters", but it shows cream letters.
- **Recommendation:** follow the drawings. The rules are the colour of the letters, the letters on orange are cream, and orange is used for highlights elsewhere.

## 3. Who it's for and what they come to do

| Visitor | Comes to | Main path |
|---|---|---|
| Café, restaurant, bakery or cloud-kitchen owner (B2B, most visits) | Find the right packaging, see it with their logo, get a price | Packaging → category → Design Studio or "Add to quote" → quote |
| Repeat business client | Reorder or add an item | Header "Get a quote" |
| Individual or small brand (B2C: events, gifts, home bakers) | Make a small run of branded boxes or bags | Home → Design Studio → quote (fewer required fields) |
| Partner or press | Who Stash is, the factory | About |

There are **no prices or online payment** in this plan: Stash quotes each order. The site never shows a price we don't have.

## 4. Sitemap

English at `/`, Arabic at `/ar`, as on every site.

| Page | URL | Purpose |
|---|---|---|
| Home | `/` | The promise, the two scenes, the eight ranges, how it works, the studio, who it serves |
| Packaging (all ranges) | `/packaging` | The eight ranges in one view, with what each includes |
| Range page × 8 | `/packaging/[range]` | One per service (the "service details" page). Slugs: `coffee-beverage`, `fast-food`, `containers-bowls`, `bakery-pastry`, `bags-carriers`, `wrapping-paper`, `sustainable`, `accessories-tableware` |
| Design Studio | `/design` | Design a box, cup or bag with your logo in 3D, then send it for a quote |
| How it works | `/how-it-works` | Design → see it → approve → we make it → delivered, with artwork guidance |
| Sustainability & materials | `/materials` | Kraft, bagasse, moulded fibre, paperboard and inks, one by one, with only the claims Stash can document |
| About | `/about` | Stash and its factory (location to be confirmed by the client) |
| Get a quote | `/quote` | Quote list and form (also reached from every range and from the studio) |
| FAQ | `/faq` | Minimum order, lead times, artwork, delivery, samples |
| Contact | `/contact` | Address, phone, WhatsApp, map, a short form |
| Privacy, Terms | `/privacy`, `/terms` | As on the other sites |

**Header:**
- Links: Packaging (a mega menu with the eight ranges), Design Studio, How it works, Materials, About, Contact.
- Language switch.
- One button, **Get a quote**, which shows the number of items in the quote list.

**Footer:**
- Columns: Packaging (8), Design & order (studio, how it works, quote, FAQ), Company (about, materials, contact) and Contact.
- The wordmark pattern behind it, tone-on-tone.

Sub-type pages (for example `/packaging/coffee-beverage/double-wall-cups`) are **not** in the first build. Each range page shows its sub-types as sections. The data model is ready for separate pages once the client sends real specs.

## 5. Page plans

### 5.1 Home

| # | Section | Content |
|---|---|---|
| H1 | **Scene 1: "Flat to form"** (scroll scene, §6) | Headline "Designed by you. Made by STASH." in the hold, then **Design your packaging** and **Browse packaging** buttons |
| H2 | The promise | One short paragraph from the brand statement, plus three lines for Precise, Easy and Premium (the brand's own words, each with one concrete fact, no filler) |
| H3 | The eight ranges | A grid of 8. Each card has an image slot, the range name, its line from the owner's list, and a link to the range |
| H4 | How it works | The four steps: Design it → See it → We make it → It's delivered. Each step has one line, and the line between them is the orange dieline motif |
| H5 | **Scene 2: "The whole stash"** (scroll scene, §6) | The eight ranges appear one by one as the camera passes them. Each label links to its range |
| H6 | Design Studio teaser | A live 3D cup turning slowly with the Stash S on it, with "Put your logo on it" → `/design`. It loads only when scrolled near and shows a still image on low-end devices |
| H7 | Who we serve | Cafés, restaurants, bakeries, cloud kitchens, retail, and individuals. Six items with icons and one line each |
| H8 | Materials teaser | Kraft, bagasse, paperboard. Only claims the client can back (§9) |
| H9 | Quote call-to-action | "Tell us what you need" → `/quote` |

### 5.2 Packaging (all ranges) and the eight range pages

**Packaging overview:**
- the eight ranges as large tiles with their sub-types listed;
- a search box that filters the tiles by sub-type (for example "pizza" → Fast Food).

**Range page:**

| # | Section | Content |
|---|---|---|
| R1 | Banner | Full-width image (made like MAS's banners, §7) with the range name and its line |
| R2 | Intro | What the range is for, which materials it comes in, and that it can be printed with your brand |
| R3 | **Sub-types** | One card per item in the owner's list. Coffee & Beverage, for example, has: hot cups, cold cups, double-wall cups, ripple cups, lids, sleeves, straws, cup carriers. Each card has an image slot, the name and a one-line use. It also lists typical sizes, material and print options (placeholders until the client sends specs). Buttons: **Design this** (when the studio has the shape) or **Add to quote** |
| R4 | Specs | One clear table per sub-type, using the fields the references show work: capacity in ml and oz, dimensions in mm, material and lining, print options, minimum order, lead time, and matching lids or add-ons. Every value is `placeholder: true` until the client confirms it |
| R5 | Materials for this range | Links into `/materials` |
| R6 | Questions | 3–5 questions specific to the range |
| R7 | Related ranges and the quote call-to-action | Cups lead to carriers and napkins, for example |

**The eight ranges, from the owner's list:**

| Range | Sub-types |
|---|---|
| Coffee & Beverage Packaging | Hot cups, cold cups, double-wall cups, ripple cups, lids, sleeves, straws, cup carriers |
| Fast Food Packaging | Burger boxes, fries cartons, chicken buckets, pizza boxes, sandwich packaging, meal boxes |
| Food Containers & Bowls | Salad bowls, soup cups, kraft containers, compartment trays, takeaway food boxes |
| Bakery & Pastry Packaging | Cake boxes, pastry boxes, cupcake boxes, donut boxes, window cartons, dessert packaging |
| Paper Bags & Carriers | SOS bags, flat-handle bags, twisted-handle bags, delivery bags, premium branded bags |
| Food Wrapping & Paper | Greaseproof paper, burger wraps, sandwich wraps, bakery tissue, food-grade wrapping sheets |
| Sustainable Packaging | Bagasse products, moulded-fibre containers, recyclable packaging, certified compostable options. *The "certified compostable" card, and any card that makes a claim, stays hidden until the client sends the certificate (§9).* |
| Accessories & Tableware | Napkins, cutlery, sauce cups, paper plates, trays, complementary foodservice accessories |

### 5.3 Design Studio (`/design`): the brand's promise, made real

This is a **guided configurator**, not a blank canvas. The `product-configurator-design` skill puts it this way: good defaults, a few meaningful choices, and no dead ends.

**First version: three shapes, chosen because they cover most orders and are simple to model:**
1. **Box:** a takeaway or mailer box. Sizes are presets; custom length × width × height is the escape hatch.
2. **Cup:** single or double wall, in 4, 8, 12 and 16 oz.
3. **Paper bag:** small, medium or large, with a flat or twisted handle.

**The steps (one screen, with a live preview beside them):**

| Step | Choice | Default |
|---|---|---|
| 1 | Shape | Cup |
| 2 | Size | The most common size |
| 3 | Paper colour | Kraft (also white, the Stash brown, beige, pistachio) |
| 4 | Your logo | Upload SVG, PNG or JPG. The browser turns every file into a clean PNG (no more than 2000 px) before it is shown or sent, so an SVG never runs as code. There is also a checkbox: "I have the right to use this logo". Without a logo, the Stash S is shown as a sample |
| 5 | Placement and size | Front face, centred, with sliders for size and position |
| 6 | Print | One-colour ink (the colour picked by the visitor) or full colour |
| 7 | Quantity | Starts empty, with the minimum order shown beside it (placeholder) |
| 8 | Send | **Send this design** opens the quote form with everything filled in. A picture of the 3D preview goes with it |

**How it's built:**
- React Three Fiber, which is already in the stack.
- The shapes are made in code (a box from its dimensions; a cup from its profile, so all sizes are exact; a bag from panels). There are **no paid 3D models**.
- The logo is a decal texture on the surface.
- **Loading:**
  - The studio loads only on `/design`, so the other pages stay light.
  - On low-end devices and with reduced motion, it shows a flat 2D preview of the front face instead of 3D.
- **Storage:** none on our side. The design lives in the browser until it is sent by email (rule 9).
  - Item records go in local storage.
  - Images (the logo PNG and a preview picture about 1200 px wide, as JPEG) go in IndexedDB, because local storage holds only about 5 MB.
- **The preview picture:** captured from the 3D canvas when the visitor presses Send. The canvas keeps its drawing buffer for that.
- **Later versions:** pizza box, burger clamshell, bowls and fries cartons can be added the same way. Every other item goes through "Add to quote" with an optional reference photo.

### 5.4 Quote list and form (`/quote`)

**The quote list:**
- "Add to quote" works like a shopping basket without prices. Items stay in the browser (local storage) while the visitor browses.
- A studio design joins the list as one item, with its picture.

**The form (react-hook-form + zod, Resend, Turnstile and a honeypot, like the other sites):**

| Field | Notes |
|---|---|
| I'm ordering for | A business / Myself. "Myself" hides the business fields |
| Name, phone (WhatsApp), email | Required |
| Business name, business type | Business only |
| Governorate | Dropdown; Egypt only |
| Items | From the list, each with a quantity |
| Printing | Plain / one colour / full colour |
| Artwork | Ready to print / logo only / need design help / no file yet |
| File | The whole send (studio pictures, logos and any file together) stays **under 4 MB**, because the form's server route on Vercel accepts no more than about 4.5 MB. The browser compresses images first. If it's still too big, the form says so and offers WhatsApp for the large file |
| Needed by | Date |
| Notes | Free text |

- On send, the Stash team gets one email with every item, each studio picture, and the original logo as a PNG.
- The visitor gets an auto-reply in their language.
- The recipient address is a placeholder until the client gives one.
- Preview deployments send to our test inbox, never to a live address.
- Sending needs a verified sender domain, so it waits for the domain (§9).

### 5.5 The other pages

| Page | Content |
|---|---|
| How it works | The four steps in detail, then artwork guidance: file types, vector or 300 dpi, the safe area, what a free digital proof is. Then minimum order and lead time (placeholder), and delivery across Egypt |
| Materials | One card per material, with what it is, what it's good for (hot, cold, greasy), how to dispose of it, and which ranges use it. A short glossary: recyclable, compostable, home vs industrial. Badges appear only where the client holds the certificate |
| About | The brand statement, the factory, how Stash works with clients, and the call-to-action. Factory photos and location are placeholders until the client sends them |
| FAQ | About 12 questions, grouped: ordering, artwork, production, delivery |
| Contact | Address, phone, WhatsApp, hours, map, and a short form that goes through the same pipeline as the quote (§5.4). All of it is placeholder until the client confirms it |

**What we learned from the references and won't copy:**
- seven differently worded buttons on one page;
- a quantity pre-filled at 10,000;
- a "Ten steps" list with seven items;
- unverifiable customer counts;
- certification marks without certificates.

Stash uses one button wording across the site: **Get a quote**.

## 6. The two scroll scenes

The method is the one MAS, COVY and Aroma use (the playbook):
- WebCodecs frame engine;
- the splash gate;
- frame index;
- R2 revision folders;
- opaque names (D76).

**No text or logos are ever inside the footage:**
- AI video garbles lettering, so every product in the footage is plain.
- The Stash marks are HTML and SVG laid over the frames, like COVY's etched glass logo (D38).

Both scenes are real camera moves, and they differ from each other (playbook §2.1): one **transforms** the subject, the other **orbits and reveals**.

### Scene 1: `stash.hero`, "Flat to form" (Design → Made)

| Field | Plan |
|---|---|
| Story | You design it, and Stash makes it. A flat sheet becomes a finished box in front of you |
| Start frame | Top-down, close: one flat die-cut kraft sheet (a box blank, its crease lines pressed into the board) lying on the **same light beige plinth** as the end frame. From straight above, only the plinth's top shows. Soft daylight from the left |
| The move | The sheet lifts and folds along its creases into a box, while the camera tilts from straight down to a low three-quarter view and eases back. 10 s |
| End frame | The finished box standing closed on that plinth (`#EDE6D8`) against the brown backdrop (`#5B4537`). Studio light, the same light as the client's cover page. The front face is plain kraft and faces the camera. **The set never changes between the two frames: nothing appears, only the sheet and the camera move** |
| Over the footage | **Beat 1 (0–15% of the scroll):** a thin orange dieline draws itself over the flat sheet, line by line (SVG stroke). This is the "designed by you" moment, and it fades as the folding starts. **Beat 2 (folding):** one short line of copy. **Hold:** the Stash wordmark prints onto the front face (an SVG with a print-reveal mask and a multiply blend, so the kraft texture shows through, like a real print). Then the headline and the two buttons |
| Scroll | 300vh moving + 90vh hold |
| Risk | Paper folding is the hardest motion for video models: panels can bend or melt instead of folding cleanly. **Fallback if the shot fails review:** the same story as a reveal. Start on a macro of the kraft board's fibre and crease, then pull back to the finished box. That is a camera-only move, which models handle reliably. It costs one new keyframe plus one shot, about 965 credits (§8) |

### Scene 2: `stash.range`, "The whole stash" (mid-page)

| Field | Plan |
|---|---|
| Story | Everything a food business needs, from one factory |
| Start frame | Close on the rim and lid of one kraft double-wall cup, shallow focus, on a beige plinth |
| The move | The camera cranes up and back while orbiting about 60° around a precise, architectural arrangement of the whole range on stepped plinths in the brand colours (brown, beige, pistachio, off-white, kraft). 10 s. The arrangement includes: cups and lids, a carrier, a burger box, a fries carton, a pizza box, salad and soup bowls, a bakery window box, paper bags, folded wrap paper, a bagasse tray, napkins and wooden cutlery |
| End frame | The whole arrangement seen from a three-quarter high angle, with room on one side for text |
| Over the footage | A fixed column on the left (on the right in Arabic) lists the eight ranges. As the camera reaches each group, its name lights up with the orange rule and its number (01–08), and each name links to its range page. **Hold:** "Eight ranges. One factory." with **Browse packaging** |
| Scroll | 320vh moving + 90vh hold |
| Note | All products are plain (no logos). The brand shows through the colours, the pattern and the HTML |

**Option B for scene 2 (if the owner prefers):**
- "Made by STASH": a glide along the factory line, from printed sheets through die-cutting and folding to stacked finished cups.
- It shows the factory, which the brand mentions.
- It is riskier: machines tend to come out generic, and lettering on machines would need checking.
- Recommendation: option A.

**Order and checks (playbook §3):**
- For each scene, the end frame is generated first, and the start frame is generated from it, so the materials and light match.
- Every shot goes through the playbook §3.4 checklist before encoding: no lettering, even motion, no morphing, room for the copy, and the last frame matching the plan.
- Scene 2's eight labels are timed to the framing of the approved keyframes and shot. The owner sees that timing at the keyframe review.

**The client's mockups are the style reference.**
- Every keyframe is generated with the presentation's mockup photos as references: the same soft daylight, beige surfaces, brown backdrop and kraft textures.
- That way the scenes and the client's own images look like one shoot.

## 7. Images

Rule 3 still applies: every image is a labelled placeholder slot until it is delivered. Like MAS (D71, D72), I propose we make these with Magnific, each batch with its own cost gate:

| Batch | Images | Size | Expected credits |
|---|---|---|---|
| I1 | The 8 range cards and banners (one 21:9 banner per range, also used as the card crop) | 2K | 8 × 65 = 520 |
| I2 | Inner-page banners: packaging, design, how it works, materials, about, quote, contact, FAQ | 2K | 8 × 65 = 520 |
| I3 | The 45 sub-type photos as **3×3** grids, like COVY's menu (D75), for about 680 px per photo. The card slot is 600 × 600. Each photo is captioned "Illustration" until the client sends real product photos | 2K | 5 × 65 = 325 |

The client's own mockup photos (presentation pp.13–17) can be used as they are, for example on About and the home "who we serve" section, if the owner agrees (like Aroma's photos, D53).

## 8. Generation cost (Magnific, from its own estimator)

Higgsfield has 0.25 credits left, so everything is generated on Magnific, which has 24,556 credits available.

| Step | Settings | Each | Count | Credits |
|---|---|---|---|---|
| Keyframes (start + end, 2 scenes) | Nano Banana 2.1, 2K, 16:9, with the mockups as reference | 65* | 4, plus up to 4 alternates | 260–520 |
| Shots | Kling 3.0, start + end frame, 10 s, **1080p**, no audio | 900 | 2 | 1,800 |
| One retry budget per shot (only if needed, and announced first) | same | 900 | 0–2 | 0–1,800 |
| **Scenes total** | | | | **2,060 typical, 4,120 at most** |
| Scene 1 fallback (only if the fold fails review) | 1 keyframe + 1 shot | | | about 965 |
| Images I1–I3 (§7, separate approval) | | | | 1,365 |

\* 65 is the fixed 2K price we paid before (D71). Today, in auto mode, the estimator said "about 50, variable". We fix the model and 2K, and re-estimate at every gate.

**Why 1080p and not 4K:**
- On Magnific, Kling 3.0 costs 3,800 credits per 4K shot, against 900 at 1080p.
- Upscaling a 10 s clip costs about 4,300.
- Our desktop video is 1920×1080 anyway, so 1080p is native.
- The cost is on mobile: the portrait crop comes out about 25% softer than from a 4K source.
- The 2560 px tier for very wide screens would also be upscaled from 1080p, not native.
- **Option:** the hero alone at 4K, for +2,900 credits. A retry at 4K costs 3,800.

## 9. Content we need from the client

Until these arrive, everything shows as a sample (`placeholder: true`, rule 5). Nothing invented is presented as real.

1. Confirm the primary colour (brown or navy) and the logo rules (§2).
2. Specs per sub-type: sizes, materials, print options, minimum order, lead time.
3. Which materials and certificates they really have (compostable, recyclable, food-contact). No badge appears without one.
4. Address, phone, WhatsApp, email for quotes, hours, and the factory location.
5. Photos of the factory and of real orders, and client logos if they allow it.
6. **The domain:** Stash's own domain, still to come from the client. **Answered (D80):** Stash is a separate brand, not part of MAS, never shown on the MAS site, and not under `mas.com`.
7. The quote inbox on that domain.
8. Analytics: the client creates a GA4 property and a Clarity project for Stash on their own accounts (rule 10).

## 10. Build phases and gates

| Phase | Work | Gate before it starts |
|---|---|---|
| S0 | This plan, its review, and the owner's approval. The owner also decides: the confirmations in §2; the domain and whether Stash is part of MAS (§9 items 6–7); and two new decisions (D77: Magnific instead of Higgsfield for the Stash scenes, superseding rule 4 and D37 for Stash; D78: Stash added to rule 3's image exceptions, for generated images and the client's mockups) | ⛔ Owner approves |
| S1 | Foundation, on a branch and a PR like the earlier sites. It covers: the `apps/stash` app (Next.js, next-intl, tokens, Poppins and Tajawal); the logo, the S and the pattern as SVG; header with mega menu, footer and mobile menu; splash; SEO base; cookie consent with GA4 and Clarity loaded after it (rule 10); every route created as a page from the start, so no link ever 404s; every image slot in `docs/assets/asset-manifest.md`; CLAUDE.md and the docs (D77+); a Vercel project on the same owner account as MAS; and the tests of MAS, COVY and Aroma run before merging, so the live sites don't regress | ⛔ Owner approves the phase |
| S2 | Scene keyframes: extract the mockup photos from the presentation, upload them as references, then end frames first | ⛔ Cost approval: 260–520 credits |
| S2b | Scene shots, then the §3.4 review, encoding (desktop + mobile), R2 and opaque names | ⛔ The owner approves the keyframes; cost approval: 1,800 credits |
| S3 | The home page, with both scenes and every section | ⛔ Owner approves the phase |
| S4 | The Packaging overview and the eight range pages, with the catalogue data in `@mas/content` | ⛔ Owner approves the phase |
| S5 | Design Studio, quote list and quote form (Resend) | ⛔ Owner approves the phase |
| S6 | How it works, Materials, About, FAQ, Contact, Privacy, Terms (which cover the logo uploads) | ⛔ Owner approves the phase |
| S7 | Images I1–I3 | ⛔ Cost approval per batch |
| S8 | SEO and structured data, accessibility, performance, e2e tests, then a preview link for the owner | ⛔ Owner approves the launch |

Every phase ends with a preview link or screenshots for the owner before the next one starts.

**Each phase is checked like the other three sites:**
- every page and the studio in English and Arabic, with full right-to-left layout (rule 7);
- every new image slot listed in the asset manifest (rule 3);
- every form going through the §5.4 pipeline: Resend, Turnstile, honeypot, zod (rule 9);
- lint, typecheck and unit tests;
- e2e tests for the scenes, the splash and the forms;
- a review in a real browser at desktop and phone sizes;
- every review with screenshots before a PR.

## 11. Main risks

| Risk | What we do |
|---|---|
| The fold in scene 1 morphs instead of folding | Review the frames before building. If it fails, use the reveal fallback (§6), and announce any retry's cost first |
| Logos inside AI footage come out garbled | No logos in the footage. The marks are HTML/SVG overlays |
| The studio is the biggest new piece | Three shapes only in the first version, built in code, loaded only on its own page, with a 2D fallback |
| Sustainability claims without proof | Only certified claims are shown, and the rest are labelled samples |
| The form's server route accepts about 4.5 MB | Everything in one send stays under 4 MB after compression in the browser. Bigger files go on WhatsApp, and the form says so |
| Uploaded logos | Turned into PNG in the browser (an SVG never runs), plus a rights checkbox, and covered in the terms |
| A fourth app in a repository with three live sites | A branch and a PR, and the other sites' tests run before every merge |
| Missing client data | Placeholders, clearly labelled, with a list of what's missing on the owner's report |

## 12. Skills used

| Phase | Skills |
|---|---|
| Plan | `information-architecture` (new: sitemap and navigation), `product-configurator-design` (new: the studio), `rpi-plan-critique` (new: independent review of this plan), `brainstorming` |
| Design | `frontend-design`, `build-awwwards-quality-sites`, `audit-ai-design-slop`, `web-design-guidelines`, `shadcn` |
| Motion and 3D | `scroll-scrubbed-visual-sequence`, `gsap-*`, `cinematic-gsap-lenis-motion-system`, `review-animations`, `threejs-react-three-fiber`, `threejs-fundamentals`, `threejs-shaders` |
| Engineering | `vercel-react-best-practices`, `core-web-vitals`, `accessibility`, `security-and-hardening`, `resend` |
| Words and search | `copywriting`, `humanizer`, `no-ai-slop`, `seo-audit`, `ai-seo`, `schema` |

**The three new skills** were found with `find-skills`. I read each one before installing it, and none of them makes network calls:
- **`rpi-plan-critique`** (Microsoft `hve-core`, MIT licence): a structured plan review through four lenses: coverage, evidence, executability and risk.
- **`product-configurator-design`** (rampstackco): how to design a configurator people finish.
- **`information-architecture`** (julianoczkowski/designer-skills, about 6,100 installs): sitemap and navigation.

**Rejected:** the gstack plan-review skills. They need gstack's own tools installed and write a usage log.
