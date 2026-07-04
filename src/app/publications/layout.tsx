import type { Metadata } from "next";

const TITLE = "Publications";
const DESCRIPTION = "Peer-reviewed papers and research output by Faruk Gürbüz in hydrology and geospatial data science.";

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
