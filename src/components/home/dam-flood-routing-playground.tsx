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
  Sparkles,
  Calculator,
  SlidersHorizontal,
  Compass,
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
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Controls mode: Dam Structure vs Flood Wave
  const [controlsGroup, setControlsGroup] = useState<"structure" | "hydrology">("structure");
  const [showMathGuide, setShowMathGuide] = useState<boolean>(false);

  // Solve reservoir routing in real time
  const { steps, summary } = useMemo(() => {
    return solveReservoirRouting(dam, inflow, 160);
  }, [dam, inflow]);

  // Current state at currentTimeHours
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
      {/* ── Top Header Toolbar ────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-[var(--paper)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-plex-mono text-[9.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[var(--line)] text-[var(--acc)] border border-[var(--frame)]">
              {t(copy.damLab.eyebrow, lang)}
            </span>
            <span className="font-plex-mono text-[10px] text-[var(--mut)] flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" />
              {lang === "tr" ? "M.Sc. Tezi Şekil 2.2 Hidrolik Modeli" : "M.Sc. Thesis Figure 2.2 Hydraulics"}
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

      {/* ── THE CRITICAL WATER RESOURCES QUESTION DASHBOARD ────────────── */}
      {/* Acts like a real water engineer's verdict: Safety vs Flood Mitigation */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[var(--paper)] via-[var(--atlas-card)] to-[var(--paper)] border-b border-[var(--line)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* 1. Dam Safety Verdict */}
          <div
            className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all ${
              summary.isOvertopped
                ? "bg-rose-500/10 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                : "bg-emerald-500/10 border-emerald-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-plex-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">
                {lang === "tr" ? "1. BARAJ GÜVENLİK ANALİZİ" : "1. DAM CREST INTEGRITY"}
              </span>
              {summary.isOvertopped ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600 text-white font-plex-mono text-[10px] font-bold animate-pulse">
                  <ShieldAlert size={12} /> {lang === "tr" ? "KRET AŞIMI TEHLİKESİ" : "OVERTOPPING HAZARD"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-plex-mono text-[10px] font-bold">
                  <ShieldCheck size={12} /> {lang === "tr" ? "GÖVDE EMNİYETLİ" : "CREST SAFE"}
                </span>
              )}
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[13px] text-[var(--mut)]">
                  {lang === "tr" ? "Minimum Hava Payı:" : "Min Freeboard Margin:"}
                </span>
                <span
                  className={`font-display font-bold text-[22px] tracking-tight ${
                    summary.isOvertopped ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {summary.isOvertopped
                    ? `-${(summary.maxStage - dam.hMax).toFixed(2)} m`
                    : `+${summary.minFreeboard.toFixed(2)} m`}
                </span>
              </div>
              <p className="font-display text-[11.5px] text-[var(--ink2)] mt-0.5 leading-tight">
                {summary.isOvertopped
                  ? (lang === "tr"
                      ? `Maksimum su kotu (${summary.maxStage} m), baraj kretini (${dam.hMax} m) aştı! Toprak/kaya dolgu gövdelerde yıkılma riski.`
                      : `Peak stage (${summary.maxStage} m) overtops dam crest (${dam.hMax} m)! Catastrophic breach risk for embankment.`)
                  : (lang === "tr"
                      ? `En yüksek su kotu (${summary.maxStage} m), kret kotunun (${dam.hMax} m) altında kalarak emniyeti koruyor.`
                      : `Peak stage (${summary.maxStage} m) stays below crest (${dam.hMax} m), preserving freeboard.`)}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--line)]/60 flex items-center justify-between font-plex-mono text-[10px] text-[var(--mut)]">
              <span>{lang === "tr" ? `Gövde: ${dam.hMax} m` : `Crest: ${dam.hMax} m`}</span>
              <span>{lang === "tr" ? `Savak Kotu: ${dam.hSpill} m` : `Spillway: ${dam.hSpill} m`}</span>
              <span>{lang === "tr" ? `Pik Kot: ${summary.maxStage} m` : `Max: ${summary.maxStage} m`}</span>
            </div>
          </div>

          {/* 2. Flood Peak Shaving (Attenuation) */}
          <div className="p-3.5 rounded-lg border border-sky-500/40 bg-sky-500/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-plex-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1">
                <TrendingDown size={12} className="text-sky-600" />
                {lang === "tr" ? "2. TAŞKIN SÖNÜMLEME (TRAŞLAMA)" : "2. FLOOD PEAK ATTENUATION"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-600 text-white font-plex-mono text-[10.5px] font-bold">
                -{summary.peakAttenuationPercent}% {lang === "tr" ? "PİK KIRPMA" : "SHAVED"}
              </span>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-[20px] text-[#0284c7]">
                  {summary.peakInflow} m³/s
                </span>
                <span className="font-display text-[14px] text-[var(--mut)]">➔</span>
                <span className="font-display font-bold text-[20px] text-[#059669]">
                  {summary.peakOutflow} m³/s
                </span>
              </div>
              <p className="font-display text-[11.5px] text-[var(--ink2)] mt-0.5 leading-tight">
                {lang === "tr"
                  ? `Rezervuar depolaması sayesinde mansaba akan en yüksek taşkın debisi ${summary.peakAttenuationM3s} m³/s azaltıldı.`
                  : `Reservoir storage buffer cuts down peak flood discharge by ${summary.peakAttenuationM3s} m³/s before reaching downstream.`}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--line)]/60 flex items-center justify-between font-plex-mono text-[10px] text-[var(--mut)]">
              <span>{lang === "tr" ? "I(t) Gelen Pik" : "Peak Inflow"}</span>
              <span>➔</span>
              <span>{lang === "tr" ? "Q(t) Mansap Çıkış Piki" : "Peak Outflow"}</span>
            </div>
          </div>

          {/* 3. Flood Warning Window (Lag Time) */}
          <div className="p-3.5 rounded-lg border border-purple-500/30 bg-purple-500/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-plex-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1">
                <Clock size={12} className="text-purple-600" />
                {lang === "tr" ? "3. MANSAP ERKEN UYARI KAZANIMI" : "3. DOWNSTREAM WARNING LAG"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-plex-mono text-[10px] font-bold">
                +{summary.lagTimeHours}h {lang === "tr" ? "GECİKME" : "LAG"}
              </span>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[13px] text-[var(--mut)]">
                  {lang === "tr" ? "Pik Varış Ertelemesi:" : "Flood Peak Delay:"}
                </span>
                <span className="font-display font-bold text-[22px] text-purple-700 dark:text-purple-400">
                  +{summary.lagTimeHours} {lang === "tr" ? "saat" : "hours"}
                </span>
              </div>
              <p className="font-display text-[11.5px] text-[var(--ink2)] mt-0.5 leading-tight">
                {lang === "tr"
                  ? `Gelen pik (${summary.timeToPeakInflowHours}. saat), rezervuar haznesinde tutularak çıkış piki ${summary.timeToPeakOutflowHours}. saate ertelendi.`
                  : `Inflow peak (${summary.timeToPeakInflowHours}h) is held back; outflow peak doesn't hit until ${summary.timeToPeakOutflowHours}h, buying critical evacuation time.`}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--line)]/60 flex items-center justify-between font-plex-mono text-[10px] text-[var(--mut)]">
              <span>t_inflow: {summary.timeToPeakInflowHours} h</span>
              <span>➔</span>
              <span>t_outflow: {summary.timeToPeakOutflowHours} h</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN SPLIT VIEW: CRYSTAL-CLEAR DAM ILLUSTRATION + CONTROLS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--line)]">
        {/* ── LEFT COLUMN (7 COLS): HIGH-LEGIBILITY DAM HYDRAULIC PROFILE ── */}
        <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col gap-3.5">
          {/* Subheader Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--acc)]" />
              <h4 className="font-plex-mono text-[11.5px] font-bold uppercase tracking-wider text-[var(--ink)]">
                {lang === "tr" ? "HİDROLİK BARAJ EN KESİTİ & AKIŞ KANITLARI" : "HYDRAULIC DAM PROFILE & FLOW REGIMES"}
              </h4>
            </div>

            {/* Current Active Flow Regime Pill */}
            <div className="flex items-center gap-2">
              <span
                className={`font-plex-mono text-[10px] font-bold px-2.5 py-1 rounded shadow-2xs ${
                  isCurrentlyOvertopping
                    ? "bg-rose-600 text-white animate-pulse"
                    : isCurrentlySpilling
                    ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/50"
                    : "bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/40"
                }`}
              >
                {t(currentFlowBreakdown.regimeName, lang)}
              </span>
            </div>
          </div>

          {/* ── Crisp, High-Contrast SVG Engineering Cross-Section Canvas ── */}
          <div className="relative w-full bg-[var(--paper)] border-[1.5px] border-[var(--frame)] rounded-lg overflow-hidden p-2 sm:p-3 shadow-inner">
            <svg
              viewBox="0 0 780 340"
              className="w-full h-auto block select-none"
              aria-label="Dam Hydraulics Profile"
            >
              <defs>
                {/* Clean Water Body Gradient */}
                <linearGradient id="eng-water-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.98" />
                </linearGradient>

                {/* Dam Concrete Monolith Gradient */}
                <linearGradient id="eng-dam-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={dark ? "#475569" : "#cbd5e1"} />
                  <stop offset="100%" stopColor={dark ? "#1e293b" : "#64748b"} />
                </linearGradient>

                {/* Spillway Cascade Flow Gradient */}
                <linearGradient id="eng-spill-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.90" />
                </linearGradient>
              </defs>

              {(() => {
                // Geometry Constants (pixels)
                const yBase = 270;        // Foundation line
                const scale = 7.5;        // 7.5 pixels per meter of elevation
                const xUp = 260;          // Dam upstream vertical face
                const crestRoadWidth = 45; // Width of dam crest
                const xCrestEnd = xUp + crestRoadWidth; // 305

                const hMaxPx = dam.hMax * scale;
                const hSpillPx = dam.hSpill * scale;
                const hWaterPx = Math.max(0, currentStage) * scale;

                const yCrest = yBase - hMaxPx;
                const ySpill = yBase - hSpillPx;
                const yWater = Math.max(25, yBase - hWaterPx);

                // Downstream toe geometry
                const xToe = xCrestEnd + hSpillPx * 0.95;
                const orifY = yBase - 22;
                const orifDpx = Math.max(10, Math.min(26, dam.orificeDiameter * 6));
                const orifExitX = xToe - 20;

                return (
                  <g className="eng-diagram">
                    {/* 1. Geological Foundation Bedrock */}
                    <rect x="20" y={yBase} width="740" height="55" fill={dark ? "#18181b" : "#e2e8f0"} opacity={0.8} />
                    <line x1="20" y1={yBase} x2="760" y2={yBase} stroke={dark ? "#71717a" : "#94a3b8"} strokeWidth={2} />
                    <text x="35" y={yBase + 28} fontSize="10.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill={dark ? "#a1a1aa" : "#64748b"}>
                      {lang === "tr" ? "TEMEL KAYASI (DATUM z = 0.0 m)" : "BEDROCK FOUNDATION (DATUM z = 0.0 m)"}
                    </text>

                    {/* 2. Reservoir Water Pool (Upstream Left) */}
                    {hWaterPx > 2 && (
                      <g className="reservoir-pool">
                        <rect
                          x="95"
                          y={yWater}
                          width={xUp - 95}
                          height={yBase - yWater}
                          fill="url(#eng-water-grad)"
                        />
                        {/* Dynamic water ripples */}
                        <line x1="90" y1={yWater} x2={xUp} y2={yWater} stroke="#38bdf8" strokeWidth={3} />
                        
                        {/* Upstream Inflow Arrow */}
                        <g transform={`translate(130, ${Math.max(45, yWater - 25)})`}>
                          <rect x="-40" y="-12" width="80" height="22" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth={1} />
                          <text x="0" y="3" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#ffffff">
                            I(t) = {currentInflow.toFixed(1)} m³/s
                          </text>
                        </g>
                      </g>
                    )}

                    {/* 3. Concrete Gravity Dam Monolith */}
                    <polygon
                      points={`
                        ${xUp},${yBase}
                        ${xUp},${yCrest}
                        ${xCrestEnd},${yCrest}
                        ${xCrestEnd},${ySpill}
                        ${xToe},${yBase}
                        ${xUp},${yBase}
                      `}
                      fill="url(#eng-dam-grad)"
                      stroke={dark ? "#94a3b8" : "#334155"}
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                    />

                    {/* Spillway Level Dashed Horizontal Notch Guide */}
                    <line
                      x1={xUp}
                      y1={ySpill}
                      x2={xCrestEnd}
                      y2={ySpill}
                      stroke="#0284c7"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                    />

                    {/* 4. Bottom Outlet Conduit (Dip Savak) & Jet */}
                    <g className="bottom-orifice">
                      <rect
                        x={xUp - 6}
                        y={orifY - orifDpx / 2}
                        width={orifExitX - xUp + 6}
                        height={orifDpx}
                        fill={currentFlowBreakdown.qOrifice > 0 ? "#0284c7" : (dark ? "#09090b" : "#334155")}
                        stroke="#38bdf8"
                        strokeWidth={1.8}
                      />

                      {/* Orifice Diameter Callout Badge (High Contrast!) */}
                      <g transform={`translate(${(xUp + orifExitX) / 2}, ${orifY - orifDpx / 2 - 16})`}>
                        <rect x="-42" y="-10" width="84" height="20" rx="4" fill="var(--paper)" stroke="#0284c7" strokeWidth={1.5} />
                        <text x="0" y="3.5" textAnchor="middle" fontSize="11" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#0284c7">
                          Ø d = {dam.orificeDiameter} m
                        </text>
                      </g>

                      {/* Pressurized Orifice Water Jet */}
                      {currentFlowBreakdown.qOrifice > 0.05 && (() => {
                        const jetReach = Math.min(180, Math.max(60, Math.sqrt(currentStage) * 38));
                        const jetEndX = orifExitX + jetReach;

                        return (
                          <g className="orifice-jet">
                            <path
                              d={`
                                M ${orifExitX} ${orifY - orifDpx / 2}
                                Q ${orifExitX + jetReach * 0.45} ${orifY - 6} ${jetEndX} ${yBase}
                                L ${jetEndX - 14} ${yBase}
                                Q ${orifExitX + jetReach * 0.35} ${orifY + 6} ${orifExitX} ${orifY + orifDpx / 2}
                                Z
                              `}
                              fill="url(#eng-spill-grad)"
                            />
                            {/* Jet Discharge Rate Badge */}
                            <g transform={`translate(${jetEndX + 55}, ${yBase - 15})`}>
                              <rect x="-48" y="-10" width="96" height="20" rx="4" fill="var(--paper)" stroke="#0284c7" strokeWidth={1.5} />
                              <text x="0" y="3.5" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#0284c7">
                                q_dip: {currentFlowBreakdown.qOrifice.toFixed(1)} m³/s
                              </text>
                            </g>
                          </g>
                        );
                      })()}
                    </g>

                    {/* 5. Spillway Overflow Flow Cascade (when h > H_spill) */}
                    {isCurrentlySpilling ? (() => {
                      const head = currentStage - dam.hSpill;
                      const sheetThick = Math.max(4, Math.min(22, head * scale * 0.6));

                      return (
                        <g className="spillway-flow">
                          <polygon
                            points={`
                              ${xCrestEnd},${ySpill}
                              ${xToe},${yBase}
                              ${xToe + 70},${yBase}
                              ${xToe + 70},${yBase - sheetThick * 0.7}
                              ${xToe - sheetThick},${yBase - sheetThick}
                              ${xCrestEnd},${ySpill - sheetThick}
                            `}
                            fill="url(#eng-spill-grad)"
                            opacity={0.94}
                          />
                          {/* Spillway Flow Rate Badge */}
                          <g transform={`translate(${xCrestEnd + 85}, ${ySpill + 25})`}>
                            <rect x="-56" y="-11" width="112" height="22" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth={1.5} />
                            <text x="0" y="4" textAnchor="middle" fontSize="11" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#ffffff">
                              🌊 q_savak: {currentFlowBreakdown.qSpillway.toFixed(1)} m³/s
                            </text>
                          </g>
                        </g>
                      );
                    })() : (
                      /* Spillway Inactive Tag */
                      <g transform={`translate(${xCrestEnd + 70}, ${ySpill + 25})`}>
                        <rect x="-48" y="-10" width="96" height="20" rx="4" fill="var(--paper)" stroke="var(--line)" strokeWidth={1} />
                        <text x="0" y="3.5" textAnchor="middle" fontSize="9.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="var(--mut)">
                          {lang === "tr" ? "Savak Kuru (h ≤ H_savak)" : "Spillway Dry (h ≤ H_spill)"}
                        </text>
                      </g>
                    )}

                    {/* 6. Emergency Dam Crest Overtopping (when h > H_max) */}
                    {isCurrentlyOvertopping && (
                      <g className="crest-overtopping">
                        <rect
                          x={xUp - 8}
                          y={yWater}
                          width={xCrestEnd - xUp + 16}
                          height={yCrest - yWater}
                          fill="#ef4444"
                          opacity={0.75}
                        />
                        <g transform={`translate(320, 20)`}>
                          <rect x="-110" y="-12" width="220" height="24" rx="4" fill="#dc2626" stroke="#ffffff" strokeWidth={1.5} />
                          <text x="0" y="4.5" textAnchor="middle" fontSize="11.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#ffffff">
                            🚨 {lang === "tr" ? "KRET AŞIMI" : "OVERTOPPING"}: {currentFlowBreakdown.qOvertopping.toFixed(1)} m³/s
                          </text>
                        </g>
                      </g>
                    )}

                    {/* 7. PROMINENT, READABLE ELEVATION DATUM RULER (Far Left) */}
                    <g className="elevation-datum" strokeWidth={1.5}>
                      {/* Vertical Datum Axis */}
                      <line x1="85" y1={yBase} x2="85" y2={Math.min(yWater, yCrest) - 20} stroke="var(--line)" strokeWidth={2} />

                      {/* 0.0m Bedrock Marker */}
                      <line x1="78" y1={yBase} x2="92" y2={yBase} stroke="var(--ink)" />
                      <g transform={`translate(65, ${yBase})`}>
                        <rect x="-24" y="-8" width="28" height="16" rx="3" fill="var(--paper)" stroke="var(--line)" />
                        <text x="-10" y="3.5" textAnchor="middle" fontSize="9.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="var(--mut)">
                          0.0m
                        </text>
                      </g>

                      {/* Spillway Crest H_spill Marker */}
                      <line x1="75" y1={ySpill} x2="xCrestEnd" y2={ySpill} stroke="#0284c7" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
                      <g transform={`translate(55, ${ySpill})`}>
                        <rect x="-50" y="-11" width="60" height="22" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth={1} />
                        <text x="-20" y="4" textAnchor="middle" fontSize="11" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#ffffff">
                          {dam.hSpill}m
                        </text>
                      </g>

                      {/* Dam Crest H_max Marker */}
                      <line x1="75" y1={yCrest} x2="xCrestEnd" y2={yCrest} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
                      <g transform={`translate(55, ${yCrest})`}>
                        <rect x="-50" y="-11" width="60" height="22" rx="4" fill="var(--frame)" stroke="var(--paper)" strokeWidth={1} />
                        <text x="-20" y="4" textAnchor="middle" fontSize="11" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="var(--paper)">
                          {dam.hMax}m
                        </text>
                      </g>
                    </g>

                    {/* 8. HIGH-LEGIBILITY PROMINENT LABELS ON THE DAM ITSELF */}
                    {/* Dam Crest Label Badge */}
                    <g transform={`translate(${xCrestEnd + 80}, ${yCrest - 14})`}>
                      <rect x="-70" y="-11" width="140" height="22" rx="4" fill="var(--paper)" stroke="var(--frame)" strokeWidth={1.5} />
                      <text x="0" y="4" textAnchor="middle" fontSize="11.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="var(--ink)">
                        🏔️ H_kret = {dam.hMax} m
                      </text>
                    </g>

                    {/* Spillway Crest Label Badge */}
                    <g transform={`translate(${xCrestEnd + 85}, ${ySpill - 14})`}>
                      <rect x="-75" y="-11" width="150" height="22" rx="4" fill="var(--paper)" stroke="#0284c7" strokeWidth={1.5} />
                      <text x="0" y="4" textAnchor="middle" fontSize="11" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#0284c7">
                        🌊 H_savak = {dam.hSpill} m (L={dam.lSpill}m)
                      </text>
                    </g>

                    {/* Floating Water Stage Badge */}
                    <g transform={`translate(185, ${yWater - 14})`}>
                      <rect x="-65" y="-11" width="130" height="22" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth={1.5} />
                      <text x="0" y="4" textAnchor="middle" fontSize="11.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#ffffff">
                        💧 h(t) = {currentStage.toFixed(2)} m
                      </text>
                    </g>

                    {/* Freeboard Margin Bracket (when h < H_max) */}
                    {freeboardNow > 0 && yCrest < yWater && (
                      <g className="freeboard-bracket">
                        <line x1={xUp - 16} y1={yWater} x2={xUp - 16} y2={yCrest} stroke="#10b981" strokeWidth={2} markerEnd="url(#arrow)" />
                        <line x1={xUp - 22} y1={yWater} x2={xUp - 10} y2={yWater} stroke="#10b981" strokeWidth={2} />
                        <line x1={xUp - 22} y1={yCrest} x2={xUp - 10} y2={yCrest} stroke="#10b981" strokeWidth={2} />
                        <g transform={`translate(${xUp - 65}, ${(yWater + yCrest) / 2})`}>
                          <rect x="-42" y="-10" width="84" height="20" rx="4" fill="var(--paper)" stroke="#10b981" strokeWidth={1.5} />
                          <text x="0" y="3.5" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#059669">
                            Pay: +{freeboardNow.toFixed(2)}m
                          </text>
                        </g>
                      </g>
                    )}
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Real-Time Mass Balance Banner */}
          <div className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded-lg flex flex-wrap items-center justify-between gap-2 shadow-2xs font-plex-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[var(--ink)]">
                {lang === "tr" ? "ANLIK AKIŞ DENGESİ (t = " : "WATER BALANCE (t = "}
                {currentTimeHours.toFixed(1)} h)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#0284c7] font-bold">
                I: {currentInflow.toFixed(1)} m³/s
              </span>
              <span className="text-[var(--mut)]">➔</span>
              <span className="text-[#059669] font-bold">
                Q: {currentOutflow.toFixed(1)} m³/s
              </span>
              <span className="text-[var(--mut)]">|</span>
              <span className="text-[var(--ink)]">
                Dip: <strong>{currentFlowBreakdown.qOrifice.toFixed(1)}</strong> m³/s
              </span>
              <span className="text-[var(--ink)]">
                Savak: <strong>{currentFlowBreakdown.qSpillway.toFixed(1)}</strong> m³/s
              </span>
              {currentFlowBreakdown.qOvertopping > 0 && (
                <span className="text-rose-600 font-bold animate-pulse">
                  Kret Aşımı: {currentFlowBreakdown.qOvertopping.toFixed(1)} m³/s
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (5 COLS): STREAMLINED CONTROLS & HYDROGRAPH ──── */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col gap-4">
          {/* Controls Mode Switcher: 2 Essential Tabs instead of 3 scattered ones */}
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setControlsGroup("structure")}
                className={`cursor-pointer px-3 py-1.5 text-[11.5px] font-plex-mono rounded font-bold transition-all flex items-center gap-1.5 ${
                  controlsGroup === "structure"
                    ? "bg-[var(--frame)] text-[var(--paper)] shadow-xs"
                    : "text-[var(--mut)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                }`}
              >
                <SlidersHorizontal size={13} />
                {lang === "tr" ? "Baraj & Savak Boyutları" : "Dam & Spillway Design"}
              </button>
              <button
                type="button"
                onClick={() => setControlsGroup("hydrology")}
                className={`cursor-pointer px-3 py-1.5 text-[11.5px] font-plex-mono rounded font-bold transition-all flex items-center gap-1.5 ${
                  controlsGroup === "hydrology"
                    ? "bg-[var(--frame)] text-[var(--paper)] shadow-xs"
                    : "text-[var(--mut)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                }`}
              >
                <Waves size={13} />
                {lang === "tr" ? "Gelen Taşkın Dalgası" : "Inflow Hydrograph"}
              </button>
            </div>

            <span className="font-plex-mono text-[10px] text-[var(--mut)] hidden sm:inline">
              ⚡ {lang === "tr" ? "Anlık RK4 Öteleme" : "Real-Time RK4"}
            </span>
          </div>

          {/* GROUP 1: DAM & RESERVOIR STRUCTURAL PARAMETERS */}
          {controlsGroup === "structure" && (
            <div className="flex flex-col gap-3 bg-[var(--paper)] p-4 border border-[var(--line)] rounded-lg shadow-2xs">
              {/* Slider 1: Dam Crest Height H_max */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline font-plex-mono text-[11.5px]">
                  <span className="text-[var(--ink)] font-bold">
                    {lang === "tr" ? "Baraj Kret Kotu (H_kret):" : "Dam Crest Elevation (H_crest):"}
                  </span>
                  <span className="font-bold text-[13px] text-[var(--ink)] px-2 py-0.5 rounded bg-[var(--atlas-card)] border border-[var(--line)]">
                    {dam.hMax} m
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={32}
                  step={0.5}
                  value={dam.hMax}
                  onChange={(e) => updateDamParam("hMax", Number(e.target.value))}
                  className="w-full accent-[var(--acc)] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--mut)] leading-tight">
                  {lang === "tr"
                    ? "Kret ne kadar yüksekse hava payı o kadar artar ve aşım riski önlenir."
                    : "Higher crest increases safety freeboard margin and prevents overtopping."}
                </span>
              </div>

              {/* Slider 2: Spillway Crest Level H_spill */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline font-plex-mono text-[11.5px]">
                  <span className="text-[var(--ink)] font-bold">
                    {lang === "tr" ? "Dolu Savak Kotu (H_savak):" : "Spillway Crest Level (H_spill):"}
                  </span>
                  <span className="font-bold text-[13px] text-[#0284c7] px-2 py-0.5 rounded bg-[var(--atlas-card)] border border-[var(--line)]">
                    {dam.hSpill} m
                  </span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={dam.hMax - 0.5}
                  step={0.5}
                  value={dam.hSpill}
                  onChange={(e) => updateDamParam("hSpill", Number(e.target.value))}
                  className="w-full accent-[#0284c7] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--mut)] leading-tight">
                  {lang === "tr"
                    ? "Su kotu bu seviyeyi aşınca dolu savak devreye girer."
                    : "Water level above this elevation triggers emergency weir discharge."}
                </span>
              </div>

              {/* Slider 3: Spillway Width L_spill */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline font-plex-mono text-[11.5px]">
                  <span className="text-[var(--ink)] font-bold">
                    {lang === "tr" ? "Dolu Savak Genişliği (L_savak):" : "Spillway Crest Width (L_spill):"}
                  </span>
                  <span className="font-bold text-[13px] text-[#0284c7] px-2 py-0.5 rounded bg-[var(--atlas-card)] border border-[var(--line)]">
                    {dam.lSpill} m
                  </span>
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
                <span className="text-[10px] text-[var(--mut)] leading-tight">
                  {lang === "tr"
                    ? "Geniş savak suyu daha hızlı tahliye eder, barajı korur fakat mansaba daha yüksek pik iletir."
                    : "Wider weir discharges water faster, protecting crest but increasing downstream peak."}
                </span>
              </div>

              {/* Slider 4: Bottom Outlet Diameter d */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline font-plex-mono text-[11.5px]">
                  <span className="text-[var(--ink)] font-bold">
                    {lang === "tr" ? "Dip Savak Orifis Çapı (d):" : "Bottom Outlet Diameter (d):"}
                  </span>
                  <span className="font-bold text-[13px] text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded bg-[var(--atlas-card)] border border-[var(--line)]">
                    Ø {dam.orificeDiameter} m
                  </span>
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
                <span className="text-[10px] text-[var(--mut)] leading-tight">
                  {lang === "tr"
                    ? "Dip savak dip seviyeden kontrollü boşalım yaparak taşkın öncesi hazneyi boşaltır."
                    : "Low-level orifice empties bottom pool and throttles initial flood stages."}
                </span>
              </div>

              {/* Slider 5: Reservoir Surface Area */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline font-plex-mono text-[11.5px]">
                  <span className="text-[var(--ink)] font-bold">
                    {lang === "tr" ? "Rezervuar Göl Yüzey Alanı (A_göl):" : "Reservoir Surface Area (A_res):"}
                  </span>
                  <span className="font-bold text-[13px] text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-[var(--atlas-card)] border border-[var(--line)]">
                    {dam.reservoirAreaKm2} km²
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
                <span className="text-[10px] text-[var(--mut)] leading-tight">
                  {lang === "tr"
                    ? "Göl alanı büyüdükçe rezervuar daha fazla taşkın hacmi depolar ve piki daha güçlü tıraşlar."
                    : "Larger reservoir pool stores massive flood volume and dramatically flattens outflow."}
                </span>
              </div>
            </div>
          )}

          {/* GROUP 2: INFLOW FLOOD HYDROGRAPH (THE THREAT) */}
          {controlsGroup === "hydrology" && (
            <div className="flex flex-col gap-3 bg-[var(--paper)] p-4 border border-[var(--line)] rounded-lg shadow-2xs">
              {/* Hydrograph Shape */}
              <div className="flex flex-col gap-1.5">
                <span className="font-plex-mono text-[11px] font-bold text-[var(--ink)]">
                  {lang === "tr" ? "Taşkın Hidrograf Şekli:" : "Inflow Hydrograph Shape:"}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["gamma", "triangular", "trapezoid"] as HydrographShape[]).map((shp) => (
                    <button
                      key={shp}
                      type="button"
                      onClick={() => updateInflowParam("shape", shp)}
                      className={`cursor-pointer px-2 py-1.5 text-[11px] font-plex-mono rounded border transition-all ${
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
                <div className="flex justify-between items-baseline font-plex-mono text-[11.5px]">
                  <span className="text-[var(--ink)] font-bold">
                    {lang === "tr" ? "Gelen Taşkın Pik Debisi (I_pik):" : "Peak Inflow Rate (I_peak):"}
                  </span>
                  <span className="font-bold text-[13px] text-[#0284c7] px-2 py-0.5 rounded bg-[var(--atlas-card)] border border-[var(--line)]">
                    {inflow.peakInflow} m³/s
                  </span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={250}
                  step={5}
                  value={inflow.peakInflow}
                  onChange={(e) => updateInflowParam("peakInflow", Number(e.target.value))}
                  className="w-full accent-[#0284c7] cursor-pointer"
                />
              </div>

              {/* Slider: Flood Duration */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline font-plex-mono text-[11.5px]">
                  <span className="text-[var(--ink)] font-bold">
                    {lang === "tr" ? "Toplam Taşkın Süresi (T_süre):" : "Total Flood Duration (T_d):"}
                  </span>
                  <span className="font-bold text-[13px] text-[var(--ink)] px-2 py-0.5 rounded bg-[var(--atlas-card)] border border-[var(--line)]">
                    {inflow.durationHours} h
                  </span>
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

              {/* Slider: Initial Pool Stage h0 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline font-plex-mono text-[11.5px]">
                  <span className="text-[var(--ink)] font-bold">
                    {lang === "tr" ? "Başlangıç Rezervuar Su Kotu (h_0):" : "Initial Pool Water Stage (h_0):"}
                  </span>
                  <span className="font-bold text-[13px] text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded bg-[var(--atlas-card)] border border-[var(--line)]">
                    {dam.h0} m
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={dam.hSpill}
                  step={0.5}
                  value={dam.h0}
                  onChange={(e) => updateDamParam("h0", Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <span className="text-[10px] text-[var(--mut)] leading-tight">
                  {dam.h0 === 0
                    ? (lang === "tr" ? "Kuru Taşkın Kapanı Modu (Tamamen boş hazne)" : "Dry detention basin mode (Empty reservoir)")
                    : (lang === "tr" ? "Dolu rezervuar (Hazne su tutmuş durumda başlar)" : "Standard conservation pool before flood arrives")}
                </span>
              </div>
            </div>
          )}

          {/* Time Scrubber & Simulation Animation Bar */}
          <div className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded-lg flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-plex-mono text-[11px] font-bold text-[var(--ink)] uppercase tracking-wider">
                {lang === "tr" ? "ZAMAN SİMÜLASYONU:" : "TIME SCRUBBER:"} <strong>{currentTimeHours.toFixed(1)} h</strong> / {inflow.durationHours} h
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

          {/* ── Coupled Inflow-Outflow Hydrograph Chart ───────────────── */}
          <div className="bg-[var(--paper)] border border-[var(--line)] rounded-lg p-3 sm:p-4 flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-plex-mono text-[11px] font-bold text-[var(--ink)] uppercase tracking-wider">
                {lang === "tr" ? "TAŞKIN HİDROGRAFI (I vs Q vs h)" : "FLOOD HYDROGRAPH (I vs Q vs h)"}
              </span>
              <div className="flex items-center gap-3 font-plex-mono text-[10px]">
                <span className="flex items-center gap-1 text-[#0284c7] font-bold">
                  <span className="w-2.5 h-1 bg-[#0284c7] rounded-xs" /> I(t) Giriş
                </span>
                <span className="flex items-center gap-1 text-[#059669] font-bold">
                  <span className="w-2.5 h-1 bg-[#059669] rounded-xs" /> Q(t) Çıkış
                </span>
                <span className="flex items-center gap-1 text-purple-600 font-bold">
                  <span className="w-2 h-0.5 border-t border-dashed border-purple-600" /> h(t) Kot
                </span>
              </div>
            </div>

            {(() => {
              const svgW = 480;
              const svgH = 190;
              const padL = 40;
              const padR = 35;
              const padT = 18;
              const padB = 24;
              const plotW = svgW - padL - padR;
              const plotH = svgH - padT - padB;

              const maxQ = Math.max(summary.peakInflow, summary.peakOutflow, 50) * 1.15;
              const maxH = Math.max(dam.hMax, summary.maxStage) * 1.1;
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
                    <linearGradient id="chart-inflow-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="chart-outflow-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.03" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75, 1.0].map((frac) => {
                    const y = padT + plotH * (1 - frac);
                    const qVal = Math.round(maxQ * frac);
                    return (
                      <g key={`chart-grid-${frac}`}>
                        <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="var(--line)" strokeWidth={0.8} strokeDasharray="3 3" />
                        <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fill="var(--mut)">
                          {qVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Inflow area & curve */}
                  <polygon points={`${padL},${padT + plotH} ${inflowPts.join(" ")} ${padL + plotW},${padT + plotH}`} fill="url(#chart-inflow-grad)" />
                  <polyline points={inflowPts.join(" ")} fill="none" stroke="#0284c7" strokeWidth={2} strokeLinecap="round" />

                  {/* Outflow area & curve */}
                  <polygon points={`${padL},${padT + plotH} ${outflowPts.join(" ")} ${padL + plotW},${padT + plotH}`} fill="url(#chart-outflow-grad)" />
                  <polyline points={outflowPts.join(" ")} fill="none" stroke="#059669" strokeWidth={2.4} strokeLinecap="round" />

                  {/* Water Stage Curve h(t) */}
                  <polyline points={stagePts.join(" ")} fill="none" stroke="#9333ea" strokeWidth={1.6} strokeDasharray="4 2" />

                  {/* Current Time Tracker */}
                  <line x1={currentX} y1={padT} x2={currentX} y2={padT + plotH} stroke="var(--ink)" strokeWidth={1.5} />
                  <circle cx={currentX} cy={padT + plotH - (currentInflow / maxQ) * plotH} r={3.5} fill="#0284c7" />
                  <circle cx={currentX} cy={padT + plotH - (currentOutflow / maxQ) * plotH} r={4} fill="#059669" stroke="#ffffff" strokeWidth={1.2} />

                  {/* Chart Axes */}
                  <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="var(--ink)" strokeWidth={1} />
                  <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--ink)" strokeWidth={1} />

                  {/* Time Ticks */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                    const x = padL + plotW * frac;
                    const tVal = Math.round(maxT * frac);
                    return (
                      <g key={`tick-h-${frac}`}>
                        <line x1={x} y1={padT + plotH} x2={x} y2={padT + plotH + 4} stroke="var(--ink)" strokeWidth={1} />
                        <text x={x} y={padT + plotH + 13} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fill="var(--ink2)">
                          {tVal}h
                        </text>
                      </g>
                    );
                  })}

                  <text x={padL + plotW} y={padT + plotH + 21} textAnchor="end" fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fill="var(--mut)">
                    {lang === "tr" ? "Zaman (saat)" : "Time (hours)"}
                  </text>
                  <text x={padL} y={padT - 5} textAnchor="start" fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fill="var(--mut)">
                    Q (m³/s)
                  </text>
                  <text x={padL + plotW + 4} y={padT - 5} textAnchor="end" fontSize="8.5" fontFamily="var(--font-ibm-plex-mono), monospace" fill="#9333ea">
                    h (m)
                  </text>
                </svg>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── ACCORDION: M.SC. THESIS MATHEMATICAL FORMULATION ─────────── */}
      <div className="p-4 sm:p-5 border-t border-[var(--line)] bg-[var(--paper)] flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowMathGuide((v) => !v)}
          className="cursor-pointer flex items-center justify-between w-full text-left py-1 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--frame)] text-[var(--paper)] flex items-center justify-center flex-none">
              <Calculator size={15} />
            </div>
            <div>
              <span className="font-plex-mono text-[9px] font-bold uppercase tracking-widest text-[var(--acc)]">
                {lang === "tr" ? "M.SC. TEZİ MATEMATİKSEL MODELİ (SAYFA 32)" : "M.SC. THESIS MATHEMATICAL MODEL (PAGE 32)"}
              </span>
              <h4 className="font-display font-bold text-[14.5px] sm:text-[15.5px] text-[var(--ink)]">
                {lang === "tr"
                  ? "Parçalı Baraj Boşalım Denklemleri & Kütle Korunumu"
                  : "Piecewise Dam Discharge Equations & Mass Conservation"}
              </h4>
            </div>
          </div>
          <span className="p-1 rounded bg-[var(--atlas-card)] border border-[var(--line)] text-[var(--mut)] group-hover:text-[var(--ink)]">
            {showMathGuide ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </button>

        {showMathGuide && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 font-mono text-[11.5px]">
            {/* Left: 4 Regimes */}
            <div className="lg:col-span-7 bg-[var(--atlas-card)] p-4 rounded-lg border border-[var(--line)] flex flex-col gap-2.5">
              <span className="font-plex-mono text-[10px] font-bold text-[var(--ink)] uppercase tracking-wider">
                {lang === "tr" ? "PARÇALI DEBİ MODELİ q(t, h):" : "PIECEWISE RATING CURVE q(t, h):"}
              </span>

              <div className={`p-2 rounded border ${currentFlowBreakdown.regime === 1 ? "bg-sky-500/15 border-sky-500 font-bold" : "bg-[var(--paper)] border-[var(--line)] opacity-70"}`}>
                <div className="flex justify-between text-[10px]">
                  <span>Regime 1 (h &lt; d): Kısmi Dolu Dip Savak</span>
                  {currentFlowBreakdown.regime === 1 && <span className="text-sky-600">● AKTİF</span>}
                </div>
                <div className="text-[11px] mt-0.5">q = c₁·r² · (arccos(f) - f·√(1 - f²) - π) · √(2gh)</div>
              </div>

              <div className={`p-2 rounded border ${currentFlowBreakdown.regime === 2 ? "bg-sky-500/15 border-sky-500 font-bold" : "bg-[var(--paper)] border-[var(--line)] opacity-70"}`}>
                <div className="flex justify-between text-[10px]">
                  <span>Regime 2 (d ≤ h ≤ H_savak): Basınçlı Orifis Akışı</span>
                  {currentFlowBreakdown.regime === 2 && <span className="text-sky-600">● AKTİF</span>}
                </div>
                <div className="text-[11px] mt-0.5">q = c₁ · A_orifis · √(2gh)</div>
              </div>

              <div className={`p-2 rounded border ${currentFlowBreakdown.regime === 3 ? "bg-sky-500/15 border-sky-500 font-bold" : "bg-[var(--paper)] border-[var(--line)] opacity-70"}`}>
                <div className="flex justify-between text-[10px]">
                  <span>Regime 3 (H_savak &lt; h ≤ H_kret): Dip Savak + Dolu Savak Savaklanması</span>
                  {currentFlowBreakdown.regime === 3 && <span className="text-sky-600">● AKTİF</span>}
                </div>
                <div className="text-[11px] mt-0.5">q = c₁·A_orifis·√(2gh) + c₂·L_savak · ((h - H_savak) / H_r)^(3/2)</div>
              </div>

              <div className={`p-2 rounded border ${currentFlowBreakdown.regime === 4 ? "bg-rose-500/20 border-rose-500 font-bold text-rose-700 dark:text-rose-300" : "bg-[var(--paper)] border-[var(--line)] opacity-70"}`}>
                <div className="flex justify-between text-[10px]">
                  <span>Regime 4 (h &gt; H_kret): Baraj Kreti Aşımı (Overtopping!)</span>
                  {currentFlowBreakdown.regime === 4 && <span>⚠️ TEHLİKE</span>}
                </div>
                <div className="text-[11px] mt-0.5">q = q_orifis + q_savak + c₂·(L_kret - L_savak)·((h - H_kret) / H_r)^(3/2)</div>
              </div>
            </div>

            {/* Right: Numerical Solution & Physics */}
            <div className="lg:col-span-5 bg-[var(--atlas-card)] p-4 rounded-lg border border-[var(--line)] flex flex-col justify-between gap-3 text-[11px]">
              <div>
                <span className="font-plex-mono text-[10px] font-bold text-[var(--ink)] uppercase tracking-wider">
                  {lang === "tr" ? "KÜTLE KORUNUMU & HİDROLOJİK PRENSİP" : "MASS CONSERVATION PRINCIPLE"}
                </span>
                <div className="mt-2 text-[var(--ink)] space-y-1">
                  <div className="p-2 rounded bg-[var(--paper)] border border-[var(--line)] font-bold text-[12px] text-center">
                    dS / dt = I(t) - Q(t, h)
                  </div>
                  <p className="text-[10.5px] text-[var(--ink2)] leading-relaxed mt-2">
                    {lang === "tr"
                      ? "Gelen taşkın debisi I(t), rezervuarda depolanarak çıkış debisini Q(t) geciktirir. Simülatör 4. mertebe Runge-Kutta (RK4) sayısal integrasyonu ile seviye-depolama ilişkisini anlık çözer."
                      : "Incoming hydrograph volume is retained within the reservoir storage buffer S(h), flattening and delaying the outflow hydrograph peak Q(t)."}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--line)] text-[10px] text-[var(--mut)]">
                💡 <strong>{lang === "tr" ? "Mühendislik Notu:" : "Engineering Takeaway:"}</strong>{" "}
                {lang === "tr"
                  ? "Baraj tasarımında amaç; mansaptaki can ve mal kaybını önleyecek maksimum pik kırpmayı sağlarken, gövde hava payını pozitif tutarak kret aşımını engellemektir."
                  : "The hydraulic goal is to maximize peak attenuation for downstream safety while guaranteeing positive freeboard so the dam never overtops."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
