import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getProjectSlugs } from "@/lib/projects";
import { siteUrl, staticRoutes } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${siteUrl}/${locale}${route === "/" ? "" : route}`,
        changeFrequency: route === "/" ? "weekly" : "monthly",
        priority: route === "/" ? 1 : 0.7,
      });
    }

    for (const slug of getProjectSlugs(locale)) {
      entries.push({
        url: `${siteUrl}/${locale}/proyectos/${slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
