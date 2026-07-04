import type { Metadata } from "next";

const TITLE = "Field Notes";
const DESCRIPTION =
  "Notes from the field and the terminal — experiences, opinions, and step-by-step learning roadmaps by Faruk Gürbüz.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/notes" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/notes" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
