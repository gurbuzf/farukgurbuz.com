import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "watershed-app",
    tag: { en: "WEB APP", tr: "WEB UYGULAMASI" },
    year: "2025",
    title: "Watershed Delineation Web App",
    desc: {
      en: "Client-side GIS app: click any point on the map, get its watershed and downstream flow path in real time — raster extents polygonized to vectors on the fly.",
      tr: "Tarayıcı tarafında çalışan bir CBS uygulaması: haritada herhangi bir noktaya tıklayın, o noktanın su toplama havzasını ve akış aşağı güzergahını anında görün — raster veriler anlık olarak vektöre dönüştürülüyor.",
    },
    tech: ["Leaflet", "JavaScript"],
    blocks: [],
  },
  {
    id: "watt",
    tag: { en: "PY LIBRARY", tr: "PY KÜTÜPHANESİ" },
    year: "2024",
    title: "WATT — Batch Watershed Delineation",
    desc: {
      en: "Feed it a DEM and a set of pour points; it hands back drainage areas for every location — a modular, command-line Python pipeline.",
      tr: "Bir DEM ve bir dizi akış noktası verin; her konum için drenaj alanlarını hesaplayıp döndürür — modüler, komut satırından çalışan bir Python aracı.",
    },
    tech: ["Python", "GDAL", "geopandas"],
    blocks: [],
  },
  {
    id: "gru-seq2seq",
    tag: { en: "ML MODEL", tr: "ML MODELİ" },
    year: "2023",
    title: "GRU Seq2seq Attention Model",
    desc: {
      en: "A neural sequence-to-sequence model with attention, built for flood prediction from hydro-meteorological time series.",
      tr: "Hidro-meteorolojik zaman serilerinden taşkın tahmini yapmak için geliştirilmiş, dikkat mekanizmalı bir sequence-to-sequence sinir ağı modeli.",
    },
    tech: ["Keras", "TensorFlow"],
    blocks: [],
  },
  {
    id: "doc2xlsx",
    tag: { en: "AUTOMATION", tr: "OTOMASYON" },
    year: "2023",
    title: "doc2xlsx — Report Parser",
    desc: {
      en: "Extracts structured tables out of semi-structured Word reports and exports clean Excel — hydrological paperwork, automated away.",
      tr: "Yarı yapılandırılmış Word raporlarından tabloları ayıklayıp düzenli Excel dosyalarına aktarır — hidrolojik evrak işleri artık otomatik.",
    },
    tech: ["python-docx", "openpyxl"],
    blocks: [],
  },
  {
    id: "reservoir-creator",
    tag: { en: "QGIS PLUGIN", tr: "QGIS EKLENTİSİ" },
    year: "2021",
    title: "reservoir_creator",
    desc: {
      en: "On-the-fly inundation mapping for real or hypothetical dams — drop a dam on the map, see what floods.",
      tr: "Gerçek veya varsayımsal barajlar için anlık su baskını haritalaması — haritaya bir baraj yerleştirin, nerelerin sular altında kalacağını görün.",
    },
    tech: ["PyQGIS", "Qt"],
    blocks: [],
  },
  {
    id: "pyhlm",
    tag: { en: "HYDRO MODEL", tr: "HİDROLOJİK MODEL" },
    year: "2020",
    title: "pyHLM — Hillslope-Link Model",
    desc: {
      en: "A physics-based distributed hydrological model in modular Python — RK45 solvers for the flow dynamics, a genetic algorithm for optimizing small-reservoir operations.",
      tr: "Modüler Python ile yazılmış, fiziksel temelli dağıtık bir hidrolojik model — akış dinamikleri için RK45 çözücüleri, küçük rezervuar işletimini optimize eden bir genetik algoritma.",
    },
    tech: ["NumPy", "SciPy", "GA"],
    blocks: [],
  },
];

export function findProject(id: string) {
  return projects.find((p) => p.id === id) ?? null;
}
