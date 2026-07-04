export type Lang = "en" | "tr";

export const navLabels = {
  home: { en: "HOME", tr: "ANA SAYFA" },
  notes: { en: "FIELD NOTES", tr: "SAHA NOTLARI" },
  work: { en: "WORK", tr: "İŞLER" },
  cv: { en: "CV", tr: "CV" },
  travels: { en: "TRAVELS", tr: "GEZİLER" },
  pubs: { en: "PUBLICATIONS", tr: "YAYINLAR" },
} as const;

export const sheetLabels = {
  home: { en: "SHEET 01 — HOME", tr: "PAFTA 01 — ANA SAYFA" },
  work: { en: "SHEET 02 — WORK", tr: "PAFTA 02 — İŞLER" },
  cv: { en: "SHEET 03 — CV", tr: "PAFTA 03 — CV" },
  notes: { en: "SHEET 04 — FIELD NOTES", tr: "PAFTA 04 — SAHA NOTLARI" },
  travels: { en: "SHEET 05 — TRAVELS", tr: "PAFTA 05 — GEZİLER" },
  pubs: { en: "SHEET 06 — PUBLICATIONS", tr: "PAFTA 06 — YAYINLAR" },
  note: { en: "SHEET 04.1 — FIELD NOTE", tr: "PAFTA 04.1 — SAHA NOTU" },
  project: { en: "SHEET 02.1 — PROJECT", tr: "PAFTA 02.1 — PROJE" },
  trip: { en: "SHEET 05.1 — TRIP LOG", tr: "PAFTA 05.1 — GEZİ GÜNLÜĞÜ" },
} as const;

export const copy = {
  common: {
    contentPending: { en: "CONTENT: PENDING", tr: "İÇERİK: HAZIRLANIYOR" },
    photosPending: { en: "PHOTOS: PENDING", tr: "FOTOĞRAFLAR: HAZIRLANIYOR" },
  },
  home: {
    legend: { en: "LEGEND — WHO IS MAPPED HERE", tr: "LEJANT — BURADA KİM HARİTALANDI" },
    heroDesc: {
      en: "Every map needs a legend. My legend reads: Water Resources Engineer, Geospatial Data Scientist, and GIS Enthusiast.",
      tr: "Her haritanın bir lejantı vardır. Benim lejantımda ise şu yazıyor: Su Kaynakları Mühendisi, Coğrafi Veri Bilimcisi ve CBS Tutkunu.",
    },
    exploreWork: { en: "Explore the work →", tr: "İşlerimi keşfet →" },
    interactiveCv: { en: "Interactive CV", tr: "İnteraktif CV" },
    layers: { en: "LAYERS", tr: "KATMANLAR" },
    layerWork: { en: "Work — selected projects", tr: "İşler — seçilmiş projeler" },
    layerCv: { en: "CV — interactive timeline", tr: "CV — interaktif zaman çizelgesi" },
    layerNotes: { en: "Field Notes — writing & guides", tr: "Saha Notları — yazılar ve rehberler" },
    layerTravels: { en: "Travels — photo log", tr: "Geziler — fotoğraf günlüğü" },
    layerPubs: { en: "Publications — 9 papers", tr: "Yayınlar — 9 makale" },
    inTheField: { en: "IN THE FIELD", tr: "SAHADA" },
    scaleLabel: { en: "SCALE — ONE CAREER", tr: "ÖLÇEK — BİR KARİYER" },
  },
  work: {
    sheetEyebrow: { en: "SHEET 02 — VECTOR LAYER", tr: "PAFTA 02 — VEKTÖR KATMANI" },
    title: { en: "Selected projects", tr: "Seçilmiş projeler" },
    desc: {
      en: "Open tools and models for water — most start with an idea and end with a decision.",
      tr: "Su için açık kaynaklı araçlar ve modeller — çoğu bir fikirle başlar, bir kararla biter.",
    },
    open: { en: "OPEN →", tr: "AÇ →" },
    back: { en: "BACK TO WORK", tr: "İŞLERE DÖN" },
    emptyDesc: {
      en: "Project details are on the way. Screenshots, write-ups, video demos and embedded maps will appear here.",
      tr: "Proje detayları yolda. Ekran görüntüleri, yazılar, video demolar ve gömülü haritalar burada görünecek.",
    },
    sourceLabel: { en: "SOURCE:", tr: "KAYNAK:" },
    workTag: { en: "WORK", tr: "İŞ" },
  },
  cv: {
    sheetEyebrow: { en: "SHEET 03 — LONGITUDINAL PROFILE", tr: "PAFTA 03 — BOYUNA KESİT" },
    title: { en: "A career you can scroll", tr: "Kaydırılabilir bir kariyer" },
    desc: {
      en: "Follow the channel downstream — 2011 at the source, today at the gauge.",
      tr: "Kanalı akış aşağı doğru takip edin — kaynakta 2011, savakta bugün.",
    },
    download: { en: "Download CV (PDF)", tr: "CV'yi indir (PDF)" },
    skillsHeading: { en: "STATION READINGS — SKILLS", tr: "İSTASYON OKUMALARI — BECERİLER" },
    languagesHeading: { en: "LANGUAGES", tr: "DİLLER" },
    contactHeading: { en: "CONTACT", tr: "İLETİŞİM" },
    sourceMarker: { en: "SOURCE — 2011", tr: "KAYNAK — 2011" },
  },
  notes: {
    sheetEyebrow: { en: "SHEET 04 — ANNOTATIONS", tr: "PAFTA 04 — AÇIKLAMALAR" },
    title: { en: "Field Notes", tr: "Saha Notları" },
    desc: {
      en: "Notes from the field and the terminal — experiences and opinions (NOTE), plus step-by-step learning roadmaps (ROUTE) for people who want to pick these things up.",
      tr: "Sahadan ve terminalden notlar — deneyimler ve görüşler (NOT), ayrıca bunları öğrenmek isteyenler için adım adım yol haritaları (ROTA).",
    },
    read: { en: "READ →", tr: "OKU →" },
    footerNote: {
      en: "These are draft titles waiting for your words — send me the real posts and I'll set them.",
      tr: "Bunlar taslak başlıklar — gerçek yazılarınızı gönderin, ekleyeyim.",
    },
    back: { en: "BACK TO FIELD NOTES", tr: "SAHA NOTLARINA DÖN" },
    emptyDesc: {
      en: "This note hasn't been written yet. Text, images, video and embedded maps will appear here.",
      tr: "Bu not henüz yazılmadı. Metin, görseller, video ve gömülü haritalar burada görünecek.",
    },
    draftLabel: { en: "DRAFT", tr: "TASLAK" },
    draftFieldNotes: { en: "DRAFT · FIELD NOTES", tr: "TASLAK · SAHA NOTLARI" },
  },
  travels: {
    sheetEyebrow: { en: "SHEET 05 — RASTER LAYER", tr: "PAFTA 05 — RASTER KATMANI" },
    title: { en: "Travels", tr: "Geziler" },
    desc: {
      en: "Ground truth. Places the work (and the wandering) has taken me — open a card to see the photo log.",
      tr: "Yer gerçeği. İşimin (ve gezme merakımın) beni götürdüğü yerler — fotoğraf günlüğünü görmek için bir karta tıklayın.",
    },
    view: { en: "VIEW →", tr: "GÖR →" },
    photosSuffix: { en: "PHOTOS", tr: "FOTOĞRAF" },
    logLabel: { en: "LOG", tr: "GÜNLÜK" },
    back: { en: "BACK TO TRAVELS", tr: "GEZİLERE DÖN" },
    emptyDesc: {
      en: "No photos in this log yet. Shots and collages from the trip will appear here.",
      tr: "Bu günlükte henüz fotoğraf yok. Geziden kareler ve kolajlar burada görünecek.",
    },
  },
  pubs: {
    sheetEyebrow: { en: "SHEET 06 — BIBLIOGRAPHY", tr: "PAFTA 06 — KAYNAKÇA" },
    title: { en: "Publications", tr: "Yayınlar" },
    fullRecord: { en: "FULL RECORD:", tr: "TAM KAYIT:" },
  },
  footer: {
    copyright: {
      en: "© 2026 FARUK GÜRBÜZ · SURVEYED IN İSTANBUL · DATUM: WGS84",
      tr: "© 2026 FARUK GÜRBÜZ · İSTANBUL'DA HARİTALANDI · DATUM: WGS84",
    },
    email: { en: "EMAIL", tr: "E-POSTA" },
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
  noteBadge: {
    NOTE: { en: "NOTE", tr: "NOT" },
    ROUTE: { en: "ROUTE", tr: "ROTA" },
  },
};

export function t<K extends { en: string; tr: string }>(field: K, lang: Lang): string {
  return field[lang];
}
