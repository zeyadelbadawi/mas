import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    "@mas/analytics",
    "@mas/content",
    "@mas/forms",
    "@mas/i18n",
    "@mas/motion",
    "@mas/seo",
    "@mas/three",
    "@mas/ui",
  ],
  turbopack: { root: path.resolve(process.cwd(), "../..") },
  images: { formats: ["image/avif", "image/webp"] },
};

export default withNextIntl(nextConfig);
