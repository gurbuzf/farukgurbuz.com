import type { Bilingual } from "./types";

export type BadgeColor = "acc" | "field" | "role" | "contour" | "gold";

export type TimelineEntry = {
  kind: "WORK" | "FIELD" | "ROLE" | "EDU" | "AWARD";
  badge: BadgeColor;
  emphasized: boolean;
  meta: Bilingual;
  title?: Bilingual;
  bullets?: Bilingual[];
  text?: Bilingual;
};

export const timeline: TimelineEntry[] = [
  {
    kind: "WORK",
    badge: "acc",
    emphasized: true,
    meta: { en: "JAN 2024 — PRESENT · İSTANBUL", tr: "OCA 2024 — GÜNÜMÜZ · İSTANBUL" },
    title: {
      en: "Engineer — Turkish Water Institute (SUEN)",
      tr: "Mühendis — Türkiye Su Enstitüsü (SUEN)",
    },
    bullets: [
      {
        en: "Remote sensing for hydrological & agricultural analysis; WaPOR-based evapotranspiration assessments",
        tr: "Hidrolojik ve tarımsal analizler için uzaktan algılama; WaPOR tabanlı evapotranspirasyon değerlendirmeleri",
      },
      {
        en: "Scalable geospatial workflows on high-volume datasets with open-source tooling",
        tr: "Açık kaynaklı araçlarla yüksek hacimli veri setleri üzerinde ölçeklenebilir jeo-uzamsal iş akışları kurdu",
      },
      {
        en: "Environmental GIS vector datasets; print-quality scientific maps and visualizations",
        tr: "Çevresel CBS vektör veri setleri hazırladı; baskı kalitesinde bilimsel harita ve görselleştirmeler üretti",
      },
      {
        en: "Editorial review of two publications; UX/UI prototyping for an institutional academy platform in Figma",
        tr: "İki yayının editöryel incelemesini yaptı; kurumsal bir akademi platformu için Figma'da UX/UI prototipleme gerçekleştirdi",
      },
    ],
  },
  {
    kind: "FIELD",
    badge: "field",
    emphasized: false,
    meta: { en: "APR 2024 · BERLIN → BONN → THE HAGUE", tr: "NİS 2024 · BERLİN → BONN → LAHEY" },
    text: {
      en: "Executive Seminar on Water Diplomacy — German Federal Foreign Office; transboundary basins, negotiation in data-scarce regions",
      tr: "Su Diplomasisi Üst Düzey Semineri — Almanya Federal Dışişleri Bakanlığı; sınıraşan havzalar, veri kıtlığı yaşanan bölgelerde müzakere",
    },
  },
  {
    kind: "ROLE",
    badge: "role",
    emphasized: false,
    meta: { en: "SEP 2022 — SEP 2023", tr: "EYL 2022 — EYL 2023" },
    text: {
      en: "Hydrological Advisor of Türkiye at the World Meteorological Organization (WMO)",
      tr: "Dünya Meteoroloji Örgütü (WMO) nezdinde Türkiye Hidroloji Danışmanı",
    },
  },
  {
    kind: "WORK",
    badge: "acc",
    emphasized: true,
    meta: { en: "FEB 2021 — DEC 2023 · ANKARA", tr: "ŞUB 2021 — ARA 2023 · ANKARA" },
    title: {
      en: "Engineer — Turkish State Hydraulic Works (DSİ)",
      tr: "Mühendis — Devlet Su İşleri (DSİ)",
    },
    bullets: [
      {
        en: "Coordinated nationwide studies for an observation-based flood early warning system",
        tr: "Gözleme dayalı taşkın erken uyarı sistemi için ülke genelindeki çalışmaları koordine etti",
      },
      {
        en: "GIS spatial analysis supporting national streamflow monitoring; routine reporting lead",
        tr: "Ulusal akarsu gözlem ağını destekleyen CBS mekansal analizlerini yürüttü; rutin raporlamanın sorumluluğunu üstlendi",
      },
      {
        en: "Custom tools for data parsing, watershed delineation and geomorphological analysis",
        tr: "Veri ayrıştırma, havza sınırlandırma ve jeomorfolojik analiz için özel araçlar geliştirdi",
      },
      {
        en: "Workshops & technical talks on hydrological modeling, flood early warning and GIS",
        tr: "Hidrolojik modelleme, taşkın erken uyarı ve CBS üzerine çalıştaylar ve teknik sunumlar verdi",
      },
    ],
  },
  {
    kind: "FIELD",
    badge: "field",
    emphasized: false,
    meta: { en: "AUG — SEP 2021 · BOZKURT, KASTAMONU", tr: "AĞU — EYL 2021 · BOZKURT, KASTAMONU" },
    text: {
      en: "Post-disaster field survey after the historic Bozkurt flood — damaged hydraulic structures, floodplain change, sediment transport",
      tr: "Tarihi Bozkurt selinin ardından afet sonrası saha incelemesi — hasar gören hidrolik yapılar, taşkın ovasındaki değişim, sediman taşınımı",
    },
  },
  {
    kind: "WORK",
    badge: "acc",
    emphasized: true,
    meta: { en: "JAN 2019 — FEB 2021 · IOWA CITY, USA", tr: "OCA 2019 — ŞUB 2021 · IOWA CITY, ABD" },
    title: {
      en: "Research Assistant — IIHR Hydroscience & Engineering, University of Iowa",
      tr: "Araştırma Görevlisi — IIHR Hydroscience & Engineering, Iowa Üniversitesi",
    },
    bullets: [
      {
        en: "Hydrological modeling for flood prediction — physically based and data-driven",
        tr: "Taşkın tahmini için hidrolojik modelleme yaptı — fiziksel temelli ve veri odaklı yaklaşımlarla",
      },
      {
        en: "Developed and validated AI models for flood forecasting",
        tr: "Taşkın tahmini için yapay zeka modelleri geliştirdi ve doğruladı",
      },
      {
        en: "Large-scale geospatial processing and model evaluation on HPC clusters",
        tr: "Yüksek performanslı hesaplama (HPC) kümelerinde büyük ölçekli jeo-uzamsal işleme ve model değerlendirmesi yaptı",
      },
      {
        en: "Reproducible statistical workflows for hydrological and climatic variables",
        tr: "Hidrolojik ve iklimsel değişkenler için tekrarlanabilir istatistiksel iş akışları kurdu",
      },
    ],
  },
  {
    kind: "EDU",
    badge: "contour",
    emphasized: false,
    meta: { en: "2019 — 2020 · IOWA CITY", tr: "2019 — 2020 · IOWA CITY" },
    text: {
      en: "M.Sc. Civil & Environmental Engineering (Water Resources) — The University of Iowa · GPA 3.61 · Thesis: Exploration of Flood Forecasting and Flood Mitigation",
      tr: "Yüksek Lisans, İnşaat ve Çevre Mühendisliği (Su Kaynakları) — Iowa Üniversitesi · Not Ortalaması 3.61 · Tez: Taşkın Tahmini ve Taşkın Azaltımı Üzerine Bir Araştırma",
    },
  },
  {
    kind: "EDU",
    badge: "contour",
    emphasized: false,
    meta: { en: "2018 · HOUSTON, USA", tr: "2018 · HOUSTON, ABD" },
    text: { en: "ESL — Rice University", tr: "Yabancı Dil Olarak İngilizce (ESL) — Rice Üniversitesi" },
  },
  {
    kind: "AWARD",
    badge: "gold",
    emphasized: false,
    meta: { en: "2017", tr: "2017" },
    text: {
      en: "YLSY Graduate Scholarship (Ministry of Education & DSİ) — fully funded graduate study abroad · TÜBİTAK Graduate Research Fellowship (Grant 115Y673)",
      tr: "YLSY Lisansüstü Bursu (Milli Eğitim Bakanlığı & DSİ) — yurt dışında tam burslu lisansüstü eğitim · TÜBİTAK Lisansüstü Araştırma Bursu (115Y673 No'lu Proje)",
    },
  },
  {
    kind: "WORK",
    badge: "acc",
    emphasized: true,
    meta: { en: "MAR 2017 — MAR 2018 · ERZURUM", tr: "MAR 2017 — MAR 2018 · ERZURUM" },
    title: {
      en: "Researcher — Erzurum Technical University",
      tr: "Araştırmacı — Erzurum Teknik Üniversitesi",
    },
    bullets: [
      {
        en: "Rainfall and flood frequency analysis on historical observations",
        tr: "Tarihsel gözlemler üzerinde yağış ve taşkın frekans analizi yaptı",
      },
      {
        en: "TÜBİTAK project: multivariate flood frequency analysis using copulas — Euphrates Basin",
        tr: "TÜBİTAK projesi: kopulalar kullanılarak Fırat Havzası'nda çok değişkenli taşkın frekans analizi",
      },
    ],
  },
  {
    kind: "EDU",
    badge: "contour",
    emphasized: false,
    meta: { en: "2011 — 2016 · İSTANBUL", tr: "2011 — 2016 · İSTANBUL" },
    text: {
      en: "B.Sc. Civil Engineering — İstanbul Technical University · with honors, completed in 3.5 years",
      tr: "Lisans, İnşaat Mühendisliği — İstanbul Teknik Üniversitesi · onur derecesiyle, 3,5 yılda tamamlandı",
    },
  },
];

export type SkillGroup = {
  heading: Bilingual;
  skills: { label: string }[];
};

export const skillGroups: SkillGroup[] = [
  {
    heading: { en: "DATA & CODE", tr: "VERİ & KOD" },
    skills: [
      { label: "Python · pandas · NumPy" },
      { label: "Matplotlib · dataviz" },
      { label: "TensorFlow · scikit-learn" },
      { label: "JavaScript · HPC · Git" },
    ],
  },
  {
    heading: { en: "GIS & REMOTE SENSING", tr: "CBS & UZAKTAN ALGILAMA" },
    skills: [
      { label: "QGIS · PyQGIS · Rasterio · geopandas" },
      { label: "GDAL · ArcGIS · Leaflet" },
      { label: "Google Earth Engine" },
    ],
  },
  {
    heading: { en: "DESIGN & DOCS", tr: "TASARIM & DOKÜMANLAR" },
    skills: [
      { label: "Figma · HTML · Markdown" },
      { label: "LaTeX · Illustrator" },
    ],
  },
];

export const languages: { label: Bilingual; level: Bilingual }[] = [
  { label: { en: "Turkish", tr: "Türkçe" }, level: { en: "NATIVE", tr: "ANA DİL" } },
  { label: { en: "English", tr: "İngilizce" }, level: { en: "FLUENT", tr: "İLERİ DÜZEY" } },
];

export const contact = [
  { label: "gurbuzfrk@gmail.com", href: "mailto:gurbuzfrk@gmail.com" },
  { label: "github.com/gurbuzf", href: "https://github.com/gurbuzf" },
  { label: "linkedin/faruk-gurbuz", href: "https://www.linkedin.com/in/faruk-gurbuz" },
];
