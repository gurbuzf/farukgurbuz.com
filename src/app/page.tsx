import type { Metadata } from "next";
import { HeroMap } from "@/components/home/hero-map";

// Home page.tsx shares the root route segment with layout.tsx, so layout's
// title.template does not apply here (Next.js only applies templates to
// child segments) — write the templated form explicitly for this one page.
const TITLE = "Home | Faruk Gürbüz";
const OG_TITLE = "Home";
const DESCRIPTION =
  "Every map needs a legend. Faruk Gürbüz is a Water Resources Engineer, Geospatial Data Scientist, and GIS Enthusiast.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: OG_TITLE, description: DESCRIPTION, url: "/" },
  twitter: { title: OG_TITLE, description: DESCRIPTION },
};

export default function HomePage() {
  return <HeroMap />;
}
