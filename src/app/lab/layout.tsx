import { StructuredData } from "@/components/seo/structured-data";
import { PERSON_ID, SITE_URL, breadcrumbLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Hydrology Lab: Watershed & Flood Routing Lessons",
  description:
    "Free interactive hydrology lessons: D8 flow direction, flow accumulation, watershed delineation, the Rational Method and reservoir flood routing, step by step.",
  path: "/lab",
  image: { url: "/lab/opengraph-image", alt: "Hydrology Lab — interactive lessons on watersheds and dam flood routing" },
});

const common = {
  "@type": "LearningResource",
  learningResourceType: ["Interactive simulation", "Tutorial"],
  educationalLevel: "Undergraduate",
  audience: { "@type": "EducationalAudience", educationalRole: "student" },
  isAccessibleForFree: true,
  inLanguage: ["en", "tr"],
  author: { "@id": PERSON_ID },
  provider: { "@id": PERSON_ID },
};

const labLd = {
  "@context": "https://schema.org",
  ...common,
  "@id": `${SITE_URL}/lab#lessons`,
  name: "Hydrology Lab — interactive lessons on watersheds and dam flood routing",
  description:
    "Two guided, interactive hydrology lessons. Each chapter explains one concept, lets the learner change one parameter and shows the cause and effect.",
  url: `${SITE_URL}/lab`,
  about: ["Hydrology", "Watershed", "Flood routing", "Reservoir", "Geographic Information Systems"],
  hasPart: [
    {
      ...common,
      name: "Where does the rain go? — Watershed delineation",
      url: `${SITE_URL}/lab#watershed`,
      teaches: [
        "Digital elevation models (DEM)",
        "D8 flow direction",
        "Flow paths and drainage divides",
        "Flow accumulation and stream networks",
        "Watershed (catchment) delineation",
        "Peak discharge with the Rational Method (Q = CIA/3.6)",
      ],
      timeRequired: "PT20M",
    },
    {
      ...common,
      name: "How does a dam tame a flood? — Reservoir flood routing",
      url: `${SITE_URL}/lab#dam`,
      teaches: [
        "Flood hydrographs and flood volume",
        "Reservoir continuity equation (dS/dt = I − Q)",
        "Stage–discharge relations of bottom outlets and spillways",
        "Level-pool reservoir routing solved with the Runge–Kutta (RK4) method",
        "Peak attenuation, lag time and freeboard",
      ],
      timeRequired: "PT25M",
    },
  ],
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={[labLd, breadcrumbLd([{ name: "Home", path: "/" }, { name: "Hydrology Lab", path: "/lab" }])]} />
      {children}
    </>
  );
}
