import type { Metadata } from "next";

const TITLE = "Travels";
const DESCRIPTION =
  "Ground truth. Places the work — and the wandering — has taken Faruk Gürbüz. A photo log by trip.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/travels" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/travels" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function TravelsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
