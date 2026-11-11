import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { securityHeaders } from "@mas/config/next/security";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Project rules live in the root CLAUDE.md; don't let `next dev` write AGENTS.md files.
  agentRules: false,
  // Stash is a separate brand (D80): its consent cookie has a neutral name.
  env: { NEXT_PUBLIC_CONSENT_COOKIE: "consent" },
  transpilePackages: [
    "@mas/analytics",
    "@mas/content",
    "@mas/forms",
    "@mas/i18n",
    "@mas/seo",
    "@mas/ui",
  ],
  turbopack: { root: path.resolve(process.cwd(), "../..") },
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({ mediaOrigin: process.env.NEXT_PUBLIC_MEDIA_URL }),
      },
    ];
  },
};

export default withNextIntl(nextConfig);
