import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { loadSpecs } from "@/lib/load-specs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kinetiq.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const specs = loadSpecs();

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/components`, changeFrequency: "weekly", priority: 0.9 },
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/docs/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...specs.map((spec) => ({
      url: `${SITE_URL}/docs/${spec.category}/${spec.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
