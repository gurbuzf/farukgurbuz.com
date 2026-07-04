"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { trips } from "@/content/trips";
import { TripCard } from "@/components/travels/trip-card";

export default function TravelsPage() {
  const { lang } = useAtlas();

  return (
    <div data-screen-label="Travels — photo log" className="px-6 md:px-11 pt-14 pb-16">
      <div className="font-plex-mono font-medium text-[12px] tracking-[0.16em] text-[var(--acc)]">
        {t(copy.travels.sheetEyebrow, lang)}
      </div>
      <h1 className="mt-3 font-display font-semibold text-[36px] sm:text-[54px] leading-[1.02] tracking-[-0.02em] text-[var(--ink)]">
        {t(copy.travels.title, lang)}
      </h1>
      <p className="mt-3.5 max-w-[600px] font-display text-[16px] leading-[1.6] text-[var(--ink2)]">
        {t(copy.travels.desc, lang)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-9">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
