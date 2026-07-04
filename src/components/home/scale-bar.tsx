"use client";

import { copy, t, type Lang } from "@/content/copy";

export function ScaleBar({ lang }: { lang: Lang }) {
  return (
    <div className="relative md:absolute md:left-11 md:bottom-11 flex items-end gap-5">
      <div>
        <div className="flex">
          <span className="w-11 h-2 bg-[var(--frame)]" />
          <span className="w-11 h-2 bg-[var(--paper)] border border-[var(--frame)] box-border" />
          <span className="w-11 h-2 bg-[var(--frame)]" />
          <span className="w-11 h-2 bg-[var(--paper)] border border-[var(--frame)] box-border" />
        </div>
        <div className="flex justify-between font-plex-mono text-[9px] text-[var(--ink)] mt-[3px] gap-3">
          <span>0</span>
          <span>{t(copy.home.scaleLabel, lang)}</span>
          <span>10 yrs</span>
        </div>
      </div>
      <svg width="30" height="40" viewBox="0 0 34 42" aria-hidden="true">
        <path d="M17,2 L24,34 L17,28 L10,34 Z" fill="var(--frame)" />
        <text
          x="17"
          y="41"
          textAnchor="middle"
          fill="var(--ink)"
          style={{ font: "600 9px var(--font-ibm-plex-mono)" }}
        >
          N
        </text>
      </svg>
    </div>
  );
}
