"use client";

import Link from "next/link";
import { copy, t, type Lang } from "@/content/copy";

const LAYERS: { href: string; label: (typeof copy.home)["layerWork"]; tag: string }[] = [
  { href: "/work", label: copy.home.layerWork, tag: "VEC" },
  { href: "/cv", label: copy.home.layerCv, tag: "TML" },
  { href: "/notes", label: copy.home.layerNotes, tag: "TXT" },
  { href: "/travels", label: copy.home.layerTravels, tag: "IMG" },
  { href: "/publications", label: copy.home.layerPubs, tag: "BIB" },
];

export function LayersPanel({ lang }: { lang: Lang }) {
  return (
    <div className="relative md:absolute md:right-11 md:top-[74px] w-full md:w-[330px] bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)]">
      <div className="flex justify-between items-center px-4 py-3 bg-[var(--frame)]">
        <span className="font-plex-mono font-semibold text-[11px] tracking-[0.16em] text-[var(--paper)]">
          {t(copy.home.layers, lang)}
        </span>
        <span className="font-plex-mono text-[11px] text-[var(--paper)] opacity-60">5 / 5</span>
      </div>
      <div className="flex flex-col">
        {LAYERS.map((layer, i) => (
          <Link
            key={layer.href}
            href={layer.href}
            className={`cursor-pointer flex items-center gap-3 px-4 py-[13px] hover:bg-[var(--paper)] ${
              i < LAYERS.length - 1 ? "border-b border-[var(--line)]" : ""
            }`}
          >
            <span className="w-3.5 h-3.5 bg-[var(--acc)] border-[1.5px] border-[var(--frame)] flex-none" />
            <span className="font-display font-medium text-[13px] text-[var(--ink)] flex-1">
              {t(layer.label, lang)}
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)]">{layer.tag}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
