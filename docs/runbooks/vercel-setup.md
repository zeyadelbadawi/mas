# Runbook: test deployments on Vercel Hobby

These steps need your accounts, so they are yours to do. Everything here stays on free tiers. Vercel Hobby is for testing only (its terms don't cover commercial use); production moves to the client's Vercel Pro team at handover.

## 1. Create the three Vercel projects

Import the GitHub repo `zeyadelbadawi/mas` three times, once per site:

| Project name | Root Directory | Local port |
|---|---|---|
| `mas-web` | `apps/mas` | 3000 |
| `covy-web` | `apps/covy` | 3001 |
| `aroma-web` | `apps/aroma` | 3002 |

- Framework preset: **Next.js** (detected). Keep the default install and build commands; Vercel installs with pnpm from the repo root because of `pnpm-lock.yaml`.
- Keep "Include files outside the Root Directory" on: the apps import the shared `packages/*`.
- Node.js version: 22.x (matches `.nvmrc`).

## 2. Environment variables (per project)

Copy from each app's `.env.example`. Set them for **Preview** and **Production**.

| Variable | Value | Notes |
|---|---|---|
| `RESEND_API_KEY` | from Resend (step 3) | Sensitive. Sending-only key |
| `MAIL_FROM` | e.g. `COVY <reservations@send.mas.com>` | Must use the domain verified in Resend |
| `MAIL_TO` | `mas@mas.com` / `covy@mas.com` / `aroma@mas.com` | For testing, your own inbox is fine |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | from Cloudflare (step 4) | |
| `TURNSTILE_SECRET_KEY` | from Cloudflare (step 4) | Sensitive. Without it, production forms refuse to send (fail closed) |
| `NEXT_PUBLIC_SITE_URL` | leave empty on Hobby | Set to the real domain on production |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_CLARITY_ID` | empty for now | Added when the client creates the properties |
| `NEXT_PUBLIC_MEDIA_URL` | empty for now | Set when R2 is ready (P2) |
| `SITE_INDEXABLE` | **leave empty** | Only `true` on production at launch. Until then every page is `noindex` |

The form endpoint accepts posts only from its own origin; on Vercel it reads `VERCEL_URL` / `VERCEL_BRANCH_URL` automatically, so previews work without extra settings.

## 3. Resend (form emails)

1. Create a free Resend account (3,000 emails/month, 100/day).
2. Until a domain is verified, Resend only delivers to the account owner's address, which is enough for first tests: set `MAIL_TO` to that address and `MAIL_FROM` to `onboarding@resend.dev`.
3. For real testing, add the sending subdomain `send.mas.com` in Resend and give the DNS records it shows (SPF, DKIM, and a DMARC record on `mas.com`) to whoever manages the client's DNS. Using a subdomain keeps the client's main mail reputation separate.
4. Create an API key with **sending access** only and paste it into `RESEND_API_KEY` in all three projects.

## 4. Cloudflare Turnstile (bot protection)

1. In the Cloudflare dashboard → Turnstile → Add widget, mode **Managed**.
2. Hostnames: the three `*.vercel.app` project domains now; add `mas.com`, `covy.mas.com`, `aroma.mas.com` at launch. One widget for all three sites is fine.
3. Copy the site key and secret into the variables above.

For local development, `.env.example` already holds Cloudflare's always-pass test keys.

## 5. Check a deployment

On each preview URL:

- `/` and `/ar` load, the cookie banner appears, and "Reject all" hides it.
- `/kitchen-sink` (P1 building blocks) and `/art-direction` (P2 board) load. Both switch off automatically at launch, when `SITE_INDEXABLE=true` is set.
- Submit a test reservation (COVY or Aroma) or inquiry (MAS): the team inbox gets the request with a reference like `CV-7K3P`, and the guest address gets the auto-reply.
- `/robots.txt` says `Disallow: /`.

## Later (not needed for P1)

- **Analytics:** the client creates one GA4 property and one Clarity project per site on their own Google/Microsoft accounts and adds you as a user. In Clarity, set masking to **Strict**.
- **Cloudflare R2** for sequence frames behind `media.mas.com` (P2).
- **Production:** transfer the projects to the client's Vercel Pro team, add the domains, set `NEXT_PUBLIC_SITE_URL` and, at launch only, `SITE_INDEXABLE=true`.
