export type Lang = "en" | "tr";

export const navLabels = {
  home: { en: "HOME", tr: "ANA SAYFA" },
  lab: { en: "HYDROLOGY LAB", tr: "HİDROLOJİ LAB" },
  cv: { en: "CV", tr: "CV" },
  pubs: { en: "PUBLICATIONS", tr: "YAYINLAR" },
} as const;

export const sheetLabels = {
  home: { en: "HOME", tr: "ANA SAYFA" },
  lab: { en: "HYDROLOGY LAB", tr: "HİDROLOJİ LAB" },
  cv: { en: "CV", tr: "CV" },
  pubs: { en: "PUBLICATIONS", tr: "YAYINLAR" },
} as const;

export const copy = {
  common: {
    contentPending: { en: "CONTENT: PENDING", tr: "İÇERİK: HAZIRLANIYOR" },
  },
  home: {
    heroEyebrow: {
      en: "WATER RESOURCES & GEOSPATIAL DATA SCIENCE",
      tr: "SU KAYNAKLARI & MEKANSAL VERİ BİLİMİ",
    },
    heroDesc: {
      en: "Water Resources Engineer and Geospatial Data Scientist specializing in hydrological modeling, environmental remote sensing, and open-source scientific tools.",
      tr: "Hidrolojik modelleme, çevresel uzaktan algılama ve açık kaynaklı bilimsel araçlar üzerine uzmanlaşmış Su Kaynakları Mühendisi ve Mekansal Veri Bilimci.",
    },
    viewCv: { en: "Interactive CV →", tr: "İnteraktif CV →" },
    viewPubs: { en: "Publications", tr: "Yayınlar" },
    viewLab: { en: "Hydrology Lab ⚡", tr: "Hidroloji Lab ⚡" },
    scrollToLab: { en: "EXPLORE HYDROLOGY LAB ↓", tr: "HİDROLOJİ LABORATUVARINI KEŞFET ↓" },
    profileRole: {
      en: "Water Resources Engineer · Geospatial Data Scientist",
      tr: "Su Kaynakları Mühendisi · Mekansal Veri Bilimci",
    },
    profileLocation: {
      en: "İSTANBUL, TÜRKİYE",
      tr: "İSTANBUL, TÜRKİYE",
    },
    disciplineData: { en: "DATA", tr: "VERİ" },
    disciplineGis: { en: "GEOSPATIAL / GIS", tr: "CBS" },
    disciplineWater: { en: "WATER RESOURCES", tr: "SU KAYNAKLARI" },
  },
  cv: {
    sheetEyebrow: { en: "PROFESSIONAL PROFILE", tr: "PROFESYONEL PROFİL" },
    title: { en: "A career you can scroll", tr: "Kaydırılabilir bir kariyer" },
    desc: {
      en: "Follow the channel downstream — 2011 at the source, today at the gauge.",
      tr: "Kanalı akış aşağı doğru takip edin — kaynakta 2011, çıkışta bugün.",
    },
    download: { en: "Download CV (PDF)", tr: "CV'yi indir (PDF)" },
    skillsHeading: { en: "SKILLS & EXPERTISE", tr: "BECERİLER & UZMANLIK" },
    languagesHeading: { en: "LANGUAGES", tr: "DİLLER" },
    contactHeading: { en: "CONTACT", tr: "İLETİŞİM" },
    sourceMarker: { en: "CAREER START — 2011", tr: "KARİYER BAŞLANGICI — 2011" },
  },
  pubs: {
    sheetEyebrow: { en: "SCIENTIFIC RECORD", tr: "BİLİMSEL YAYINLAR" },
    title: { en: "Publications", tr: "Yayınlar" },
    fullRecord: { en: "FULL RECORD:", tr: "TAM KAYIT:" },
  },
  footer: {
    copyright: {
      en: "© 2026 FARUK GÜRBÜZ · WATER RESOURCES & GEOSPATIAL DATA SCIENCE",
      tr: "© 2026 FARUK GÜRBÜZ · SU KAYNAKLARI & MEKANSAL VERİ BİLİMİ",
    },
    github: { en: "GITHUB", tr: "GITHUB" },
    linkedin: { en: "LINKEDIN", tr: "LINKEDIN" },
    scholar: { en: "SCHOLAR", tr: "SCHOLAR" },
  },
  cvBadge: {
    WORK: { en: "WORK", tr: "İŞ" },
    FIELD: { en: "FIELD", tr: "SAHA" },
    ROLE: { en: "ROLE", tr: "GÖREV" },
    EDU: { en: "EDU", tr: "EĞİTİM" },
    AWARD: { en: "AWARD", tr: "ÖDÜL" },
  },
};

export function t(field: string | { en: string; tr: string } | undefined, lang: Lang): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field.en;
}
