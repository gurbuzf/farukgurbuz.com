import { StructuredData } from "@/components/seo/structured-data";
import { publicationGroups, type Publication } from "@/content/publications";
import { PERSON_ID, PERSON_NAME, SITE_URL, breadcrumbLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Publications — Hydrology & Flood Research",
  description:
    "Peer-reviewed research by Faruk Gürbüz on flood forecasting, machine-learning streamflow prediction, reservoir operation and flood frequency analysis.",
  path: "/publications",
});

const text = (v: Publication["title"]) => (typeof v === "string" ? v : v.en);

function scholarlyLd(p: Publication, kind: string) {
  const type = kind === "BOOK CHAPTER" ? "Chapter" : p.idLabel === "T" ? "Thesis" : "ScholarlyArticle";
  const link = p.doi ? `https://doi.org/${p.doi}` : p.url;
  return {
    "@type": type,
    name: text(p.title),
    headline: text(p.title).slice(0, 110),
    datePublished: p.year,
    author: p.authors.map((a) =>
      a === p.highlightAuthor ? { "@type": "Person", "@id": PERSON_ID, name: PERSON_NAME } : { "@type": "Person", familyName: a, name: a }
    ),
    ...(type === "Chapter"
      ? { isPartOf: { "@type": "Book", name: text(p.venue) } }
      : type === "Thesis"
      ? { inSupportOf: "M.Sc.", sourceOrganization: { "@type": "CollegeOrUniversity", name: "The University of Iowa" } }
      : { isPartOf: { "@type": "Periodical", name: text(p.venue) } }),
    ...(p.doi ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: p.doi } } : {}),
    ...(link ? { url: link, sameAs: link } : {}),
    ...(p.langNote ? { inLanguage: "tr" } : { inLanguage: "en" }),
  };
}

// Published work only (manuscripts under review are listed on the page but not marked up).
const published = publicationGroups
  .filter((g) => g.heading.en !== "IN SUBMISSION")
  .flatMap((g) => g.entries.map((e) => scholarlyLd(e, g.heading.en)));

const publicationsLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/publications#page`,
  url: `${SITE_URL}/publications`,
  name: `Publications — ${PERSON_NAME}`,
  about: { "@id": PERSON_ID },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: published.length,
    itemListElement: published.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
  },
};

export default function PublicationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData
        data={[publicationsLd, breadcrumbLd([{ name: "Home", path: "/" }, { name: "Publications", path: "/publications" }])]}
      />
      {children}
    </>
  );
}
