"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  Sliders,
  TrendingDown,
  Clock,
  ShieldAlert,
  Waves,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  ArrowRight,
  Calculator,
} from "lucide-react";

export function DamFloodRoutingPlayground() {
  const { lang, dark } = useAtlas();

  // Dam & Inflow Parameters State
  const [dam, setDam] = useState<DamParameters>(DEFAULT_DAM_PARAMS);
  const [inflow, setInflow] = useState<InflowHydrographConfig>(DEFAULT_INFLOW_CONFIG);
  const [activePreset, setActivePreset] = useState<string>("balanced");

  // Simulation Animation State (Time scrubber t in hours)
  const [currentTimeHours, setCurrentTimeHours] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x

  // UI Accordion / Details toggle state
  const [showMathGuide, setShowMathGuide] = useState<boolean>(true);
  const [activeControlTab, setActiveControlTab] = useState<"dam" | "inflow" | "reservoir">("dam");
  const [damViewMode, setDamViewMode] = useState<"profile" | "elevation">("profile");

  // Solve reservoir routing in real time (runs instantaneously on any parameter change)
  const { steps, summary } = useMemo(() => {
    return solveReservoirRouting(dam, inflow, 160);
  }, [dam, inflow]);

  // Current interpolated state at currentTimeHours
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

  // Handle Preset selection
  const handleApplyPreset = (presetId: string) => {
    const found = DAM_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setDam(found.params);
    setInflow(found.inflow);
    setActivePreset(presetId);
    setCurrentTimeHours(0);
    setIsPlaying(false);
  };

  // Safe parameter updater ensuring physical geometry constraints (e.g. hSpill < hMax, lSpill <= lCrest)
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

  // Dynamic status flags
  const isCurrentlySpilling = currentStage > dam.hSpill;
  const isCurrentlyOvertopping = currentStage > dam.hMax;
  const freeboardCurrent = Math.max(0, dam.hMax - currentStage);

  return (
    <div className="w-full bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] rounded-xl overflow-hidden shadow-[6px_6px_0_var(--shadow)] transition-all flex flex-col">
      {/* ── Top Header Toolbar ────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-[var(--paper)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-plex-mono text-[9.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[var(--line)] text-[var(--acc)] border border-[var(--frame)]">
              {t(copy.damLab.eyebrow, lang)}
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)] flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" />
              {lang === "tr" ? "M.Sc. Tezi Şekil 2.2 Hidrolik Formülasyonu" : "M.Sc. Thesis Figure 2.2 Hydraulics"}
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

      {/* ── Key Performance Metrics Bar ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b border-[var(--line)] bg-[var(--paper)] divide-x divide-y sm:divide-y-0 divide-[var(--line)]">
        {/* Metric 1: Peak Inflow */}
        <div className="p-3.5 flex flex-col">
          <span className="font-plex-mono text-[10px] font-semibold text-[var(--mut)] uppercase tracking-wider">
            {t(copy.damLab.metrics.peakInflow, lang)}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-[19px] sm:text-[22px] text-[#0284c7]">
              {summary.peakInflow}
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)]">m³/s</span>
          </div>
          <span className="font-plex-mono text-[9px] text-[var(--mut)]">
            @ t = {summary.timeToPeakInflowHours} h
          </span>
        </div>

        {/* Metric 2: Peak Outflow */}
        <div className="p-3.5 flex flex-col">
          <span className="font-plex-mono text-[10px] font-semibold text-[var(--mut)] uppercase tracking-wider">
            {t(copy.damLab.metrics.peakOutflow, lang)}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-[19px] sm:text-[22px] text-[#059669]">
              {summary.peakOutflow}
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)]">m³/s</span>
          </div>
          <span className="font-plex-mono text-[9px] text-[var(--mut)]">
            @ t = {summary.timeToPeakOutflowHours} h
          </span>
        </div>

        {/* Metric 3: Peak Attenuation (Flood Shaving) */}
        <div className="p-3.5 flex flex-col bg-emerald-500/5">
          <span className="font-plex-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingDown size={12} />
            {t(copy.damLab.metrics.attenuation, lang)}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-[19px] sm:text-[22px] text-emerald-600 dark:text-emerald-400">
              -{summary.peakAttenuationPercent}%
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)]">
              (-{summary.peakAttenuationM3s} m³/s)
            </span>
          </div>
          <span className="font-plex-mono text-[9px] text-[var(--mut)]">
            {lang === "tr" ? "Pik Sönümleme Başarısı" : "Peak Reduction Rate"}
          </span>
        </div>

        {/* Metric 4: Flood Lag Time */}
        <div className="p-3.5 flex flex-col">
          <span className="font-plex-mono text-[10px] font-semibold text-[var(--mut)] uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} />
            {t(copy.damLab.metrics.lagTime, lang)}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-[19px] sm:text-[22px] text-[var(--ink)]">
              +{summary.lagTimeHours}
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)]">
              {lang === "tr" ? "saat" : "hours"}
            </span>
          </div>
          <span className="font-plex-mono text-[9px] text-[var(--mut)]">
            {lang === "tr" ? "Mansap Uyarı Zamanı" : "Downstream Warning Window"}
          </span>
        </div>

        {/* Metric 5: Max Water Stage */}
        <div className="p-3.5 flex flex-col">
          <span className="font-plex-mono text-[10px] font-semibold text-[var(--mut)] uppercase tracking-wider">
            {t(copy.damLab.metrics.maxStage, lang)}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-[19px] sm:text-[22px] text-[var(--ink)]">
              {summary.maxStage}
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)]">
              m / {dam.hMax} m
            </span>
          </div>
          <span className="font-plex-mono text-[9px] text-[var(--mut)]">
            {summary.maxStage > dam.hSpill ? (lang === "tr" ? "Savak Aktif (H > Hsavak)" : "Spillway Active") : (lang === "tr" ? "Sadece Dip Savak" : "Orifice Only")}
          </span>
        </div>

        {/* Metric 6: Freeboard / Overtopping Safety */}
        <div
          className={`p-3.5 flex flex-col transition-colors ${
            summary.isOvertopped
              ? "bg-rose-500/15 border-rose-500"
              : "bg-emerald-500/5"
          }`}
        >
          <span className="font-plex-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            {summary.isOvertopped ? (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                <ShieldAlert size={13} /> {t(copy.damLab.metrics.overtopping, lang)}
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400">
                {t(copy.damLab.metrics.freeboard, lang)}
              </span>
            )}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`font-display font-bold text-[19px] sm:text-[22px] ${
                summary.isOvertopped ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {summary.isOvertopped
                ? `+${(summary.maxStage - dam.hMax).toFixed(2)} m (AŞIM)`
                : `${summary.minFreeboard} m`}
            </span>
          </div>
          <span className="font-plex-mono text-[9px] text-[var(--mut)]">
            {summary.isOvertopped
              ? (lang === "tr" ? "Gövde Kretini Aştı!" : "Water Spilled Over Crest!")
              : (lang === "tr" ? "Kret Emniyet Payı" : "Safety Margin to Crest")}
          </span>
        </div>
      </div>

      {/* ── Main Interactive Workbench Grid (Isometric Illustration + Controls + Hydrograph) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* ── LEFT / TOP: 2D Civil Engineering Dam Illustration (Cross-Section & Downstream Elevation) ── */}
        <div className="lg:col-span-7 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[var(--line)] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--acc)]" />
              <h4 className="font-plex-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
                {damViewMode === "profile"
                  ? (lang === "tr" ? "2B HİDROLİK PROFİL (BARAJ EN KESİTİ)" : "2D HYDRAULIC PROFILE (DAM CROSS-SECTION)")
                  : (lang === "tr" ? "2B MANSAP GÖRÜNÜŞÜ (KRET & SAVAK GENİŞLİĞİ)" : "2D DOWNSTREAM ELEVATION (CREST & SPILLWAY)")}
              </h4>
            </div>

            {/* View Mode Toggle & Flow Regime Pill */}
            <div className="flex items-center gap-2">
              {/* Toggle Buttons */}
              <div className="inline-flex items-center p-0.5 rounded-md bg-[var(--line)] border border-[var(--frame)]">
                <button
                  type="button"
                  onClick={() => setDamViewMode("profile")}
                  className={`cursor-pointer px-2 py-1 rounded text-[10px] font-plex-mono font-semibold transition-all ${
                    damViewMode === "profile"
                      ? "bg-[var(--frame)] text-[var(--paper)] shadow-2xs font-bold"
                      : "text-[var(--mut)] hover:text-[var(--ink)]"
                  }`}
                >
                  {lang === "tr" ? "📐 Kesit" : "📐 Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setDamViewMode("elevation")}
                  className={`cursor-pointer px-2 py-1 rounded text-[10px] font-plex-mono font-semibold transition-all ${
                    damViewMode === "elevation"
                      ? "bg-[var(--frame)] text-[var(--paper)] shadow-2xs font-bold"
                      : "text-[var(--mut)] hover:text-[var(--ink)]"
                  }`}
                >
                  {lang === "tr" ? "🏛️ Ön Görünüş" : "🏛️ Elevation"}
                </button>
              </div>

              <span
                className={`font-plex-mono text-[9px] font-bold px-2 py-0.5 rounded ${
                  isCurrentlyOvertopping
                    ? "bg-rose-600 text-white animate-bounce"
                    : isCurrentlySpilling
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40"
                    : "bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30"
                }`}
              >
                {t(currentFlowBreakdown.regimeName, lang)}
              </span>
            </div>
          </div>

          {/* 2D Minimalist Engineering Vector Canvas */}
          <div className="relative w-full bg-[var(--paper)] border border-[var(--line)] rounded-lg overflow-hidden p-3 sm:p-5 shadow-inner">
            <svg
              viewBox="0 0 720 320"
              className="w-full h-auto block select-none"
              aria-label="2D Dam Engineering Hydraulic Diagram"
            >
              <defs>
                {/* Clean Water Gradient */}
                <linearGradient id="clean-water" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                </linearGradient>

                {/* Clean Concrete Dam Gradient */}
                <linearGradient id="clean-dam" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={dark ? "#475569" : "#cbd5e1"} />
                  <stop offset="100%" stopColor={dark ? "#1e293b" : "#94a3b8"} />
                </linearGradient>

                {/* Clean Overflow Water Cascade */}
                <linearGradient id="clean-cascade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
                </linearGradient>
              </defs>

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* ── MODE 1: 2D HYDRAULIC PROFILE (DAM CROSS-SECTION) ───────── */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {damViewMode === "profile" && (() => {
                // Ground Baseline & Scale
                const yBase = 250;
                const scale = 7.0; // pixels per meter

                const hMaxPx = dam.hMax * scale;
                const hSpillPx = dam.hSpill * scale;
                const hWaterPx = Math.max(0, currentStage) * scale;

                const yCrest = yBase - hMaxPx;
                const ySpill = yBase - hSpillPx;
                const yWater = Math.max(20, yBase - hWaterPx);

                // Dam Profile Geometry
                const xUp = 230;            // Upstream vertical face
                const xCrestEnd = xUp + 40; // Crest road width
                const xToe = xCrestEnd + hSpillPx * 0.85; // Downstream toe
                const xOutEnd = 670;        // Downstream channel extent

                // Bottom Orifice Geometry
                const orifY = yBase - 18;
                const orifDpx = Math.max(8, Math.min(22, dam.orificeDiameter * 4.5));
                const orifExitX = xToe - 18;

                return (
                  <g className="clean-dam-cross-section">
                    {/* Ground Foundation Line */}
                    <rect x="50" y={yBase} width="630" height="40" fill={dark ? "#18181b" : "#e2e8f0"} opacity={0.6} />
                    <line x1="50" y1={yBase} x2="680" y2={yBase} stroke={dark ? "#52525b" : "#94a3b8"} strokeWidth={1.5} />

                    {/* 1. Reservoir Water Body (Left of Dam) */}
                    {hWaterPx > 1 && (
                      <g className="clean-reservoir">
                        <rect
                          x="100"
                          y={yWater}
                          width={xUp - 100}
                          height={yBase - yWater}
                          fill="url(#clean-water)"
                        />
                        {/* Water Surface Line */}
                        <line
                          x1="90"
                          y1={yWater}
                          x2={xUp}
                          y2={yWater}
                          stroke="#38bdf8"
                          strokeWidth={2}
                        />
                        {/* Live Water Level Badge */}
                        <g transform={`translate(145, ${yWater - 12})`}>
                          <rect x="-35" y="-8" width="70" height="18" rx="4" fill="#0284c7" />
                          <text
                            x="0"
                            y="4.5"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="var(--font-ibm-plex-mono), monospace"
                            fontWeight="bold"
                            fill="#ffffff"
                          >
                            h = {currentStage.toFixed(2)}m
                          </text>
                        </g>
                      </g>
                    )}

                    {/* 2. Concrete Dam Monolith (Iconic Gravity Profile) */}
                    <polygon
                      points={`
                        ${xUp},${yBase}
                        ${xUp},${yCrest}
                        ${xCrestEnd},${yCrest}
                        ${xCrestEnd},${ySpill}
                        ${xToe},${yBase}
                        ${xUp},${yBase}
                      `}
                      fill="url(#clean-dam)"
                      stroke={dark ? "#64748b" : "#475569"}
                      strokeWidth={2}
                      strokeLinejoin="round"
                    />

                    {/* Spillway Level Dashed Reference Line across dam */}
                    <line
                      x1={xUp}
                      y1={ySpill}
                      x2={xCrestEnd}
                      y2={ySpill}
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                    />

                    {/* 3. Bottom Outlet Orifice Pipe & Jet */}
                    <g className="clean-orifice">
                      {/* Pipe conduit */}
                      <rect
                        x={xUp - 4}
                        y={orifY - orifDpx / 2}
                        width={orifExitX - xUp + 4}
                        height={orifDpx}
                        fill={currentFlowBreakdown.qOrifice > 0 ? "#0284c7" : (dark ? "#09090b" : "#334155")}
                        stroke="#38bdf8"
                        strokeWidth={1.2}
                      />
                      {/* Orifice Diameter Tag */}
                      <text
                        x={(xUp + orifExitX) / 2}
                        y={orifY - orifDpx / 2 - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fontFamily="var(--font-ibm-plex-mono), monospace"
                        fontWeight="bold"
                        fill="#0284c7"
                      >
                        d = {dam.orificeDiameter}m
                      </text>

                      {/* Pressurized Water Jet */}
                      {currentFlowBreakdown.qOrifice > 0.05 && (() => {
                        const jetReach = Math.min(160, Math.max(50, Math.sqrt(currentStage) * 35));
                        const jetEndX = orifExitX + jetReach;

                        return (
                          <g className="clean-jet">
                            <path
                              d={`
                                M ${orifExitX} ${orifY - orifDpx / 2}
                                Q ${orifExitX + jetReach * 0.45} ${orifY - 4} ${jetEndX} ${yBase}
                                L ${jetEndX - 10} ${yBase}
                                Q ${orifExitX + jetReach * 0.35} ${orifY + 4} ${orifExitX} ${orifY + orifDpx / 2}
                                Z
                              `}
                              fill="url(#clean-cascade)"
                            />
                            <text
                              x={jetEndX + 8}
                              y={yBase - 8}
                              fontSize="9.5"
                              fontFamily="var(--font-ibm-plex-mono), monospace"
                              fontWeight="bold"
                              fill="#0284c7"
                            >
                              q_orif: {currentFlowBreakdown.qOrifice.toFixed(1)} m³/s
                            </text>
                          </g>
                        );
                      })()}
                    </g>

                    {/* 4. Spillway Overflow Water Sheet (when h > H_spill) */}
                    {isCurrentlySpilling && (() => {
                      const head = currentStage - dam.hSpill;
                      const sheetThick = Math.max(3, Math.min(18, head * scale * 0.5));

                      return (
                        <g className="clean-spillway-flow">
                          <polygon
                            points={`
                              ${xCrestEnd},${ySpill}
                              ${xToe},${yBase}
                              ${xToe + 60},${yBase}
                              ${xToe + 60},${yBase - sheetThick * 0.7}
                              ${xToe - sheetThick},${yBase - sheetThick}
                              ${xCrestEnd},${ySpill - sheetThick}
                            `}
                            fill="url(#clean-cascade)"
                            opacity={0.92}
                          />
                          <text
                            x={xCrestEnd + 45}
                            y={ySpill + 25}
                            fontSize="10"
                            fontFamily="var(--font-ibm-plex-mono), monospace"
                            fontWeight="bold"
                            fill="#0369a1"
                          >
                            🌊 q_savak: {currentFlowBreakdown.qSpillway.toFixed(1)} m³/s
                          </text>
                        </g>
                      );
                    })()}

                    {/* 5. Emergency Crest Overtopping (when h > H_max) */}
                    {isCurrentlyOvertopping && (
                      <g className="clean-overtop">
                        <rect
                          x={xUp - 4}
                          y={yWater}
                          width={xCrestEnd - xUp + 8}
                          height={yCrest - yWater}
                          fill="#ef4444"
                          opacity={0.7}
                        />
                        <rect x="200" y="10" width="220" height="22" rx="4" fill="#dc2626" />
                        <text
                          x="310"
                          y="25"
                          textAnchor="middle"
                          fontSize="10"
                          fontFamily="var(--font-ibm-plex-mono), monospace"
                          fontWeight="bold"
                          fill="#ffffff"
                        >
                          ⚠️ {lang === "tr" ? "KRET AŞIMI" : "CREST OVERTOPPING"} ({currentFlowBreakdown.qOvertopping.toFixed(1)} m³/s)
                        </text>
                      </g>
                    )}

                    {/* 6. Clean, Dedicated Vertical Elevation Axis on Far Left */}
                    <g className="clean-elevation-axis" stroke="var(--ink)" strokeWidth={1}>
                      {/* Vertical Datum Bar */}
                      <line x1="80" y1={yBase} x2="80" y2={yCrest - 10} stroke="var(--line)" strokeWidth={2} />

                      {/* 0.0m Datum */}
                      <line x1="74" y1={yBase} x2="86" y2={yBase} />
                      <text x="68" y={yBase + 3} textAnchor="end" fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fill="var(--mut)">
                        0.0m
                      </text>

                      {/* H_spill Marker */}
                      <line x1="74" y1={ySpill} x2="86" y2={ySpill} stroke="#0284c7" strokeWidth={1.5} />
                      <text x="68" y={ySpill + 3} textAnchor="end" fontSize="9" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#0284c7">
                        H_spill = {dam.hSpill}m
                      </text>

                      {/* H_max Dam Crest Marker */}
                      <line x1="74" y1={yCrest} x2="86" y2={yCrest} stroke="var(--ink)" strokeWidth={1.5} />
                      <text x="68" y={yCrest + 3} textAnchor="end" fontSize="9" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="var(--ink)">
                        H_max = {dam.hMax}m
                      </text>
                    </g>
                  </g>
                );
              })()}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* ── MODE 2: 2D DOWNSTREAM ELEVATION (CREST & SPILLWAY WIDTH) ── */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {damViewMode === "elevation" && (() => {
                const yBase = 250;
                const scale = 7.0;
                const hMaxPx = dam.hMax * scale;
                const hSpillPx = dam.hSpill * scale;

                const yCrest = yBase - hMaxPx;
                const ySpill = yBase - hSpillPx;

                const crestLeftX = 160;
                const crestRightX = 580;
                const totalWidthPx = crestRightX - crestLeftX;

                const spillFrac = Math.min(0.75, Math.max(0.15, dam.lSpill / dam.lCrest));
                const spillWidthPx = totalWidthPx * spillFrac;
                const s1X = 370 - spillWidthPx / 2;
                const s2X = 370 + spillWidthPx / 2;

                const orifY = yBase - 20;
                const orifRpx = Math.max(5, Math.min(14, dam.orificeDiameter * 3));

                return (
                  <g className="clean-dam-elevation">
                    {/* Ground line */}
                    <line x1="60" y1={yBase} x2="680" y2={yBase} stroke={dark ? "#52525b" : "#94a3b8"} strokeWidth={1.5} />

                    {/* Dam Downstream Concrete Face */}
                    <polygon
                      points={`
                        ${crestLeftX},${yBase}
                        ${crestLeftX},${yCrest}
                        ${s1X},${yCrest}
                        ${s1X},${ySpill}
                        ${s2X},${ySpill}
                        ${s2X},${yCrest}
                        ${crestRightX},${yCrest}
                        ${crestRightX},${yBase}
                      `}
                      fill="url(#clean-dam)"
                      stroke={dark ? "#64748b" : "#475569"}
                      strokeWidth={2}
                    />

                    {/* Spillway Central Chute */}
                    <polygon
                      points={`${s1X},${ySpill} ${s2X},${ySpill} ${s2X},${yBase} ${s1X},${yBase}`}
                      fill={dark ? "#1e293b" : "#e2e8f0"}
                      stroke={dark ? "#475569" : "#cbd5e1"}
                    />

                    {/* Centered Bottom Outlet Orifice */}
                    <circle cx="370" cy={orifY} r={orifRpx} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
                    <text
                      x="370"
                      y={orifY - orifRpx - 4}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="bold"
                      fill="#38bdf8"
                    >
                      d = {dam.orificeDiameter}m
                    </text>

                    {/* Spillway Overflow Down Chute */}
                    {isCurrentlySpilling && (
                      <g className="clean-elevation-spill">
                        <polygon
                          points={`${s1X + 2},${ySpill} ${s2X - 2},${ySpill} ${s2X - 2},${yBase} ${s1X + 2},${yBase}`}
                          fill="url(#clean-cascade)"
                          opacity={0.88}
                        />
                        <text
                          x="370"
                          y={(ySpill + yBase) / 2}
                          textAnchor="middle"
                          fontSize="10"
                          fontFamily="var(--font-ibm-plex-mono), monospace"
                          fontWeight="bold"
                          fill="#0284c7"
                          stroke="var(--paper)"
                          strokeWidth={2}
                          paintOrder="stroke fill"
                        >
                          🌊 q_savak = {currentFlowBreakdown.qSpillway.toFixed(1)} m³/s
                        </text>
                      </g>
                    )}

                    {/* Clean Top Dimensions: L_crest */}
                    <g className="clean-dim-lcrest" stroke="var(--ink)" strokeWidth={1}>
                      <line x1={crestLeftX} y1={yCrest - 16} x2={crestRightX} y2={yCrest - 16} strokeDasharray="3 2" />
                      <line x1={crestLeftX} y1={yCrest - 20} x2={crestLeftX} y2={yCrest - 12} />
                      <line x1={crestRightX} y1={yCrest - 20} x2={crestRightX} y2={yCrest - 12} />
                      <text
                        x="370"
                        y={yCrest - 20}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontFamily="var(--font-ibm-plex-mono), monospace"
                        fontWeight="bold"
                        fill="var(--ink)"
                      >
                        L_crest = {dam.lCrest}m
                      </text>
                    </g>

                    {/* Spillway Width: L_spill */}
                    <g className="clean-dim-lspill" stroke="#0284c7" strokeWidth={1}>
                      <line x1={s1X} y1={ySpill - 8} x2={s2X} y2={ySpill - 8} strokeDasharray="2 2" />
                      <line x1={s1X} y1={ySpill - 12} x2={s1X} y2={ySpill - 4} />
                      <line x1={s2X} y1={ySpill - 12} x2={s2X} y2={ySpill - 4} />
                      <text
                        x="370"
                        y={ySpill - 11}
                        textAnchor="middle"
                        fontSize="9"
                        fontFamily="var(--font-ibm-plex-mono), monospace"
                        fontWeight="bold"
                        fill="#0284c7"
                      >
                        L_spill = {dam.lSpill}m
                      </text>
                    </g>

                    {/* Height Marks on Right */}
                    <g className="clean-dim-heights" stroke="var(--ink)" strokeWidth={1}>
                      <text x={crestRightX + 16} y={yCrest + 3} fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="var(--ink)">
                        H_max: {dam.hMax}m
                      </text>
                      <text x={crestRightX + 16} y={ySpill + 3} fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#0284c7">
                        H_spill: {dam.hSpill}m
                      </text>
                    </g>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Real-Time Flow Discharge Summary Bar */}
          <div className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded-md flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-plex-mono text-[11px] font-bold text-[var(--ink)]">
                {lang === "tr" ? "ANLIK SU BÜTÇESİ (t = " : "INSTANTANEOUS WATER BALANCE (t = "}
                {currentTimeHours.toFixed(1)} h)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 font-plex-mono text-[11px]">
              <span className="text-[#0284c7] font-semibold">
                I(t): <strong className="font-bold text-[13px]">{currentInflow.toFixed(1)}</strong> m³/s
              </span>
              <span className="text-[var(--mut)]">→</span>
              <span className="text-[#059669] font-semibold">
                Q(t): <strong className="font-bold text-[13px]">{currentOutflow.toFixed(1)}</strong> m³/s
              </span>
              <span className="text-[var(--mut)]">|</span>
              <span className="text-[var(--ink)]">
                {lang === "tr" ? "Dip Savak" : "Orifice"}: <strong>{currentFlowBreakdown.qOrifice.toFixed(1)}</strong> m³/s
              </span>
              <span className="text-[var(--ink)]">
                {lang === "tr" ? "Dolu Savak" : "Spillway"}: <strong>{currentFlowBreakdown.qSpillway.toFixed(1)}</strong> m³/s
              </span>
              {currentFlowBreakdown.qOvertopping > 0 && (
                <span className="text-rose-600 font-bold animate-pulse">
                  {lang === "tr" ? "Kret Aşımı" : "Overtopping"}: {currentFlowBreakdown.qOvertopping.toFixed(1)} m³/s
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT / BOTTOM: Interactive Controls & Coupled Hydrograph ── */}
        <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col gap-4">
          {/* Navigation Control Tabs (Dam Structure vs Inflow Storm vs Reservoir Pool) */}
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveControlTab("dam")}
                className={`cursor-pointer px-3 py-1.5 text-[11px] font-plex-mono rounded font-bold transition-all ${
                  activeControlTab === "dam"
                    ? "bg-[var(--frame)] text-[var(--paper)] shadow-xs"
                    : "text-[var(--mut)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                }`}
              >
                {lang === "tr" ? "Baraj & Savak" : "Dam & Spillway"}
              </button>
              <button
                type="button"
                onClick={() => setActiveControlTab("inflow")}
                className={`cursor-pointer px-3 py-1.5 text-[11px] font-plex-mono rounded font-bold transition-all ${
                  activeControlTab === "inflow"
                    ? "bg-[var(--frame)] text-[var(--paper)] shadow-xs"
                    : "text-[var(--mut)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                }`}
              >
                {lang === "tr" ? "Taşkın Girişi I(t)" : "Inflow Hydrograph"}
              </button>
              <button
                type="button"
                onClick={() => setActiveControlTab("reservoir")}
                className={`cursor-pointer px-3 py-1.5 text-[11px] font-plex-mono rounded font-bold transition-all ${
                  activeControlTab === "reservoir"
                    ? "bg-[var(--frame)] text-[var(--paper)] shadow-xs"
                    : "text-[var(--mut)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                }`}
              >
                {lang === "tr" ? "Rezervuar Alanı" : "Reservoir Pool"}
              </button>
            </div>

            <span className="font-plex-mono text-[10px] text-[var(--mut)] hidden sm:inline">
              ⚡ {lang === "tr" ? "Kaydırıcılarla Anlık Öteleme" : "Instant Level-Pool Routing"}
            </span>
          </div>

          {/* Tab 1: Dam Structure & Hydraulic Outlet Parameters */}
          {activeControlTab === "dam" && (
            <div className="flex flex-col gap-3.5 bg-[var(--paper)] p-4 border border-[var(--line)] rounded-lg shadow-2xs">
              {/* Slider: Dam Height H_max */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-plex-mono text-[11px]">
                  <span className="text-[var(--ink)] font-semibold">
                    {lang === "tr" ? "Baraj Kret Yüksekliği (H_maks):" : "Dam Crest Height (H_max):"}
                  </span>
                  <span className="font-bold text-[var(--ink)]">{dam.hMax} m</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={35}
                  step={0.5}
                  value={dam.hMax}
                  onChange={(e) => updateDamParam("hMax", Number(e.target.value))}
                  className="w-full accent-[var(--acc)] cursor-pointer"
                />
              </div>

              {/* Slider: Spillway Level H_spill */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-plex-mono text-[11px]">
                  <span className="text-[var(--ink)] font-semibold">
                    {lang === "tr" ? "Dolu Savak Kret Kotu (H_savak):" : "Spillway Crest Level (H_spill):"}
                  </span>
                  <span className="font-bold text-[#0284c7]">{dam.hSpill} m</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={dam.hMax - 0.5}
                  step={0.5}
                  value={dam.hSpill}
                  onChange={(e) => updateDamParam("hSpill", Number(e.target.value))}
                  className="w-full accent-[#0284c7] cursor-pointer"
                />
              </div>

              {/* Slider: Spillway Length L_spill */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-plex-mono text-[11px]">
                  <span className="text-[var(--ink)] font-semibold">
                    {lang === "tr" ? "Dolu Savak Kret Genişliği (L_savak):" : "Spillway Width (L_spill):"}
                  </span>
                  <span className="font-bold text-[#0284c7]">{dam.lSpill} m</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={dam.lCrest}
                  step={1}
                  value={dam.lSpill}
                  onChange={(e) => updateDamParam("lSpill", Number(e.target.value))}
                  className="w-full accent-[#0284c7] cursor-pointer"
                />
              </div>

              {/* Slider: Orifice Diameter d */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-plex-mono text-[11px]">
                  <span className="text-[var(--ink)] font-semibold">
                    {lang === "tr" ? "Dip Savak Çapı (d):" : "Bottom Orifice Diameter (d):"}
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">{dam.orificeDiameter} m</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={3.0}
                  step={0.1}
                  value={dam.orificeDiameter}
                  onChange={(e) => updateDamParam("orificeDiameter", Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider: Total Crest Length L_crest */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-plex-mono text-[11px]">
                  <span className="text-[var(--ink)] font-semibold">
                    {lang === "tr" ? "Toplam Kret Uzunluğu (L_kret):" : "Total Crest Length (L_crest):"}
                  </span>
                  <span className="font-bold text-[var(--ink)]">{dam.lCrest} m</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={150}
                  step={5}
                  value={dam.lCrest}
                  onChange={(e) => updateDamParam("lCrest", Number(e.target.value))}
                  className="w-full accent-[var(--acc)] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Inflow Flood Hydrograph Parameters */}
          {activeControlTab === "inflow" && (
            <div className="flex flex-col gap-3.5 bg-[var(--paper)] p-4 border border-[var(--line)] rounded-lg shadow-2xs">
              {/* Shape Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="font-plex-mono text-[11px] font-semibold text-[var(--ink)]">
                  {t(copy.damLab.shapes.gamma, lang)}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["gamma", "triangular", "trapezoid"] as HydrographShape[]).map((shp) => (
                    <button
                      key={shp}
                      type="button"
                      onClick={() => updateInflowParam("shape", shp)}
                      className={`cursor-pointer px-2 py-1.5 text-[10.5px] font-plex-mono rounded border transition-all ${
                        inflow.shape === shp
                          ? "bg-[var(--acc)] text-white border-[var(--acc)] font-bold shadow-xs"
                          : "bg-[var(--atlas-card)] text-[var(--ink2)] border-[var(--line)] hover:bg-[var(--paper)]"
                      }`}
                    >
                      {shp === "gamma" ? "Gamma" : shp === "triangular" ? "Triangular" : "Trapezoid"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider: Peak Inflow I_peak */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-plex-mono text-[11px]">
                  <span className="text-[var(--ink)] font-semibold">
                    {lang === "tr" ? "Taşkın Pik Debisi (I_pik):" : "Peak Inflow Rate (I_peak):"}
                  </span>
                  <span className="font-bold text-[#0284c7]">{inflow.peakInflow} m³/s</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={240}
                  step={5}
                  value={inflow.peakInflow}
                  onChange={(e) => updateInflowParam("peakInflow", Number(e.target.value))}
                  className="w-full accent-[#0284c7] cursor-pointer"
                />
              </div>

              {/* Slider: Time to Peak T_p */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-plex-mono text-[11px]">
                  <span className="text-[var(--ink)] font-semibold">
                    {lang === "tr" ? "Pik Varış Zamanı (T_pik):" : "Time to Peak (T_p):"}
                  </span>
                  <span className="font-bold text-[var(--ink)]">{inflow.timeToPeakHours} h</span>
                </div>
                <input
                  type="range"
                  min={1.5}
                  max={12}
                  step={0.5}
                  value={inflow.timeToPeakHours}
                  onChange={(e) => updateInflowParam("timeToPeakHours", Number(e.target.value))}
                  className="w-full accent-[var(--acc)] cursor-pointer"
                />
              </div>

              {/* Slider: Flood Duration T_d */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-plex-mono text-[11px]">
                  <span className="text-[var(--ink)] font-semibold">
                    {lang === "tr" ? "Toplam Taşkın Süresi (T_süre):" : "Flood Duration (T_d):"}
                  </span>
                  <span className="font-bold text-[var(--ink)]">{inflow.durationHours} h</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={48}
                  step={2}
                  value={inflow.durationHours}
                  onChange={(e) => updateInflowParam("durationHours", Number(e.target.value))}
                  className="w-full accent-[var(--acc)] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Reservoir Capacity & Pool Parameters */}
          {activeControlTab === "reservoir" && (
            <div className="flex flex-col gap-3.5 bg-[var(--paper)] p-4 border border-[var(--line)] rounded-lg shadow-2xs">
              {/* Slider: Reservoir Area A_res */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-plex-mono text-[11px]">
                  <span className="text-[var(--ink)] font-semibold">
                    {lang === "tr" ? "Göl Yüzey Alanı (A_göl):" : "Reservoir Surface Area (A_res):"}
                  </span>
                  <span className="font-bold text-[#059669]">
                    {dam.reservoirAreaKm2} km² ({Math.round(dam.reservoirAreaKm2 * 100)} ha)
                  </span>
                </div>
                <input
                  type="range"
                  min={0.15}
                  max={3.0}
                  step={0.05}
                  value={dam.reservoirAreaKm2}
                  onChange={(e) => updateDamParam("reservoirAreaKm2", Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-[var(--mut)]">
                  {lang === "tr" ? "Alan büyüdükçe rezervuar daha fazla su depolar ve çıkış debisini daha çok kırpar." : "Larger lake area stores more volume and flattens the outflow hydrograph."}
                </span>
              </div>

              {/* Slider: Initial Water Level h0 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-plex-mono text-[11px]">
                  <span className="text-[var(--ink)] font-semibold">
                    {lang === "tr" ? "Başlangıç Su Seviyesi (h_0):" : "Initial Pool Stage (h_0):"}
                  </span>
                  <span className="font-bold text-[#0284c7]">{dam.h0} m</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={dam.hSpill}
                  step={0.5}
                  value={dam.h0}
                  onChange={(e) => updateDamParam("h0", Number(e.target.value))}
                  className="w-full accent-[#0284c7] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--mut)]">
                  {dam.h0 === 0
                    ? (lang === "tr" ? "Kuru Taşkın Kapanı Modu (Boş Hazne)" : "Dry detention basin mode (Empty)")
                    : (lang === "tr" ? "Dolu savak kotuna kadar dolu rezervuar" : "Reservoir with conservation storage pool")}
                </span>
              </div>
            </div>
          )}

          {/* Simulation Time Scrubber & Playback Controls */}
          <div className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded-lg flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-plex-mono text-[10px] font-bold text-[var(--ink)] uppercase tracking-wider">
                {t(copy.damLab.controls.timeScrubber, lang)} <strong>{currentTimeHours.toFixed(1)} h</strong> / {inflow.durationHours} h
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="cursor-pointer px-3 py-1 rounded bg-[var(--acc)] text-white font-plex-mono text-[11px] font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={12} /> {t(copy.damLab.controls.pauseAnimation, lang)}
                    </>
                  ) : (
                    <>
                      <Play size={12} /> {t(copy.damLab.controls.playAnimation, lang)}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentTimeHours(0);
                  }}
                  title={t(copy.damLab.controls.resetAnimation, lang)}
                  className="cursor-pointer p-1.5 rounded bg-[var(--atlas-card)] border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--line)]"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            {/* Time progress slider */}
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
              className="w-full accent-[var(--acc)] cursor-pointer"
            />
          </div>

          {/* ── Coupled Inflow vs Outflow Hydrograph & Stage Chart ── */}
          <div className="bg-[var(--paper)] border border-[var(--line)] rounded-lg p-3 sm:p-4 flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-plex-mono text-[11px] font-bold text-[var(--ink)] uppercase tracking-wider">
                {lang === "tr" ? "GİRİŞ-ÇIKIŞ TAŞKIN HİDROGRAFI (I vs Q vs h)" : "INFLOW-OUTFLOW HYDROGRAPH (I vs Q vs h)"}
              </span>
              <div className="flex items-center gap-3 font-plex-mono text-[9.5px]">
                <span className="flex items-center gap-1 text-[#0284c7] font-semibold">
                  <span className="w-2.5 h-1 bg-[#0284c7] rounded-xs" /> I(t) Giriş
                </span>
                <span className="flex items-center gap-1 text-[#059669] font-bold">
                  <span className="w-2.5 h-1 bg-[#059669] rounded-xs" /> Q(t) Çıkış
                </span>
                <span className="flex items-center gap-1 text-purple-600 font-semibold">
                  <span className="w-2 h-0.5 border-t border-dashed border-purple-600" /> h(t) Su Kotu
                </span>
              </div>
            </div>

            {/* Hydrograph SVG Chart */}
            {(() => {
              const svgW = 480;
              const svgH = 210;
              const padL = 40;
              const padR = 35;
              const padT = 20;
              const padB = 26;
              const plotW = svgW - padL - padR;
              const plotH = svgH - padT - padB;

              const maxQ = Math.max(summary.peakInflow, summary.peakOutflow, 50) * 1.15;
              const maxH = Math.max(dam.hMax, summary.maxStage) * 1.1;
              const maxT = inflow.durationHours;

              // Generate SVG points for Inflow and Outflow
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

              // Generate SVG points for Stage curve h(t)
              const stagePts = steps.map((s) => {
                const x = padL + (s.timeHours / maxT) * plotW;
                const y = padT + plotH - (s.stage / maxH) * plotH;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });

              const currentX = padL + (currentTimeHours / maxT) * plotW;

              return (
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto block select-none">
                  <defs>
                    <linearGradient id="inflow-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="outflow-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.03" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0.25, 0.5, 0.75, 1.0].map((frac) => {
                    const y = padT + plotH * (1 - frac);
                    const qVal = Math.round(maxQ * frac);
                    return (
                      <g key={`grid-y-${frac}`}>
                        <line
                          x1={padL}
                          y1={y}
                          x2={padL + plotW}
                          y2={y}
                          stroke="var(--line)"
                          strokeWidth={0.8}
                          strokeDasharray="3 3"
                        />
                        <text
                          x={padL - 4}
                          y={y + 3}
                          textAnchor="end"
                          fontSize="8"
                          fontFamily="var(--font-ibm-plex-mono), monospace"
                          fill="var(--mut)"
                        >
                          {qVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Inflow Hydrograph Area & Line */}
                  <polygon
                    points={`${padL},${padT + plotH} ${inflowPts.join(" ")} ${padL + plotW},${padT + plotH}`}
                    fill="url(#inflow-area-grad)"
                  />
                  <polyline
                    points={inflowPts.join(" ")}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />

                  {/* Outflow Hydrograph Area & Line */}
                  <polygon
                    points={`${padL},${padT + plotH} ${outflowPts.join(" ")} ${padL + plotW},${padT + plotH}`}
                    fill="url(#outflow-area-grad)"
                  />
                  <polyline
                    points={outflowPts.join(" ")}
                    fill="none"
                    stroke="#059669"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                  />

                  {/* Stage curve h(t) */}
                  <polyline
                    points={stagePts.join(" ")}
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                  />

                  {/* Spillway Level Line H_spill */}
                  {(() => {
                    const ySpill = padT + plotH - (dam.hSpill / maxH) * plotH;
                    return (
                      <line
                        x1={padL}
                        y1={ySpill}
                        x2={padL + plotW}
                        y2={ySpill}
                        stroke="#0284c7"
                        strokeWidth={0.9}
                        strokeDasharray="2 2"
                      />
                    );
                  })()}

                  {/* Dam Crest Warning Line H_max */}
                  {(() => {
                    const yMax = padT + plotH - (dam.hMax / maxH) * plotH;
                    return (
                      <line
                        x1={padL}
                        y1={yMax}
                        x2={padL + plotW}
                        y2={yMax}
                        stroke="#dc2626"
                        strokeWidth={1}
                        strokeDasharray="3 2"
                      />
                    );
                  })()}

                  {/* Time Scrubber Line Indicator */}
                  <line
                    x1={currentX}
                    y1={padT}
                    x2={currentX}
                    y2={padT + plotH}
                    stroke="var(--ink)"
                    strokeWidth={1.5}
                  />
                  <circle
                    cx={currentX}
                    cy={padT + plotH - (currentInflow / maxQ) * plotH}
                    r={3.5}
                    fill="#0284c7"
                  />
                  <circle
                    cx={currentX}
                    cy={padT + plotH - (currentOutflow / maxQ) * plotH}
                    r={4}
                    fill="#059669"
                    stroke="#ffffff"
                    strokeWidth={1.2}
                  />

                  {/* Axes */}
                  <line
                    x1={padL}
                    y1={padT + plotH}
                    x2={padL + plotW}
                    y2={padT + plotH}
                    stroke="var(--ink)"
                    strokeWidth={1}
                  />
                  <line
                    x1={padL}
                    y1={padT}
                    x2={padL}
                    y2={padT + plotH}
                    stroke="var(--ink)"
                    strokeWidth={1}
                  />

                  {/* Time Ticks */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                    const x = padL + plotW * frac;
                    const tVal = Math.round(maxT * frac);
                    return (
                      <g key={`tick-t-${frac}`}>
                        <line x1={x} y1={padT + plotH} x2={x} y2={padT + plotH + 4} stroke="var(--ink)" strokeWidth={1} />
                        <text
                          x={x}
                          y={padT + plotH + 13}
                          textAnchor="middle"
                          fontSize="8.5"
                          fontFamily="var(--font-ibm-plex-mono), monospace"
                          fill="var(--ink2)"
                        >
                          {tVal}h
                        </text>
                      </g>
                    );
                  })}

                  <text
                    x={padL + plotW}
                    y={padT + plotH + 22}
                    textAnchor="end"
                    fontSize="8.5"
                    fontFamily="var(--font-ibm-plex-mono), monospace"
                    fill="var(--mut)"
                  >
                    {lang === "tr" ? "Zaman (saat)" : "Time (hours)"}
                  </text>
                  <text
                    x={padL}
                    y={padT - 6}
                    textAnchor="start"
                    fontSize="8.5"
                    fontFamily="var(--font-ibm-plex-mono), monospace"
                    fill="var(--mut)"
                  >
                    Q (m³/s)
                  </text>
                  <text
                    x={padL + plotW + 4}
                    y={padT - 6}
                    textAnchor="end"
                    fontSize="8.5"
                    fontFamily="var(--font-ibm-plex-mono), monospace"
                    fill="#9333ea"
                  >
                    h (m)
                  </text>
                </svg>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Mathematical Derivation & Thesis Equations Accordion ──────── */}
      <div className="p-4 sm:p-6 border-t border-[var(--line)] bg-[var(--paper)] flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setShowMathGuide((v) => !v)}
          className="cursor-pointer flex items-center justify-between w-full text-left py-1 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--frame)] text-[var(--paper)] flex items-center justify-center flex-none">
              <Calculator size={16} />
            </div>
            <div>
              <span className="font-plex-mono text-[9px] font-bold uppercase tracking-widest text-[var(--acc)]">
                {lang === "tr" ? "M.SC. TEZİ MATEMATİKSEL MODELİ (SAYFA 32)" : "M.SC. THESIS MATHEMATICAL FORMULATION (PAGE 32)"}
              </span>
              <h4 className="font-display font-bold text-[15px] sm:text-[16px] text-[var(--ink)]">
                {lang === "tr"
                  ? "Parçalı Baraj Boşalım Denklemleri ve Seviye-Depolama Ötelemesi"
                  : "Piecewise Dam Discharge Equations & Reservoir Flood Routing"}
              </h4>
            </div>
          </div>
          <span className="p-1 rounded bg-[var(--atlas-card)] border border-[var(--line)] text-[var(--mut)] group-hover:text-[var(--ink)]">
            {showMathGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {showMathGuide && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Equation Card */}
            <div className="lg:col-span-7 bg-[var(--atlas-card)] p-4 sm:p-5 rounded-lg border border-[var(--line)] flex flex-col gap-3 font-mono text-[12px] leading-relaxed">
              <span className="font-plex-mono text-[10px] font-bold text-[var(--ink)] uppercase tracking-wider">
                {lang === "tr" ? "TEZDEKİ ANALİTİK FORMÜLASYON q(t, h):" : "THESIS GOVERNING EQUATION q(t, h):"}
              </span>

              {/* Regime 1 */}
              <div
                className={`p-2.5 rounded border transition-colors ${
                  currentFlowBreakdown.regime === 1
                    ? "bg-sky-500/15 border-sky-500 text-[var(--ink)] font-bold shadow-xs"
                    : "bg-[var(--paper)] border-[var(--line)] text-[var(--mut)]"
                }`}
              >
                <div className="flex justify-between items-center text-[10.5px]">
                  <span>Regime 1 (h &lt; d): Kısmi Dolu Orifis (Partial Orifice)</span>
                  {currentFlowBreakdown.regime === 1 && <span className="text-sky-600">● AKTİF</span>}
                </div>
                <div className="mt-1 overflow-x-auto text-[11.5px]">
                  q = c₁·r² · (arccos(f) - f·√(1 - f²) - π) · √(2gh)
                </div>
              </div>

              {/* Regime 2 */}
              <div
                className={`p-2.5 rounded border transition-colors ${
                  currentFlowBreakdown.regime === 2
                    ? "bg-sky-500/15 border-sky-500 text-[var(--ink)] font-bold shadow-xs"
                    : "bg-[var(--paper)] border-[var(--line)] text-[var(--mut)]"
                }`}
              >
                <div className="flex justify-between items-center text-[10.5px]">
                  <span>Regime 2 (d ≤ h ≤ H_spill): Basınçlı Dip Savak (Submerged Orifice)</span>
                  {currentFlowBreakdown.regime === 2 && <span className="text-sky-600">● AKTİF</span>}
                </div>
                <div className="mt-1 overflow-x-auto text-[11.5px]">
                  q = c₁ · O_a · √(2gh)
                </div>
              </div>

              {/* Regime 3 */}
              <div
                className={`p-2.5 rounded border transition-colors ${
                  currentFlowBreakdown.regime === 3
                    ? "bg-sky-500/15 border-sky-500 text-[var(--ink)] font-bold shadow-xs"
                    : "bg-[var(--paper)] border-[var(--line)] text-[var(--mut)]"
                }`}
              >
                <div className="flex justify-between items-center text-[10.5px]">
                  <span>Regime 3 (H_spill &lt; h ≤ H_max): Dip Savak + Dolu Savak (Spillway Weir)</span>
                  {currentFlowBreakdown.regime === 3 && <span className="text-sky-600">● AKTİF</span>}
                </div>
                <div className="mt-1 overflow-x-auto text-[11.5px]">
                  q = c₁·O_a·√(2gh) + c₂·L_spill · ((h - H_spill) / H_r)^(3/2)
                </div>
              </div>

              {/* Regime 4 */}
              <div
                className={`p-2.5 rounded border transition-colors ${
                  currentFlowBreakdown.regime === 4
                    ? "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-xs animate-pulse"
                    : "bg-[var(--paper)] border-[var(--line)] text-[var(--mut)]"
                }`}
              >
                <div className="flex justify-between items-center text-[10.5px]">
                  <span>Regime 4 (h &gt; H_max): Dip Savak + Dolu Savak + Kret Aşımı (Overtopping!)</span>
                  {currentFlowBreakdown.regime === 4 && <span>⚠️ TEHLİKE</span>}
                </div>
                <div className="mt-1 overflow-x-auto text-[11.5px]">
                  q = c₁·O_a·√(2gh) + c₂·L_spill·((h - H_spill) / H_r)^(3/2) + c₂·(L_crest - L_spill)·((h - H_max) / H_r)^(3/2)
                </div>
              </div>
            </div>

            {/* Live Numerical Parameter Substitution */}
            <div className="lg:col-span-5 bg-[var(--atlas-card)] p-4 sm:p-5 rounded-lg border border-[var(--line)] flex flex-col gap-3 font-mono text-[11px]">
              <span className="font-plex-mono text-[10px] font-bold text-[var(--ink)] uppercase tracking-wider">
                {lang === "tr" ? "ANLIK SAYISAL ÇÖZÜM (t = " : "CURRENT NUMERICAL EVALUATION (t = "}
                {currentTimeHours.toFixed(1)} h):
              </span>

              <div className="space-y-1.5 text-[var(--ink)]">
                <div>• Su Seviyesi h = <strong>{currentStage.toFixed(2)} m</strong></div>
                <div>• Orifis Kesiti O_a = π·d²/4 = <strong>{((Math.PI / 4) * Math.pow(dam.orificeDiameter, 2)).toFixed(2)} m²</strong></div>
                <div>• Savak Genişliği L_spill = <strong>{dam.lSpill} m</strong></div>
                <div>• Gövde Yüksekliği H_max = <strong>{dam.hMax} m</strong> (Savak Kotu: {dam.hSpill} m)</div>
                <div className="pt-2 border-t border-[var(--line)]">
                  • q_orifis = <strong>{currentFlowBreakdown.qOrifice.toFixed(2)} m³/s</strong>
                </div>
                <div>• q_savak = <strong>{currentFlowBreakdown.qSpillway.toFixed(2)} m³/s</strong></div>
                <div>• q_kret = <strong>{currentFlowBreakdown.qOvertopping.toFixed(2)} m³/s</strong></div>
                <div className="pt-1.5 border-t border-[var(--line)] text-emerald-600 dark:text-emerald-400 font-bold text-[12.5px]">
                  = Toplam Q_çıkış = {currentFlowBreakdown.qTotal.toFixed(2)} m³/s
                </div>
              </div>

              <div className="mt-auto p-2.5 rounded bg-[var(--paper)] border border-[var(--line)] text-[10px] text-[var(--mut)]">
                💡 <strong>{lang === "tr" ? "Kütle Korunumu:" : "Mass Balance:"}</strong> dS/dt = I(t) - Q(t, h). 
                {lang === "tr"
                  ? " Gelen taşkın suyu rezervuarda depolanarak çıkış piki geciktirilir ve debi önemli ölçüde traşlanır."
                  : " Storing floodwaters in the reservoir shaves down peak discharge and delays the flood arrival."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
