"use client";

import { useState } from "react";
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
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative min-[1400px]:absolute min-[1400px]:right-11 min-[1400px]:top-[74px] w-full min-[1400px]:w-[330px] bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex justify-between items-center px-4 py-3 bg-[var(--frame)] cursor-pointer min-[1400px]:cursor-auto"
      >
        <span className="font-plex-mono font-semibold text-[11px] tracking-[0.16em] text-[var(--paper)]">
          {t(copy.home.layers, lang)}
        </span>
        <span className="flex items-center gap-2">
          <span className="font-plex-mono text-[11px] text-[var(--paper)] opacity-60">5 / 5</span>
          <svg
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            className={`min-[1400px]:hidden w-3 h-3 text-[var(--paper)] transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`absolute min-[1400px]:static inset-x-0 top-full z-30 flex-col ${
          expanded ? "flex" : "hidden"
        } min-[1400px]:flex bg-[var(--atlas-card)] min-[1400px]:bg-transparent border-x-[1.5px] border-b-[1.5px] min-[1400px]:border-0 border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)] min-[1400px]:shadow-none`}
      >
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
