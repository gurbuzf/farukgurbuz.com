"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { WatershedPlayground } from "./watershed-playground";
import { Waves } from "lucide-react";

export function HydrologyLabSection() {
  const { lang } = useAtlas();

  return (
    <section
      id="hydrology-lab"
      data-screen-label="Interactive Hydrology Lab"
      className="relative w-full border-t-[1.5px] border-[var(--frame)] bg-[var(--paper)] py-20 px-6 sm:px-10 lg:px-14 flex flex-col items-center overflow-hidden"
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

      <div className="relative w-full max-w-[1120px] flex flex-col gap-10">
        {/* ── Apple-style Section Header & Social Links ───────────────────── */}
        <div className="flex flex-col gap-4 text-center items-center max-w-[840px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--frame)] bg-[var(--atlas-card)] shadow-2xs">
            <Waves size={13} className="text-[var(--acc)] animate-pulse" />
            <span className="font-plex-mono text-[11px] font-bold tracking-widest text-[var(--acc)] uppercase">
              {t(copy.home.labEyebrow, lang)}
            </span>
          </div>

          <h2 className="font-display font-bold text-[34px] sm:text-[46px] lg:text-[54px] leading-[1.06] tracking-[-0.03em] text-[var(--ink)]">
            {t(copy.home.labTitle, lang)}
          </h2>

          <p className="font-display text-[15px] sm:text-[17px] leading-[1.6] text-[var(--ink2)] max-w-[680px]">
            {t(copy.home.labDesc, lang)}
          </p>
        </div>

        {/* ── The Dynamic Interactive Watershed Playground ───────────────── */}
        <div className="w-full">
          <WatershedPlayground />
        </div>
      </div>
    </section>
  );
}
