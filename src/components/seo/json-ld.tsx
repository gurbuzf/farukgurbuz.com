/**
 * Site-wide JSON-LD: Person + WebSite. Page-specific schema (ProfilePage,
 * LearningResource, ScholarlyArticle, breadcrumbs) lives in each route.
 */
import { PERSON_ID, PERSON_NAME, SITE_URL, WEBSITE_ID } from "@/lib/seo";
import { StructuredData } from "./structured-data";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: PERSON_NAME,
  alternateName: "Faruk Gurbuz",
  givenName: "Faruk",
  familyName: "Gürbüz",
  url: SITE_URL,
  image: `${SITE_URL}/images/faruk.jpg`,
  jobTitle: "Water Resources Engineer",
  description:
    "Water Resources Engineer and Geospatial Data Scientist specializing in hydrological modeling, flood forecasting, environmental remote sensing and open-source scientific tools.",
  worksFor: {
    "@type": "GovernmentOrganization",
    name: "Turkish Water Institute (SUEN)",
    url: "https://www.suen.gov.tr",
  },
  address: { "@type": "PostalAddress", addressLocality: "İstanbul", addressCountry: "TR" },
  knowsLanguage: ["tr", "en"],
  knowsAbout: [
    "Hydrology",
    "Water Resources Engineering",
    "Hydrological Modeling",
    "Flood Forecasting",
    "Machine Learning",
    "Geographic Information Systems",
    "Geospatial Data Science",
    "Remote Sensing",
    "Evapotranspiration",
    "Watershed Delineation",
    "Reservoir Flood Routing",
  ],
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of Iowa", url: "https://uiowa.edu" },
    { "@type": "CollegeOrUniversity", name: "Istanbul Technical University", url: "https://www.itu.edu.tr" },
  ],
  sameAs: [
    "https://scholar.google.com/citations?user=CVfKPpUAAAAJ",
    "https://orcid.org/0000-0002-5596-667X",
    "https://github.com/gurbuzf",
    "https://www.linkedin.com/in/faruk-gurbuz",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: PERSON_NAME,
  alternateName: "Faruk Gürbüz — Water Resources Engineer & Geospatial Data Scientist",
  description:
    "Personal website of Faruk Gürbüz: CV, peer-reviewed publications and free interactive hydrology lessons on watershed delineation and dam flood routing.",
  author: { "@id": PERSON_ID },
  publisher: { "@id": PERSON_ID },
  inLanguage: ["en", "tr"],
};

export function JsonLd() {
  return <StructuredData data={[personSchema, websiteSchema]} />;
}
