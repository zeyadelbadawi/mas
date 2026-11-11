import type { MetadataRoute } from "next";
import { robotsFor } from "@mas/seo";
import { brand } from "@/site";

export default function robots(): MetadataRoute.Robots {
  return robotsFor(brand);
}
