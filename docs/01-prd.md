# PRD — MAS, COVY & Aroma Lounge Websites

## 1. Context

**MAS** is an Egyptian F&B management company. It supports restaurant and café owners from first idea to daily operations: strategy, marketing, people, production, supply and operational control. MAS currently manages two brands:

- **COVY** — a café/restaurant created by the *Sailors Men* team. "The Taste of Everywhere": international cuisine (Mediterranean, Asian, Latin American, Middle-Eastern, Italian) in a surreal blue "sea meets modern design" interior, built around an iconic blue tree. Has indoor, outdoor and shisha areas, a barista bar and a kitchen.
- **Aroma Lounge** — founded 2006 in City Stars, Cairo (1,200 m² incl. a 900 m² terrace). Premium chill-out lounge: "Good food comes from good hearts, we aspire for both." Values: Passion, Diversity, Creativity. Warm, contemporary, fresh.

## 2. Goals

| # | Goal | Measured by |
|---|---|---|
| G1 | MAS looks like a top-tier F&B partner and generates project inquiries | Inquiry form submissions; GA4 `inquiry_submit` |
| G2 | COVY and Aroma Lounge sites turn visits into reservation requests | GA4 `reservation_submit_success` / sessions |
| G3 | A "wow" scroll experience on all three sites that doesn't look AI-generated | Client approval at Milestone A; `audit-ai-design-slop` pass |
| G4 | Fast and accessible on mid-range Egyptian mobile networks | Core Web Vitals "good" (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1); WCAG 2.2 AA |
| G5 | Found in Google and AI answers for brand + "restaurant in Cairo" queries | Search Console impressions; valid JSON-LD |
| G6 | Zero new spend during the build | Only free tiers or already-paid tools used |

## 3. Non-goals

- Online ordering, payments, deposits or e-commerce.
- A real-time table-booking system with availability checks (reservations are *requests* confirmed by phone).
- A CMS or admin dashboard (content lives in the repo).
- User accounts or logins.

## 4. Users

| Persona | Site | Needs |
|---|---|---|
| Restaurant/café owner or investor | MAS | Understand services, see proof (managed brands), contact MAS |
| Guest planning a visit | COVY, Aroma | See the vibe, browse the full menu, book a table or event, find location/hours |
| Guest after a visit | COVY, Aroma | Leave feedback |
| Event organiser / corporate client | COVY, Aroma, MAS | Book private/corporate events; see upcoming events |
| MAS / restaurant staff | Email inbox | Receive clean, complete, actionable request emails |

## 5. Scope

### 5.1 MAS (`mas.com`) — multi-page

| Page | Phase | Purpose |
|---|---|---|
| Home | 1 (Milestone A) | 3D brand story, services overview, managed brands portal, events teaser, CTA |
| About MAS | 2 | Vision, approach, scope of support, team (placeholders) |
| Services | 2 | Index of 9 services + one detail page each |
| Managed Brands | 2 | COVY + Aroma Lounge case pages linking to subdomains |
| Events | 2 | Events from both brands (filter by brand, upcoming/past) |
| Insights | 2 | Article list + article template (MDX in repo) |
| Contact | 2 | "Discuss Your Project" inquiry form, contact details, map |
| Privacy Policy, Terms of Use | 2 | Legal |

**Services (9):** F&B Concept Development · F&B Catering Service · Menu Engineering & Costing · Events Management · Recruitment & Training · Operations & Hospitality Management · Financial Control & Performance · Production, Packaging & Supply · Tools & Quality Assurance.

### 5.2 COVY (`covy.mas.com`) and Aroma Lounge (`aroma.mas.com`) — one landing page each (+ legal pages)

Sections: cinematic hero → story → signature sequence → **full menu experience** → spaces/ambience → events (from shared data) → testimonials (placeholder) → **reservation form** → **feedback form** → location & hours → footer. Plus `/privacy` and `/terms`.

## 6. Functional requirements

### FR-1 Reservation request (COVY, Aroma)

- Types: **Table**, **Birthday**, **Private celebration** (engagement, anniversary…), **Corporate event**, **Full-venue buyout**, **Shisha area**.
- Fields: type, date, time, number of guests, seating preference (indoor / outdoor / no preference), full name, mobile phone, email, special requests; occasion details shown only for event types.
- Rules: no past dates; booking window configurable (default today → +60 days); time slots from the location's opening hours; guests 1–20 for tables, larger ranges for events; groups above the table limit are routed to the event types.
- On submit: email to the restaurant inbox (reply-to = guest) + auto-reply to the guest. The success screen says the request isn't confirmed until the restaurant calls.
- No payment, no availability check.

### FR-2 Feedback (COVY, Aroma)

Overall rating (1–5) + food, service, ambience ratings; visit date; comments; optional name/email/phone ("contact me about my feedback" toggle). Email to the restaurant inbox. No auto-reply unless an email is given and the toggle is on.

### FR-3 Project inquiry (MAS)

See `03-experience-design.md` §6.3. Email to `mas@mas.com` + auto-reply.

### FR-4 Menu (COVY, Aroma)

All categories and items shown on the site; bilingual names/descriptions; price in EGP; dietary tags (vegetarian, spicy, contains nuts…); item image slot; category navigation; search/filter on mobile. No cart.

### FR-5 Events (MAS Events page + teasers on brand sites)

Event = brand, title, date/time, venue, short description, image slot, optional "reserve for this event" link that pre-fills the reservation form.

### FR-6 Bilingual

Every page in `en` and `ar`; language switcher keeps the current page; `hreflang`, `dir="rtl"`, mirrored layouts and motion where direction matters.

### FR-7 Consent, analytics, legal

Cookie banner (Accept all / Reject all / Preferences) before any analytics cookie; GA4 Consent Mode v2 defaults to *denied*; Clarity loads only after analytics consent. Privacy Policy and Terms of Use on all three sites in both languages.

### FR-8 Placeholder system

`<ImageSlot>` / `<SequenceSlot>` render a sized box with dimensions and slot ID; an asset manifest lists every slot for the designer.

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Mobile LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (target 0.05); initial JS ≤ 180 KB gzip per route excluding lazily loaded 3D; sequences stream progressively (budget in `02-architecture.md` §8) |
| Accessibility | WCAG 2.2 AA; full keyboard use; visible focus; `prefers-reduced-motion` gets static, complete pages |
| Security | OWASP Top 10 basics; strict CSP; server-side validation; Turnstile; no secrets in client bundles; security headers |
| SEO | Static HTML for all content; metadata, OG images, sitemap, robots, hreflang; JSON-LD (Organization, Restaurant, Menu, Event, BreadcrumbList) |
| Resilience | Pages fully usable with JS disabled (except forms), WebGL unavailable, slow network or Save-Data |
| Browsers | Last 2 versions of Chrome, Safari (iOS ≥ 16), Firefox, Edge, Samsung Internet |
| Cost | Free tiers only during the build |

## 8. Acceptance criteria — Milestone A (client demo)

1. MAS home, COVY landing and Aroma landing complete in EN and AR, deployed on Vercel preview URLs.
2. At least one MAG-generated scroll sequence per site, plus the real-time 3D scene on MAS home.
3. Reservation and feedback forms deliver emails to test inboxes, including the guest auto-reply.
4. Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 on all three pages.
5. Reduced-motion and no-WebGL fallbacks verified.
6. Every image is an `ImageSlot` placeholder or a designer-delivered asset; the asset manifest is complete.
7. `audit-ai-design-slop` and `review-animations` reviews pass with no blocking findings.
