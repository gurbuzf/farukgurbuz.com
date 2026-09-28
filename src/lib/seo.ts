import type { Metadata } from "next";

export const SITE_URL = "https://farukgurbuz.com";
export const PERSON_NAME = "Faruk Gürbüz";
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Faruk Gürbüz — Water Resources Engineer & Geospatial Data Scientist",
};

/**
 * Page metadata with the shared Open Graph / Twitter fields filled in.
 *
 * Next.js merges metadata shallowly: a page that sets `openGraph` replaces the
 * root layout's `openGraph` entirely (site name, locale, image are lost). Every
 * page therefore builds its metadata through this helper.
 */
export function pageMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  /** true = use the title as-is, without the "| Faruk Gürbüz" template */
  absoluteTitle?: boolean;
  description: string;
  path: string;
  /** Route-specific OG image (defaults to the site image) */
  image?: { url: string; alt: string };
  type?: "website" | "profile";
}): Metadata {
  const ogImage = image ? { ...DEFAULT_OG_IMAGE, ...image } : DEFAULT_OG_IMAGE;
  const fullTitle = absoluteTitle ? title : `${title} | ${PERSON_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: PERSON_NAME,
      locale: "en_US",
      alternateLocale: ["tr_TR"],
      type,
      images: [ogImage],
      ...(type === "profile" ? { firstName: "Faruk", lastName: "Gürbüz", username: "gurbuzf" } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}
