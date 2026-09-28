import { HeroMap } from "@/components/home/hero-map";
import { StructuredData } from "@/components/seo/structured-data";
import { PERSON_ID, PERSON_NAME, SITE_URL, WEBSITE_ID, pageMetadata } from "@/lib/seo";

// Home page.tsx shares the root route segment with layout.tsx, so layout's
// title.template does not apply here — the title is absolute.
export const metadata = pageMetadata({
  title: "Faruk Gürbüz — Water Resources Engineer & Geospatial Data Scientist",
  absoluteTitle: true,
  description:
    "Faruk Gürbüz — water resources engineer and geospatial data scientist in İstanbul. Hydrological modeling, flood forecasting, remote sensing and free hydrology lessons.",
  path: "/",
  type: "profile",
});

const profilePage = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profilepage`,
  url: SITE_URL,
  name: metadata.openGraph?.title,
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: { "@id": PERSON_ID, "@type": "Person", name: PERSON_NAME },
  inLanguage: "en",
};

export default function HomePage() {
  return (
    <>
      <StructuredData data={profilePage} />
      <HeroMap />
    </>
  );
}
