import type { Metadata } from "next";

const TITLE = "Publications — Faruk Gürbüz | Hydrology & GIS Research";
const DESCRIPTION = "Peer-reviewed journal articles, conference papers, and thesis publications by Faruk Gürbüz covering hydrology, water resources engineering, geospatial data science, and flood risk analysis.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/publications" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/publications" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function PublicationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
