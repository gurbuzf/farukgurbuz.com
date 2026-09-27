"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { WatershedPlayground } from "@/components/home/watershed-playground";
import { DamFloodRoutingPlayground } from "@/components/home/dam-flood-routing-playground";
import { Waves, Mountain, Shield, ArrowRight, MousePointerClick, SlidersHorizontal, LineChart, Info } from "lucide-react";

type LabId = "watershed" | "dam";

// The active lab lives in the URL hash (#watershed / #dam) so each lab can be linked directly.
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const getHash = () => window.location.hash;
const getServerHash = () => "";

const LABS: {
  id: LabId;
  number: string;
  icon: typeof Mountain;
  accent: string;
  accentBg: string;
  title: { en: string; tr: string };
  summary: { en: string; tr: string };
  methods: { en: string; tr: string }[];
  steps: { icon: typeof Mountain; en: string; tr: string }[];
}[] = [
  {
    id: "watershed",
    number: "01",
    icon: Mountain,
    accent: "text-sky-600 dark:text-sky-400",
    accentBg: "bg-sky-500/10 border-sky-500/30",
    title: copy.home.labTitle,
    summary: {
      en: "Click any cell of a synthetic DEM to trace its flow path, delineate the upstream catchment and see a Rational-Method peak discharge with its hydrograph.",
      tr: "Sentetik bir DEM üzerindeki herhangi bir hücreye tıklayarak akış yolunu izleyin, memba havzasını sınırlandırın ve Rasyonel Metot pik debisini hidrografıyla birlikte görün.",
    },
    methods: [
      { en: "D8 flow direction", tr: "D8 akış yönü" },
      { en: "Flow accumulation", tr: "Akış birikimi" },
      { en: "Rational Method", tr: "Rasyonel Metot" },
    ],
    steps: [
      {
        icon: SlidersHorizontal,
        en: "Pick a layer: elevation (DEM), D8 flow directions or flow accumulation.",
        tr: "Bir katman seçin: yükseklik (DEM), D8 akış yönleri veya akış birikimi.",
      },
      {
        icon: MousePointerClick,
        en: "Click a cell to set a pour point — its catchment and flow path appear instantly.",
        tr: "Bir hücreye tıklayarak çıkış noktası belirleyin — havzası ve akış yolu anında çizilir.",
      },
      {
        icon: LineChart,
        en: "Open the hydrograph card and the field notes to check every number by hand.",
        tr: "Hidrograf kartını ve mühendislik notlarını açarak her değeri elle doğrulayın.",
      },
    ],
  },
  {
    id: "dam",
    number: "02",
    icon: Shield,
    accent: "text-emerald-600 dark:text-emerald-400",
    accentBg: "bg-emerald-500/10 border-emerald-500/30",
    title: copy.damLab.title,
    summary: {
      en: "Route a flood hydrograph through a reservoir (level-pool method) and watch the bottom outlet, spillway and — in extreme cases — crest overtopping respond.",
      tr: "Bir taşkın hidrografını rezervuardan öteleyin (level-pool yöntemi); dip savak, dolu savak ve aşırı durumlarda kret aşımının nasıl devreye girdiğini izleyin.",
    },
    methods: [
      { en: "Level-pool routing", tr: "Level-pool öteleme" },
      { en: "Fixed-step RK4", tr: "Sabit adımlı RK4" },
      { en: "Orifice & weir flow", tr: "Orifis & savak akışı" },
    ],
    steps: [
      {
        icon: SlidersHorizontal,
        en: "Start from a preset scenario, or tune the dam geometry and inflow hydrograph.",
        tr: "Hazır bir senaryodan başlayın ya da baraj geometrisini ve giriş hidrografını ayarlayın.",
      },
      {
        icon: MousePointerClick,
        en: "Press play (or drag the time slider) to animate the reservoir level and outflows.",
        tr: "Oynat'a basın (veya zaman kaydırıcısını sürükleyin); göl seviyesi ve çıkış debileri canlanır.",
      },
      {
        icon: LineChart,
        en: "Read the results strip: peak attenuation, lag time, peak level and freeboard.",
        tr: "Sonuç şeridini okuyun: pik sönümleme, gecikme süresi, en yüksek su kotu ve hava payı.",
      },
    ],
  },
];

export default function HydrologyLabPage() {
  const { lang } = useAtlas();
  const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash);
  const active: LabId = hash === "#dam" ? "dam" : "watershed";

  const openLab = useCallback((id: LabId, scroll: boolean) => {
    if (window.location.hash !== `#${id}`) {
      window.location.hash = id;
    }
    if (scroll) {
      document.getElementById("lab-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const activeLab = LABS.find((l) => l.id === active)!;

  return (
    <div data-screen-label="Hydrology Lab" className="relative w-full flex flex-col items-center">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-b-[1.5px] border-[var(--frame)]">
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute -top-24 right-[10%] w-[420px] h-[420px] rounded-full pointer-events-none opacity-20 dark:opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--acc) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-8 lg:px-12 pt-10 pb-10 sm:pt-14 sm:pb-12 flex flex-col gap-8">
          <div className="flex flex-col gap-3.5 max-w-[820px]">
            <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full border border-[var(--frame)] bg-[var(--atlas-card)] shadow-2xs">
              <Waves size={13} className="text-[var(--acc)]" />
              <span className="font-plex-mono text-[10.5px] font-bold tracking-widest text-[var(--acc)] uppercase">
                {lang === "tr" ? "İNTERAKTİF CBS & HİDROLOJİ LABORATUVARI" : "INTERACTIVE GIS & HYDROLOGY LAB"}
              </span>
            </div>
            <h1 className="font-display font-bold text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
              {lang === "tr" ? "Havzadan baraja: tarayıcıda hidroloji" : "From watershed to dam: hydrology in your browser"}
            </h1>
            <p className="font-display text-[15px] sm:text-[17px] leading-[1.6] text-[var(--ink2)] max-w-[720px]">
              {lang === "tr"
                ? "İki etkileşimli deney: önce yağışın arazide nereye aktığını ve havzanın nasıl oluştuğunu keşfedin, ardından bu taşkının bir barajda nasıl sönümlendiğini simüle edin. Tüm hesaplar tarayıcınızda anında çalışır."
                : "Two interactive experiments: first explore where rain flows across terrain and how a catchment forms, then simulate how that flood is attenuated by a dam. Every calculation runs instantly in your browser."}
            </p>
          </div>

          {/* Lab picker cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LABS.map((lab) => {
              const Icon = lab.icon;
              const isActive = lab.id === active;
              return (
                <button
                  key={lab.id}
                  type="button"
                  onClick={() => openLab(lab.id, true)}
                  aria-pressed={isActive}
                  className={`group cursor-pointer text-left flex flex-col gap-3 p-5 bg-[var(--atlas-card)] border-[1.5px] transition-all duration-200 hover:-translate-y-0.5 ${
                    isActive
                      ? "border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)]"
                      : "border-[var(--line)] hover:border-[var(--frame)] shadow-[3px_3px_0_var(--shadow)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-none ${lab.accentBg}`}>
                        <Icon size={19} className={lab.accent} />
                      </span>
                      <span className="font-plex-mono text-[10.5px] font-bold tracking-widest text-[var(--mut)] uppercase">
                        LAB {lab.number}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 font-plex-mono text-[10.5px] font-bold uppercase tracking-wider ${
                        isActive ? lab.accent : "text-[var(--mut)] group-hover:text-[var(--ink)]"
                      }`}
                    >
                      {isActive ? (lang === "tr" ? "● Açık" : "● Open") : lang === "tr" ? "Aç" : "Open"}
                      {!isActive && <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-[19px] sm:text-[21px] tracking-tight text-[var(--ink)]">
                      {t(lab.title, lang)}
                    </h2>
                    <p className="mt-1.5 font-display text-[13.5px] leading-[1.55] text-[var(--ink2)]">
                      {t(lab.summary, lang)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {lab.methods.map((m) => (
                      <span
                        key={m.en}
                        className="px-2 py-0.5 border border-[var(--line)] bg-[var(--paper)] font-plex-mono text-[10px] text-[var(--ink2)]"
                      >
                        {t(m, lang)}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Workspace: sticky lab switcher + active lab ─────────────── */}
      <div id="lab-workspace" className="w-full scroll-mt-4 sm:scroll-mt-20">
        <div className="sm:sticky sm:top-18 z-30 w-full border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur-md">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8 lg:px-12 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label={lang === "tr" ? "Laboratuvar seçimi" : "Choose a lab"} className="inline-flex p-1 rounded-lg border border-[var(--frame)] bg-[var(--atlas-card)]">
              {LABS.map((lab) => {
                const Icon = lab.icon;
                const isActive = lab.id === active;
                return (
                  <button
                    key={lab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`lab-panel-${lab.id}`}
                    onClick={() => openLab(lab.id, false)}
                    className={`cursor-pointer inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md font-plex-mono text-[11px] font-bold tracking-wide uppercase transition-all ${
                      isActive
                        ? "bg-[var(--frame)] text-[var(--paper)] shadow-2xs"
                        : "text-[var(--ink2)] hover:text-[var(--ink)] hover:bg-[var(--paper)]"
                    }`}
                  >
                    <Icon size={13} />
                    <span className="hidden sm:inline">{lab.id === "watershed" ? t(copy.home.labTab01, lang) : t(copy.home.labTab02, lang)}</span>
                    <span className="sm:hidden">LAB {lab.number}</span>
                  </button>
                );
              })}
            </div>
            <span className="inline-flex items-center gap-1.5 font-plex-mono text-[10px] text-[var(--mut)]">
              <Info size={12} />
              {lang === "tr" ? "Eğitim amaçlı, basitleştirilmiş modeller" : "Educational, simplified models"}
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8 lg:px-12 py-8 sm:py-10 flex flex-col gap-6">
          {/* Quick start for the active lab */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className={`font-plex-mono text-[11px] font-bold tracking-widest uppercase ${activeLab.accent}`}>
                {active === "watershed" ? t(copy.home.labEyebrow, lang) : t(copy.damLab.eyebrow, lang)}
              </span>
              <h2 className="font-display font-bold text-[26px] sm:text-[32px] tracking-[-0.02em] text-[var(--ink)]">
                {t(activeLab.title, lang)}
              </h2>
              <p className="font-display text-[14.5px] sm:text-[15.5px] text-[var(--ink2)] max-w-[820px] leading-[1.6]">
                {active === "watershed" ? t(copy.home.labDesc, lang) : t(copy.damLab.desc, lang)}
              </p>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeLab.steps.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 bg-[var(--atlas-card)] border border-[var(--line)]"
                  >
                    <span className="flex-none w-6 h-6 rounded-full bg-[var(--frame)] text-[var(--paper)] font-plex-mono text-[11px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-display text-[13px] leading-[1.5] text-[var(--ink2)]">
                      <StepIcon size={13} className={`inline -mt-0.5 mr-1.5 ${activeLab.accent}`} />
                      {lang === "tr" ? step.tr : step.en}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Both labs stay mounted so switching tabs keeps their state */}
          <div id="lab-panel-watershed" role="tabpanel" hidden={active !== "watershed"}>
            <WatershedPlayground />
          </div>
          <div id="lab-panel-dam" role="tabpanel" hidden={active !== "dam"}>
            <DamFloodRoutingPlayground />
          </div>

          {/* Next-lab prompt */}
          <button
            type="button"
            onClick={() => openLab(active === "watershed" ? "dam" : "watershed", true)}
            className="group cursor-pointer self-center inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border-[1.5px] border-[var(--frame)] bg-[var(--atlas-card)] hover:border-[var(--acc)] shadow-2xs transition-all"
          >
            <span className="font-plex-mono text-[11px] font-bold tracking-widest uppercase text-[var(--acc)]">
              {active === "watershed"
                ? lang === "tr"
                  ? "Sıradaki: Baraj taşkın ötelemesi (LAB 02)"
                  : "Next: Dam flood routing (LAB 02)"
                : lang === "tr"
                ? "Geri dön: Havza sınırlandırma (LAB 01)"
                : "Back to: Watershed delineation (LAB 01)"}
            </span>
            <ArrowRight size={14} className="text-[var(--acc)] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <p className="font-display text-[12px] leading-[1.6] text-[var(--mut)] max-w-[900px] mx-auto text-center">
            {lang === "tr"
              ? "Not: Arazi, havza ve baraj verileri sentetiktir; katsayılar örnek amaçlı seçilmiştir. Bu simülatörler kavramları göstermek içindir, tasarım veya işletme kararlarında kullanılmamalıdır."
              : "Note: terrain, catchment and dam data are synthetic and coefficients are illustrative. These simulators demonstrate concepts and must not be used for design or operational decisions."}
          </p>
        </div>
      </div>
    </div>
  );
}
