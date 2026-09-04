/**
 * Dam Hydraulics & Level-Pool Reservoir Flood Routing Engine
 * Based on Faruk Gurbuz's M.Sc. thesis ("Exploration of flood forecasting and flood mitigation",
 * The University of Iowa, Chapter 2 & Figure 2.2 / page 32).
 */

export type HydrographShape = "gamma" | "triangular" | "trapezoid";

export interface DamParameters {
  /** Dam height (crest elevation above datum), meters */
  hMax: number;
  /** Spillway crest elevation above datum, meters (hSpill < hMax) */
  hSpill: number;
  /** Length of the spillway crest, meters */
  lSpill: number;
  /** Total length of the dam crest, meters (lCrest >= lSpill) */
  lCrest: number;
  /** Bottom orifice outlet diameter, meters */
  orificeDiameter: number;
  /** Bottom orifice discharge coefficient (c1) */
  c1: number;
  /** Spillway weir discharge coefficient (c2) */
  c2: number;
  /** Reference head (Hr), meters (default = 1.0 m) */
  hr: number;
  /** Reservoir pool surface area, km² (assumed constant or mean for level pool) */
  reservoirAreaKm2: number;
  /** Initial water elevation, meters */
  h0: number;
}

export interface InflowHydrographConfig {
  shape: HydrographShape;
  /** Peak inflow rate, m³/s */
  peakInflow: number;
  /** Baseflow rate, m³/s */
  baseflow: number;
  /** Time to peak, hours */
  timeToPeakHours: number;
  /** Total flood duration, hours */
  durationHours: number;
}

export interface FlowRegimes {
  regime: 1 | 2 | 3 | 4;
  regimeName: { en: string; tr: string };
  qOrifice: number;
  qSpillway: number;
  qOvertopping: number;
  qTotal: number;
}

export interface RoutingStep {
  timeHours: number;
  timeMinutes: number;
  inflow: number;
  outflow: number;
  stage: number;
  storageM3: number;
  qOrifice: number;
  qSpillway: number;
  qOvertopping: number;
  regime: 1 | 2 | 3 | 4;
}

export interface RoutingSummary {
  peakInflow: number;
  peakOutflow: number;
  timeToPeakInflowHours: number;
  timeToPeakOutflowHours: number;
  lagTimeHours: number;
  peakAttenuationM3s: number;
  peakAttenuationPercent: number;
  maxStage: number;
  minFreeboard: number;
  isOvertopped: boolean;
  totalInflowVolumeM3: number;
  totalOutflowVolumeM3: number;
  initialStorageM3: number;
  maxStorageM3: number;
}

export const DEFAULT_DAM_PARAMS: DamParameters = {
  hMax: 18.0,
  hSpill: 13.5,
  lSpill: 20.0,
  lCrest: 90.0,
  orificeDiameter: 1.4,
  c1: 0.62,
  c2: 2.1,
  hr: 1.0,
  reservoirAreaKm2: 0.85,
  h0: 8.0,
};

export const DEFAULT_INFLOW_CONFIG: InflowHydrographConfig = {
  shape: "gamma",
  peakInflow: 95.0,
  baseflow: 4.0,
  timeToPeakHours: 6.0,
  durationHours: 32.0,
};

export const DAM_PRESETS = [
  {
    id: "balanced",
    name: { en: "Standard Multi-Purpose Dam", tr: "Standart Çok Amaçlı Baraj" },
    desc: {
      en: "Conservation pool with bottom orifice outlet and broad emergency spillway.",
      tr: "Dip savak tahliyesi ve acil durum kret savaklı dengeli depolama barajı.",
    },
    params: {
      hMax: 18.0,
      hSpill: 13.5,
      lSpill: 20.0,
      lCrest: 90.0,
      orificeDiameter: 1.4,
      c1: 0.62,
      c2: 2.1,
      hr: 1.0,
      reservoirAreaKm2: 0.85,
      h0: 8.0,
    },
    inflow: {
      shape: "gamma" as HydrographShape,
      peakInflow: 95.0,
      baseflow: 4.0,
      timeToPeakHours: 6.0,
      durationHours: 32.0,
    },
  },
  {
    id: "dry-dam",
    name: { en: "Flood Detention Basin (Dry Dam)", tr: "Kuru Taşkın Kapanı (Dry Dam)" },
    desc: {
      en: "Normally empty reservoir; orifice throttles peak flow while emergency spillway handles extreme events.",
      tr: "Normalde kuru bekleyen, dip savakla debiyi boğan ve taşkın suyunu geçici depolayan yapı.",
    },
    params: {
      hMax: 15.0,
      hSpill: 11.0,
      lSpill: 25.0,
      lCrest: 75.0,
      orificeDiameter: 1.2,
      c1: 0.60,
      c2: 2.0,
      hr: 1.0,
      reservoirAreaKm2: 1.2,
      h0: 0.0,
    },
    inflow: {
      shape: "triangular" as HydrographShape,
      peakInflow: 120.0,
      baseflow: 0.0,
      timeToPeakHours: 4.5,
      durationHours: 24.0,
    },
  },
  {
    id: "mountain-gorge",
    name: { en: "Narrow Mountain Gorge Reservoir", tr: "Dar Vadi Dağ Barajı" },
    desc: {
      en: "High crest, small surface area, rapid water stage rise during heavy mountain flash floods.",
      tr: "Yüksek gövde, kısıtlı vadi göl alanı; ani sağanaklarda hızla kabaran su seviyesi.",
    },
    params: {
      hMax: 26.0,
      hSpill: 21.0,
      lSpill: 15.0,
      lCrest: 50.0,
      orificeDiameter: 1.6,
      c1: 0.62,
      c2: 2.2,
      hr: 1.0,
      reservoirAreaKm2: 0.35,
      h0: 16.0,
    },
    inflow: {
      shape: "gamma" as HydrographShape,
      peakInflow: 140.0,
      baseflow: 5.0,
      timeToPeakHours: 3.5,
      durationHours: 20.0,
    },
  },
  {
    id: "overtopping-risk",
    name: { en: "Emergency Overtopping Scenario", tr: "Kret Aşımı Acil Durum Senaryosu" },
    desc: {
      en: "Extreme torrential inflow exceeds spillway capacity, pushing stage above dam crest (H > H_max).",
      tr: "Dolu savak kapasitesini aşan olağanüstü taşkın gövde kretini (H_max) aşarak tehlike yaratır.",
    },
    params: {
      hMax: 14.0,
      hSpill: 11.0,
      lSpill: 10.0,
      lCrest: 60.0,
      orificeDiameter: 0.9,
      c1: 0.62,
      c2: 2.0,
      hr: 1.0,
      reservoirAreaKm2: 0.45,
      h0: 10.5,
    },
    inflow: {
      shape: "trapezoid" as HydrographShape,
      peakInflow: 180.0,
      baseflow: 8.0,
      timeToPeakHours: 5.0,
      durationHours: 28.0,
    },
  },
];

/**
 * Calculates piecewise discharge q(t, h) according to Faruk Gurbuz's thesis formulation:
 * - Regime 1 (h < d): Partially filled bottom circular orifice
 * - Regime 2 (d <= h <= H_spill): Pressurized submerged orifice
 * - Regime 3 (H_spill < h <= H_max): Submerged orifice + spillway weir
 * - Regime 4 (h > H_max): Submerged orifice + spillway + dam crest overtopping
 */
export function calculateOutflowDischarge(h: number, params: DamParameters): FlowRegimes {
  const g = 9.81;
  const d = Math.max(0.05, params.orificeDiameter);
  const r = d / 2;
  const oa = (Math.PI / 4) * d * d;
  const c1 = params.c1;
  const c2 = params.c2;
  const hr = Math.max(0.01, params.hr);
  const hSpill = params.hSpill;
  const hMax = Math.max(hSpill + 0.1, params.hMax);
  const lSpill = params.lSpill;
  const lCrest = Math.max(lSpill, params.lCrest);

  if (h <= 0.0001) {
    return {
      regime: 1,
      regimeName: { en: "Dry / No Outflow", tr: "Kuru / Akış Yok" },
      qOrifice: 0,
      qSpillway: 0,
      qOvertopping: 0,
      qTotal: 0,
    };
  }

  // 1. Bottom Orifice component
  let qOrifice = 0;
  if (h < d) {
    // Partially filled orifice: f = (h - r) / r
    const f = Math.max(-0.9999, Math.min(0.9999, (h - r) / r));
    // Wet segment angle factor: theta = arccos(f), segment area = r^2 * (arccos(f) - f * sqrt(1 - f^2))
    // Standard hydraulic formula for circular segment:
    const segArea = r * r * (Math.acos(-f) - (-f) * Math.sqrt(1 - f * f));
    // Effective velocity head: sqrt(2 * g * max(0.01, h))
    qOrifice = c1 * segArea * Math.sqrt(2 * g * h);
  } else {
    // Fully submerged pressurized orifice flow: c1 * Oa * sqrt(2 * g * h)
    qOrifice = c1 * oa * Math.sqrt(2 * g * h);
  }

  // 2. Spillway weir component
  let qSpillway = 0;
  if (h > hSpill) {
    const headOverSpill = (h - hSpill) / hr;
    qSpillway = c2 * lSpill * Math.pow(headOverSpill, 1.5);
  }

  // 3. Dam Crest overtopping component
  let qOvertopping = 0;
  if (h > hMax) {
    const headOverCrest = (h - hMax) / hr;
    const overtopLength = Math.max(0, lCrest - lSpill);
    qOvertopping = c2 * overtopLength * Math.pow(headOverCrest, 1.5);
  }

  let regime: 1 | 2 | 3 | 4 = 1;
  let regimeName = { en: "Regime 1: Partial Orifice Flow", tr: "Aşama 1: Kısmi Dolu Dip Savak" };

  if (h >= d && h <= hSpill) {
    regime = 2;
    regimeName = { en: "Regime 2: Pressurized Orifice Flow", tr: "Aşama 2: Basınçlı Dip Savak Akışı" };
  } else if (h > hSpill && h <= hMax) {
    regime = 3;
    regimeName = { en: "Regime 3: Orifice + Spillway Discharge", tr: "Aşama 3: Dip Savak + Dolu Savak Akışı" };
  } else if (h > hMax) {
    regime = 4;
    regimeName = { en: "Regime 4: Dam Crest Overtopping (Emergency!)", tr: "Aşama 4: Baraj Kreti Aşımı (Acil Durum!)" };
  }

  const qTotal = qOrifice + qSpillway + qOvertopping;

  return {
    regime,
    regimeName,
    qOrifice,
    qSpillway,
    qOvertopping,
    qTotal,
  };
}

/**
 * Computes inflow rate I(t) at any time t (hours) based on configured hydrograph
 */
export function evaluateInflow(tHours: number, config: InflowHydrographConfig): number {
  if (tHours < 0 || tHours > config.durationHours) {
    return config.baseflow;
  }

  const tp = Math.max(0.1, config.timeToPeakHours);
  const td = Math.max(tp * 1.5, config.durationHours);
  const peakNet = Math.max(0, config.peakInflow - config.baseflow);

  if (config.shape === "gamma") {
    // Synthetic Gamma curve with alpha = 2.5
    const alpha = 2.5;
    const ratio = tHours / tp;
    const gammaFactor = Math.pow(ratio, alpha) * Math.exp(-alpha * (ratio - 1));
    return config.baseflow + peakNet * Math.max(0, gammaFactor);
  }

  if (config.shape === "triangular") {
    if (tHours <= tp) {
      return config.baseflow + peakNet * (tHours / tp);
    } else if (tHours <= td) {
      return config.baseflow + peakNet * (1 - (tHours - tp) / (td - tp));
    }
    return config.baseflow;
  }

  if (config.shape === "trapezoid") {
    // Sustained storm peak from tp to tp + 0.3 * duration
    const plateauEnd = Math.min(td - 0.2 * td, tp + 0.25 * td);
    if (tHours <= tp) {
      return config.baseflow + peakNet * (tHours / tp);
    } else if (tHours <= plateauEnd) {
      return config.baseflow + peakNet;
    } else if (tHours <= td) {
      return config.baseflow + peakNet * (1 - (tHours - plateauEnd) / (td - plateauEnd));
    }
    return config.baseflow;
  }

  return config.baseflow;
}

/**
 * Performs Level-Pool Reservoir Flood Routing by solving the continuity mass balance:
 *   dS/dt = I(t) - Q(t, h)
 *   dh/dt = (I(t) - Q(t, h)) / A_res
 * Using 4th-Order Runge-Kutta (RK4) integration for high numerical stability and smoothness.
 */
export function solveReservoirRouting(
  dam: DamParameters,
  inflowConfig: InflowHydrographConfig,
  totalSteps = 160
): { steps: RoutingStep[]; summary: RoutingSummary } {
  const durationHours = Math.max(8, inflowConfig.durationHours);
  const dtHours = durationHours / totalSteps;
  const dtSeconds = dtHours * 3600;
  const areaM2 = dam.reservoirAreaKm2 * 1_000_000;

  const steps: RoutingStep[] = [];
  let currentStage = dam.h0;

  let peakInflow = 0;
  let timeToPeakInflow = 0;
  let peakOutflow = 0;
  let timeToPeakOutflow = 0;
  let maxStage = currentStage;
  let totalInflowM3 = 0;
  let totalOutflowM3 = 0;

  // Rate function: dh/dt = (I - Q) / A_res
  const dhdt = (tH: number, hVal: number): number => {
    const iVal = evaluateInflow(tH, inflowConfig);
    const flow = calculateOutflowDischarge(hVal, dam);
    return (iVal - flow.qTotal) / areaM2;
  };

  for (let i = 0; i <= totalSteps; i++) {
    const tH = i * dtHours;
    const tMin = tH * 60;
    const inf = evaluateInflow(tH, inflowConfig);
    const flow = calculateOutflowDischarge(currentStage, dam);

    if (inf > peakInflow) {
      peakInflow = inf;
      timeToPeakInflow = tH;
    }
    if (flow.qTotal > peakOutflow) {
      peakOutflow = flow.qTotal;
      timeToPeakOutflow = tH;
    }
    if (currentStage > maxStage) {
      maxStage = currentStage;
    }

    totalInflowM3 += inf * dtSeconds;
    totalOutflowM3 += flow.qTotal * dtSeconds;

    steps.push({
      timeHours: Number(tH.toFixed(2)),
      timeMinutes: Math.round(tMin),
      inflow: Number(inf.toFixed(2)),
      outflow: Number(flow.qTotal.toFixed(2)),
      stage: Number(currentStage.toFixed(3)),
      storageM3: Math.round(areaM2 * currentStage),
      qOrifice: Number(flow.qOrifice.toFixed(2)),
      qSpillway: Number(flow.qSpillway.toFixed(2)),
      qOvertopping: Number(flow.qOvertopping.toFixed(2)),
      regime: flow.regime,
    });

    if (i < totalSteps) {
      // 4th-Order Runge-Kutta step
      const k1 = dhdt(tH, currentStage);
      const k2 = dhdt(tH + 0.5 * dtHours, currentStage + 0.5 * dtSeconds * k1);
      const k3 = dhdt(tH + 0.5 * dtHours, currentStage + 0.5 * dtSeconds * k2);
      const k4 = dhdt(tH + dtHours, currentStage + dtSeconds * k3);

      const dStage = (dtSeconds / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      currentStage = Math.max(0, currentStage + dStage);
    }
  }

  const lagTimeHours = Math.max(0, timeToPeakOutflow - timeToPeakInflow);
  const peakAttenuationM3s = Math.max(0, peakInflow - peakOutflow);
  const peakAttenuationPercent = peakInflow > 0 ? (peakAttenuationM3s / peakInflow) * 100 : 0;
  const minFreeboard = dam.hMax - maxStage;
  const isOvertopped = maxStage > dam.hMax;

  const summary: RoutingSummary = {
    peakInflow: Number(peakInflow.toFixed(1)),
    peakOutflow: Number(peakOutflow.toFixed(1)),
    timeToPeakInflowHours: Number(timeToPeakInflow.toFixed(1)),
    timeToPeakOutflowHours: Number(timeToPeakOutflow.toFixed(1)),
    lagTimeHours: Number(lagTimeHours.toFixed(1)),
    peakAttenuationM3s: Number(peakAttenuationM3s.toFixed(1)),
    peakAttenuationPercent: Number(peakAttenuationPercent.toFixed(1)),
    maxStage: Number(maxStage.toFixed(2)),
    minFreeboard: Number(minFreeboard.toFixed(2)),
    isOvertopped,
    totalInflowVolumeM3: Math.round(totalInflowM3),
    totalOutflowVolumeM3: Math.round(totalOutflowM3),
    initialStorageM3: Math.round(areaM2 * dam.h0),
    maxStorageM3: Math.round(areaM2 * maxStage),
  };

  return { steps, summary };
}
