/**
 * Teaching wrapper around the level-pool routing engine (dam-routing.ts).
 *
 * The lesson exposes only a handful of knobs (flood size, outlets, reservoir size,
 * starting level); everything else is fixed so each change has one visible cause.
 */
import {
  calculateOutflowDischarge,
  evaluateInflow,
  solveReservoirRouting,
  type DamParameters,
  type InflowHydrographConfig,
} from "./dam-routing";

/** Dam crest elevation above the reservoir bed (m) — fixed for the lesson. */
export const CREST_M = 20;
/** Simulated period (h) and number of RK4 steps. */
export const HORIZON_H = 48;
export const STEPS = 240;
const BASEFLOW = 5;

export interface LessonDesign {
  /** Spillway crest elevation (m), below the dam crest */
  spillCrest: number;
  /** Spillway width (m) */
  spillWidth: number;
  /** Bottom outlet diameter (m) */
  outletD: number;
  /** Reservoir volume when full to the dam crest (hm³ = million m³) */
  capacity: number;
  /** Water level when the flood starts (m) */
  h0: number;
}

export interface LessonFlood {
  /** Peak inflow (m³/s) */
  peak: number;
  /** Time from start of the flood to its peak (h) */
  tp: number;
}

export const DEFAULT_DESIGN: LessonDesign = {
  spillCrest: 15,
  spillWidth: 25,
  outletD: 1.5,
  capacity: 12,
  h0: 10,
};

export const DEFAULT_FLOOD: LessonFlood = { peak: 150, tp: 6 };

export function toEngine(d: LessonDesign, f: LessonFlood): { dam: DamParameters; inflow: InflowHydrographConfig } {
  return {
    dam: {
      hMax: CREST_M,
      hSpill: d.spillCrest,
      lSpill: d.spillWidth,
      lCrest: 150,
      orificeDiameter: d.outletD,
      c1: 0.62,
      c2: 2.0,
      hr: 1.0,
      maxStorageHm3: d.capacity,
      reservoirAreaKm2: 1,
      h0: Math.min(d.h0, d.spillCrest),
    },
    inflow: {
      shape: "gamma",
      peakInflow: f.peak,
      baseflow: BASEFLOW,
      timeToPeakHours: f.tp,
      durationHours: HORIZON_H,
    },
  };
}

export function route(d: LessonDesign, f: LessonFlood) {
  const { dam, inflow } = toEngine(d, f);
  return solveReservoirRouting(dam, inflow, STEPS, HORIZON_H);
}

export type LessonResult = ReturnType<typeof route>;

/** Inflow hydrograph sampled for plotting: [t (h), Q (m³/s)] */
export function inflowSeries(f: LessonFlood, n = 192): [number, number][] {
  const { inflow } = toEngine(DEFAULT_DESIGN, f);
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = (i / n) * HORIZON_H;
    return [t, evaluateInflow(t, inflow)];
  });
}

/** Flood volume above baseflow (hm³), trapezoid rule over the simulated period. */
export function floodVolumeHm3(f: LessonFlood): number {
  const pts = inflowSeries(f, 480);
  let v = 0;
  for (let i = 1; i < pts.length; i++) {
    const dt = (pts[i][0] - pts[i - 1][0]) * 3600;
    v += ((pts[i][1] + pts[i - 1][1]) / 2 - BASEFLOW) * dt;
  }
  return v / 1e6;
}

/** Stage–discharge (rating) curve: outflow split by outlet type for levels 0 … maxH. */
export function ratingCurve(d: LessonDesign, maxH = CREST_M + 1, n = 120) {
  const { dam } = toEngine(d, DEFAULT_FLOOD);
  return Array.from({ length: n + 1 }, (_, i) => {
    const h = (i / n) * maxH;
    const q = calculateOutflowDischarge(h, dam);
    return { h, outlet: q.qOrifice, spillway: q.qSpillway, overtop: q.qOvertopping, total: q.qTotal };
  });
}

export function outflowAt(d: LessonDesign, h: number) {
  const { dam } = toEngine(d, DEFAULT_FLOOD);
  return calculateOutflowDischarge(h, dam);
}

/** Stored volume (hm³) at level h — same idealized curve the engine uses. */
export function storageAt(d: LessonDesign, h: number): number {
  const r = Math.max(0, h) / CREST_M;
  return d.capacity * (0.2 * r + 0.8 * r * r);
}
