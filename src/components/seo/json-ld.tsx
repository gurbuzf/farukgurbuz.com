/**
 * Global JSON-LD structured data for search engines and AI.
 * Renders Person + WebSite schema.org markup so Google can show
 * rich knowledge-panel cards and sitelinks for "Faruk Gürbüz".
 */

const BASE_URL = "https://farukgurbuz.com";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${BASE_URL}/#person`,
  name: "Faruk Gürbüz",
  alternateName: "Faruk Gurbuz",
  url: BASE_URL,
  image: `${BASE_URL}/images/faruk.jpg`,
  jobTitle: "Water Resources Engineer",
  description:
    "Water Resources Engineer and Geospatial Data Scientist specializing in hydrological modeling, GIS-based watershed analysis, dam flood routing, and open-source hydrology tools.",
  knowsAbout: [
    "Hydrology",
    "Water Resources Engineering",
    "GIS",
    "Geospatial Data Science",
    "Watershed Delineation",
    "Dam Flood Routing",
    "Remote Sensing",
    "Hydrological Modeling",
  ],
  sameAs: [
    "https://scholar.google.com/citations?user=CVfKPpUAAAAJ",
    "https://orcid.org/0000-0002-5596-667X",
    "https://github.com/gurbuzf",
    "https://www.linkedin.com/in/faruk-gurbuz",
  ],
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "University of Iowa",
      url: "https://www.uiowa.edu",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Middle East Technical University",
      url: "https://www.metu.edu.tr",
    },
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "Faruk Gürbüz — Water Resources Engineer & Geospatial Data Scientist",
  description:
    "Personal website of Faruk Gürbüz featuring interactive hydrology simulations, GIS tools, watershed delineation, dam flood routing, and peer-reviewed publications.",
  author: { "@id": `${BASE_URL}/#person` },
  publisher: { "@id": `${BASE_URL}/#person` },
  inLanguage: ["en", "tr"],
};

export function JsonLd() {
  const payload = JSON.stringify([personSchema, websiteSchema]).replace(
    /</g,
    "\\u003c"
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
