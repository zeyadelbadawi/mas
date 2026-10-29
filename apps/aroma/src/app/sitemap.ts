import type { MetadataRoute } from "next";
import { sitemapFor } from "@mas/seo";
import { brand } from "@/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapFor(brand, [
    { path: "/", priority: 1 },
    { path: "/privacy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
  ]);
}
