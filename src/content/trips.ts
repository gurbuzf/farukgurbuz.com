import type { Trip } from "./types";

export const trips: Trip[] = [
  {
    id: "istanbul",
    name: "İstanbul, TR",
    coords: "41.01N 28.98E",
    meta: { en: "HOME BASE", tr: "ANA ÜS" },
    img: "/images/trip-dummy-1.png",
    photos: [],
  },
];

export function findTrip(id: string) {
  return trips.find((t) => t.id === id) ?? null;
}
