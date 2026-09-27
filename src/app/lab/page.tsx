"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Mountain, Shield, ArrowRight, Lightbulb, SlidersHorizontal, MoveRight } from "lucide-react";
import { useTx } from "@/components/lab/lab-kit";
import { WatershedLab } from "@/components/lab/watershed-lab";
import { ReservoirLab } from "@/components/lab/reservoir-lab";

type LabId = "watershed" | "dam";

// The active lab lives in the URL hash (#watershed / #dam) so each lab can be linked directly.
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const getHash = () => window.location.hash;
const getServerHash = () => "";

const LABS = [
  {
    id: "watershed" as LabId,
    number: "01",
    icon: Mountain,
    title: { en: "Where does the rain go?", tr: "Yağmur nereye gider?" },
    subtitle: { en: "Watershed delineation", tr: "Havza sınırlandırma" },
    question: {
      en: "Follow water across a terrain model, see rivers and watersheds emerge, and estimate a flood peak.",
      tr: "Suyu bir arazi modeli üzerinde izleyin; nehirlerin ve havzaların oluşumunu görün ve bir taşkın pikini tahmin edin.",
    },
    chapters: {
      en: "Terrain · Flow direction · Flow path · Accumulation · Watershed · Peak flow",
      tr: "Arazi · Akış yönü · Akış yolu · Birikim · Havza · Pik debi",
    },
  },
  {
    id: "dam" as LabId,
    number: "02",
    icon: Shield,
    title: { en: "How does a dam tame a flood?", tr: "Baraj taşkını nasıl ehlileştirir?" },
    subtitle: { en: "Reservoir flood routing", tr: "Rezervuar taşkın ötelemesi" },
    question: {
      en: "Send a flood into a reservoir, see how storage and outlets lower and delay its peak, then solve a design challenge.",
      tr: "Bir taşkını rezervuara gönderin; depolamanın ve çıkış yapılarının piki nasıl düşürüp geciktirdiğini görün, sonra bir tasarım görevini çözün.",
    },
    chapters: {
      en: "Flood · Bucket with holes · Outlets · Routing · Challenge",
      tr: "Taşkın · Delikli kova · Çıkış yapıları · Öteleme · Görev",
    },
  },
];

export default function HydrologyLabPage() {
  const tx = useTx();
  const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash);
  const active: LabId = hash === "#dam" ? "dam" : "watershed";

  const openLab = useCallback((id: LabId, scroll: boolean) => {
    if (window.location.hash !== `#${id}`) window.location.hash = id;
    if (scroll) document.getElementById("lab-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const howItWorks = [
    {
      icon: Lightbulb,
      title: tx("One idea per chapter", "Her bölümde tek fikir"),
      text: tx("Each chapter explains one concept in plain words, then lets you test it.", "Her bölüm tek bir kavramı sade bir dille anlatır, sonra denemenizi sağlar."),
    },
    {
      icon: SlidersHorizontal,
      title: tx("Change one thing", "Tek bir şeyi değiştirin"),
      text: tx("Click the map or move a single slider. Everything else stays fixed.", "Haritaya tıklayın ya da tek bir kaydırıcıyı oynatın. Geri kalan her şey sabit kalır."),
    },
    {
      icon: MoveRight,
      title: tx("See cause → effect", "Neden → sonucu görün"),
      text: tx("The lab tells you what your change caused, with the numbers before and after.", "Laboratuvar, değişikliğinizin neye yol açtığını önceki ve sonraki sayılarla söyler."),
    },
  ];

  return (
    <div data-screen-label="Hydrology Lab" className="relative w-full flex flex-col items-center">
      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <section className="w-full border-b-[1.5px] border-[var(--frame)]">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8 lg:px-12 pt-10 pb-10 sm:pt-12 flex flex-col gap-7">
          <div className="flex flex-col gap-3 max-w-[760px]">
            <span className="font-plex-mono text-[11px] font-bold tracking-[0.16em] text-[var(--acc)] uppercase">
              {tx("Hydrology Lab · interactive lessons", "Hidroloji Lab · etkileşimli dersler")}
            </span>
            <h1 className="font-display font-bold text-[32px] sm:text-[44px] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
              {tx("Learn hydrology by changing things", "Hidrolojiyi bir şeyleri değiştirerek öğrenin")}
            </h1>
            <p className="font-display text-[15.5px] sm:text-[17px] leading-[1.6] text-[var(--ink2)]">
              {tx(
                "Two short, guided lessons. Each step shows one idea, lets you change one thing, and explains what happened and why.",
                "İki kısa, rehberli ders. Her adım tek bir fikri gösterir, tek bir şeyi değiştirmenize izin verir ve ne olduğunu ve nedenini açıklar."
              )}
            </p>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {howItWorks.map((h, i) => {
              const Icon = h.icon;
              return (
                <li key={i} className="flex gap-3 p-3.5 bg-[var(--atlas-card)] border border-[var(--line)]">
                  <span className="w-8 h-8 flex-none rounded-full bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center text-[var(--acc)]">
                    <Icon size={15} />
                  </span>
                  <span>
                    <span className="block font-display text-[14px] font-semibold text-[var(--ink)]">{h.title}</span>
                    <span className="block mt-0.5 font-display text-[13px] leading-[1.5] text-[var(--ink2)]">{h.text}</span>
                  </span>
                </li>
              );
            })}
          </ol>

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
                  className={`group cursor-pointer text-left flex flex-col gap-2.5 p-5 bg-[var(--atlas-card)] border-[1.5px] transition-all duration-200 hover:-translate-y-0.5 ${
                    isActive ? "border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)]" : "border-[var(--line)] hover:border-[var(--frame)] shadow-[3px_3px_0_var(--shadow)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-lg border border-[var(--line)] bg-[var(--paper)] flex items-center justify-center">
                        <Icon size={18} className="text-[var(--acc)]" />
                      </span>
                      <span className="font-plex-mono text-[10.5px] font-bold tracking-widest text-[var(--mut)] uppercase">
                        {tx("Lesson", "Ders")} {lab.number} · {tx(lab.subtitle.en, lab.subtitle.tr)}
                      </span>
                    </span>
                    <span className={`inline-flex items-center gap-1 font-plex-mono text-[11px] font-bold uppercase ${isActive ? "text-[var(--acc)]" : "text-[var(--mut)] group-hover:text-[var(--ink)]"}`}>
                      {isActive ? tx("Open", "Açık") : tx("Start", "Başla")}
                      {!isActive && <ArrowRight size={13} />}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-[21px] tracking-tight text-[var(--ink)]">{tx(lab.title.en, lab.title.tr)}</h2>
                  <p className="font-display text-[14px] leading-[1.55] text-[var(--ink2)]">{tx(lab.question.en, lab.question.tr)}</p>
                  <p className="font-plex-mono text-[11px] text-[var(--mut)]">{tx(lab.chapters.en, lab.chapters.tr)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Workspace ─────────────────────────────────────────────────── */}
      <div id="lab-workspace" className="w-full scroll-mt-4 sm:scroll-mt-[72px]">
        <div className="sm:sticky sm:top-18 z-30 w-full border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur-md">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8 lg:px-12 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label={tx("Choose a lesson", "Bir ders seçin")} className="inline-flex p-1 rounded-lg border border-[var(--frame)] bg-[var(--atlas-card)]">
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
                    className={`cursor-pointer inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md font-display text-[13px] font-semibold transition-colors ${
                      isActive ? "bg-[var(--frame)] text-[var(--paper)]" : "text-[var(--ink2)] hover:text-[var(--ink)] hover:bg-[var(--paper)]"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{tx(lab.subtitle.en, lab.subtitle.tr)}</span>
                    <span className="sm:hidden">
                      {tx("Lesson", "Ders")} {lab.number}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="font-display text-[12px] text-[var(--mut)]">
              {tx("Simplified teaching models — not for design use", "Basitleştirilmiş eğitim modelleri — tasarımda kullanılmamalıdır")}
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8 lg:px-12 py-7 sm:py-9">
          {/* Both labs stay mounted so switching keeps their progress */}
          <div id="lab-panel-watershed" role="tabpanel" hidden={active !== "watershed"}>
            <WatershedLab />
          </div>
          <div id="lab-panel-dam" role="tabpanel" hidden={active !== "dam"}>
            <ReservoirLab />
          </div>
        </div>
      </div>
    </div>
  );
}
