"use client";

import Link from "next/link";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import type { Trip } from "@/content/types";

export function TripCard({ trip }: { trip: Trip }) {
  const { lang } = useAtlas();
  const count = trip.photos.length
    ? `${trip.photos.length} ${t(copy.travels.photosSuffix, lang)}`
    : t(copy.travels.logLabel, lang);

  return (
    <Link
      href={`/travels/${trip.id}`}
      className="cursor-pointer bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)] p-3.5 pb-4 flex flex-col gap-3 hover:shadow-[8px_8px_0_var(--shadow)] hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div className="relative h-[250px] overflow-hidden border border-[var(--line)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trip.img} alt={trip.name} className="w-full h-full object-cover block" />
        <span className="absolute top-2.5 left-2.5 font-plex-mono font-semibold text-[9px] tracking-[0.12em] px-[7px] py-[3px] bg-[var(--paper)] border border-[var(--frame)] text-[var(--ink)]">
          {count}
        </span>
      </div>
      <div className="flex justify-between items-baseline px-1 gap-2">
        <span className="font-display font-semibold text-[15px] text-[var(--ink)]">{trip.name}</span>
        <span className="font-plex-mono font-medium text-[10px] text-[var(--mut)] whitespace-nowrap">
          {trip.coords}
        </span>
      </div>
      <div className="flex justify-between items-baseline px-1 gap-2">
        <span className="font-plex-mono font-medium text-[11px] text-[var(--acc)]">
          {t(trip.meta, lang)}
        </span>
        <span className="font-plex-mono font-semibold text-[12px] text-[var(--acc)] whitespace-nowrap">
          {t(copy.travels.view, lang)}
        </span>
      </div>
    </Link>
  );
}
