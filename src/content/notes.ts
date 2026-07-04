import type { FieldNote } from "./types";

export const notes: FieldNote[] = [
  {
    id: "gis-roadmap",
    kind: "ROUTE",
    title: {
      en: "So you want to learn GIS: a QGIS → Python → PyQGIS roadmap",
      tr: "CBS öğrenmek mi istiyorsun: QGIS → Python → PyQGIS yol haritası",
    },
    desc: {
      en: "The exact path I'd take today: start clicking in QGIS, automate with Python, then write your own plugins. With free datasets to practice on.",
      tr: "Bugün olsam izleyeceğim yol: önce QGIS'te tıklayarak başla, sonra Python ile otomatikleştir, en sonunda kendi eklentilerini yaz. Üstüne pratik yapabileceğin ücretsiz veri setleriyle birlikte.",
    },
    tags: [
      { en: "GIS", tr: "CBS" },
      { en: "LEARNING", tr: "ÖĞRENME" },
    ],
    blocks: [],
  },
  {
    id: "early-warning",
    kind: "NOTE",
    title: {
      en: "What building a national flood early warning system taught me",
      tr: "Ulusal bir taşkın erken uyarı sistemi kurmak bana ne öğretti",
    },
    desc: {
      en: "Three years at DSİ coordinating observation-based early warning across a whole country — what worked, what surprised me, and why the hard part isn't the hydrology.",
      tr: "DSİ'de gözleme dayalı erken uyarıyı tüm ülke genelinde koordine ettiğim üç yıl — neyin işe yaradığı, beni neyin şaşırttığı ve asıl zor kısmın neden hidroloji olmadığı.",
    },
    tags: [
      { en: "FLOODS", tr: "SELLER" },
      { en: "CAREER", tr: "KARİYER" },
    ],
    blocks: [],
  },
  {
    id: "gee-30-days",
    kind: "ROUTE",
    title: { en: "Google Earth Engine in 30 days", tr: "30 günde Google Earth Engine" },
    desc: {
      en: "A month-long plan to go from zero to producing evapotranspiration and land-cover analyses — the datasets, the gotchas, and when not to use GEE at all.",
      tr: "Sıfırdan başlayıp evapotranspirasyon ve arazi örtüsü analizleri üretmeye kadar giden bir aylık plan — veri setleri, karşına çıkacak tuzaklar ve GEE'yi hiç kullanmaman gereken durumlar.",
    },
    tags: [
      { en: "REMOTE SENSING", tr: "UZAKTAN ALGILAMA" },
      { en: "LEARNING", tr: "ÖĞRENME" },
    ],
    blocks: [],
  },
  {
    id: "bozkurt-flood",
    kind: "NOTE",
    title: {
      en: "Field notes from the 2021 Bozkurt flood",
      tr: "2021 Bozkurt selinden saha notları",
    },
    desc: {
      en: "Walking a floodplain weeks after a historic disaster: what damaged structures, sediment and debris lines tell you that no model output can.",
      tr: "Tarihi bir felaketten haftalar sonra bir taşkın ovasında yürümek: hasar gören yapıların, sediman ve moloz izlerinin hiçbir model çıktısının anlatamayacağı şeyleri anlatması.",
    },
    tags: [
      { en: "FIELDWORK", tr: "SAHA ÇALIŞMASI" },
      { en: "FLOODS", tr: "SELLER" },
    ],
    blocks: [],
  },
  {
    id: "python-water",
    kind: "ROUTE",
    title: {
      en: "From hydrographs to dataframes: Python for water engineers",
      tr: "Hidrograftan veri çerçevesine: su mühendisleri için Python",
    },
    desc: {
      en: "A practical on-ramp for engineers who live in Excel — pandas for time series, Matplotlib for publication figures, and your first automated report.",
      tr: "Hayatı Excel'de geçen mühendisler için pratik bir giriş — zaman serileri için pandas, yayın kalitesinde grafikler için Matplotlib ve ilk otomatik raporun.",
    },
    tags: [
      { en: "PYTHON", tr: "PYTHON" },
      { en: "LEARNING", tr: "ÖĞRENME" },
    ],
    blocks: [],
  },
  {
    id: "water-diplomacy",
    kind: "NOTE",
    title: { en: "Water diplomacy, up close", tr: "Yakından su diplomasisi" },
    desc: {
      en: "Ten days with the German Federal Foreign Office on transboundary rivers — how engineers and diplomats talk past each other, and where the data actually helps.",
      tr: "Almanya Federal Dışişleri Bakanlığı ile sınıraşan nehirler üzerine geçirdiğim on gün — mühendislerle diplomatların birbirini nasıl anlamadığı ve verinin gerçekten nerede işe yaradığı.",
    },
    tags: [
      { en: "POLICY", tr: "POLİTİKA" },
      { en: "TRAVEL", tr: "SEYAHAT" },
    ],
    blocks: [],
  },
];

export function findNote(id: string) {
  return notes.find((n) => n.id === id) ?? null;
}
