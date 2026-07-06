"use client";

import Link from "next/link";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { Pill } from "@/components/atlas/pill";
import { LayersPanel } from "./layers-panel";
import { FeaturePhoto } from "./feature-photo";
import { ScaleBar } from "./scale-bar";

export function HeroMap() {
  const { lang } = useAtlas();

  return (
    <div
      data-screen-label="Home — map sheet"
      className="relative overflow-hidden flex flex-col gap-10 px-6 py-10 min-[1400px]:block min-[1400px]:px-0 min-[1400px]:py-0 min-[1400px]:gap-0 min-[1400px]:flex-1 min-[1400px]:min-h-[740px]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('/images/terrain.png')",
          opacity: "var(--terrainA, 0.55)",
          filter: "var(--terrainF, saturate(0.82))",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(96deg,var(--paper) 0%,color-mix(in srgb,var(--paper) 86%,transparent) 30%,color-mix(in srgb,var(--paper) 45%,transparent) 55%,color-mix(in srgb,var(--paper) 12%,transparent) 78%,transparent 100%),linear-gradient(180deg,color-mix(in srgb,var(--paper) 70%,transparent) 0%,transparent 18%,transparent 80%,color-mix(in srgb,var(--paper) 65%,transparent) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: "var(--gridA, 1)",
          backgroundImage:
            "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          backgroundPosition: "22px 16px",
        }}
      />

      {/* graticule labels */}
      <div className="hidden min-[1400px]:block absolute top-3 left-24 font-plex-mono font-medium text-[10px] text-[var(--ink)]">
        28°58&apos;E
      </div>
      <div className="hidden min-[1400px]:block absolute top-3 right-24 font-plex-mono font-medium text-[10px] text-[var(--ink)]">
        29°06&apos;E
      </div>
      <div
        className="hidden min-[1400px]:block absolute top-24 left-2 font-plex-mono font-medium text-[10px] text-[var(--ink)]"
        style={{ writingMode: "vertical-rl" }}
      >
        41°01&apos;N
      </div>
      <div
        className="hidden min-[1400px]:block absolute bottom-24 left-2 font-plex-mono font-medium text-[10px] text-[var(--ink)]"
        style={{ writingMode: "vertical-rl" }}
      >
        40°58&apos;N
      </div>

      {/* hero */}
      <div className="relative min-[1400px]:absolute min-[1400px]:left-11 min-[1400px]:top-[74px] max-w-[600px]">
        <svg
          aria-hidden="true"
          focusable="false"
          className="absolute top-0 bottom-0 left-[-14px] w-1 pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 4 100"
        >
          <line x1="2" y1="0" x2="2" y2="100" stroke="var(--river)" strokeWidth="4" />
          <line
            x1="2"
            y1="0"
            x2="2"
            y2="100"
            stroke="var(--riverEdge)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            style={{ animation: "flowdash 12s linear infinite" }}
          />
        </svg>

        <div
          className="font-plex-mono font-medium text-[12px] tracking-[0.16em] text-[var(--acc)]"
          style={{ animation: "heroFadeIn 0.6s ease-out both", animationDelay: "0ms" }}
        >
          {t(copy.home.legend, lang)}
        </div>
        <h1
          className="mt-3.5 font-display font-semibold text-[52px] sm:text-[68px] md:text-[92px] leading-[0.98] tracking-[-0.03em] text-[var(--ink)]"
          style={{ animation: "heroFadeIn 0.6s ease-out both", animationDelay: "80ms" }}
        >
          Faruk
          <br />
          Gürbüz
        </h1>
        <div
          className="flex gap-2.5 mt-6 flex-wrap"
          style={{ animation: "heroFadeIn 0.6s ease-out both", animationDelay: "160ms" }}
        >
          <Pill>DATA</Pill>
          <Pill>GIS</Pill>
          <Pill filled>WATER</Pill>
        </div>
        <p
          className="mt-6 font-display text-[18px] leading-[1.6] text-[var(--ink2)] max-w-[540px]"
          style={{
            background: "color-mix(in srgb, var(--paper) 35%, transparent)",
            boxShadow: "0 0 18px 12px color-mix(in srgb, var(--paper) 35%, transparent)",
            animation: "heroFadeIn 0.6s ease-out both",
            animationDelay: "240ms",
          }}
        >
          {t(copy.home.heroDesc, lang)}
        </p>
        <div
          className="flex gap-3 mt-7 flex-wrap"
          style={{ animation: "heroFadeIn 0.6s ease-out both", animationDelay: "320ms" }}
        >
          <Link
            href="/work"
            className="cursor-pointer px-5 py-3 bg-[var(--frame)] text-[var(--paper)] font-display font-semibold text-[13px]"
          >
            {t(copy.home.exploreWork, lang)}
          </Link>
          <Link
            href="/cv"
            className="cursor-pointer px-5 py-3 border-[1.5px] border-[var(--frame)] text-[var(--ink)] font-display font-medium text-[13px]"
          >
            {t(copy.home.interactiveCv, lang)}
          </Link>
        </div>
      </div>

      <LayersPanel lang={lang} />
      <FeaturePhoto lang={lang} />
      <ScaleBar lang={lang} />
    </div>
  );
}
