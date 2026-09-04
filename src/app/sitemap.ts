import type { MetadataRoute } from "next";

const BASE_URL = "https://farukgurbuz.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE_URL}/lab`, changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE_URL}/cv`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/publications`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
