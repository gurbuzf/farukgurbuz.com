import type { Metadata } from "next";

const TITLE = "Interactive Hydrology Lab — Watershed & Dam Flood Routing Simulator";
const DESCRIPTION =
  "Free interactive hydrology lab by Faruk Gürbüz. Perform D8 watershed delineation, catchment-scale flow routing, Rational Method peak discharge estimation, and level-pool dam flood routing with spillway and orifice discharge simulation.";

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
