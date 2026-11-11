import type { MetadataRoute } from "next";
import { stashRanges } from "@mas/content";
import { sitemapFor } from "@mas/seo";
import { brand } from "@/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapFor(brand, [
    { path: "/", priority: 1 },
    { path: "/packaging", priority: 0.9 },
    ...stashRanges.map((r) => ({ path: `/packaging/${r.slug}`, priority: 0.8 })),
    { path: "/design", priority: 0.8 },
    { path: "/how-it-works", priority: 0.7 },
    { path: "/materials", priority: 0.6 },
    { path: "/about", priority: 0.6 },
    { path: "/quote", priority: 0.9 },
    { path: "/faq", priority: 0.5 },
    { path: "/contact", priority: 0.7 },
    { path: "/privacy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
  ]);
}
