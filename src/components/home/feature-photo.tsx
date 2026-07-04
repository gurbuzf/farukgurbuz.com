"use client";

import { copy, t, type Lang } from "@/content/copy";

export function FeaturePhoto({ lang }: { lang: Lang }) {
  return (
    <div className="relative min-[1400px]:absolute min-[1400px]:right-24 min-[1400px]:bottom-16 flex items-center gap-4">
      <svg
        width="52"
        height="70"
        viewBox="0 0 60 80"
        aria-hidden="true"
        className="hidden sm:block origin-center"
        style={{ animation: "markerPulse 2.6s ease-in-out infinite" }}
      >
        <path
          d="M30,4 C43,4 54,15 54,28 C54,46 30,72 30,72 C30,72 6,46 6,28 C6,15 17,4 30,4 Z"
          fill="var(--acc)"
          stroke="var(--frame)"
          strokeWidth="2"
        />
        <circle cx="30" cy="28" r="9" fill="var(--paper)" stroke="var(--frame)" strokeWidth="2" />
      </svg>
      <div className="w-[120px] h-[120px] rounded-full border-2 border-[var(--frame)] overflow-hidden shadow-[6px_6px_0_var(--shadow)] flex-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/faruk.jpg"
          alt="Faruk Gürbüz"
          className="w-full h-full object-cover"
          style={{ objectPosition: "50% 20%" }}
        />
      </div>
      <div className="font-plex-mono font-medium text-[11px] leading-[1.7] text-[var(--ink)]">
        FEATURE: F. GÜRBÜZ
        <br />
        LAT 41.0082 LON 28.9784
        <br />
        STATUS: <span className="text-[var(--acc)]">{t(copy.home.inTheField, lang)}</span>
      </div>
    </div>
  );
}
