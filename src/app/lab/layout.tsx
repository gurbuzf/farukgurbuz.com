import type { Metadata } from "next";

const TITLE = "Hydrology Lab";
const DESCRIPTION =
  "Interactive GIS Lab & Watershed Simulator — D8 steepest descent flow routing, dynamic catchment delineation, Rational Method peak discharge, and synthetic hydrograph modeling.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/lab" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/lab" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
