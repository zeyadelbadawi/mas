// Security headers shared by the three apps (architecture §7).
//
// The CSP allows inline scripts: Next.js inlines its hydration data, and the alternative
// (per-request nonces) forces every page to render dynamically, losing static generation.
// Everything else is locked down: no plugins, no framing, no foreign forms, and third-party
// scripts only from GA4, Clarity, Turnstile (and Vercel's toolbar on preview deployments).

const GA = [
  "https://*.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
];
const CLARITY = ["https://www.clarity.ms", "https://*.clarity.ms"];
const TURNSTILE = "https://challenges.cloudflare.com";
const VERCEL_LIVE = "https://vercel.live";

/**
 * @param {{ mediaOrigin?: string | undefined; dev?: boolean; preview?: boolean }} [options]
 * @returns {string}
 */
export function contentSecurityPolicy({ mediaOrigin, dev = false, preview = false } = {}) {
  const media = mediaOrigin ? [new URL(mediaOrigin).origin] : [];
  const live = preview ? [VERCEL_LIVE] : [];
  /** @type {Record<string, string[]>} */
  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(dev ? ["'unsafe-eval'"] : []),
      "https://www.googletagmanager.com",
      ...CLARITY,
      TURNSTILE,
      ...live,
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      ...GA,
      ...CLARITY,
      "https://c.bing.com",
      ...media,
      ...live,
    ],
    "font-src": ["'self'", "data:", ...live],
    "connect-src": [
      "'self'",
      ...GA,
      ...CLARITY,
      TURNSTILE,
      ...media,
      ...live,
      ...(dev ? ["ws:"] : []),
    ],
    "media-src": ["'self'", ...media],
    "frame-src": [TURNSTILE, ...live],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (!dev) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

/**
 * Headers for `next.config` → `headers()`.
 * @param {{ mediaOrigin?: string | undefined }} [options]
 * @returns {{ key: string; value: string }[]}
 */
export function securityHeaders({ mediaOrigin } = {}) {
  const dev = process.env.NODE_ENV === "development";
  const preview = process.env.VERCEL_ENV === "preview";
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy({ mediaOrigin, dev, preview }) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
    // No includeSubDomains: other hosts on the client's domain may not serve HTTPS.
    { key: "Strict-Transport-Security", value: "max-age=63072000" },
  ];
}
