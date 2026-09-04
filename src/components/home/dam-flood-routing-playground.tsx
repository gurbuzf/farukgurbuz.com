"use client";

import { useState, useMemo, useEffect } from "react";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import {
  DamParameters,
  InflowHydrographConfig,
  HydrographShape,
  DEFAULT_DAM_PARAMS,
  DEFAULT_INFLOW_CONFIG,
  DAM_PRESETS,
  calculateOutflowDischarge,
  solveReservoirRouting,
} from "@/lib/dam-routing";
import {
  Play,
  Pause,
  RotateCcw,
  TrendingDown,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Waves,
  ChevronDown,
  ChevronUp,
  Calculator,
  SlidersHorizontal,
} from "lucide-react";

export function DamFloodRoutingPlayground() {
  const { lang, dark } = useAtlas();

  // Dam & Inflow Parameters State
  const [dam, setDam] = useState<DamParameters>(DEFAULT_DAM_PARAMS);
  const [inflow, setInflow] = useState<InflowHydrographConfig>(DEFAULT_INFLOW_CONFIG);
  const [activePreset, setActivePreset] = useState<string>("balanced");

  // View Mode: Profile (Enkesit) vs Elevation (Boykesit)
  const [viewMode, setViewMode] = useState<"profile" | "elevation">("profile");

  // Controls Tab: Dam Geometry vs Inflow Hydrology
  const [controlsTab, setControlsTab] = useState<"geometry" | "hydrology">("geometry");

  // Simulation Animation State
  const [currentTimeHours, setCurrentTimeHours] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Equations drawer
  const [showEquations, setShowEquations] = useState<boolean>(false);

  // Solve reservoir routing in real time
  const { steps, summary } = useMemo(() => {
    return solveReservoirRouting(dam, inflow, 160);
  }, [dam, inflow]);

  // Interpolated state at currentTimeHours
  const currentStep = useMemo(() => {
    if (steps.length === 0) return null;
    let closest = steps[0];
    let minDiff = Math.abs(steps[0].timeHours - currentTimeHours);
    for (let i = 1; i < steps.length; i++) {
      const diff = Math.abs(steps[i].timeHours - currentTimeHours);
      if (diff < minDiff) {
        minDiff = diff;
        closest = steps[i];
      }
    }
    return closest;
  }, [steps, currentTimeHours]);

  const currentStage = currentStep ? currentStep.stage : dam.h0;
  const currentOutflow = currentStep ? currentStep.outflow : 0;
  const currentInflow = currentStep ? currentStep.inflow : inflow.baseflow;
  const currentFlowBreakdown = useMemo(() => {
    return calculateOutflowDischarge(currentStage, dam);
  }, [currentStage, dam]);

  // Animation frame ticker
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTimeHours((prev) => {
        const stepSize = 0.12 * playbackSpeed;
        const nextTime = prev + stepSize;
        if (nextTime >= inflow.durationHours) {
          setIsPlaying(false);
          return inflow.durationHours;
        }
        return nextTime;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, inflow.durationHours]);

  // Preset Handler
  const handleApplyPreset = (presetId: string) => {
    const found = DAM_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setDam(found.params);
    setInflow(found.inflow);
    setActivePreset(presetId);
    setCurrentTimeHours(0);
    setIsPlaying(false);
  };

  // Safe parameter updaters
  const updateDamParam = (key: keyof DamParameters, value: number) => {
    setDam((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "hMax" && next.hSpill >= value) {
        next.hSpill = Math.max(1, value - 1.5);
      }
      if (key === "hSpill" && next.hMax <= value) {
        next.hMax = value + 1.5;
      }
      if (key === "lCrest" && next.lSpill > value) {
        next.lSpill = value;
      }
      if (key === "lSpill" && next.lCrest < value) {
        next.lCrest = value;
      }
      if (key === "hMax" && next.h0 > value) {
        next.h0 = value;
      }
      return next;
    });
    setActivePreset("custom");
  };

  const updateInflowParam = (key: keyof InflowHydrographConfig, value: any) => {
    setInflow((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "durationHours" && next.timeToPeakHours >= value) {
        next.timeToPeakHours = Math.max(1, value * 0.35);
      }
      if (key === "timeToPeakHours" && next.durationHours <= value) {
        next.durationHours = value * 2.5;
      }
      return next;
    });
    setActivePreset("custom");
  };

  const isCurrentlySpilling = currentStage > dam.hSpill;
  const isCurrentlyOvertopping = currentStage > dam.hMax;
  const freeboardNow = Math.max(0, dam.hMax - currentStage);

  return (
    <div className="w-full bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] rounded-xl overflow-hidden shadow-[6px_6px_0_var(--shadow)] transition-all flex flex-col">
      {/* ── Top Header Toolbar (Lab 01 Style) ─────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-[var(--paper)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-plex-mono text-[9.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[var(--line)] text-[var(--acc)] border border-[var(--frame)]">
              {t(copy.damLab.eyebrow, lang)}
            </span>
          </div>
          <h3 className="font-display font-bold text-[20px] sm:text-[24px] text-[var(--ink)] tracking-tight mt-1">
            {t(copy.damLab.title, lang)}
          </h3>
          <p className="font-display text-[12px] sm:text-[13px] text-[var(--mut)] max-w-3xl leading-snug mt-0.5">
            {t(copy.damLab.desc, lang)}
          </p>
        </div>

        {/* Preset Scenarios Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start lg:self-center">
          <span className="font-plex-mono text-[10px] font-bold text-[var(--mut)] uppercase tracking-wider">
            {t(copy.damLab.controls.presetsHeading, lang)}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 bg-[var(--atlas-card)] p-1 rounded-md border border-[var(--line)]">
            {DAM_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                className={`cursor-pointer px-2.5 py-1 text-[10.5px] font-plex-mono font-medium rounded transition-all ${
                  activePreset === p.id
                    ? "bg-[var(--frame)] text-[var(--paper)] shadow-2xs font-bold"
                    : "text-[var(--ink2)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                }`}
              >
                {t(p.name, lang)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Key Hydraulic Metrics Summary Row (Lab 01 Style) ──────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--line)] border-b border-[var(--line)] bg-[var(--paper)]">
        {/* Metric 1: Dam Safety Freeboard */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-center">
          <span className="font-plex-mono text-[10px] font-semibold text-[var(--mut)] uppercase tracking-wider flex items-center gap-1">
            {summary.isOvertopped ? (
              <span className="text-rose-600 flex items-center gap-1 font-bold">
                <ShieldAlert size={12} /> {lang === "tr" ? "Kret Aşımı Tehlikesi" : "Overtopping Risk"}
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <ShieldCheck size={12} /> {lang === "tr" ? "Hava Payı (Emniyet)" : "Safety Freeboard"}
              </span>
            )}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`font-display font-bold text-[19px] sm:text-[21px] leading-tight ${
                summary.isOvertopped ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {summary.isOvertopped
                ? `-${(summary.maxStage - dam.hMax).toFixed(2)} m`
                : `+${summary.minFreeboard.toFixed(2)} m`}
            </span>
          </div>
          <span className="font-plex-mono text-[9px] text-[var(--mut)] mt-0.5">
            {summary.isOvertopped
              ? (lang === "tr" ? "Kret Kotu Aşıldı!" : "Water Exceeds Crest!")
              : (lang === "tr" ? `H_kret = ${dam.hMax} m` : `H_crest = ${dam.hMax} m`)}
          </span>
        </div>

        {/* Metric 2: Flood Peak Attenuation */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-center">
          <span className="font-plex-mono text-[10px] font-semibold text-[var(--mut)] uppercase tracking-wider flex items-center gap-1">
            <TrendingDown size={12} className="text-sky-600" />
            {lang === "tr" ? "Pik Sönümleme" : "Peak Attenuation"}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-[19px] sm:text-[21px] text-[#0284c7] leading-tight">
              -{summary.peakAttenuationPercent}%
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)]">
              (-{summary.peakAttenuationM3s} m³/s)
            </span>
          </div>
          <span className="font-plex-mono text-[9px] text-[var(--mut)] mt-0.5">
            {summary.peakInflow} → {summary.peakOutflow} m³/s
          </span>
        </div>

        {/* Metric 3: Flood Lag Time */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-center">
          <span className="font-plex-mono text-[10px] font-semibold text-[var(--mut)] uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} className="text-purple-600" />
            {lang === "tr" ? "Öteleme Gecikmesi" : "Peak Delay Lag"}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-[19px] sm:text-[21px] text-purple-700 dark:text-purple-400 leading-tight">
              +{summary.lagTimeHours} h
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)]">
              {lang === "tr" ? "erteleme" : "delay"}
            </span>
          </div>
          <span className="font-plex-mono text-[9px] text-[var(--mut)] mt-0.5">
            t_in: {summary.timeToPeakInflowHours}h → t_out: {summary.timeToPeakOutflowHours}h
          </span>
        </div>

        {/* Metric 4: Peak Water Stage */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-center">
          <span className="font-plex-mono text-[10px] font-semibold text-[var(--mut)] uppercase tracking-wider">
            {lang === "tr" ? "En Yüksek Su Kotu" : "Peak Water Stage"}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-[19px] sm:text-[21px] text-[var(--ink)] leading-tight">
              {summary.maxStage.toFixed(2)} m
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)]">
              / {dam.hMax} m
            </span>
          </div>
          <span className="font-plex-mono text-[9px] text-[var(--mut)] mt-0.5">
            {summary.maxStage > dam.hSpill
              ? (lang === "tr" ? "Dolu Savak Devrede" : "Spillway Active")
              : (lang === "tr" ? "Sadece Dip Savak" : "Orifice Flow Only")}
          </span>
        </div>
      </div>

      {/* ── VISUAL WORKBENCH: DAM (LEFT) + HYDROGRAPH WITH DUAL AXIS (RIGHT) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-[var(--line)] bg-[var(--atlas-card)]">
        {/* ── LEFT PANEL: DAM VISUALIZATION (ENKESİT & BOYKEST TOGGLE) ── */}
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          {/* Top Bar with Enkesit / Boykesit Toggle & Active Regime */}
          <div className="flex items-center justify-between gap-2">
            {/* View Mode Switcher */}
            <div className="inline-flex items-center p-0.5 rounded-md bg-[var(--line)] border border-[var(--frame)]">
              <button
                type="button"
                onClick={() => setViewMode("profile")}
                className={`cursor-pointer px-2.5 py-1 rounded text-[10.5px] font-plex-mono font-semibold transition-all ${
                  viewMode === "profile"
                    ? "bg-[var(--frame)] text-[var(--paper)] shadow-2xs font-bold"
                    : "text-[var(--mut)] hover:text-[var(--ink)]"
                }`}
              >
                {lang === "tr" ? "📐 Enkesit (Profil)" : "📐 Profile (Cross-Section)"}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("elevation")}
                className={`cursor-pointer px-2.5 py-1 rounded text-[10.5px] font-plex-mono font-semibold transition-all ${
                  viewMode === "elevation"
                    ? "bg-[var(--frame)] text-[var(--paper)] shadow-2xs font-bold"
                    : "text-[var(--mut)] hover:text-[var(--ink)]"
                }`}
              >
                {lang === "tr" ? "🏛️ Boykesit (Ön Görünüş)" : "🏛️ Downstream Elevation"}
              </button>
            </div>

            {/* Active Regime Pill */}
            <span
              className={`font-plex-mono text-[9.5px] font-bold px-2 py-0.5 rounded ${
                isCurrentlyOvertopping
                  ? "bg-rose-600 text-white animate-pulse"
                  : isCurrentlySpilling
                  ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40"
                  : "bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30"
              }`}
            >
              {t(currentFlowBreakdown.regimeName, lang)}
            </span>
          </div>

          {/* SVG Canvas for Dam (Clean text without background boxes, zero overlapping) */}
          <div className="relative w-full bg-[var(--paper)] border border-[var(--line)] rounded-lg overflow-hidden p-2 shadow-2xs">
            <svg
              viewBox="0 0 600 300"
              className="w-full h-auto block select-none"
              aria-label="Dam Hydraulic Diagram"
            >
              <defs>
                <linearGradient id="dam-clean-water" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="dam-clean-concrete" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={dark ? "#475569" : "#cbd5e1"} />
                  <stop offset="100%" stopColor={dark ? "#1e293b" : "#64748b"} />
                </linearGradient>
                <linearGradient id="dam-clean-cascade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
                </linearGradient>
              </defs>

              {/* ════════════════════════════════════════════════════════════ */}
              {/* ── VIEW 1: ENKESİT (HYDRAULIC CROSS-SECTION PROFILE) ──────── */}
              {/* ════════════════════════════════════════════════════════════ */}
              {viewMode === "profile" && (() => {
                const yBase = 245;
                const scale = 7.0; // pixels per meter
                const xUp = 200;
                const crestW = 40;
                const xCrestEnd = xUp + crestW; // 240

                const hMaxPx = dam.hMax * scale;
                const hSpillPx = dam.hSpill * scale;
                const hWaterPx = Math.max(0, currentStage) * scale;

                const yCrest = yBase - hMaxPx;
                const ySpill = yBase - hSpillPx;
                const yWater = Math.max(20, yBase - hWaterPx);

                const xToe = xCrestEnd + hSpillPx * 0.95;
                const orifY = yBase - 18;
                const orifDpx = Math.max(8, Math.min(24, dam.orificeDiameter * 5.5));
                const orifExitX = xToe - 16;

                return (
                  <g className="profile-diagram">
                    {/* Bedrock Ground Line */}
                    <rect x="20" y={yBase} width="560" height="45" fill={dark ? "#18181b" : "#e2e8f0"} opacity={0.6} />
                    <line x1="20" y1={yBase} x2="580" y2={yBase} stroke={dark ? "#52525b" : "#94a3b8"} strokeWidth={1.5} />
                    <text
                      x="35"
                      y={yBase + 24}
                      fontSize="9.5"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fill="var(--mut)"
                    >
                      {lang === "tr" ? "Temel Kayası (z = 0.0 m)" : "Bedrock Datum (z = 0.0 m)"}
                    </text>

                    {/* Reservoir Water Body */}
                    {hWaterPx > 2 && (
                      <g className="water-reservoir">
                        <rect x="75" y={yWater} width={xUp - 75} height={yBase - yWater} fill="url(#dam-clean-water)" />
                        <line x1="70" y1={yWater} x2={xUp} y2={yWater} stroke="#38bdf8" strokeWidth={2.5} />
                        {/* Live Water Level Label (No background box, halo stroke, 100% readable) */}
                        <text
                          x="135"
                          y={yWater - 7}
                          textAnchor="middle"
                          fontSize="11"
                          fontFamily="var(--font-ibm-plex-mono), monospace"
                          fontWeight="bold"
                          fill="#0284c7"
                          stroke="var(--paper)"
                          strokeWidth={2.5}
                          paintOrder="stroke fill"
                        >
                          💧 h = {currentStage.toFixed(2)}m
                        </text>
                      </g>
                    )}

                    {/* Concrete Dam Polygon */}
                    <polygon
                      points={
                        dam.lSpill > 0
                          ? `
                            ${xUp},${yBase}
                            ${xUp},${yCrest}
                            ${xCrestEnd},${yCrest}
                            ${xCrestEnd},${ySpill}
                            ${xToe},${yBase}
                            ${xUp},${yBase}
                          `
                          : `
                            ${xUp},${yBase}
                            ${xUp},${yCrest}
                            ${xCrestEnd},${yCrest}
                            ${xToe},${yBase}
                            ${xUp},${yBase}
                          `
                      }
                      fill="url(#dam-clean-concrete)"
                      stroke={dark ? "#64748b" : "#475569"}
                      strokeWidth={2}
                      strokeLinejoin="round"
                    />

                    {/* Spillway Level Dashed Line (Only if spillway exists L > 0) */}
                    {dam.lSpill > 0 && (
                      <line x1={xUp} y1={ySpill} x2={xCrestEnd} y2={ySpill} stroke="#0284c7" strokeWidth={1.5} strokeDasharray="4 3" />
                    )}

                    {/* Bottom Orifice Conduit & Pipe */}
                    <rect
                      x={xUp - 4}
                      y={orifY - orifDpx / 2}
                      width={orifExitX - xUp + 4}
                      height={orifDpx}
                      fill={currentFlowBreakdown.qOrifice > 0 ? "#0284c7" : (dark ? "#09090b" : "#334155")}
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                    />
                    {/* Orifice Diameter Label (Clean, no box) */}
                    <text
                      x={(xUp + orifExitX) / 2}
                      y={orifY - orifDpx / 2 - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="bold"
                      fill="#0284c7"
                      stroke="var(--paper)"
                      strokeWidth={2}
                      paintOrder="stroke fill"
                    >
                      Ø d = {dam.orificeDiameter}m
                    </text>

                    {/* Pressurized Water Jet */}
                    {currentFlowBreakdown.qOrifice > 0.05 && (() => {
                      const jetReach = Math.min(140, Math.max(45, Math.sqrt(currentStage) * 32));
                      const jetEndX = orifExitX + jetReach;

                      return (
                        <g className="jet">
                          <path
                            d={`
                              M ${orifExitX} ${orifY - orifDpx / 2}
                              Q ${orifExitX + jetReach * 0.45} ${orifY - 4} ${jetEndX} ${yBase}
                              L ${jetEndX - 10} ${yBase}
                              Q ${orifExitX + jetReach * 0.35} ${orifY + 4} ${orifExitX} ${orifY + orifDpx / 2}
                              Z
                            `}
                            fill="url(#dam-clean-cascade)"
                          />
                          <text
                            x={jetEndX + 8}
                            y={yBase - 6}
                            fontSize="10"
                            fontFamily="var(--font-ibm-plex-mono), monospace"
                            fontWeight="bold"
                            fill="#0284c7"
                            stroke="var(--paper)"
                            strokeWidth={2}
                            paintOrder="stroke fill"
                          >
                            q_dip = {currentFlowBreakdown.qOrifice.toFixed(1)} m³/s
                          </text>
                        </g>
                      );
                    })()}

                    {/* Spillway Cascade Flow (Only if spillway weir exists and active) */}
                    {dam.lSpill > 0 && isCurrentlySpilling ? (() => {
                      const head = currentStage - dam.hSpill;
                      const sheetThick = Math.max(3, Math.min(18, head * scale * 0.5));

                      return (
                        <g className="spillway-flow">
                          <polygon
                            points={`
                              ${xCrestEnd},${ySpill}
                              ${xToe},${yBase}
                              ${xToe + 50},${yBase}
                              ${xToe + 50},${yBase - sheetThick * 0.7}
                              ${xToe - sheetThick},${yBase - sheetThick}
                              ${xCrestEnd},${ySpill - sheetThick}
                            `}
                            fill="url(#dam-clean-cascade)"
                            opacity={0.92}
                          />
                          <text
                            x={xCrestEnd + 40}
                            y={ySpill + 20}
                            fontSize="10.5"
                            fontFamily="var(--font-ibm-plex-mono), monospace"
                            fontWeight="bold"
                            fill="#0369a1"
                            stroke="var(--paper)"
                            strokeWidth={2}
                            paintOrder="stroke fill"
                          >
                            🌊 q_savak = {currentFlowBreakdown.qSpillway.toFixed(1)} m³/s
                          </text>
                        </g>
                      );
                    })() : dam.lSpill > 0 ? (
                      <text
                        x={xCrestEnd + 30}
                        y={ySpill + 20}
                        fontSize="9"
                        fontFamily="var(--font-ibm-plex-mono), monospace"
                        fill="var(--mut)"
                        stroke="var(--paper)"
                        strokeWidth={1.5}
                        paintOrder="stroke fill"
                      >
                        {lang === "tr" ? "(Savak Kuru)" : "(Spillway Inactive)"}
                      </text>
                    ) : null}

                    {/* Emergency Crest Overtopping */}
                    {isCurrentlyOvertopping && (
                      <g className="overtopping">
                        <rect x={xUp - 4} y={yWater} width={xCrestEnd - xUp + 8} height={yCrest - yWater} fill="#ef4444" opacity={0.7} />
                        <text
                          x="220"
                          y="16"
                          fontSize="10.5"
                          fontFamily="var(--font-ibm-plex-mono), monospace"
                          fontWeight="bold"
                          fill="#dc2626"
                          stroke="var(--paper)"
                          strokeWidth={2}
                          paintOrder="stroke fill"
                        >
                          ⚠️ {lang === "tr" ? "KRET AŞIMI" : "OVERTOPPING"}: {currentFlowBreakdown.qOvertopping.toFixed(1)} m³/s
                        </text>
                      </g>
                    )}

                    {/* Left Elevation Datum Axis */}
                    <g className="datum-axis">
                      <line x1="68" y1={yBase} x2="68" y2={Math.min(yWater, yCrest) - 15} stroke="var(--line)" strokeWidth={1.5} />
                      <line x1="63" y1={yBase} x2="73" y2={yBase} stroke="var(--ink)" />
                      <text x="58" y={yBase + 3} textAnchor="end" fontSize="9" fontFamily="var(--font-ibm-plex-mono), monospace" fill="var(--mut)">
                        0m
                      </text>

                      {/* Spillway Level Indicator (Only if spillway weir exists) */}
                      {dam.lSpill > 0 && (
                        <>
                          <line x1="63" y1={ySpill} x2="xCrestEnd" y2={ySpill} stroke="#0284c7" strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
                          <text
                            x="58"
                            y={ySpill + 3}
                            textAnchor="end"
                            fontSize="10"
                            fontFamily="var(--font-ibm-plex-mono), monospace"
                            fontWeight="bold"
                            fill="#0284c7"
                            stroke="var(--paper)"
                            strokeWidth={2}
                            paintOrder="stroke fill"
                          >
                            H_savak = {dam.hSpill}m
                          </text>
                        </>
                      )}

                      {/* Crest Level Indicator */}
                      <line x1="63" y1={yCrest} x2="xCrestEnd" y2={yCrest} stroke="var(--ink)" strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
                      <text
                        x="58"
                        y={yCrest + 3}
                        textAnchor="end"
                        fontSize="10"
                        fontFamily="var(--font-ibm-plex-mono), monospace"
                        fontWeight="bold"
                        fill="var(--ink)"
                        stroke="var(--paper)"
                        strokeWidth={2}
                        paintOrder="stroke fill"
                      >
                        H_kret = {dam.hMax}m
                      </text>
                    </g>

                    {/* Dam Top Parameter Labels (No rectangles, zero collision) */}
                    <text
                      x={xCrestEnd + 8}
                      y={yCrest - 8}
                      fontSize="10.5"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="bold"
                      fill="var(--ink)"
                      stroke="var(--paper)"
                      strokeWidth={2}
                      paintOrder="stroke fill"
                    >
                      🏔️ H_kret: {dam.hMax}m
                    </text>
                    {dam.lSpill > 0 ? (
                      <text
                        x={xCrestEnd + 8}
                        y={ySpill - 6}
                        fontSize="10"
                        fontFamily="var(--font-ibm-plex-mono), monospace"
                        fontWeight="bold"
                        fill="#0284c7"
                        stroke="var(--paper)"
                        strokeWidth={2}
                        paintOrder="stroke fill"
                      >
                        🌊 H_savak: {dam.hSpill}m (L={dam.lSpill}m)
                      </text>
                    ) : (
                      <text
                        x={xCrestEnd + 8}
                        y={yCrest + 22}
                        fontSize="9.5"
                        fontFamily="var(--font-ibm-plex-mono), monospace"
                        fill="var(--mut)"
                        stroke="var(--paper)"
                        strokeWidth={1.5}
                        paintOrder="stroke fill"
                      >
                        {lang === "tr" ? "(Dolu Savaksız, L=0)" : "(No Spillway, L=0)"}
                      </text>
                    )}
                  </g>
                );
              })()}

              {/* ════════════════════════════════════════════════════════════ */}
              {/* ── VIEW 2: BOYKEST (DOWNSTREAM ELEVATION FACING DAM) ──────── */}
              {/* ════════════════════════════════════════════════════════════ */}
              {viewMode === "elevation" && (() => {
                const yBase = 245;
                const scale = 7.0;
                const hMaxPx = dam.hMax * scale;
                const hSpillPx = dam.hSpill * scale;

                const yCrest = yBase - hMaxPx;
                const ySpill = yBase - hSpillPx;

                const crestLeftX = 130;
                const crestRightX = 490;
                const totalWidthPx = crestRightX - crestLeftX;

                const spillFrac = Math.min(0.75, Math.max(0.15, dam.lSpill / dam.lCrest));
                const spillWidthPx = totalWidthPx * spillFrac;
                const s1X = 310 - spillWidthPx / 2;
                const s2X = 310 + spillWidthPx / 2;

                const orifY = yBase - 18;
                const orifRpx = Math.max(5, Math.min(15, dam.orificeDiameter * 3.5));

                return (
                  <g className="elevation-diagram">
                    {/* Ground line */}
                    <line x1="40" y1={yBase} x2="560" y2={yBase} stroke={dark ? "#52525b" : "#94a3b8"} strokeWidth={1.5} />

                    {/* Dam Downstream Face */}
                    <polygon
                      points={
                        dam.lSpill > 0
                          ? `
                            ${crestLeftX},${yBase}
                            ${crestLeftX},${yCrest}
                            ${s1X},${yCrest}
                            ${s1X},${ySpill}
                            ${s2X},${ySpill}
                            ${s2X},${yCrest}
                            ${crestRightX},${yCrest}
                            ${crestRightX},${yBase}
                          `
                          : `
                            ${crestLeftX},${yBase}
                            ${crestLeftX},${yCrest}
                            ${crestRightX},${yCrest}
                            ${crestRightX},${yBase}
                          `
                      }
                      fill="url(#dam-clean-concrete)"
                      stroke={dark ? "#64748b" : "#475569"}
                      strokeWidth={2}
                    />

                    {/* Central Spillway Chute (Only if spillway weir exists) */}
                    {dam.lSpill > 0 && (
                      <polygon
                        points={`${s1X},${ySpill} ${s2X},${ySpill} ${s2X},${yBase} ${s1X},${yBase}`}
                        fill={dark ? "#1e293b" : "#e2e8f0"}
                        stroke={dark ? "#475569" : "#cbd5e1"}
                      />
                    )}

                    {/* Bottom Outlet Circle */}
                    <circle cx="310" cy={orifY} r={orifRpx} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
                    <text
                      x="310"
                      y={orifY - orifRpx - 4}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="bold"
                      fill="#38bdf8"
                      stroke="var(--paper)"
                      strokeWidth={2}
                      paintOrder="stroke fill"
                    >
                      Ø d = {dam.orificeDiameter}m
                    </text>

                    {/* Overflow Flow Down Spillway Chute (Only if spillway weir exists and active) */}
                    {dam.lSpill > 0 && isCurrentlySpilling && (
                      <g className="elevation-spill-flow">
                        <polygon
                          points={`${s1X + 2},${ySpill} ${s2X - 2},${ySpill} ${s2X - 2},${yBase} ${s1X + 2},${yBase}`}
                          fill="url(#dam-clean-cascade)"
                          opacity={0.88}
                        />
                        <text
                          x="310"
                          y={(ySpill + yBase) / 2}
                          textAnchor="middle"
                          fontSize="10.5"
                          fontFamily="var(--font-ibm-plex-mono), monospace"
                          fontWeight="bold"
                          fill="#0284c7"
                          stroke="var(--paper)"
                          strokeWidth={2.5}
                          paintOrder="stroke fill"
                        >
                          🌊 q_savak = {currentFlowBreakdown.qSpillway.toFixed(1)} m³/s
                        </text>
                      </g>
                    )}

                    {/* Total Crest Length Dimension L_crest */}
                    <g stroke="var(--ink)" strokeWidth={1}>
                      <line x1={crestLeftX} y1={yCrest - 14} x2={crestRightX} y2={yCrest - 14} strokeDasharray="3 2" />
                      <line x1={crestLeftX} y1={yCrest - 18} x2={crestLeftX} y2={yCrest - 10} />
                      <line x1={crestRightX} y1={yCrest - 18} x2={crestRightX} y2={yCrest - 10} />
                      <text
                        x="310"
                        y={yCrest - 18}
                        textAnchor="middle"
                        fontSize="10"
                        fontFamily="var(--font-ibm-plex-mono), monospace"
                        fontWeight="bold"
                        fill="var(--ink)"
                        stroke="var(--paper)"
                        strokeWidth={2}
                        paintOrder="stroke fill"
                      >
                        L_kret = {dam.lCrest}m
                      </text>
                    </g>

                    {/* Spillway Width Dimension L_spill (Only if L > 0) */}
                    {dam.lSpill > 0 ? (
                      <g stroke="#0284c7" strokeWidth={1}>
                        <line x1={s1X} y1={ySpill - 8} x2={s2X} y2={ySpill - 8} strokeDasharray="2 2" />
                        <line x1={s1X} y1={ySpill - 12} x2={s1X} y2={ySpill - 4} />
                        <line x1={s2X} y1={ySpill - 12} x2={s2X} y2={ySpill - 4} />
                        <text
                          x="310"
                          y={ySpill - 11}
                          textAnchor="middle"
                          fontSize="9.5"
                          fontFamily="var(--font-ibm-plex-mono), monospace"
                          fontWeight="bold"
                          fill="#0284c7"
                          stroke="var(--paper)"
                          strokeWidth={2}
                          paintOrder="stroke fill"
                        >
                          L_savak = {dam.lSpill}m
                        </text>
                      </g>
                    ) : (
                      <text
                        x="310"
                        y={yCrest + 22}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontFamily="var(--font-ibm-plex-mono), monospace"
                        fill="var(--mut)"
                        stroke="var(--paper)"
                        strokeWidth={1.5}
                        paintOrder="stroke fill"
                      >
                        {lang === "tr" ? "(Dolu Savaksız Gövde - L=0)" : "(No Spillway Installed - L=0)"}
                      </text>
                    )}

                    {/* Elevation Heights on Right */}
                    <text
                      x={crestRightX + 12}
                      y={yCrest + 4}
                      fontSize="9.5"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="bold"
                      fill="var(--ink)"
                      stroke="var(--paper)"
                      strokeWidth={2}
                      paintOrder="stroke fill"
                    >
                      H_kret: {dam.hMax}m
                    </text>
                    <text
                      x={crestRightX + 12}
                      y={ySpill + 4}
                      fontSize="9.5"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="bold"
                      fill="#0284c7"
                      stroke="var(--paper)"
                      strokeWidth={2}
                      paintOrder="stroke fill"
                    >
                      H_savak: {dam.hSpill}m
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Instantaneous Flow Breakdown Sub-bar */}
          <div className="p-2.5 bg-[var(--paper)] border border-[var(--line)] rounded-md flex flex-wrap items-center justify-between gap-2 shadow-2xs font-plex-mono text-[10.5px]">
            <span className="font-bold text-[var(--ink)]">
              {lang === "tr" ? "ANLIK AKIŞ:" : "INSTANT BALANCE:"}
            </span>
            <span className="text-[#0284c7] font-semibold">I(t): {currentInflow.toFixed(1)} m³/s</span>
            <span className="text-[var(--mut)]">→</span>
            <span className="text-[#059669] font-bold">Q(t): {currentOutflow.toFixed(1)} m³/s</span>
            <span className="text-[var(--mut)]">|</span>
            <span>Dip: {currentFlowBreakdown.qOrifice.toFixed(1)} m³/s</span>
            <span>Savak: {currentFlowBreakdown.qSpillway.toFixed(1)} m³/s</span>
            {currentFlowBreakdown.qOvertopping > 0 && (
              <span className="text-rose-600 font-bold animate-pulse">Kret: {currentFlowBreakdown.qOvertopping.toFixed(1)} m³/s</span>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: COUPLED HYDROGRAPH WITH DUAL Y-AXIS (Q & h) ── */}
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          {/* Header & Legends */}
          <div className="flex items-center justify-between">
            <h4 className="font-plex-mono text-[11.5px] font-bold uppercase tracking-wider text-[var(--ink)]">
              {lang === "tr" ? "GİRİŞ-ÇIKIŞ TAŞKIN HİDROGRAFI" : "INFLOW-OUTFLOW HYDROGRAPH"}
            </h4>
            <div className="flex items-center gap-3 font-plex-mono text-[10px]">
              <span className="flex items-center gap-1 text-[#0284c7] font-bold">
                <span className="w-2.5 h-1 bg-[#0284c7] rounded-xs" /> I(t) Giriş
              </span>
              <span className="flex items-center gap-1 text-[#059669] font-bold">
                <span className="w-2.5 h-1 bg-[#059669] rounded-xs" /> Q(t) Çıkış
              </span>
              <span className="flex items-center gap-1 text-purple-600 font-bold">
                <span className="w-2.5 h-0.5 border-t border-dashed border-purple-600" /> h(t) Kot
              </span>
            </div>
          </div>

          {/* Dual-Axis SVG Chart Canvas */}
          <div className="relative w-full bg-[var(--paper)] border border-[var(--line)] rounded-lg overflow-hidden p-2 shadow-2xs">
            {(() => {
              const svgW = 540;
              const svgH = 260;
              const padL = 46; // Left axis (Q)
              const padR = 46; // Right axis (h)
              const padT = 24;
              const padB = 28;
              const plotW = svgW - padL - padR;
              const plotH = svgH - padT - padB;

              const maxQ = Math.max(summary.peakInflow, summary.peakOutflow, 50) * 1.15;
              const maxH = Math.max(dam.hMax, summary.maxStage) * 1.15;
              const maxT = inflow.durationHours;

              const inflowPts = steps.map((s) => {
                const x = padL + (s.timeHours / maxT) * plotW;
                const y = padT + plotH - (s.inflow / maxQ) * plotH;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });

              const outflowPts = steps.map((s) => {
                const x = padL + (s.timeHours / maxT) * plotW;
                const y = padT + plotH - (s.outflow / maxQ) * plotH;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });

              const stagePts = steps.map((s) => {
                const x = padL + (s.timeHours / maxT) * plotW;
                const y = padT + plotH - (s.stage / maxH) * plotH;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });

              const currentX = padL + (currentTimeHours / maxT) * plotW;

              return (
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto block select-none">
                  <defs>
                    <linearGradient id="hydro-inflow-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="hydro-outflow-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines */}
                  {[0.25, 0.5, 0.75, 1.0].map((frac) => {
                    const y = padT + plotH * (1 - frac);
                    const qVal = Math.round(maxQ * frac);
                    const hVal = (maxH * frac).toFixed(1);
                    return (
                      <g key={`grid-${frac}`}>
                        <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="var(--line)" strokeWidth={0.8} strokeDasharray="3 3" />
                        {/* Left Q tick */}
                        <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fill="var(--mut)">
                          {qVal}
                        </text>
                        {/* Right h tick (SECOND Y-AXIS) */}
                        <text x={padL + plotW + 4} y={y + 3} textAnchor="start" fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fill="#9333ea">
                          {hVal}m
                        </text>
                      </g>
                    );
                  })}

                  {/* Spillway Level Dashed Line on Right Axis */}
                  {(() => {
                    const ySpill = padT + plotH - (dam.hSpill / maxH) * plotH;
                    return (
                      <g className="chart-spillway-ref">
                        <line x1={padL} y1={ySpill} x2={padL + plotW} y2={ySpill} stroke="#0284c7" strokeWidth={1} strokeDasharray="4 2" />
                        <text x={padL + plotW + 4} y={ySpill - 3} fontSize="8" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#0284c7">
                          H_savak
                        </text>
                      </g>
                    );
                  })()}

                  {/* Dam Crest Level Dashed Line on Right Axis */}
                  {(() => {
                    const yCrest = padT + plotH - (dam.hMax / maxH) * plotH;
                    return (
                      <g className="chart-crest-ref">
                        <line x1={padL} y1={yCrest} x2={padL + plotW} y2={yCrest} stroke="#dc2626" strokeWidth={1.2} strokeDasharray="3 2" />
                        <text x={padL + plotW + 4} y={yCrest - 3} fontSize="8" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#dc2626">
                          H_kret
                        </text>
                      </g>
                    );
                  })()}

                  {/* Inflow area & curve */}
                  <polygon points={`${padL},${padT + plotH} ${inflowPts.join(" ")} ${padL + plotW},${padT + plotH}`} fill="url(#hydro-inflow-grad)" />
                  <polyline points={inflowPts.join(" ")} fill="none" stroke="#0284c7" strokeWidth={2} strokeLinecap="round" />

                  {/* Outflow area & curve */}
                  <polygon points={`${padL},${padT + plotH} ${outflowPts.join(" ")} ${padL + plotW},${padT + plotH}`} fill="url(#hydro-outflow-grad)" />
                  <polyline points={outflowPts.join(" ")} fill="none" stroke="#059669" strokeWidth={2.4} strokeLinecap="round" />

                  {/* Stage curve h(t) */}
                  <polyline points={stagePts.join(" ")} fill="none" stroke="#9333ea" strokeWidth={1.6} strokeDasharray="4 2" />

                  {/* Time Cursor */}
                  <line x1={currentX} y1={padT} x2={currentX} y2={padT + plotH} stroke="var(--ink)" strokeWidth={1.5} />
                  <circle cx={currentX} cy={padT + plotH - (currentInflow / maxQ) * plotH} r={3.5} fill="#0284c7" />
                  <circle cx={currentX} cy={padT + plotH - (currentOutflow / maxQ) * plotH} r={4} fill="#059669" stroke="#ffffff" strokeWidth={1.2} />

                  {/* Left Axis Line (Q) */}
                  <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--ink)" strokeWidth={1.2} />
                  {/* Right Axis Line (h) - 2nd Y-AXIS */}
                  <line x1={padL + plotW} y1={padT} x2={padL + plotW} y2={padT + plotH} stroke="#9333ea" strokeWidth={1.2} />
                  {/* Bottom Time Axis */}
                  <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="var(--ink)" strokeWidth={1.2} />

                  {/* Axis Titles */}
                  <text x={padL - 4} y={padT - 8} textAnchor="start" fontSize="9" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="var(--ink)">
                    Q (m³/s)
                  </text>
                  <text x={padL + plotW + 4} y={padT - 8} textAnchor="end" fontSize="9" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#9333ea">
                    h (m)
                  </text>

                  {/* Time Ticks */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                    const x = padL + plotW * frac;
                    const tVal = Math.round(maxT * frac);
                    return (
                      <g key={`tick-${frac}`}>
                        <line x1={x} y1={padT + plotH} x2={x} y2={padT + plotH + 4} stroke="var(--ink)" strokeWidth={1} />
                        <text x={x} y={padT + plotH + 14} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fill="var(--ink2)">
                          {tVal}h
                        </text>
                      </g>
                    );
                  })}
                  <text x={padL + plotW / 2} y={padT + plotH + 24} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fill="var(--mut)">
                    {lang === "tr" ? "Zaman (saat)" : "Time (hours)"}
                  </text>
                </svg>
              );
            })()}
          </div>

          {/* Time Scrubber Animation Bar */}
          <div className="p-2.5 bg-[var(--paper)] border border-[var(--line)] rounded-md flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-1.5 flex-none">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="cursor-pointer px-2.5 py-1 rounded bg-[var(--acc)] text-white font-plex-mono text-[10.5px] font-bold flex items-center gap-1 shadow-2xs hover:opacity-90"
              >
                {isPlaying ? <><Pause size={11} /> {t(copy.damLab.controls.pauseAnimation, lang)}</> : <><Play size={11} /> {t(copy.damLab.controls.playAnimation, lang)}</>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentTimeHours(0);
                }}
                title={t(copy.damLab.controls.resetAnimation, lang)}
                className="cursor-pointer p-1 rounded bg-[var(--atlas-card)] border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--line)]"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={inflow.durationHours}
                step={0.1}
                value={currentTimeHours}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentTimeHours(Number(e.target.value));
                }}
                className="w-full accent-[var(--acc)] cursor-pointer h-1.5"
              />
              <span className="font-plex-mono text-[10.5px] font-bold text-[var(--ink)] whitespace-nowrap min-w-[50px] text-right">
                {currentTimeHours.toFixed(1)} h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── COMPACT PARAMETERS UNDER DAM (Takes less space, unobtrusive) ── */}
      <div className="p-4 sm:p-5 border-t border-[var(--line)] bg-[var(--paper)] flex flex-col gap-3">
        {/* Controls Category Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setControlsTab("geometry")}
              className={`cursor-pointer px-3 py-1 text-[11px] font-plex-mono rounded font-bold transition-all flex items-center gap-1.5 ${
                controlsTab === "geometry"
                  ? "bg-[var(--frame)] text-[var(--paper)] shadow-2xs font-bold"
                  : "text-[var(--mut)] hover:bg-[var(--atlas-card)] hover:text-[var(--ink)]"
              }`}
            >
              <SlidersHorizontal size={12} />
              {lang === "tr" ? "Baraj & Savak Geometrisi" : "Dam & Spillway Design"}
            </button>
            <button
              type="button"
              onClick={() => setControlsTab("hydrology")}
              className={`cursor-pointer px-3 py-1 text-[11px] font-plex-mono rounded font-bold transition-all flex items-center gap-1.5 ${
                controlsTab === "hydrology"
                  ? "bg-[var(--frame)] text-[var(--paper)] shadow-2xs font-bold"
                  : "text-[var(--mut)] hover:bg-[var(--atlas-card)] hover:text-[var(--ink)]"
              }`}
            >
              <Waves size={12} />
              {lang === "tr" ? "Gelen Taşkın Hidrografı" : "Inflow Hydrograph"}
            </button>
          </div>

          <span className="font-plex-mono text-[10px] text-[var(--mut)] hidden sm:inline">
            💡 {lang === "tr" ? "Kaydırıcılarla anlık çözülür" : "Instant Level-Pool solution"}
          </span>
        </div>

        {/* TAB 1: DAM & SPILLWAY GEOMETRY (Compact 5-column grid) */}
        {controlsTab === "geometry" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Dam Crest H_max */}
            <div className="p-2.5 bg-[var(--atlas-card)] border border-[var(--line)] rounded-md flex flex-col gap-1 shadow-2xs">
              <div className="flex justify-between items-baseline font-plex-mono text-[10.5px]">
                <span className="text-[var(--ink)] font-semibold">{lang === "tr" ? "Kret Kotu (H):" : "Crest (H):"}</span>
                <span className="font-bold text-[var(--ink)]">{dam.hMax} m</span>
              </div>
              <input
                type="range"
                min={10}
                max={30}
                step={0.5}
                value={dam.hMax}
                onChange={(e) => updateDamParam("hMax", Number(e.target.value))}
                className="w-full accent-[var(--acc)] cursor-pointer h-1.5"
              />
            </div>

            {/* Spillway Crest H_spill */}
            <div className="p-2.5 bg-[var(--atlas-card)] border border-[var(--line)] rounded-md flex flex-col gap-1 shadow-2xs">
              <div className="flex justify-between items-baseline font-plex-mono text-[10.5px]">
                <span className="text-[var(--ink)] font-semibold">{lang === "tr" ? "Savak Kotu:" : "Spillway:"}</span>
                <span className="font-bold text-[#0284c7]">{dam.hSpill} m</span>
              </div>
              <input
                type="range"
                min={6}
                max={dam.hMax - 0.5}
                step={0.5}
                value={dam.hSpill}
                onChange={(e) => updateDamParam("hSpill", Number(e.target.value))}
                className="w-full accent-[#0284c7] cursor-pointer h-1.5"
              />
            </div>

            {/* Spillway Width L_spill (starts from 0) */}
            <div className="p-2.5 bg-[var(--atlas-card)] border border-[var(--line)] rounded-md flex flex-col gap-1 shadow-2xs">
              <div className="flex justify-between items-baseline font-plex-mono text-[10.5px]">
                <span className="text-[var(--ink)] font-semibold">{lang === "tr" ? "Savak Eni (L):" : "Weir L:"}</span>
                <span className="font-bold text-[#0284c7]">
                  {dam.lSpill === 0 ? (lang === "tr" ? "0 m (Savaksız)" : "0 m (No Weir)") : `${dam.lSpill} m`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={dam.lCrest}
                step={1}
                value={dam.lSpill}
                onChange={(e) => updateDamParam("lSpill", Number(e.target.value))}
                className="w-full accent-[#0284c7] cursor-pointer h-1.5"
              />
            </div>

            {/* Orifice Diameter d */}
            <div className="p-2.5 bg-[var(--atlas-card)] border border-[var(--line)] rounded-md flex flex-col gap-1 shadow-2xs">
              <div className="flex justify-between items-baseline font-plex-mono text-[10.5px]">
                <span className="text-[var(--ink)] font-semibold">{lang === "tr" ? "Dip Savak (Ø):" : "Outlet (Ø):"}</span>
                <span className="font-bold text-sky-600">{dam.orificeDiameter} m</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={2.8}
                step={0.1}
                value={dam.orificeDiameter}
                onChange={(e) => updateDamParam("orificeDiameter", Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer h-1.5"
              />
            </div>

            {/* Maximum Reservoir Storage Capacity S_max (Number input + Slider) */}
            <div className="p-2.5 bg-[var(--atlas-card)] border border-[var(--line)] rounded-md flex flex-col gap-1 shadow-2xs">
              <div className="flex justify-between items-center font-plex-mono text-[10.5px]">
                <span className="text-[var(--ink)] font-semibold">{lang === "tr" ? "Maks. Hacim (S):" : "Max Storage (S):"}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0.5}
                    max={150}
                    step={0.5}
                    value={dam.maxStorageHm3 ?? 15}
                    onChange={(e) => updateDamParam("maxStorageHm3", Math.max(0.2, Number(e.target.value)))}
                    className="w-13 px-1 py-0.5 text-right font-bold text-emerald-600 dark:text-emerald-400 bg-[var(--paper)] border border-[var(--line)] rounded text-[11px]"
                  />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">hm³</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={0.5}
                value={dam.maxStorageHm3 ?? 15}
                onChange={(e) => updateDamParam("maxStorageHm3", Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5"
              />
            </div>
          </div>
        )}

        {/* TAB 2: INFLOW HYDROGRAPH (Compact 4-column grid) */}
        {controlsTab === "hydrology" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Hydrograph Shape */}
            <div className="p-2.5 bg-[var(--atlas-card)] border border-[var(--line)] rounded-md flex flex-col gap-1 shadow-2xs">
              <span className="font-plex-mono text-[10.5px] font-semibold text-[var(--ink)]">
                {lang === "tr" ? "Hidrograf Tipi:" : "Shape:"}
              </span>
              <div className="grid grid-cols-3 gap-1 mt-0.5">
                {(["gamma", "triangular", "trapezoid"] as HydrographShape[]).map((shp) => (
                  <button
                    key={shp}
                    type="button"
                    onClick={() => updateInflowParam("shape", shp)}
                    className={`cursor-pointer px-1.5 py-0.5 text-[10px] font-plex-mono rounded border transition-all ${
                      inflow.shape === shp
                        ? "bg-[var(--acc)] text-white border-[var(--acc)] font-bold shadow-xs"
                        : "bg-[var(--paper)] text-[var(--ink2)] border-[var(--line)]"
                    }`}
                  >
                    {shp === "gamma" ? "Gamma" : shp === "triangular" ? "Triang" : "Trap"}
                  </button>
                ))}
              </div>
            </div>

            {/* Peak Inflow I_peak */}
            <div className="p-2.5 bg-[var(--atlas-card)] border border-[var(--line)] rounded-md flex flex-col gap-1 shadow-2xs">
              <div className="flex justify-between items-baseline font-plex-mono text-[10.5px]">
                <span className="text-[var(--ink)] font-semibold">{lang === "tr" ? "Pik Giriş:" : "Peak I:"}</span>
                <span className="font-bold text-[#0284c7]">{inflow.peakInflow} m³/s</span>
              </div>
              <input
                type="range"
                min={30}
                max={220}
                step={5}
                value={inflow.peakInflow}
                onChange={(e) => updateInflowParam("peakInflow", Number(e.target.value))}
                className="w-full accent-[#0284c7] cursor-pointer h-1.5"
              />
            </div>

            {/* Flood Duration */}
            <div className="p-2.5 bg-[var(--atlas-card)] border border-[var(--line)] rounded-md flex flex-col gap-1 shadow-2xs">
              <div className="flex justify-between items-baseline font-plex-mono text-[10.5px]">
                <span className="text-[var(--ink)] font-semibold">{lang === "tr" ? "Taşkın Süresi:" : "Duration:"}</span>
                <span className="font-bold text-[var(--ink)]">{inflow.durationHours} h</span>
              </div>
              <input
                type="range"
                min={12}
                max={44}
                step={2}
                value={inflow.durationHours}
                onChange={(e) => updateInflowParam("durationHours", Number(e.target.value))}
                className="w-full accent-[var(--acc)] cursor-pointer h-1.5"
              />
            </div>

            {/* Initial Stage h0 */}
            <div className="p-2.5 bg-[var(--atlas-card)] border border-[var(--line)] rounded-md flex flex-col gap-1 shadow-2xs">
              <div className="flex justify-between items-baseline font-plex-mono text-[10.5px]">
                <span className="text-[var(--ink)] font-semibold">{lang === "tr" ? "Başlangıç Kotu:" : "Initial h0:"}</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{dam.h0} m</span>
              </div>
              <input
                type="range"
                min={0}
                max={dam.hSpill}
                step={0.5}
                value={dam.h0}
                onChange={(e) => updateDamParam("h0", Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-1.5"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── GOVERNING EQUATIONS DRAWER (PROPER MATHEMATICAL NOTATION) ─── */}
      <div className="p-4 sm:p-5 border-t border-[var(--line)] bg-[var(--paper)] flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowEquations((v) => !v)}
          className="cursor-pointer flex items-center justify-between w-full text-left py-1 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--frame)] text-[var(--paper)] flex items-center justify-center flex-none">
              <Calculator size={14} />
            </div>
            <div>
              <span className="font-plex-mono text-[9px] font-bold uppercase tracking-widest text-[var(--acc)]">
                {lang === "tr" ? "HİDROLİK FORMÜLASYON & TEMEL DENKLEMLER" : "GOVERNING HYDRAULIC EQUATIONS"}
              </span>
              <h4 className="font-display font-bold text-[14px] text-[var(--ink)]">
                {lang === "tr"
                  ? "Süreklilik Denklemi & Parçalı Boşalım Bağıntıları"
                  : "Continuity Mass Conservation & Piecewise Rating Curves"}
              </h4>
            </div>
          </div>
          <span className="p-1 rounded bg-[var(--atlas-card)] border border-[var(--line)] text-[var(--mut)] group-hover:text-[var(--ink)]">
            {showEquations ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </button>

        {showEquations && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 font-display text-[12px] leading-relaxed">
            {/* Left: 4 Hydraulic Regimes */}
            <div className="lg:col-span-7 bg-[var(--atlas-card)] p-4 rounded-lg border border-[var(--line)] flex flex-col gap-2.5">
              <span className="font-plex-mono text-[10px] font-bold text-[var(--ink)] uppercase tracking-wider">
                {lang === "tr" ? "PARÇALI DEBİ MODELİ Q(t, h):" : "PIECEWISE OUTFLOW DISCHARGE Q(t, h):"}
              </span>

              {/* Regime 1 */}
              <div className={`p-2.5 rounded border ${currentFlowBreakdown.regime === 1 ? "bg-sky-500/15 border-sky-500 font-bold" : "bg-[var(--paper)] border-[var(--line)] opacity-80"}`}>
                <div className="flex justify-between font-plex-mono text-[10px]">
                  <span>Aşama 1 (h &lt; d): Kısmi Dolu Orifis Akışı</span>
                  {currentFlowBreakdown.regime === 1 && <span className="text-sky-600">● AKTİF</span>}
                </div>
                <div className="font-mono text-[11.5px] mt-1 text-[var(--ink)]">
                  Q<sub>1</sub> = c₁ · r² · [ arccos(1 - h/r) - (1 - h/r)·√(1 - (1 - h/r)²) ] · √(2gh)
                </div>
              </div>

              {/* Regime 2 */}
              <div className={`p-2.5 rounded border ${currentFlowBreakdown.regime === 2 ? "bg-sky-500/15 border-sky-500 font-bold" : "bg-[var(--paper)] border-[var(--line)] opacity-80"}`}>
                <div className="flex justify-between font-plex-mono text-[10px]">
                  <span>Aşama 2 (d ≤ h ≤ H<sub>savak</sub>): Basınçlı Dip Savak Orifis Akışı</span>
                  {currentFlowBreakdown.regime === 2 && <span className="text-sky-600">● AKTİF</span>}
                </div>
                <div className="font-mono text-[11.5px] mt-1 text-[var(--ink)]">
                  Q<sub>2</sub> = c₁ · A<sub>orifis</sub> · √(2gh) &nbsp;&nbsp;[A<sub>orifis</sub> = π·d² / 4]
                </div>
              </div>

              {/* Regime 3 */}
              <div className={`p-2.5 rounded border ${currentFlowBreakdown.regime === 3 ? "bg-sky-500/15 border-sky-500 font-bold" : "bg-[var(--paper)] border-[var(--line)] opacity-80"}`}>
                <div className="flex justify-between font-plex-mono text-[10px]">
                  <span>Aşama 3 (H<sub>savak</sub> &lt; h ≤ H<sub>kret</sub>): Dip Savak + Dolu Savak Savaklanması</span>
                  {currentFlowBreakdown.regime === 3 && <span className="text-sky-600">● AKTİF</span>}
                </div>
                <div className="font-mono text-[11.5px] mt-1 text-[var(--ink)]">
                  Q<sub>3</sub> = Q<sub>orifis</sub> + c₂ · L<sub>savak</sub> · [ (h - H<sub>savak</sub>) / H<sub>r</sub> ]<sup>3/2</sup>
                </div>
              </div>

              {/* Regime 4 */}
              <div className={`p-2.5 rounded border ${currentFlowBreakdown.regime === 4 ? "bg-rose-500/20 border-rose-500 font-bold text-rose-700 dark:text-rose-300" : "bg-[var(--paper)] border-[var(--line)] opacity-80"}`}>
                <div className="flex justify-between font-plex-mono text-[10px]">
                  <span>Aşama 4 (h &gt; H<sub>kret</sub>): Dip Savak + Dolu Savak + Baraj Kreti Aşımı</span>
                  {currentFlowBreakdown.regime === 4 && <span>⚠️ KRİTİK AŞIM</span>}
                </div>
                <div className="font-mono text-[11.5px] mt-1 text-[var(--ink)]">
                  Q<sub>4</sub> = Q<sub>orifis</sub> + Q<sub>savak</sub> + c₂ · (L<sub>kret</sub> - L<sub>savak</sub>) · [ (h - H<sub>kret</sub>) / H<sub>r</sub> ]<sup>3/2</sup>
                </div>
              </div>
            </div>

            {/* Right: Mass Balance & Level-Pool Integration */}
            <div className="lg:col-span-5 bg-[var(--atlas-card)] p-4 rounded-lg border border-[var(--line)] flex flex-col justify-between gap-3">
              <div>
                <span className="font-plex-mono text-[10px] font-bold text-[var(--ink)] uppercase tracking-wider">
                  {lang === "tr" ? "REZERVUAR KÜTLE KORUNUMU:" : "RESERVOIR CONTINUITY EQUATION:"}
                </span>
                <div className="mt-2 text-[var(--ink)] space-y-2">
                  <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--line)] font-mono text-[12.5px] text-center font-bold">
                    dS / dt = I(t) - Q(t, h)
                  </div>
                  <div className="p-2 rounded bg-[var(--paper)] border border-[var(--line)] font-mono text-[10.5px] text-center text-[var(--ink2)] space-y-0.5">
                    <div>A(h) · (dh / dt) = I(t) - Q(t, h)</div>
                    <div className="text-[9.5px] text-[var(--mut)]">
                      S(h) = S<sub>maks</sub> · [ 0.2·(h/H) + 0.8·(h/H)² ] &nbsp;|&nbsp; A(h) = dS/dh
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--ink2)] leading-relaxed mt-1">
                    {lang === "tr"
                      ? "Gelen taşkın debisi I(t) ile çıkış debisi Q(t, h) arasındaki fark rezervuar hacmini değiştirir. Vadi topoğrafyasına bağlı hazne hacim-kot eğrisi S(h) ve anlık su yüzeyi alanı A(h) üzerinden seviye artışı dh/dt hesaplanır. 4. Mertebe Runge-Kutta (RK4) sayısal algoritması bu diferansiyel denklemi adım adım çözer."
                      : "The difference between inflow I(t) and discharge Q(t, h) drives the change in stored water volume. The dynamic valley stage-storage curve S(h) and surface area A(h) govern the water level rate dh/dt, integrated using a 4th-Order Runge-Kutta (RK4) scheme."}
                  </p>
                </div>
              </div>

              <div className="p-2 rounded bg-[var(--paper)] border border-[var(--line)] text-[10px] text-[var(--mut)]">
                💡 <strong>{lang === "tr" ? "Hidrolik Prensip:" : "Hydraulic Principle:"}</strong>{" "}
                {lang === "tr"
                  ? "Taşkın ötelemesi, gelen taşkının pik debisini rezervuar depolamasıyla kırparak mansaba aktarılan pik yükü geciktirir ve güvenli seviyede tutar."
                  : "Reservoir routing detains floodwater, shaving the sharp inflow peak and delaying discharge to protect downstream life and assets."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
