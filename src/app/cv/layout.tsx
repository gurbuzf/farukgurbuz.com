import { StructuredData } from "@/components/seo/structured-data";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "CV — Hydrology, GIS & Remote Sensing",
  description:
    "CV of Faruk Gürbüz: engineer at the Turkish Water Institute (SUEN), formerly DSİ and IIHR–Hydroscience & Engineering; M.Sc. University of Iowa.",
  path: "/cv",
});

export default function CvLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "CV", path: "/cv" }])} />
      {children}
    </>
  );
}
