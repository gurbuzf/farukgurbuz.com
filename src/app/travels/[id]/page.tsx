"use client";

import { useParams, notFound } from "next/navigation";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { findTrip } from "@/content/trips";
import { BackLink } from "@/components/atlas/back-link";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useAtlas();
  const trip = findTrip(id);

  if (!trip) notFound();

  return (
    <div className="px-6 md:px-11 pt-11 pb-18 flex justify-center">
      <div className="w-[min(1000px,100%)]">
        <BackLink href="/travels">{t(copy.travels.back, lang)}</BackLink>

        <div className="flex gap-3 items-baseline mt-9 flex-wrap">
          <span className="font-plex-mono font-semibold text-[10px] tracking-[0.14em] px-2 py-1 bg-[var(--acc)] text-[var(--accInk)]">
            {t(trip.meta, lang)}
          </span>
          <span className="font-plex-mono font-medium text-[11px] text-[var(--mut)]">{trip.coords}</span>
        </div>

        <h1 className="mt-4 font-display font-semibold text-[32px] sm:text-[44px] leading-[1.12] tracking-[-0.02em] text-[var(--ink)]">
          {trip.name}
        </h1>
        <div className="mt-6 border-t-[1.5px] border-[var(--frame)]" />

        <div className="mt-8">
          {trip.photos.length === 0 ? (
            <div className="border-[1.5px] border-dashed border-[var(--frame)] px-8 py-11 flex flex-col items-center gap-2.5 text-center">
              <span className="font-plex-mono font-semibold text-[11px] tracking-[0.16em] text-[var(--acc)]">
                {t(copy.common.photosPending, lang)}
              </span>
              <span className="font-display text-[15px] leading-[1.6] text-[var(--ink2)] max-w-[480px]">
                {t(copy.travels.emptyDesc, lang)}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {trip.photos.map((photo, i) => (
                <figure
                  key={i}
                  className={`m-0 ${photo.wide ? "sm:col-span-2" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    className="w-full block border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)]"
                  />
                  <figcaption className="mt-2 font-plex-mono font-medium text-[11px] tracking-[0.08em] text-[var(--mut)]">
                    {photo.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
