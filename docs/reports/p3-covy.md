# P3 report: COVY landing

Live preview: https://mas-covy.vercel.app (English) and https://mas-covy.vercel.app/ar (Arabic).

## What's on the page

C1 hero (scroll walk from the facade to the blue tree, real COVY logo at the end) · C2 story (brand guide's own words) · C3 signature cup with timed labels · C4 "The Taste of Everywhere" leaf ring and five kitchens · C5 full sample menu (11 sections, 51 dishes, search in both languages, filters, sticky section bar) · C6 spaces · C7 events (booking links prefill the form) · C8 labelled sample reviews · C9 booking and feedback · C10 visit details.

## Results

| Check | English | Arabic | Target |
|---|---|---|---|
| Lighthouse Performance (mobile, live Vercel) | 85 | 87 | ≥ 85 |
| Lighthouse Accessibility | 100 | 100 | ≥ 95 |
| Lighthouse Best Practices | 100 | 100 | ≥ 95 |
| Lighthouse SEO (with launch settings) | 100 | 100 | ≥ 95 |
| LCP / CLS (live) | 2.4 s / 0 | 2.1 s / 0.024 | — |
| Initial JavaScript | 174 KB | 174 KB | ≤ 180 KB (D29) |
| axe (WCAG 2.1 AA, serious/critical) | 0 | 0 | 0 |

SEO shows 61 on the preview on purpose: every page is `noindex` until `SITE_INDEXABLE=true` at launch.

## Reviews

An independent `audit-ai-design-slop` + `review-animations` pass found no generic-template patterns and one blocking bug (the menu's section bar did not track the current section in Arabic), plus contrast and layering issues on phones. All blocking and minor findings were fixed; e2e tests now cover the menu filters, event prefill, the cookie banner and accessibility.

## Interim and open items

- **Logo:** traced from the vector artwork in the COVY brand guide (D31). Replace with the official SVG files from the brand designer.
- **Sequences:** the approved 1080p Kling 3.0 drafts are encoded at full size (hero pace-matched across the two shots). They go live when R2 is set up (`docs/runbooks/r2-setup.md`); until then the page plays the 960×540 previews.
- **Content:** menu, prices, events, reviews, address, hours and phone are labelled samples until the client sends the real data (P7).
