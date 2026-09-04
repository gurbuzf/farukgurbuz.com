"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { WatershedPlayground } from "./watershed-playground";
import { DamFloodRoutingPlayground } from "./dam-flood-routing-playground";
import { Waves, Mountain, Shield, ArrowDown } from "lucide-react";

export function HydrologyLabSection() {
  const { lang } = useAtlas();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="hydrology-lab"
      data-screen-label="Interactive Hydrology Lab"
      className="relative w-full border-t-[1.5px] border-[var(--frame)] bg-[var(--paper)] py-20 px-4 sm:px-8 lg:px-12 flex flex-col items-center overflow-hidden"
    >
      {/* Subtle dynamic ambient glow */}
      <div
        className="absolute top-10 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15 dark:opacity-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--acc) 0%, transparent 70%)",
        }}
      />

      {/* Subtle graticule grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-[1280px] flex flex-col gap-16">
        {/* ── Studio Header & Fast Jump Navigation ───────────────────── */}
        <div className="flex flex-col gap-3.5 text-center items-center max-w-[880px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--frame)] bg-[var(--atlas-card)] shadow-2xs">
            <Waves size={13} className="text-[var(--acc)] animate-pulse" />
            <span className="font-plex-mono text-[11px] font-bold tracking-widest text-[var(--acc)] uppercase">
              {lang === "tr" ? "İNTERAKTİF CBS & HİDROLOJİ ATÖLYESİ" : "INTERACTIVE GIS & HYDROLOGY STUDIO"}
            </span>
          </div>

          <h2 className="font-display font-bold text-[34px] sm:text-[46px] lg:text-[54px] leading-[1.06] tracking-[-0.03em] text-[var(--ink)]">
            {lang === "tr" ? "Sayısal Havza & Baraj Simülasyon Laboratuvarı" : "Computational Hydrology & Reservoir Hydraulics Lab"}
          </h2>

          <p className="font-display text-[15px] sm:text-[17px] leading-[1.6] text-[var(--ink2)] max-w-[760px]">
            {lang === "tr"
              ? "Sayısal arazi modellemesinden mansap hidroliğine: İlk olarak D8 algoritması ile havza sınırlandırıp akış yönlerini belirleyin, ardından sayfayı aşağı kaydırarak baraj rezervuarında taşkın ötelemesi ve savak dinamiklerini simüle edin."
              : "From terrain-based flow genesis to downstream dam hydraulics: Start with deterministic D8 watershed delineation, then scroll down to explore reservoir level-pool flood routing, orifice discharge, and spillway weir mechanics."}
          </p>

          {/* ── Fast Jump Index Pills ── */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollToSection("home-lab-01")}
              className="cursor-pointer px-4 py-2 rounded-xl bg-[var(--atlas-card)] border border-[var(--frame)] hover:border-[var(--acc)] hover:bg-[var(--paper)] text-[var(--ink)] font-plex-mono text-[11.5px] font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-xs"
            >
              <Mountain size={14} className="text-[var(--acc)]" />
              <span>{t(copy.home.labTab01, lang)}</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("home-lab-02")}
              className="cursor-pointer px-4 py-2 rounded-xl bg-[var(--atlas-card)] border border-emerald-500/30 hover:border-emerald-500 hover:bg-[var(--paper)] text-[var(--ink)] font-plex-mono text-[11.5px] font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-xs"
            >
              <Shield size={14} className="text-emerald-500" />
              <span>{t(copy.home.labTab02, lang)}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-mono">
                NEW
              </span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── LAB // 01: Watershed Delineation & Flow Routing ───────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div id="home-lab-01" className="scroll-mt-24 flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b border-[var(--frame)] pb-4">
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--acc)]" />
              <span className="font-plex-mono text-[11px] font-bold tracking-widest text-[var(--acc)] uppercase">
                {t(copy.home.labEyebrow, lang)}
              </span>
            </div>
            <h3 className="font-display font-bold text-[28px] sm:text-[34px] tracking-[-0.02em] text-[var(--ink)]">
              {t(copy.home.labTitle, lang)}
            </h3>
            <p className="font-display text-[14.5px] sm:text-[16px] text-[var(--ink2)] max-w-[800px]">
              {t(copy.home.labDesc, lang)}
            </p>
          </div>

          <div className="w-full">
            <WatershedPlayground />
          </div>
        </div>

        {/* ── Downstream Bridge / Scroll Indicator ── */}
        <div className="relative py-8 flex flex-col items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-[1.5px] border-dashed border-[var(--frame)]" />
          </div>
          <button
            type="button"
            onClick={() => scrollToSection("home-lab-02")}
            className="cursor-pointer relative z-10 px-5 py-2.5 rounded-full bg-[var(--paper)] border-[1.5px] border-[var(--frame)] shadow-xs hover:border-[var(--acc)] hover:scale-105 transition-all flex items-center gap-2.5 group text-[var(--ink)]"
          >
            <span className="font-plex-mono text-[11px] font-bold tracking-widest text-[var(--acc)] uppercase">
              {lang === "tr" ? "AŞAĞI KAYDIRIN: MANSAK BARAJ DENEYİ // 02" : "SCROLL DOWN: DAM ROUTING LAB // 02"}
            </span>
            <ArrowDown size={14} className="text-[var(--acc)] group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── LAB // 02: Dam Hydraulics & Reservoir Flood Routing ───── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div id="home-lab-02" className="scroll-mt-24 flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b border-[var(--frame)] pb-4">
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-plex-mono text-[11px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                {t(copy.damLab.eyebrow, lang)}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-mono uppercase">
                Figure 2.2 Formulations
              </span>
            </div>
            <h3 className="font-display font-bold text-[28px] sm:text-[34px] tracking-[-0.02em] text-[var(--ink)]">
              {t(copy.damLab.title, lang)}
            </h3>
            <p className="font-display text-[14.5px] sm:text-[16px] text-[var(--ink2)] max-w-[800px]">
              {t(copy.damLab.desc, lang)}
            </p>
          </div>

          <div className="w-full">
            <DamFloodRoutingPlayground />
          </div>
        </div>
      </div>
    </section>
  );
}


