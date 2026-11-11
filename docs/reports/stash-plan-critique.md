<!-- markdownlint-disable-file -->
# RPI Plan Critique: Stash website plan

## Metadata

* Task ID: stash-plan
* Critique date: 2026-11-11
* Plan: docs/09-stash-plan.md
* Critique execution: Complete
* Critique depth: standard
* Depth provenance: default
* Critique type: initial
* Earlier critique: not applicable

## Inputs and Criterion Boundary

* Task context and caller requirements:
  * A multi-page website like MAS (home, about, services, service details…), with its structure derived from the brand files and the three references.
  * Two scroll scenes on the home page, a hero and one mid-page. They must be very impressive and express the brand.
  * The scenes are generated with the connected generation connector (Magnific) and follow the playbook method.
  * The owner approves the plan before implementation starts.
  * The CLAUDE.md hard rules apply.
* Research and evidence considered: CLAUDE.md, docs/playbooks/scroll-animation-playbook.md, docs/08-mas-replan.md, docs/00-decisions.md (D64–D76). Also, as summarised in the brief:
  * the identity PDF and the presentation PDF;
  * the owner's list of eight services;
  * the reference research (Vegware, Yaseen, Huhtamaki);
  * Magnific cost estimates measured today.
* Decisions, dependencies, task Goals, and task Requirements considered: plan §§1–12, phases S0–S8, scenes stash.hero and stash.range, Design Studio, quote flow.
* Assessment boundary: the supplied plan and evidence only. No new research. Claims about the brand files are checked against the plan's own statements and the caller's summary.

## Lens Assessments

| Lens          | Scope        | Reasoning effort and source | Status | Candidates |
|---------------|--------------|-----------------------------|--------|------------|
| Coverage      | Whole plan   | low (selected)              | Partial  | 6 adopted; 1 rejected (reference patterns not tied to pages: a possible improvement, not an error) |
| Evidence      | Whole plan   | medium (selected)           | Complete | 8 adopted (the 10 MB claim was merged into PC-002); 0 rejected |
| Executability | §§5–8, §10   | medium (selected)           | Complete | 7 adopted (several merged); 0 rejected |
| Risk          | Whole plan   | medium (selected)           | Complete | 9 adopted (several merged); 0 rejected |

Lens critics were general-purpose subagents, because `RPI Plan Critic` is not available in this environment. Each one read only the plan and its assigned evidence.

## Coverage Assessment

| ID | Coverage | Evidence or concern |
|---|---|---|
| Multi-page site like MAS (§4–5) | Covered | Home, ranges (service details), about, studio, quote, FAQ, contact, legal |
| Structure from brand files and references (§1–5) | Covered | Brand statement drives the studio; references drive specs and quote flow |
| Two home scenes, hero + mid-page (§6) | Covered | Distinct moves (transform vs orbit-reveal), with an option B |
| Generated with Magnific (§8) | Partial | Conflicts with CLAUDE.md rule 4 / D37 and is not recorded as a decision (PC-005) |
| Playbook method (§6) | Partial | Keyframe order (§3.2) and the review checklist are not cited per scene (PC-006) |
| CLAUDE.md rule 1 (approval per phase) | Partial | Most phases have no owner gate (PC-003) |
| Rule 3 (slots in the asset manifest) | Missing | PC-008 |
| Rule 7 (EN + AR in every phase) | Partial | Only S3 says EN + AR (PC-008) |
| Rule 9 (forms by email) | Partial | Upload limits are wrong; the contact form pipeline is unstated (PC-002) |
| Rule 10 (analytics after consent) | Missing | PC-001 |

## Verdict

* Verdict: Revise
* Rationale:
  * The plan covers the owner's six requests credibly, and its costs are arithmetically correct.
  * Two High findings would make implementation fail or breach a rule: upload limits that the server route cannot accept, and design images that won't fit in local storage.
  * Several hard rules are uncovered: analytics, per-phase approval, the asset manifest, and recording the tool switch.
  * All the fixes are small plan changes.

## Findings

<!-- rpi:critique id=PC-001 -->
### PC-001 [High]: Analytics and cookie consent are missing (rule 10)

* Related IDs: S1, S8, §9
* Evidence: CLAUDE.md rule 10. The plan doesn't mention GA4, Clarity or consent anywhere.
* Concern: No phase creates the analytics properties or the consent banner.
* Impact: The site would launch without analytics, or with analytics that breach the consent rule.
* Smallest useful change:
  * S1: add the consent banner and loaders, as on the other sites.
  * §9: ask the client to create the GA4 and Clarity properties on their accounts.
* Action owner: planning parent
* Exact resolving evidence: The S1 row and §9 list name analytics and consent.
* Decision route: direct planner correction

<!-- rpi:critique id=PC-002 -->
### PC-002 [High]: Upload sizes exceed what the form route can accept, and the send has no total budget

* Related IDs: §5.3 step 4, §5.3 step 8, §5.4 File row, §11
* Evidence:
  * The plan says "Up to 10 MB (the email attachment limit)".
  * Rule 9 sends forms through a Next.js server route on Vercel.
  * Vercel functions accept request bodies of about 4.5 MB at most.
  * The Resend limit (40 MB) is not the binding one.
* Concern: Files of 5–10 MB fail before they reach the email. Several studio designs plus a file have no total cap. The plan also doesn't say whether the original logo file goes to the factory.
* Impact: Failed quote requests, which are the site's main conversion.
* Smallest useful change:
  * Cap one send at about 4 MB in total, compressing or downscaling on the client. For example, make the studio pictures JPEG about 1200 px wide.
  * Attach the original logo while the cap allows; otherwise send it via WhatsApp, and have the form give that reason.
  * State the cap in §5.3, §5.4 and §11.
* Action owner: planning parent
* Exact resolving evidence: The plan states the 4 MB total, the client-side compression, and which files are attached.
* Decision route: direct planner correction

<!-- rpi:critique id=PC-003 -->
### PC-003 [High]: Most phases start without the owner's approval (rule 1)

* Related IDs: §10 S1, S3–S6, S8
* Evidence: CLAUDE.md rule 1 says "the user approves each phase before code starts." Six phases have "—" in the gate column.
* Concern: The owner's approval of the plan is not stated to cover each phase.
* Impact: A breach of a hard rule, and the owner loses review points.
* Smallest useful change: Give every phase a "⛔ Owner approves" gate, with a preview or screenshots at the end of each phase.
* Action owner: planning parent
* Exact resolving evidence: Every row in §10 has an owner gate.
* Decision route: direct planner correction

<!-- rpi:critique id=PC-004 -->
### PC-004 [High]: Local storage cannot hold the studio's images

* Related IDs: §5.3 Storage, §5.4 quote list
* Evidence: localStorage holds about 5 MB per origin, as strings. Designs keep a picture and a logo.
* Concern: One large logo or a few preview pictures go over the quota. Saving then fails and the item is lost.
* Impact: Lost designs, and broken quote lists.
* Smallest useful change: Keep image data in IndexedDB and only the item records in localStorage. Store small thumbnails.
* Action owner: planning parent
* Exact resolving evidence: §5.3 and §5.4 name IndexedDB for images.
* Decision route: direct planner correction

<!-- rpi:critique id=PC-005 -->
### PC-005 [Medium]: The switch to Magnific and the new image exceptions are not recorded as decisions

* Related IDs: §6, §7, §8, S0, S1
* Evidence:
  * CLAUDE.md rule 4 says "generated with Higgsfield (D37)".
  * Rule 3 lists its exceptions per site.
  * The plan says "everything is generated on Magnific".
* Concern: The owner's request justifies the switch, but the project's hard rules still say otherwise.
* Impact: The rulebook and the work disagree, and later sessions will follow the old rule.
* Smallest useful change: List among the S0 confirmations:
  * "Magnific for the Stash scenes and images (supersedes D37 for Stash)";
  * "Stash images and generated photos added to rule 3's exceptions".
* Action owner: user (approve), then planning parent
* Exact resolving evidence: The S0 confirmations list both decisions.
* Decision route: significant user decision

<!-- rpi:critique id=PC-006 -->
### PC-006 [Medium]: Scene 1's frames change the set, and the keyframe order is not stated

* Related IDs: §6 Scene 1, S2
* Evidence:
  * The start frame is on "a smooth brown surface"; the end frame is on "a light beige plinth".
  * Playbook §2.1 says to avoid things appearing.
  * Playbook §3.2 says to generate the end frame first and derive the start frame from it.
* Concern: A plinth that appears mid-shot is a morph the plan doesn't name.
* Impact: A failed shot, which costs 900 credits per retry.
* Smallest useful change:
  * Use the same surface and backdrop in both frames.
  * Generate the end frame first and the start frame from it.
  * Run the playbook §3.4 checklist before encoding.
* Action owner: planning parent
* Exact resolving evidence: §6 shows one set for both frames and cites §3.2 and §3.4.
* Decision route: direct planner correction

<!-- rpi:critique id=PC-007 -->
### PC-007 [Medium]: Stash in the shared repository: whether it belongs, and isolation

* Related IDs: S1, §9 items 6–7
* Evidence:
  * Three live sites deploy from this repository.
  * S1 adds to the shared packages and edits CLAUDE.md.
  * The domain, and whether Stash is part of MAS, are listed only as content questions.
* Concern:
  * Those two answers decide whether Stash belongs in this repository and under this domain.
  * Changes to shared packages can regress the live sites.
  * The Vercel account is not named.
* Impact: Rework, or regressions on live sites.
* Smallest useful change:
  * Make §9 items 6–7 S0 answers.
  * S1 works on a branch and a PR, as the earlier sites did.
  * Run the tests of all three live sites before merging.
  * Name the Vercel account, the same as MAS's.
* Action owner: user (answers), then planning parent
* Exact resolving evidence: S0 lists the two answers, and S1 lists the regression run.
* Decision route: significant user decision

<!-- rpi:critique id=PC-008 -->
### PC-008 [Medium]: Hard-rule coverage gaps: the asset manifest (rule 3), Arabic in every phase (rule 7), and the contact form (rule 9)

* Related IDs: §7, §10 S3–S6, §5.5
* Evidence: CLAUDE.md rules 3, 7 and 9. Only S3 says EN + AR.
* Concern: Stash's slots are not added to docs/assets/asset-manifest.md, the Arabic version is not required in S4–S6, and the contact form's pipeline is unstated.
* Impact: Checks fail, and the work is redone.
* Smallest useful change:
  * One line under "Each phase is checked": EN + AR with RTL in every phase, every slot in the manifest, and every form through the §5.4 pipeline.
* Action owner: planning parent
* Exact resolving evidence: The line exists in §10.
* Decision route: direct planner correction

<!-- rpi:critique id=PC-009 -->
### PC-009 [Medium]: Uploaded SVG logos and third-party marks

* Related IDs: §5.3 step 4
* Evidence: The plan accepts SVG uploads and puts them in emails.
* Concern: An SVG can carry script, and third-party logos raise questions of rights.
* Impact: A security and legal exposure.
* Smallest useful change:
  * Turn every upload into a PNG on the client before it is shown or sent.
  * Add a checkbox: "I have the right to use this logo".
  * Cover uploads in the privacy and terms pages.
* Action owner: planning parent
* Exact resolving evidence: §5.3 states the conversion and the checkbox.
* Decision route: direct planner correction

<!-- rpi:critique id=PC-010 -->
### PC-010 [Medium]: Claims about products and certificates through generated photos and the "certified compostable" card

* Related IDs: §5.2 (Sustainable), §7 I3, rule 5
* Evidence: The owner's list includes "certified compostable options". I3 makes the product photos.
* Concern: Generated product photos and a certification card imply real products and certificates before the client confirms them.
* Impact: A misrepresentation risk.
* Smallest useful change:
  * Mark generated product photos as illustrative.
  * Hide cards that carry claims until a certificate exists, as §9 item 3 already intends.
* Action owner: planning parent
* Exact resolving evidence: §5.2 and §7 state the rule.
* Decision route: direct planner correction

<!-- rpi:critique id=PC-011 -->
### PC-011 [Medium]: The pattern is described from its caption, not from the page

* Related IDs: §2 Pattern
* Evidence:
  * Presentation p.12 repeats the whole STASH wordmark in alternating mirrored rows, all grey.
  * The tissue mockup shows full wordmarks.
  * The caption says "the S… repeated".
* Concern: The SVG pattern asset would be built wrong.
* Impact: Rework.
* Smallest useful change: Describe the pattern as drawn, and add it to the confirmations.
* Action owner: planning parent
* Exact resolving evidence: §2 describes the drawn pattern.
* Decision route: direct planner correction

<!-- rpi:critique id=PC-012 -->
### PC-012 [Medium]: Sub-type photos at about 512 px per cell may be too soft

* Related IDs: §7 I3
* Evidence: A 2K image cut into a 4×4 grid gives cells of about 512 px.
* Concern: That is soft for cards on high-density screens.
* Impact: Weak catalogue images.
* Smallest useful change: Use 3×3 grids (about 680 px per cell). For 45 items that is 5 grids × 65 = 325 credits. State the card slot size.
* Action owner: planning parent
* Exact resolving evidence: §7 I3 states the grid, the cell size and the credits.
* Decision route: direct planner correction

<!-- rpi:critique id=PC-013 -->
### PC-013 [Low]: Demonstrated small errors and unpriced items

* Related IDs: Sources, §2, §5.5, §6, §8
* Evidence:
  * The mockups are on pp.13–17 (5 pages, about 7 photos), not nine pages.
  * The monogram is on p.2, not p.3.
  * Today's image estimate was "50, variable" in auto mode; 65 is the earlier fixed-2K price.
  * "Factory in Cairo" is not stated in the files.
  * The scene 1 fallback (a new keyframe plus a shot, about 965 credits) is not priced.
  * Retries at 4K cost 3,800.
  * The reference images need extracting and uploading in S2.
  * Range links built in S3 return 404 until S4.
  * The 2560 px tier has no 1080p source.
  * The orange logo page is labelled "navy letters" but shows cream letters.
* Concern: Small errors in facts and budget.
* Impact: Low.
* Smallest useful change: Correct each one in place.
* Action owner: planning parent
* Exact resolving evidence: The corrected text.
* Decision route: direct planner correction

## Strengths and Residual Risk

* The plan ties the site's structure to the brand's own promise (the Design Studio) and to concrete patterns from the references.
* The two scenes use different camera moves, keep logos out of the footage, and have a fallback.
* The costs are measured and the arithmetic is correct. The worst case, about 8,300 credits, fits the balance.
* Residual risk accepted by design: Scene 2 lights eight range names over one orbit, so the timing depends on the generated framing. It is checked at the keyframe review.

## Questions or Blocking Evidence Gaps

* The owner's answers on the domain and on whether Stash is part of MAS (PC-007), and on Magnific replacing Higgsfield for Stash (PC-005).

## Limitations

* The findings that come from the reference research rest on the research summary, not on the fetched pages.
* The Vercel and localStorage limits come from platform knowledge, not from files in the repository.

## Recommended Next Action

* Highest-impact finding: PC-002
* Action owner: planning parent
* Smallest next action: revise the plan for PC-001 to PC-013, then send it to the owner with the decisions from PC-005 and PC-007 among the confirmations.
* User response required: yes, for PC-005 and PC-007 (in the owner's approval)
