import type { MetadataRoute } from "next";
import { insights, masServices } from "@mas/content";
import { sitemapFor } from "@mas/seo";
import { brand } from "@/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapFor(brand, [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/services", priority: 0.9 },
    ...masServices.map((s) => ({ path: `/services/${s.slug}`, priority: 0.7 })),
    { path: "/brands", priority: 0.8 },
    { path: "/brands/covy", priority: 0.6 },
    { path: "/brands/aroma", priority: 0.6 },
    { path: "/events", priority: 0.6 },
    { path: "/insights", priority: 0.6 },
    ...insights.map((i) => ({
      path: `/insights/${i.slug}`,
      priority: 0.6,
      lastModified: i.publishedAt,
    })),
    { path: "/contact", priority: 0.9 },
    { path: "/privacy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
  ]);
}
