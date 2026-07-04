import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { notes } from "@/content/notes";
import { trips } from "@/content/trips";

const BASE_URL = "https://farukgurbuz.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/work`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/cv`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/notes`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/travels`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/publications`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE_URL}/work/${p.id}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  const noteRoutes: MetadataRoute.Sitemap = notes.map((n) => ({
    url: `${BASE_URL}/notes/${n.id}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  const tripRoutes: MetadataRoute.Sitemap = trips.map((tr) => ({
    url: `${BASE_URL}/travels/${tr.id}`,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...projectRoutes, ...noteRoutes, ...tripRoutes];
}
