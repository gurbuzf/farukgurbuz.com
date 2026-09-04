import type { Metadata } from "next";

const TITLE = "CV — Faruk Gürbüz | Water Resources Engineer & GIS Specialist";
const DESCRIPTION = "Academic and professional curriculum vitae of Faruk Gürbüz — Water Resources Engineer, Geospatial Data Scientist, and GIS specialist with experience in hydrological modeling, remote sensing, and flood risk analysis.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/cv" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/cv" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function CvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
