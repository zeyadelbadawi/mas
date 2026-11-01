# 08 — MAS re-plan (new identity)

**Status:** proposal, waiting for the owner's approval (CLAUDE.md rule 1). Nothing below is implemented yet.

**Once approved, it replaces:**
- the MAS parts of `03-experience-design.md`: §1 motion row, §2 "MAS — Proposal A" and §4.1;
- D2 (palette) and the MAS fonts;
- the MAS rows of `docs/assets/asset-manifest.md`;
- the current MAS demo app: the art-direction board, the "facets" 3D scene, and the crimson sequences.

**It keeps:**
- D13 (pages), D5 (the nine services), D14 (the "Discuss your project" form), D10 (recipients);
- every CLAUDE.md rule.

**Sources:** the client's identity guide `Gold Option.pdf` (12 pages) and `3 logos.pdf` (vector logos, Adobe Illustrator).

## 1. What changed

The client replaced the MAS identity. The owner's brief (2026-11-01):
- **Start MAS from scratch** on the new identity. Forget the old identity, the old MAS demo, and the animation videos made for MAS.
- **Same pages** as agreed (D13).
- **Two scroll scenes on the home page, as before:**
  1. **Hero:** the 8-second video the owner generated.
  2. **"The road with two doors":** the same idea, one door to COVY and one to Aroma Lounge, but done much better than the rejected video.
- **Videos are made with Higgsfield.** The scenes use the same method as COVY and Aroma: WebCodecs engine, splash gate, frame index, R2 revision folders, and text and logos as HTML over the footage (D43, D62).
- **COVY and Aroma are closed.** No changes to them until MAS is done.

**The new identity in one paragraph:** a bold geometric wordmark built from diagonal cuts and interlocking forms ("structure, coordination, confidence, and forward movement"). Its colours are dark gray and champagne gold, with two light greys. All type is Poppins. The guide also has:
- an outline version of the wordmark, drawn in thin gold lines;
- a repeat pattern made from the letters;
- the line "Café & Restaurant Management" followed by a short rule;
- photography: dark restaurant interiors lit in gold, with tall ribbed walls and gold light seams.

**Lines from the guide's social posts that set the voice:**
- "Shaping F&B Destinations"
- "People, Places, Flavors, Performance"
- "Great Food, Better Business"
- "Operational Excellence in Hospitality"
- "F&B Strategy, Management, Growth"

## 2. Goals and non-goals

**Goals**
- A visitor knows within a second that MAS runs restaurants and cafés at a high level: dark, gold, precise. This is the identity's own mood, not a template.
- Two scroll scenes that feel like one film with the rest of the group's sites, and are as smooth as COVY and Aroma (same engine, same splash gate, same checks).
- Every page agreed in D13, in English and Arabic (RTL).
- The two managed brands are one click away and look like what they are: the door to COVY opens on COVY, the door to Aroma opens on Aroma.

**Non-goals**
- No changes to COVY or Aroma Lounge (including shared packages, unless a change is invisible to them and their tests stay green).
- No 3D scene in real time (the old "nine facets" idea is dropped). Motion comes from the two video scenes and from CSS/GSAP.

## 3. Design system

### 3.1 Colour (from the guide)

| Token | Hex | Role |
|---|---|---|
| `--mas-ink` (Dark Gray) | `#1C1B1C` | Main background of the home page and the dark sections; text on light sections |
| `--mas-gold` (Champagne Gold) | `#DDAF52` | Wordmark, lines, buttons, focus rings, the scenes' light |
| `--mas-soft` (Soft Grey) | `#E5E5E5` | Light sections (service details, articles, forms), and light text on dark |
| `--mas-silver` (Silver) | `#D6D6D6` | Borders, dividers and quiet text on dark |

**Contrast:**
- Gold on dark gray is 8.5 : 1, fine for text.
- Gold on soft grey is only about 1.6 : 1. On light sections gold is used only for lines, fills and the wordmark, never for text.
- Buttons are gold with dark gray text.

### 3.2 Type

- **Latin: Poppins** (Google Fonts, OFL). It's the guide's own font, so no substitute is needed (rule 8 is met).
  - Headlines: 600/700, tight tracking, large sizes, mixing bold and light in one line, as the guide does in "COLOR PALETTE" and "FONT USE".
  - Body: 300/400.
  - The tagline: 300 with wide letter-spacing.
- **Arabic: Noto Kufi Arabic** (Google Fonts, OFL).
  - Proposed because its geometric Kufi shapes echo the wordmark's angles and it sits well next to Poppins.
  - It is also different from COVY's Alexandria and Aroma's Readex/El Messiri, so the three sites stay distinct.
  - Other option: IBM Plex Sans Arabic.

### 3.3 The mark and the motif

- **Logos** come from the client's Illustrator file as SVG: gold, dark, light, and the outline version. They are inlined as `<symbol>`s (as on Aroma), so they are sharp at every size and never a picture.
- **The motif is the diagonal cut.** The wordmark's angle (about 51°, to be measured from the file) becomes the one shape the site repeats:
  - section edges cut on that diagonal;
  - reveals that wipe along it;
  - the corner of buttons and cards clipped at it.
- **The gold rule** that ends the tagline becomes the site's line. It draws under headings, marks the active link, and runs through the "how we work" steps.
- **The letter pattern** appears in only two places, as a quiet texture: the footer, and the background of the contact section.

### 3.4 Layout and principles

- **Rhythm:** dark home page with full-bleed scenes; light inner pages (soft grey) for reading, with dark heroes on top.
- **Structure:** a 12-column grid with generous margins. Headings are left-aligned (right-aligned in Arabic), and big numbers are used only for real sequences (the steps and the nine services).
- **One loud thing per screen.** The gold is spent on the wordmark, the lines and one action; everything else stays dark gray and soft grey.
- **Motion is precise and short**, matching the identity's "structure, coordination": `power3.out`, short tight staggers, wipes on the diagonal. No floating, no bounce.
- **Reviewed against generic defaults** (frontend-design):
  - Near-black with one bright accent is a known AI default, but here it is the client's identity, so it stays exactly as given.
  - To keep it from looking generic:
    - the motif is the client's own diagonal, not rounded cards;
    - no uppercase eyebrow labels above every heading (small caps appear only in the wordmark lockup);
    - no "→" arrows on every link;
    - the real photography comes through the two video scenes.

## 4. Pages (D13, unchanged)

Home · About MAS · Services (index + 9 detail pages) · Managed Brands (index + COVY + Aroma Lounge) · Events · Insights (index + article) · Contact ("Discuss your project") · Privacy · Terms. All pages in English at `/` and Arabic at `/ar`.

| Page | Content |
|---|---|
| About | The MAS story; mission in the guide's words (concept, brand strategy, people, operations and management); values; team (placeholders until the client sends them) |
| Services | The nine services (D5) as an ordered list with their numbers. Each detail page: what it is, what the client gets, how it runs (steps), related services, call to action |
| Managed Brands | COVY and Aroma Lounge: what MAS does for each, a few facts, and links to their sites. Each case page uses that brand's own scene posters |
| Events | Events from both brands (shared data; COVY's three are still labelled samples) |
| Insights | Articles (placeholders until the client sends real ones, labelled as such) |
| Contact | The form from D14 / `03-experience-design.md` §6.3, sent to `mas@mas.com` (rule 9), plus the details |

## 5. The home page, top to bottom

| # | Section | What happens | Scroll |
|---|---|---|---|
| M0 | **Splash** (same gate as COVY and Aroma, D62) | Dark gray. The outline wordmark draws itself line by line in gold, then fills with gold from the bottom as the two scenes download and decode. Then the panel lifts off the empty restaurant of the first frame | — |
| M1 | **Hero scene: "From a shell to a restaurant"** | The owner's 8-second video (§6) | ~260vh |
| M2 | Statement | "People. Places. Flavors. Performance." in very large Poppins, each word wiped in along the diagonal. Then one short paragraph on what MAS does | 100vh |
| M3 | The nine services | A numbered list of the nine (01–09). On scroll each row draws its gold rule and its two-line summary opens. Links to the detail pages. A single list in reading order, keyboard-friendly | ~180vh |
| M4 | How we work | Concept → Brand → People → Operations → Growth (from the guide's own sentence), on one gold line that draws through the five steps | 120vh |
| M5 | **Doors scene: "One line, two doors"** | §7 | ~320vh |
| M6 | Events | The next three events from both brands, as cards with diagonal-cut corners | 100vh |
| M7 | Insights | Three latest articles | 80vh |
| M8 | Call to action | "Discuss your project" with the gold button, over the letter pattern | — |

## 6. Hero scene (M1): "From a shell to a restaurant"

**The footage is the owner's 8-second video.**
- The owner said they generated an 8-second video for the hero, but it wasn't attached to the message.
- On the Higgsfield account there is one 8-second video (Seedance 2.5, 31/10, 1280 × 720). It shows an empty dark-stone restaurant shell: floor-plan lines glow and trace the layout, the ribbed walls light up, and then the furniture appears. Its light is **crimson**, the old palette.
- The new guide's cover is the same kind of room lit in **gold**.

The hero will use whichever of these the owner confirms:

| Option | What | Credits |
|---|---|---|
| A | The owner sends the gold 8-second video (the file itself, or its name on Higgsfield) | 0 |
| B | The crimson 31/10 video recoloured to champagne gold, frame by frame (tested on a frame: it works and keeps the light), then upscaled from 720p to 1080p or 4K | 0 for the colour; the upscale price is shown before it runs |
| C | Regenerate the same idea in gold at 4K. The two keyframes are taken from that video (first and last frame, recoloured), so the room stays the same | about 66 (2 images × 3 + one 10-second 4K shot at 60) |

**On scroll:**
- The camera moves slowly into the shell.
- As the gold floor-plan lines trace the layout, the **outline wordmark** (HTML/SVG over the footage, never in the frames, rule 4) draws its own lines in sync.
- When the furniture arrives, the wordmark fills with gold and the tagline writes underneath: "Café & Restaurant Management ——".
- The headline "Shaping F&B destinations" and the "Discuss your project" button come in during the hold on the last frame.

**Phones:** a 4:5 crop around the centre, as on the other two sites.

## 7. Doors scene (M5): "One line, two doors"

**The idea stays the same:** a way forward, and at its end two doors, one to COVY and one to Aroma Lounge.

**What makes it better than the rejected video:**
1. **It is built from the MAS identity itself.**
   - A single thin gold line, the rule from the logo's tagline, is inlaid in a polished dark stone floor.
   - The camera follows it low, between tall dark fins cut on the logo's diagonal, each with a seam of gold light (the guide's ribbed walls).
   - Halfway, the line splits on the logo's own diagonal into two lines (the "interlocking forms" of the mark).
2. **The doors open on the real brands.**
   - Each line ends at a tall doorway framed in brushed gold.
   - Through the left one you see COVY's dining room, the blue caladium mural and the blue tree. Through the right one you see Aroma's lake at golden hour.
   - Both views are made from real frames of those sites' own scenes. Clicking a door lands the visitor on the picture they just saw through it.
3. **The light tells the story.** Everything is dark gray and gold until the end, when COVY's blue and Aroma's warm sun spill out onto the gold floor. It's the only colour on the MAS home page, and it belongs to the brands.

**On scroll:**
- The camera glides along the line, the fins pass, and the line forks.
- The camera stops centred between the two doors.
- During the hold, the two brand logos (HTML) appear above their doors, each with one line and a "Visit COVY" / "Visit Aroma Lounge" link.
- On a computer, hovering a door brightens its light (CSS on the overlay).
- The links are real links with focus states, in reading order, so keyboards and screen readers get the same two choices.

**Phones:** the end frame is composed so both doors fit a 4:5 centre crop.

**How it is made (Higgsfield, same steps as Aroma):**

| Step | What | Credits |
|---|---|---|
| K1 | Start frame: low camera on the dark stone floor, the gold line running ahead between the diagonal fins | 3 per image, about 3–4 tries: ~12 |
| K2 | End frame: the two gold-framed doors at the ends of the two lines, with the COVY view and the Aroma view through them (from those sites' real frames) | ~12 |
| S1 | One 10-second shot, Kling 3.0 at 4K, from K1 to K2 | 60 |
| Reserve | One retry of S1 if it drifts (morphing, a wrong door) | 60, only if needed |

The frames carry no text or logos (rule 4). The video is built into desktop and phone versions with the frame index (D62) and uploaded to R2.

**Fallback if a generated shot can't reach the quality bar:** no new video. The scene becomes two half-screen panels cut on the diagonal, showing the COVY and Aroma scenes' own frames, with the same overlays. 0 credits. Proposed only as a fallback.

## 8. Images (rule 3)

- Every other image on the MAS site stays a visible placeholder with its size and slot ID until the designer delivers it: About, services, articles, team, Open Graph.
- The two scenes are generated (rule 4).
- Option, if the owner wants it before the designer delivers: generate a small set of images in the guide's look (dark rooms, gold light, plated food) for the Open Graph card and the service headers. 3 credits each, listed and approved one by one.

## 9. Credits

| Item | Credits |
|---|---|
| Hero (option A / B / C) | 0 / 0 + upscale / ~66 |
| Doors scene, normal case | ~84 (24 for the frames + 60 for the shot) |
| Doors scene, with one retry | ~144 |
| **Most likely total** | **84 (hero A or B) to 150 (hero C)**; balance now 224.75 |

Each generation is listed with its exact price and approved before it runs (rule 2).

## 10. Phases

| Phase | Work | Check |
|---|---|---|
| M-A | Identity in code: tokens, Poppins and Noto Kufi Arabic, logo SVGs from the client file, the diagonal and rule motifs. Remove the old MAS demo: art-direction board, facets scene, crimson tokens, old sequences | Lint, types, a11y contrast |
| M-B | Scenes: hero (per the owner's choice) and doors (K1, K2, S1), built and uploaded as revision folders | Owner reviews the frames, then the videos |
| M-C | Home page: splash, M1–M8, header and footer, EN and AR | `scenes.spec.ts` extended to MAS (cover, gate, same frame both ways, handoffs, fallback), Lighthouse, 180 KB budget |
| M-D | Inner pages: About, Services and nine details, Managed Brands and two cases, Events, Insights and article, Contact form (Resend, Turnstile, honeypot, zod), Privacy, Terms | e2e, axe, forms, RTL |
| M-E | Review on devices with `?debug=scrub`, PR, owner sign-off | Device runbook (D62) |

Each phase ends in a PR the owner can open on Vercel.

## 11. Decisions for the owner

1. **Hero video:** A (send the gold video), B (recolour the crimson 31/10 video and upscale it) or C (regenerate in gold, ~66 credits)?
2. **Doors scene:** approve "One line, two doors" (§7, ~84 credits, up to ~144 with a retry)?
3. **Arabic font:** Noto Kufi Arabic (proposed) or IBM Plex Sans Arabic?
4. **Images (§8):** placeholders until the designer delivers (default), or generate a small set now?
