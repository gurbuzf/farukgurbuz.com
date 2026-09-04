"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { WatershedPlayground } from "@/components/home/watershed-playground";
import { Waves } from "lucide-react";

export default function HydrologyLabPage() {
  const { lang } = useAtlas();

  return (
    <div
      data-screen-label="Hydrology Lab — Dedicated Page"
      className="w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-14 flex flex-col items-center"
    >
      <div className="relative w-full max-w-[1240px] flex flex-col gap-10">
        {/* Apple-style Section Header */}
        <div className="flex flex-col gap-3 text-center items-center max-w-[840px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--frame)] bg-[var(--atlas-card)] shadow-2xs">
            <Waves size={13} className="text-[var(--acc)] animate-pulse" />
            <span className="font-plex-mono text-[11px] font-bold tracking-widest text-[var(--acc)] uppercase">
              {t(copy.home.labEyebrow, lang)}
            </span>
          </div>

          <h1 className="font-display font-bold text-[32px] sm:text-[46px] lg:text-[54px] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
            {t(copy.home.labTitle, lang)}
          </h1>

          <p className="font-display text-[15px] sm:text-[17px] leading-[1.6] text-[var(--ink2)] max-w-[720px]">
            {t(copy.home.labDesc, lang)}
          </p>
        </div>

        {/* The Dynamic Interactive Watershed Playground */}
        <div className="w-full">
          <WatershedPlayground />
        </div>
      </div>
    </div>
  );
}
