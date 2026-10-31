# MAS Websites — Project Rules

Three websites in one monorepo:

| App | Domain | What it is |
|---|---|---|
| `apps/mas` | `mas.com` | MAS corporate site (full multi-page site) |
| `apps/covy` | `covy.mas.com` | COVY restaurant & café — single landing page |
| `apps/aroma` | `aroma.mas.com` | Aroma Lounge — single landing page |

`mas.com` is a placeholder until the real domain is confirmed. Read `docs/` before changing anything. `docs/00-decisions.md` is the source of truth for decisions already made with the user.

## Hard rules

1. **No implementation without approval.** Planning docs come first; the user approves each phase before code starts.
2. **Zero new spend.** Use only free tiers or things already paid for (the Higgsfield plan; the Magnific/MAG plan for earlier work). Before any generation, state the expected credit cost and get approval.
3. **Image placeholder rule.** Every image is a visible placeholder box until the graphic designer delivers it (exception: the COVY Spaces photos, which we generate with Higgsfield from the client's interior renders, D39, the COVY Visit photo, cropped from one of them, D42, and the three COVY event photos, made the same way, D46). The box occupies the image's exact layout space and shows its required size in pixels, aspect ratio and slot ID (e.g. `1600 × 1000 · 16:10 · covy.hero.poster`). Use the shared `<ImageSlot>` / `<SequenceSlot>` components; never ship a bare `<img>` with a stock or AI image in an image slot. Every slot is listed in `docs/assets/asset-manifest.md`.
4. **Scroll sequences are generated with Higgsfield** (D37; the earlier ones with MAG), not by the designer. Text, logos and UI are never baked into generated frames; they are HTML/SVG layered on top.
5. **Placeholder content is labelled.** Menu items, prices, testimonials, phone numbers, addresses, hours and social links are dummy data until the client provides real data. Mark each record `placeholder: true`. Never present invented reviews as real.
6. **Brand names:** `COVY` and `Aroma Lounge` (not "CUVY"/"ARUMA").
7. **Bilingual:** English + Arabic with full RTL support in all three sites.
8. **Fonts:** free (Google Fonts / OFL) substitutes only. The brand fonts PassionSans and Telegraf are not licensed for us.
9. **Forms send email only** (no database): Next.js server route → Resend. Recipients: `mas@mas.com`, `covy@mas.com`, `aroma@mas.com`. Guests get an auto-reply. Protect with Cloudflare Turnstile + honeypot + zod validation.
10. **Analytics:** separate GA4 property and Microsoft Clarity project per site, created on the client's Google/Microsoft accounts, loaded only after cookie consent.
11. **Do not put model names in commits, PRs or code comments.**

## Stack

Next.js (App Router, TypeScript strict) · pnpm + Turborepo · Tailwind CSS + shadcn/ui · GSAP (ScrollTrigger, SplitText) + Lenis · React Three Fiber · next-intl · react-hook-form + zod · Resend + React Email · Cloudflare Turnstile · Vitest + Playwright.
Hosting: Vercel Hobby for testing → client's Vercel Pro for production. Scroll-sequence frames: Cloudflare R2 behind `media.mas.com`.
Locales: English at `/`, Arabic at `/ar`; Western digits (0-9) in both.

## Skills to use (installed in `.claude/skills`)

- Motion: `gsap-*`, `scroll-scrubbed-visual-sequence`, `cinematic-gsap-lenis-motion-system`, `review-animations`
- 3D: `threejs-react-three-fiber`, `threejs-shaders`, `threejs-fundamentals`
- Design quality: `build-awwwards-quality-sites`, `frontend-design`, `audit-ai-design-slop`, `web-design-guidelines`, `shadcn`
- Engineering: `vercel-react-best-practices`, `core-web-vitals`, `accessibility`, `security-and-hardening`, `resend`
- Content & SEO: `copywriting`, `humanizer`, `no-ai-slop`, `seo-audit`, `ai-seo`, `schema`
- Discovery: `find-skills` (vet installs, stars and security audits before adding any new skill)
