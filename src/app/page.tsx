import type { Metadata } from "next";
import { HeroMap } from "@/components/home/hero-map";

// Home page.tsx shares the root route segment with layout.tsx, so layout's
// title.template does not apply here (Next.js only applies templates to
// child segments) — write the templated form explicitly for this one page.
const TITLE = "Faruk Gürbüz — Water Resources Engineer & Geospatial Data Scientist";
const OG_TITLE = "Faruk Gürbüz — Water Resources Engineer & Geospatial Data Scientist";
const DESCRIPTION =
  "Faruk Gürbüz is a Water Resources Engineer and Geospatial Data Scientist. Explore interactive hydrology simulations, GIS-based watershed analysis, dam flood routing tools, and peer-reviewed research.";

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
