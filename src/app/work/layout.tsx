import type { Metadata } from "next";

const TITLE = "Work";
const DESCRIPTION =
  "Open tools and models for water — most start with an idea and end with a decision. Selected projects by Faruk Gürbüz.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/work" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/work" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
