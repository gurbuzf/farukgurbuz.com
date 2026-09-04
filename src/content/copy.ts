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
    labEyebrow: { en: "INTERACTIVE GIS LAB // 01", tr: "İNTERAKTİF CBS ATÖLYESİ // 01" },
    labTitle: { en: "Watershed Delineation & Flow Routing", tr: "Havza Sınırlandırma ve Akış Yönlendirme" },
    labDesc: {
      en: "A client-side digital elevation model (DEM) demonstrating deterministic 8-neighbor (D8) steepest descent routing and flow accumulation. Select an analysis layer, click any cell to set a pour point, and watch the watershed delineate in real time.",
      tr: "Deterministik 8 komşu (D8) en dik eğim yönlendirmesi ve akış birikimini modelleyen interaktif sayısal yükseklik modeli (DEM). Bir analiz katmanı seçin, akış çıkış noktası belirlemek için herhangi bir hücreye tıklayın ve havzanın anlık olarak sınırlandırılmasını izleyin.",
    },
    labTab01: { en: "LAB 01 · WATERSHED DELINEATION", tr: "LAB 01 · HAVZA SINIRLANDIRMA & DRENAJ" },
    labTab02: { en: "LAB 02 · DAM FLOOD ROUTING", tr: "LAB 02 · BARAJ TAŞKIN ÖTELEMESİ" },
  },
  damLab: {
    eyebrow: { en: "INTERACTIVE GIS LAB // 02", tr: "İNTERAKTİF CBS ATÖLYESİ // 02" },
    title: {
      en: "Dam Hydraulics & Reservoir Flood Routing",
      tr: "Baraj Hidroliği & Rezervuar Taşkın Ötelemesi (Level-Pool Routing)",
    },
    desc: {
      en: "Interactive reservoir flood routing engine solving continuity mass balance and multi-regime orifice & weir discharge based on Faruk Gürbüz's M.Sc. thesis hydraulic formulation (Figure 2.2).",
      tr: "Faruk Gürbüz'ün yüksek lisans tezinde yer alan hidrolik formülasyon (Şekil 2.2) ve kütle korunum denklemleriyle çalışan interaktif rezervuar taşkın ötelemesi ve savak hidroliği simülatörü.",
    },
    tabs: {
      illustration: { en: "3D Dam Model & Geometry", tr: "3B Baraj Modeli & Geometri" },
      hydrograph: { en: "Inflow-Outflow Hydrograph", tr: "Giriş-Çıkış Taşkın Hidrografı" },
      parameters: { en: "Hydraulic Controls", tr: "Hidrolik Parametreler" },
      fieldNotes: { en: "Thesis Equations & Derivations", tr: "Tez Formülleri & Hesap Adımları" },
    },
    shapes: {
      gamma: { en: "Synthetic Gamma Unit Hydrograph", tr: "Sentetik Gama Birim Hidrografı" },
      triangular: { en: "Triangular Hydrograph", tr: "Üçgen Taşkın Hidrografı" },
      trapezoid: { en: "Trapezoidal Sustained Storm", tr: "Trapez / Uzun Süreli Sağanak" },
    },
    metrics: {
      peakInflow: { en: "Peak Inflow", tr: "Giriş Piki" },
      peakOutflow: { en: "Peak Outflow", tr: "Çıkış Piki" },
      attenuation: { en: "Peak Attenuation", tr: "Pik Sönümleme" },
      lagTime: { en: "Lag Time", tr: "Öteleme Gecikmesi" },
      maxStage: { en: "Peak Water Level", tr: "En Yüksek Su Kotu" },
      freeboard: { en: "Safety Freeboard", tr: "Hava Payı (Freeboard)" },
      overtopping: { en: "Dam Overtopping", tr: "Kret Aşımı" },
    },
    controls: {
      presetsHeading: { en: "PRESET SCENARIOS:", tr: "HAZIR SENARYOLAR:" },
      damSection: { en: "DAM STRUCTURE & ORIFICE", tr: "BARAJ GÖVDESİ & DİP SAVAK" },
      reservoirSection: { en: "RESERVOIR CAPACITY & POOL", tr: "REZERVUAR ALANI & DEPOLAMA" },
      floodSection: { en: "INFLOW FLOOD HYDROGRAPH", tr: "GELEN TAŞKIN HİDROGRAFI" },
      playAnimation: { en: "Play Flood Routing", tr: "Taşkın Simülasyonunu Oynat" },
      pauseAnimation: { en: "Pause", tr: "Duraklat" },
      resetAnimation: { en: "Reset to t = 0", tr: "Başa Sar (t = 0)" },
      timeScrubber: { en: "Time Simulation Progress:", tr: "Zaman İlerlemesi:" },
    },
  },
  playground: {
    demButton: { en: "DEM", tr: "DEM" },
    d8Button: { en: "D8", tr: "D8" },
    accButton: { en: "Accumulation", tr: "Accumulation" },
    layerLabel: { en: "LAYER:", tr: "KATMAN:" },
    presets: { en: "PRESETS:", tr: "ÖRNEKLER:" },
    presetWest: { en: "West Basin (Lake A)", tr: "Batı Havzası (Göl A)" },
    presetEast: { en: "East Basin (Bay B)", tr: "Doğu Havzası (Körfez B)" },
    presetDivide: { en: "Drainage Divide", tr: "Su Ayrım Çizgisi (Drainage Divide)" },
    clear: { en: "Clear ✕", tr: "Temizle ✕" },
    cell: { en: "CELL", tr: "HÜCRE" },
    elev: { en: "ELEVATION", tr: "YÜKSEKLİK" },
    d8Flow: { en: "D8 FLOW", tr: "D8 AKIŞ" },
    acc: { en: "FLOW ACCUMULATION", tr: "AKIŞ BİRİKİMİ" },
    watershed: { en: "WATERSHED BASIN", tr: "HAVZA ALANI" },
    reach: { en: "REACH TO OUTLET", tr: "ÇIKIŞA MESAFE" },
    emptyHint: {
      en: "Click any cell on the digital elevation grid to simulate drainage and trace the watershed basin.",
      tr: "Drenajı simüle etmek ve havzayı sınırlandırmak için yükseklik ızgarasındaki herhangi bir hücreye tıklayın.",
    },
    demTitle: { en: "Digital Elevation Model (DEM)", tr: "Sayısal Yükseklik Modeli (DEM)" },
    demSubtitle: { en: "Hypsometric Tinting & Water Surfaces", tr: "Hipsometrik Renklendirme & Su Yüzeyleri" },
    demMin: { en: "0 m (Sea level / coastal bay & receiving lakes)", tr: "0 m (Deniz seviyesi / kıyı körfezi & alıcı göller)" },
    demMax: { en: "498 m (Drainage divide summit ridge)", tr: "498 m (Su ayrım zirve sırtı / Drainage divide)" },
    demDesc: {
      en: "Displays surface elevation in meters above sea level, with coastal bay and terminal lake water bodies at sea level datum (0 m).",
      tr: "Metre cinsinden yüzey yüksekliğini, kıyı körfezi ve alıcı göl su kütleleriyle deniz seviyesi referansında (0 m) gösterir.",
    },
    d8Title: { en: "D8 Flow Direction Algorithm", tr: "D8 Akış Yönü Algoritması" },
    d8Subtitle: { en: "Steepest Descent Rule", tr: "En Dik Eğim Kuralı" },
    d8Desc: {
      en: "The deterministic 8-direction (D8) method calculates the hydraulic gradient to all 8 surrounding cells, assigning flow to the single steepest downslope neighbor.",
      tr: "Deterministik 8-yönlü (D8) yöntem çevreleyen 8 hücreye olan hidrolik eğimi hesaplar ve akışı en dik iniş yönündeki komşuya yönlendirir.",
    },
    accTitle: { en: "Flow Accumulation (Upslope Area)", tr: "Akış Birikimi (Üst Havza Alanı)" },
    accSubtitle: { en: "Channel Network", tr: "Akarsu Ağı" },
    accMin: { en: "1 cell (Ridge headwaters)", tr: "1 hücre (Sırt / Kaynak)" },
    accMax: { en: "cells (Edge outlet pour point)", tr: "hücre (Sınır çıkış noktası)" },
    accDesc: {
      en: "Dark blue channels emerge naturally where surface water converges. Separate river systems drain toward distinct edge outlets across the two neighboring catchments.",
      tr: "Yüzey suyunun toplandığı yerlerde koyu mavi akarsu yatakları belirir. İki komşu havzada ayrı akarsu kolları kendi sınır çıkışlarına doğru akar.",
    },
    mapKeyTitle: { en: "Map Features & Symbology", tr: "Harita İşaretleri & Semboloji (Lejant)" },
    pourPoint: { en: "Selected Pour Point", tr: "Seçilen Çıkış / Analiz Noktası (Pour Point)" },
    pourPointDesc: { en: "Target cell where upstream runoff is collected & gauged", tr: "Tıklanan hedef hücre; akış burada toplanır ve hidrografı üretilir" },
    flowPath: { en: "Downstream Streamline", tr: "Mansap Akış Çizgisi (Streamline)" },
    flowPathDesc: { en: "Simulated route of runoff to final basin outlet", tr: "Suyun en dik eğimle mansaptaki ana çıkışa ulaştığı kesikli mavi hat" },
    basin: { en: "Upstream Catchment Basin", tr: "Drenaj Havzası & Sınırı (Catchment)" },
    basinDesc: { en: "Upstream contributing area with perimeter boundary line", tr: "Mavi konturla çevrili, seçilen noktaya su akıtan tüm alan" },
    edgeOutlet: { en: "Terminal Basin Outlet", tr: "Havza Ana Çıkışı (Terminal Outlet)" },
    edgeOutletDesc: { en: "Main downstream discharge exit point at map edge", tr: "Tüm havzanın harita sınırındaki ana drenaj çıkışı" },
    waterSurface: { en: "Water Surface (Sea / Bay, 0 m)", tr: "Su Yüzeyi (Deniz / Körfez, 0 m)" },
    waterSurfaceDesc: { en: "Receiving coastal water bodies at 0 m elevation", tr: "0 m kotundaki alıcı su kütleleri (≈ sembollü hücreler)" },
    divideLineLabel: { en: "Drainage Divide Ridge", tr: "Su Ayrım Çizgisi (Drainage Divide)" },
    divideLineDesc: { en: "Amber dashed ridge line separating neighboring catchments", tr: "İki komşu havzanın sularını ayıran sarı/turuncu sırt çizgisi" },
    basinA: { en: "West Basin (Basin A)", tr: "Batı Havzası (A Havzası)" },
    basinADesc: { en: "Catchment draining to west outlet", tr: "Batı çıkışına boşalan açık mavi havza alanı" },
    basinB: { en: "East Basin (Basin B)", tr: "Doğu Havzası (B Havzası)" },
    basinBDesc: { en: "Catchment draining to east outlet", tr: "Doğu çıkışına boşalan nane yeşili havza alanı" },
    hydraulicFormula: { en: "Rational Method: Q = (C · I · A) / 3.6", tr: "Rasyonel Yöntem: Q = (C · I · A) / 3.6" },
    hydraulicAssumptions: {
      en: "Assumptions: Runoff coeff C = 0.45, Design storm intensity I = 35 mm/hr, 1 cell = 1.0 km². Q = 4.375 · A m³/s. Concentration time Tc = max(8, L · 4) min.",
      tr: "Hesaplama Varsayımları: Akış katsayısı C = 0.45, Tasarım yağışı şiddeti I = 35 mm/saat, 1 hücre = 1.0 km². Q = 4.375 · A m³/s. Toplanma süresi Tc = max(8, L · 4) dk.",
    },
    hydrographTitle: { en: "HYETOGRAPH & RUNOFF HYDROGRAPH (Q vs Time)", tr: "HİYETOGRAF & TAŞKIN AKIŞ HİDROGRAFI (Debi - Zaman)" },
    timeMinutes: { en: "Time (min)", tr: "Zaman (dk)" },
    dischargeM3s: { en: "Discharge (m³/s)", tr: "Debi (m³/s)" },
    rainfallIntensity: { en: "Rainfall (mm/hr)", tr: "Yağış (mm/saat)" },
    peakRunoff: { en: "Peak Runoff", tr: "Pik Akış" },
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
};

export function t(field: string | { en: string; tr: string } | undefined, lang: Lang): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field.en;
}
