import type { Metadata } from "next";

const TITLE = "CV";
const DESCRIPTION = "Follow the channel downstream — 2011 at the source, today at the gauge. The career of Faruk Gürbüz.";

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
