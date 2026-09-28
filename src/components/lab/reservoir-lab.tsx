"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, Trophy } from "lucide-react";
import {
  CREST_M,
  DEFAULT_DESIGN,
  DEFAULT_FLOOD,
  HORIZON_H,
  STEPS,
  floodVolumeHm3,
  inflowSeries,
  outflowAt,
  ratingCurve,
  route,
  type LessonDesign,
  type LessonFlood,
  type LessonResult,
} from "@/lib/reservoir-lesson";
import { LineChart, type ChartSeries } from "./lab-chart";
import { ChangeNote, ChapterNav, Formula, Goal, LessonPanel, Manual, Slider, Stat, fmt, useTx, type Change } from "./lab-kit";
import {
  ContinuityEquations,
  GoverningEquationsReference,
  InflowEquations,
  RK4Equations,
  RatingEquations,
  StorageEquations,
} from "./equations";

const CHAPTERS = [
  { en: "The flood", tr: "Taşkın" },
  { en: "A bucket with holes", tr: "Delikli bir kova" },
  { en: "The outlets", tr: "Çıkış yapıları" },
  { en: "Flood routing", tr: "Taşkın ötelemesi" },
  { en: "Challenge", tr: "Görev" },
];

const CHALLENGE_FLOOD: LessonFlood = { peak: 260, tp: 5 };
const CHALLENGE_START: LessonDesign = { spillCrest: 16, spillWidth: 15, outletD: 1, capacity: 10, h0: 15 };
const TOWN_LIMIT = 120; // m³/s the river through town can carry
const MIN_FREEBOARD = 1; // m
const MIN_START = 12; // m kept for water supply

const C_IN = "var(--viz-in)";
const C_OUT = "var(--viz-out)";
const C_OUTLET = "var(--viz-outlet)";
const C_SPILL = "var(--viz-spill)";
const C_REF = "var(--mut)";
const C_LEVEL = "var(--ink2)";

const dtH = HORIZON_H / STEPS;
const stepAt = (res: LessonResult, t: number) => res.steps[Math.max(0, Math.min(res.steps.length - 1, Math.round(t / dtH)))];
const peakLevelStep = (res: LessonResult) => res.steps.reduce((a, b) => (b.stage > a.stage ? b : a));

export function ReservoirLab() {
  const tx = useTx();
  const [chapter, setChapter] = useState(0);
  const [flood, setFlood] = useState<LessonFlood>(DEFAULT_FLOOD);
  const [design, setDesign] = useState<LessonDesign>(DEFAULT_DESIGN);
  const [reference, setReference] = useState<{ design: LessonDesign; flood: LessonFlood } | null>(null);
  const [probe, setProbe] = useState(17);
  const [challenge, setChallenge] = useState<LessonDesign>(CHALLENGE_START);
  const [change, setChange] = useState<Change | null>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  const result = useMemo(() => route(design, flood), [design, flood]);
  const refResult = useMemo(() => (reference ? route(reference.design, reference.flood) : null), [reference]);
  const chResult = useMemo(() => route(challenge, CHALLENGE_FLOOD), [challenge]);

  // Animation clock (chapter 2): 48 h in ~12 s
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((prev) => {
        const next = prev + 0.2;
        if (next >= HORIZON_H) {
          setPlaying(false);
          return HORIZON_H;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(id);
  }, [playing]);

  const goTo = (i: number) => {
    setChapter(i);
    setChange(null);
    setPlaying(false);
    if (i === 3) setReference({ design, flood });
    document.getElementById("lab-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── change helpers: compute before/after with the same pure model ──
  const updateFlood = (k: keyof LessonFlood, v: number, label: string, unit: string) => {
    const next = { ...flood, [k]: v };
    const effects: Change["effects"] = [
      { label: tx("Flood volume", "Taşkın hacmi"), from: floodVolumeHm3(flood), to: floodVolumeHm3(next), unit: "hm³", decimals: 2 },
    ];
    if (chapter === 3) {
      const a = route(design, flood).summary;
      const b = route(design, next).summary;
      effects.push({ label: tx("Peak outflow", "Çıkış piki"), from: a.peakOutflow, to: b.peakOutflow, unit: "m³/s" });
      effects.push({ label: tx("Highest level", "En yüksek seviye"), from: a.maxStage, to: b.maxStage, unit: "m", decimals: 2 });
    }
    setChange({ cause: label, from: `${flood[k]} ${unit}`, to: `${v} ${unit}`, effects });
    setFlood(next);
  };

  const updateDesign = (k: keyof LessonDesign, v: number, label: string, unit: string) => {
    const next = { ...design, [k]: v };
    if (k === "spillCrest" && next.h0 > v) next.h0 = v;
    let effects: Change["effects"];
    if (chapter === 2) {
      effects = [
        {
          label: tx(`Outflow at ${probe} m`, `${probe} m'de çıkış debisi`),
          from: outflowAt(design, probe).qTotal,
          to: outflowAt(next, probe).qTotal,
          unit: "m³/s",
        },
      ];
    } else {
      const a = route(design, flood).summary;
      const b = route(next, flood).summary;
      effects = [
        { label: tx("Peak outflow", "Çıkış piki"), from: a.peakOutflow, to: b.peakOutflow, unit: "m³/s" },
        { label: tx("Highest level", "En yüksek seviye"), from: a.maxStage, to: b.maxStage, unit: "m", decimals: 2 },
        { label: tx("Delay of the peak", "Pik gecikmesi"), from: a.lagTimeHours, to: b.lagTimeHours, unit: "h" },
      ];
    }
    setChange({ cause: label, from: `${design[k]} ${unit}`, to: `${v} ${unit}`, effects });
    setDesign(next);
  };

  const updateChallenge = (k: keyof LessonDesign, v: number) => {
    setChallenge((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "spillCrest" && next.h0 > v) next.h0 = v;
      return next;
    });
  };

  // ── shared chart builders ──────────────────────────────────────────
  const flowSeries = (res: LessonResult, ref?: LessonResult | null): ChartSeries[] => [
    { id: "in", label: tx("Inflow I", "Giriş I"), color: C_IN, points: res.steps.map((s) => [s.timeHours, s.inflow]), area: true },
    { id: "out", label: tx("Outflow Q", "Çıkış Q"), color: C_OUT, points: res.steps.map((s) => [s.timeHours, s.outflow]) },
    ...(ref
      ? [{ id: "ref", label: tx("Outflow Q (reference)", "Çıkış Q (referans)"), color: C_REF, dashed: true, points: ref.steps.map((s) => [s.timeHours, s.outflow] as [number, number]) }]
      : []),
  ];
  const levelSeries = (res: LessonResult, ref?: LessonResult | null): ChartSeries[] => [
    { id: "h", label: tx("Water level h", "Su seviyesi h"), color: C_LEVEL, points: res.steps.map((s) => [s.timeHours, s.stage]) },
    ...(ref
      ? [{ id: "href", label: tx("Water level (reference)", "Su seviyesi (referans)"), color: C_REF, dashed: true, points: ref.steps.map((s) => [s.timeHours, s.stage] as [number, number]) }]
      : []),
  ];

  const crestRefs = (d: LessonDesign) => [
    { axis: "y" as const, value: CREST_M, label: tx(`Dam crest ${CREST_M} m`, `Baraj kreti ${CREST_M} m`) },
    { axis: "y" as const, value: d.spillCrest, label: tx(`Spillway crest ${d.spillCrest} m`, `Dolu savak eşiği ${d.spillCrest} m`) },
  ];

  // ── Chapter content ────────────────────────────────────────────────
  let title = "";
  let idea: React.ReactNode = null;
  let controls: React.ReactNode = null;
  let tryThis: React.ReactNode[] = [];
  let observe: React.ReactNode = null;
  let visual: React.ReactNode = null;
  let math: React.ReactNode = null;

  const s = result.summary;

  if (chapter === 0) {
    const vol = floodVolumeHm3(flood);
    title = tx("The flood: a hydrograph", "Taşkın: bir hidrograf");
    idea = (
      <>
        <p>
          {tx(
            "A hydrograph shows river flow over time. During a flood the flow rises (rising limb), reaches a peak, and slowly falls again (falling limb).",
            "Hidrograf, akarsu debisinin zamanla değişimini gösterir. Taşkında debi yükselir (yükselme kolu), bir pike ulaşır ve yavaşça tekrar düşer (çekilme kolu)."
          )}
        </p>
        <p>
          {tx(
            "The area under the curve is the flood volume — the amount of water the dam will have to deal with.",
            "Eğrinin altındaki alan taşkın hacmidir — barajın başa çıkması gereken su miktarı."
          )}
        </p>
      </>
    );
    controls = (
      <>
        <Slider label={tx("Peak inflow", "Pik giriş debisi")} value={flood.peak} min={50} max={300} step={10} unit="m³/s" onChange={(v) => updateFlood("peak", v, tx("peak inflow", "pik giriş"), "m³/s")} />
        <Slider
          label={tx("Time to peak", "Pike varış süresi")}
          value={flood.tp}
          min={2}
          max={10}
          step={0.5}
          unit="h"
          decimals={1}
          hint={tx("Short = a flashy mountain storm · long = a slow, long rain.", "Kısa = ani dağ sağanağı · uzun = yavaş, uzun süren yağış.")}
          onChange={(v) => updateFlood("tp", v, tx("time to peak", "pike varış süresi"), "h")}
        />
        <ChangeNote change={change} />
      </>
    );
    tryThis = [
      tx("Double the peak: what happens to the volume?", "Piki iki katına çıkarın: hacme ne olur?"),
      tx("Keep the peak, make the time to peak longer: same peak, but more water.", "Piki sabit tutup pike varış süresini uzatın: aynı pik, ama daha çok su."),
      tx("Hover the chart to read the flow at any hour.", "Herhangi bir saatteki debiyi okumak için grafiğin üzerine gelin."),
    ];
    observe = (
      <p>
        {tx(
          `The river peaks at ${flood.peak} m³/s after ${flood.tp} h. In total the flood brings ${fmt(vol, 2)} million m³ of extra water — about ${fmt(vol * 400, 0)} Olympic swimming pools.`,
          `Nehir ${flood.tp} saat sonra ${flood.peak} m³/s ile pike ulaşır. Taşkın toplamda ${fmt(vol, 2)} milyon m³ fazladan su getirir — yaklaşık ${fmt(vol * 400, 0)} olimpik yüzme havuzu.`
        )}
      </p>
    );
    visual = (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat label={tx("Peak", "Pik")} value={fmt(flood.peak, 0)} unit="m³/s" tone={C_IN} />
          <Stat label={tx("Time to peak", "Pike varış")} value={fmt(flood.tp)} unit="h" />
          <Stat label={tx("Volume", "Hacim")} value={fmt(vol, 2)} unit="hm³" />
        </div>
        <LineChart
          series={[{ id: "in", label: tx("Inflow I", "Giriş I"), color: C_IN, points: inflowSeries(flood), area: true }]}
          xLabel={tx("Time", "Zaman")}
          yLabel={tx("Flow", "Debi")}
          xUnit="h"
          yUnit="m³/s"
          xMax={HORIZON_H}
          yMax={300}
          markers={[{ x: flood.tp, y: flood.peak, label: tx("Peak", "Pik"), color: C_IN }]}
          ariaLabel={tx("Inflow hydrograph", "Giriş hidrografı")}
          tableStep={4}
        />
      </div>
    );
  }

  if (chapter === 0) math = <InflowEquations />;
  if (chapter === 1)
    math = (
      <>
        <ContinuityEquations />
        <div className="mt-3 pt-3 border-t border-[var(--line)]">
          <StorageEquations />
        </div>
      </>
    );
  if (chapter === 2) math = <RatingEquations />;
  if (chapter === 3)
    math = (
      <>
        <p className="font-display text-[12.5px] leading-snug text-[var(--ink2)]">
          {tx(
            "Routing combines everything: the inflow I(t), the continuity equation, A(h) and the outlet equations Q(h). The model solves them step by step:",
            "Öteleme her şeyi birleştirir: giriş I(t), süreklilik denklemi, A(h) ve çıkış denklemleri Q(h). Model bunları adım adım çözer:"
          )}
        </p>
        <RK4Equations />
        {/* a button, not a #link: the URL hash selects the active lesson */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("governing-equations") as HTMLDetailsElement | null;
            if (!el) return;
            el.open = true;
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="cursor-pointer mt-2 font-display text-[12.5px] text-[var(--acc)] underline underline-offset-2"
        >
          {tx("See all governing equations ↓", "Tüm temel denklemleri görün ↓")}
        </button>
      </>
    );

  if (chapter === 1) {
    const now = stepAt(result, t);
    const net = now.inflow - now.outflow;
    const pk = peakLevelStep(result);
    const trend =
      Math.abs(net) < 0.5
        ? tx("steady", "sabit")
        : net > 0
        ? tx("rising ▲", "yükseliyor ▲")
        : tx("falling ▼", "düşüyor ▼");
    title = tx("The reservoir is a bucket with holes", "Rezervuar delikli bir kovadır");
    idea = (
      <>
        <p>
          {tx(
            "Water pours in (inflow I) and drains out through the dam's outlets (outflow Q). The difference fills or empties the reservoir:",
            "Su içeri akar (giriş I) ve barajın çıkış yapılarından dışarı akar (çıkış Q). Aradaki fark rezervuarı doldurur veya boşaltır:"
          )}
        </p>
        <Formula>
          {tx("change in storage = (I − Q) × time", "depolama değişimi = (I − Q) × zaman")}
          <br />
          {tx("I > Q → level rises · I < Q → level falls", "I > Q → seviye yükselir · I < Q → seviye düşer")}
        </Formula>
        <p>
          {tx(
            "The higher the water, the faster it leaves. So the level stops rising exactly when outflow has caught up with inflow.",
            "Su ne kadar yüksekse o kadar hızlı çıkar. Bu yüzden seviye, çıkış debisi girişi yakaladığı anda yükselmeyi bırakır."
          )}
        </p>
      </>
    );
    controls = (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (t >= HORIZON_H) setT(0);
              setPlaying((p) => !p);
            }}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--frame)] text-[var(--paper)] hover:bg-[var(--acc)] font-plex-mono text-[11.5px] font-semibold"
          >
            {playing ? <Pause size={13} /> : <Play size={13} />}
            {playing ? tx("Pause", "Duraklat") : tx("Play the flood", "Taşkını oynat")}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setT(0);
            }}
            aria-label={tx("Back to start", "Başa dön")}
            className="cursor-pointer p-1.5 border border-[var(--line)] hover:border-[var(--frame)] text-[var(--ink)]"
          >
            <RotateCcw size={13} />
          </button>
        </div>
        <Slider
          label={tx("Time", "Zaman")}
          value={t}
          min={0}
          max={HORIZON_H}
          step={0.2}
          unit="h"
          decimals={1}
          onChange={(v) => {
            setPlaying(false);
            setT(v);
          }}
        />
        <div className="grid grid-cols-3 gap-2">
          <Stat label={tx("Inflow I", "Giriş I")} value={fmt(now.inflow, 0)} unit="m³/s" tone={C_IN} />
          <Stat label={tx("Outflow Q", "Çıkış Q")} value={fmt(now.outflow, 0)} unit="m³/s" tone={C_OUT} />
          <Stat label="I − Q" value={`${net >= 0 ? "+" : ""}${fmt(net, 0)}`} unit="m³/s" sub={trend} />
        </div>
      </div>
    );
    tryThis = [
      tx("Press play and watch the arrows and the water level.", "Oynat'a basın; okları ve su seviyesini izleyin."),
      tx(`Stop at ≈ ${fmt(pk.timeHours, 0)} h, when the level stops rising. Compare I and Q.`, `Seviyenin yükselmeyi bıraktığı ≈ ${fmt(pk.timeHours, 0)}. saatte durdurun. I ile Q'yu karşılaştırın.`),
      tx("Look at the flow chart: the outflow peak lies right on the falling inflow curve.", "Debi grafiğine bakın: çıkış piki, düşen giriş eğrisinin tam üzerinde."),
    ];
    observe = (
      <p>
        {tx(
          `At ${fmt(t)} h: ${fmt(now.inflow, 0)} m³/s flows in and ${fmt(now.outflow, 0)} m³/s flows out, so the level is ${trend} (${fmt(now.stage, 2)} m). The highest level, ${fmt(pk.stage, 2)} m, is reached at ${fmt(pk.timeHours)} h — the moment when inflow = outflow.`,
          `${fmt(t)}. saatte: içeri ${fmt(now.inflow, 0)} m³/s giriyor, dışarı ${fmt(now.outflow, 0)} m³/s çıkıyor; bu yüzden seviye ${trend} (${fmt(now.stage, 2)} m). En yüksek seviye olan ${fmt(pk.stage, 2)} m'ye ${fmt(pk.timeHours)}. saatte ulaşılır — giriş = çıkış olduğu an.`
        )}
      </p>
    );
    visual = (
      <div className="flex flex-col gap-4">
        <ReservoirDiagram design={design} inflow={now.inflow} outflow={now.outflow} level={now.stage} />
        <LineChart
          series={flowSeries(result)}
          xLabel={tx("Time", "Zaman")}
          yLabel={tx("Flow", "Debi")}
          xUnit="h"
          yUnit="m³/s"
          xMax={HORIZON_H}
          cursorX={t}
          onCursor={(x) => {
            if (x !== null) {
              setPlaying(false);
              setT(x);
            }
          }}
          markers={[{ x: pk.timeHours, y: pk.outflow, label: tx("I = Q → highest level", "I = Q → en yüksek seviye"), color: C_OUT }]}
          ariaLabel={tx("Inflow and outflow over time", "Zamana göre giriş ve çıkış debisi")}
          height={210}
          tableStep={4}
        />
        <LineChart
          series={levelSeries(result)}
          xLabel={tx("Time", "Zaman")}
          yLabel={tx("Water level", "Su seviyesi")}
          xUnit="h"
          yUnit="m"
          xMax={HORIZON_H}
          yMax={22}
          refLines={crestRefs(design)}
          cursorX={t}
          onCursor={(x) => {
            if (x !== null) {
              setPlaying(false);
              setT(x);
            }
          }}
          markers={[{ x: pk.timeHours, y: pk.stage, label: tx("Highest level", "En yüksek seviye"), color: C_LEVEL }]}
          ariaLabel={tx("Water level over time", "Zamana göre su seviyesi")}
          height={170}
          yDecimals={2}
          tableStep={4}
        />
      </div>
    );
  }

  if (chapter === 2) {
    const q = outflowAt(design, probe);
    title = tx("The outlets: how fast water leaves", "Çıkış yapıları: su ne kadar hızlı çıkar");
    idea = (
      <>
        <p>
          {tx(
            "A dam releases water in two ways. The bottom outlet is a pipe near the bed: it always runs, and deeper water pushes harder. The spillway is an overflow channel at the top: it only starts when the water passes its crest, but then it grows very fast.",
            "Baraj suyu iki yoldan bırakır. Dip savak, tabana yakın bir borudur: sürekli çalışır ve su derinleştikçe daha güçlü iter. Dolu savak üstteki bir taşma kanalıdır: yalnızca su eşiğini aşınca çalışır, ama sonra çok hızlı artar."
          )}
        </p>
        <Formula>
          {tx("bottom outlet", "dip savak")}: Q = c · A · √(2 g h)
          <br />
          {tx("spillway", "dolu savak")}: Q = C · L · H<sup>1.5</sup>
          <br />
          <span className="text-[var(--ink2)]">
            {tx("A pipe area · h depth · L spillway width · H water height above the spillway crest", "A boru kesit alanı · h derinlik · L savak genişliği · H savak eşiği üzerindeki su yüksekliği")}
          </span>
        </Formula>
      </>
    );
    controls = (
      <>
        <Slider label={tx("Bottom outlet diameter", "Dip savak çapı")} value={design.outletD} min={0} max={3} step={0.1} unit="m" decimals={1} onChange={(v) => updateDesign("outletD", v, tx("outlet diameter", "dip savak çapı"), "m")} />
        <Slider label={tx("Spillway width L", "Dolu savak genişliği L")} value={design.spillWidth} min={0} max={60} step={1} unit="m" onChange={(v) => updateDesign("spillWidth", v, tx("spillway width", "savak genişliği"), "m")} />
        <Slider label={tx("Spillway crest level", "Dolu savak eşik kotu")} value={design.spillCrest} min={10} max={19} step={0.5} unit="m" decimals={1} onChange={(v) => updateDesign("spillCrest", v, tx("spillway crest", "savak eşiği"), "m")} />
        <Slider
          label={tx("Check a water level", "Bir su seviyesini kontrol et")}
          value={probe}
          min={1}
          max={CREST_M}
          step={0.5}
          unit="m"
          decimals={1}
          hint={tx("Read the outflow at this level (the dot on the chart). The chart ends at the dam crest.", "Bu seviyedeki çıkış debisini okuyun (grafikteki nokta). Grafik baraj kretinde biter.")}
          onChange={(v) => {
            setChange({
              cause: tx("the water level", "su seviyesi"),
              from: `${probe} m`,
              to: `${v} m`,
              effects: [{ label: tx("Outflow", "Çıkış debisi"), from: outflowAt(design, probe).qTotal, to: outflowAt(design, v).qTotal, unit: "m³/s" }],
            });
            setProbe(v);
          }}
        />
        <ChangeNote change={change} />
      </>
    );
    tryThis = [
      tx("Move the water level up slowly: see the jump when it passes the spillway crest.", "Su seviyesini yavaşça yükseltin: savak eşiğini geçince oluşan sıçramayı görün."),
      tx("Double the spillway width: the spillway part doubles.", "Savak genişliğini iki katına çıkarın: savak kısmı da iki katına çıkar."),
      tx("Set the outlet to 0 m: below the spillway crest nothing can leave the reservoir.", "Dip savağı 0 m yapın: savak eşiğinin altında rezervuardan hiç su çıkamaz."),
    ];
    observe = (
      <p>
        {tx(
          `At ${probe} m: the bottom outlet releases ${fmt(q.qOrifice)} m³/s and the spillway ${fmt(q.qSpillway)} m³/s${q.qOvertopping > 0 ? `, and ${fmt(q.qOvertopping)} m³/s pours over the dam crest (dangerous!)` : ""}. Total: ${fmt(q.qTotal)} m³/s.`,
          `${probe} m'de: dip savak ${fmt(q.qOrifice)} m³/s, dolu savak ${fmt(q.qSpillway)} m³/s bırakıyor${q.qOvertopping > 0 ? `; ayrıca ${fmt(q.qOvertopping)} m³/s baraj kretinin üzerinden aşıyor (tehlikeli!)` : ""}. Toplam: ${fmt(q.qTotal)} m³/s.`
        )}
      </p>
    );
    const rc = ratingCurve(design);
    visual = (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat label={tx("Bottom outlet", "Dip savak")} value={fmt(q.qOrifice)} unit="m³/s" tone={C_OUTLET} />
          <Stat label={tx("Spillway", "Dolu savak")} value={fmt(q.qSpillway)} unit="m³/s" tone={C_SPILL} />
          <Stat label={tx("Total outflow", "Toplam çıkış")} value={fmt(q.qTotal)} unit="m³/s" tone={C_OUT} sub={`h = ${probe} m`} />
        </div>
        <LineChart
          series={[
            { id: "total", label: tx("Total outflow", "Toplam çıkış"), color: C_OUT, points: rc.map((p) => [p.h, p.total]) },
            { id: "outlet", label: tx("Bottom outlet", "Dip savak"), color: C_OUTLET, points: rc.map((p) => [p.h, p.outlet]) },
            { id: "spill", label: tx("Spillway", "Dolu savak"), color: C_SPILL, points: rc.map((p) => [p.h, p.spillway]) },
          ]}
          xLabel={tx("Water level h", "Su seviyesi h")}
          yLabel={tx("Outflow", "Çıkış debisi")}
          xUnit="m"
          yUnit="m³/s"
          xMax={CREST_M}
          refLines={[{ axis: "x", value: design.spillCrest, label: tx("spillway crest", "savak eşiği") }]}
          markers={[{ x: probe, y: q.qTotal, label: `${fmt(q.qTotal, 0)} m³/s`, color: C_OUT }]}
          ariaLabel={tx("Outflow versus water level (rating curve)", "Su seviyesine göre çıkış debisi (anahtar eğrisi)")}
          tableStep={1}
        />
      </div>
    );
  }

  if (chapter === 3) {
    const r = refResult?.summary;
    title = tx("Flood routing: how a dam tames a flood", "Taşkın ötelemesi: baraj taşkını nasıl ehlileştirir");
    idea = (
      <>
        <p>
          {tx(
            "Put it all together: the flood from chapter 1 enters the reservoir, the water stores up, and the outlets release it slowly. Two things happen:",
            "Hepsini birleştirin: 1. bölümdeki taşkın rezervuara girer, su depolanır ve çıkış yapıları onu yavaşça bırakır. İki şey olur:"
          )}
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>{tx("Attenuation", "Sönümleme")}</strong>
            {tx(": the outflow peak is lower than the inflow peak.", ": çıkış piki, giriş pikinden daha düşüktür.")}
          </li>
          <li>
            <strong>{tx("Delay", "Gecikme")}</strong>
            {tx(": the outflow peak comes later.", ": çıkış piki daha geç gelir.")}
          </li>
        </ul>
        <p>{tx("The grey dashed lines are your reference design, so you can compare every change.", "Gri kesikli çizgiler referans tasarımınızdır; her değişikliği onunla karşılaştırabilirsiniz.")}</p>
      </>
    );
    controls = (
      <>
        <Slider label={tx("Reservoir size (when full)", "Rezervuar hacmi (dolu)")} value={design.capacity} min={3} max={30} step={1} unit="hm³" onChange={(v) => updateDesign("capacity", v, tx("reservoir size", "rezervuar hacmi"), "hm³")} />
        <Slider label={tx("Spillway width", "Dolu savak genişliği")} value={design.spillWidth} min={0} max={60} step={1} unit="m" onChange={(v) => updateDesign("spillWidth", v, tx("spillway width", "savak genişliği"), "m")} />
        <Slider label={tx("Bottom outlet diameter", "Dip savak çapı")} value={design.outletD} min={0} max={3} step={0.1} unit="m" decimals={1} onChange={(v) => updateDesign("outletD", v, tx("outlet diameter", "dip savak çapı"), "m")} />
        <Slider
          label={tx("Water level when the flood starts", "Taşkın başladığında su seviyesi")}
          value={Math.min(design.h0, design.spillCrest)}
          min={0}
          max={design.spillCrest}
          step={0.5}
          unit="m"
          decimals={1}
          onChange={(v) => updateDesign("h0", v, tx("starting level", "başlangıç seviyesi"), "m")}
        />
        <Slider label={tx("Peak inflow", "Pik giriş debisi")} value={flood.peak} min={50} max={300} step={10} unit="m³/s" onChange={(v) => updateFlood("peak", v, tx("peak inflow", "pik giriş"), "m³/s")} />
        <button
          type="button"
          onClick={() => setReference({ design, flood })}
          className="cursor-pointer self-start px-3 py-1.5 border border-[var(--frame)] hover:bg-[var(--frame)] hover:text-[var(--paper)] font-plex-mono text-[11px] font-semibold text-[var(--ink)]"
        >
          {tx("Use the current design as reference", "Mevcut tasarımı referans yap")}
        </button>
        <ChangeNote change={change} />
      </>
    );
    tryThis = [
      tx("Double the reservoir size. What happens to the peak outflow and its timing?", "Rezervuar hacmini iki katına çıkarın. Çıkış pikine ve zamanlamasına ne olur?"),
      tx("Make the spillway narrower: less water goes downstream, but watch the water level — a trade-off!", "Savağı daraltın: mansaba daha az su gider ama su seviyesine dikkat — bir ödünleşim!"),
      tx("Lower the starting level: empty space is the best flood protection.", "Başlangıç seviyesini düşürün: boş hacim en iyi taşkın korumasıdır."),
    ];
    observe = (
      <>
        <p>
          {tx(
            `The peak drops from ${fmt(s.peakInflow, 0)} to ${fmt(s.peakOutflow, 0)} m³/s (${fmt(s.peakAttenuationPercent, 0)}% attenuation) and arrives ${fmt(s.lagTimeHours)} h later. The water rises to ${fmt(s.maxStage, 2)} m, leaving ${fmt(s.minFreeboard, 2)} m below the dam crest.`,
            `Pik ${fmt(s.peakInflow, 0)} m³/s'den ${fmt(s.peakOutflow, 0)} m³/s'ye düşer (%${fmt(s.peakAttenuationPercent, 0)} sönümleme) ve ${fmt(s.lagTimeHours)} saat geç gelir. Su ${fmt(s.maxStage, 2)} m'ye yükselir; kret ile arasında ${fmt(s.minFreeboard, 2)} m kalır.`
          )}
        </p>
        {s.isOvertopped && (
          <p className="font-semibold" style={{ color: "var(--viz-bad)" }}>
            {tx("⚠ The water overtops the dam crest — in reality this can destroy an embankment dam.", "⚠ Su baraj kretini aşıyor — gerçekte bu bir dolgu barajı yıkabilir.")}
          </p>
        )}
      </>
    );
    visual = (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label={tx("Peak outflow", "Çıkış piki")} value={fmt(s.peakOutflow, 0)} unit="m³/s" tone={C_OUT} sub={r ? `${tx("ref", "ref")} ${fmt(r.peakOutflow, 0)}` : undefined} />
          <Stat label={tx("Attenuation", "Sönümleme")} value={fmt(s.peakAttenuationPercent, 0)} unit="%" sub={r ? `${tx("ref", "ref")} ${fmt(r.peakAttenuationPercent, 0)}%` : undefined} />
          <Stat label={tx("Delay", "Gecikme")} value={fmt(s.lagTimeHours)} unit="h" sub={r ? `${tx("ref", "ref")} ${fmt(r.lagTimeHours)} h` : undefined} />
          <Stat label={tx("Highest level", "En yüksek seviye")} value={fmt(s.maxStage, 2)} unit="m" sub={r ? `${tx("ref", "ref")} ${fmt(r.maxStage, 2)} m` : undefined} />
        </div>
        <LineChart
          series={flowSeries(result, refResult)}
          xLabel={tx("Time", "Zaman")}
          yLabel={tx("Flow", "Debi")}
          xUnit="h"
          yUnit="m³/s"
          xMax={HORIZON_H}
          markers={[
            { x: s.timeToPeakInflowHours, y: s.peakInflow, label: tx("inflow peak", "giriş piki"), color: C_IN },
            { x: s.timeToPeakOutflowHours, y: s.peakOutflow, label: tx("outflow peak", "çıkış piki"), color: C_OUT },
          ]}
          ariaLabel={tx("Inflow and outflow hydrographs", "Giriş ve çıkış hidrografları")}
          height={220}
          tableStep={4}
        />
        <LineChart
          series={levelSeries(result, refResult)}
          xLabel={tx("Time", "Zaman")}
          yLabel={tx("Water level", "Su seviyesi")}
          xUnit="h"
          yUnit="m"
          xMax={HORIZON_H}
          yMax={22}
          refLines={crestRefs(design)}
          ariaLabel={tx("Reservoir water level over time", "Zamana göre rezervuar su seviyesi")}
          height={170}
          yDecimals={2}
          tableStep={4}
        />
      </div>
    );
  }

  if (chapter === 4) {
    const cs = chResult.summary;
    const g1 = cs.peakOutflow <= TOWN_LIMIT;
    const g2 = cs.minFreeboard >= MIN_FREEBOARD;
    const g3 = challenge.h0 >= MIN_START;
    const won = g1 && g2 && g3;
    title = tx("Challenge: protect the town and the dam", "Görev: kasabayı ve barajı koruyun");
    idea = (
      <>
        <p>
          {tx(
            `A ${CHALLENGE_FLOOD.peak} m³/s storm flood is forecast. Redesign the outlets and choose the starting level so that all three goals are met:`,
            `${CHALLENGE_FLOOD.peak} m³/s'lik bir taşkın bekleniyor. Üç hedefin de sağlanması için çıkış yapılarını yeniden tasarlayın ve başlangıç seviyesini seçin:`
          )}
        </p>
        <div className="flex flex-col gap-1.5 mt-1">
          <Goal ok={g1}>
            {tx(`Town is safe: peak outflow ≤ ${TOWN_LIMIT} m³/s`, `Kasaba güvende: çıkış piki ≤ ${TOWN_LIMIT} m³/s`)}{" "}
            <span className="font-plex-mono text-[12px] text-[var(--ink2)]">({fmt(cs.peakOutflow, 0)})</span>
          </Goal>
          <Goal ok={g2}>
            {tx(`Dam is safe: at least ${MIN_FREEBOARD} m below the crest`, `Baraj güvende: krete en az ${MIN_FREEBOARD} m`)}{" "}
            <span className="font-plex-mono text-[12px] text-[var(--ink2)]">({fmt(cs.minFreeboard, 2)} m)</span>
          </Goal>
          <Goal ok={g3}>
            {tx(`Water supply: start the flood at ≥ ${MIN_START} m`, `İçme suyu: taşkına ≥ ${MIN_START} m ile başlayın`)}{" "}
            <span className="font-plex-mono text-[12px] text-[var(--ink2)]">({fmt(challenge.h0, 1)} m)</span>
          </Goal>
        </div>
      </>
    );
    controls = (
      <>
        <Slider label={tx("Spillway width", "Dolu savak genişliği")} value={challenge.spillWidth} min={5} max={60} step={1} unit="m" onChange={(v) => updateChallenge("spillWidth", v)} />
        <Slider label={tx("Spillway crest level", "Dolu savak eşik kotu")} value={challenge.spillCrest} min={12} max={19} step={0.5} unit="m" decimals={1} onChange={(v) => updateChallenge("spillCrest", v)} />
        <Slider label={tx("Bottom outlet diameter", "Dip savak çapı")} value={challenge.outletD} min={0.5} max={3} step={0.1} unit="m" decimals={1} onChange={(v) => updateChallenge("outletD", v)} />
        <Slider
          label={tx("Water level when the flood starts", "Taşkın başladığında su seviyesi")}
          value={challenge.h0}
          min={5}
          max={challenge.spillCrest}
          step={0.5}
          unit="m"
          decimals={1}
          onChange={(v) => updateChallenge("h0", v)}
        />
        <button
          type="button"
          onClick={() => setChallenge(CHALLENGE_START)}
          className="cursor-pointer self-start inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--line)] hover:border-[var(--frame)] font-plex-mono text-[11px] font-semibold text-[var(--ink)]"
        >
          <RotateCcw size={12} /> {tx("Start over", "Baştan başla")}
        </button>
      </>
    );
    tryThis = [
      <details key="h1">
        <summary className="cursor-pointer">{tx("Hint 1", "İpucu 1")}</summary>
        {tx("Empty space before the flood stores water — but you cannot go below 12 m.", "Taşkından önceki boş hacim suyu depolar — ama 12 m'nin altına inemezsiniz.")}
      </details>,
      <details key="h2">
        <summary className="cursor-pointer">{tx("Hint 2", "İpucu 2")}</summary>
        {tx("A wide spillway protects the dam but sends a big peak to the town. A narrow one does the opposite.", "Geniş bir savak barajı korur ama kasabaya büyük bir pik gönderir. Dar savak bunun tersini yapar.")}
      </details>,
      <details key="h3">
        <summary className="cursor-pointer">{tx("Hint 3", "İpucu 3")}</summary>
        {tx("A bigger bottom outlet starts releasing early, before the peak arrives, and never delivers a sudden surge.", "Daha büyük bir dip savak, pik gelmeden erken boşaltmaya başlar ve ani bir dalga yaratmaz.")}
      </details>,
    ];
    observe = won ? (
      <p className="flex items-center gap-2 font-semibold">
        <Trophy size={16} className="text-[var(--gold)]" />
        {tx(
          "All goals met! You balanced flood protection, dam safety and water supply — exactly the trade-off real reservoir operators face.",
          "Tüm hedefler sağlandı! Taşkın korumasını, baraj güvenliğini ve su temini dengelediniz — gerçek baraj işletmecilerinin yüzleştiği ödünleşim tam olarak budur."
        )}
      </p>
    ) : (
      <p>
        {tx(
          `Peak outflow ${fmt(cs.peakOutflow, 0)} m³/s, highest level ${fmt(cs.maxStage, 2)} m. ${!g1 ? "Too much water reaches the town. " : ""}${!g2 ? "The water gets too close to the crest. " : ""}${!g3 ? "The reservoir starts too empty for the water supply. " : ""}`,
          `Çıkış piki ${fmt(cs.peakOutflow, 0)} m³/s, en yüksek seviye ${fmt(cs.maxStage, 2)} m. ${!g1 ? "Kasabaya çok fazla su gidiyor. " : ""}${!g2 ? "Su krete çok yaklaşıyor. " : ""}${!g3 ? "Rezervuar su temini için fazla boş başlıyor. " : ""}`
        )}
      </p>
    );
    visual = (
      <div className="flex flex-col gap-4">
        <LineChart
          series={flowSeries(chResult)}
          xLabel={tx("Time", "Zaman")}
          yLabel={tx("Flow", "Debi")}
          xUnit="h"
          yUnit="m³/s"
          xMax={HORIZON_H}
          refLines={[{ axis: "y", value: TOWN_LIMIT, label: tx(`Town limit ${TOWN_LIMIT} m³/s`, `Kasaba sınırı ${TOWN_LIMIT} m³/s`) }]}
          ariaLabel={tx("Challenge: inflow and outflow", "Görev: giriş ve çıkış debisi")}
          height={220}
          tableStep={4}
        />
        <LineChart
          series={levelSeries(chResult)}
          xLabel={tx("Time", "Zaman")}
          yLabel={tx("Water level", "Su seviyesi")}
          xUnit="h"
          yUnit="m"
          xMax={HORIZON_H}
          yMax={22}
          refLines={[
            { axis: "y", value: CREST_M, label: tx(`Dam crest ${CREST_M} m`, `Baraj kreti ${CREST_M} m`) },
            { axis: "y", value: CREST_M - MIN_FREEBOARD, label: tx("Safety limit", "Güvenlik sınırı"), below: true },
          ]}
          ariaLabel={tx("Challenge: water level", "Görev: su seviyesi")}
          height={170}
          yDecimals={2}
          tableStep={4}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ChapterNav chapters={CHAPTERS} active={chapter} onSelect={goTo} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-5 items-start">
        <div className="lg:sticky lg:top-[136px] p-3 sm:p-4 bg-[var(--atlas-card)] border border-[var(--line)]">{visual}</div>
        <LessonPanel
          key={chapter}
          index={chapter}
          total={CHAPTERS.length}
          title={title}
          idea={idea}
          controls={controls}
          tryThis={tryThis}
          observe={observe}
          math={math}
          onPrev={chapter > 0 ? () => goTo(chapter - 1) : undefined}
          onNext={chapter < CHAPTERS.length - 1 ? () => goTo(chapter + 1) : undefined}
        />
      </div>

      <Manual
        title={tx("Short manual & glossary — Reservoir lab", "Kısa kılavuz ve sözlük — Rezervuar laboratuvarı")}
        steps={[
          tx("Go through the chapters in order: flood → bucket → outlets → routing → challenge.", "Bölümleri sırayla izleyin: taşkın → kova → çıkış yapıları → öteleme → görev."),
          tx("Change one slider at a time. The grey box reports cause → effect with numbers before and after.", "Her seferinde tek bir kaydırıcıyı değiştirin. Gri kutu önceki ve sonraki sayılarla neden → sonuç ilişkisini gösterir."),
          tx("Hover (or focus and use the arrow keys on) a chart to read exact values; each chart also has a data table.", "Kesin değerleri okumak için grafiğin üzerine gelin (veya odaklanıp ok tuşlarını kullanın); her grafiğin bir veri tablosu da vardır."),
          tx("In “Flood routing”, grey dashed lines show your reference design — set a new reference any time.", "“Taşkın ötelemesi”nde gri kesikli çizgiler referans tasarımınızdır — istediğiniz an yeni referans belirleyebilirsiniz."),
          tx("The dam and flood are idealized (level-pool routing, solved with a fixed-step RK4 method). Built for learning, not for design.", "Baraj ve taşkın idealize edilmiştir (level-pool öteleme, sabit adımlı RK4 ile çözülür). Tasarım için değil, öğrenmek için yapılmıştır."),
        ]}
        glossary={[
          { term: tx("Hydrograph", "Hidrograf"), def: tx("Graph of river flow over time.", "Akarsu debisinin zamana göre grafiği.") },
          { term: tx("Inflow I / outflow Q", "Giriş I / çıkış Q"), def: tx("Water entering / leaving the reservoir (m³/s).", "Rezervuara giren / çıkan su (m³/s).") },
          { term: tx("Bottom outlet", "Dip savak"), def: tx("Pipe near the reservoir bed that always releases water.", "Rezervuar tabanına yakın, sürekli su bırakan boru.") },
          { term: tx("Spillway", "Dolu savak"), def: tx("Overflow channel that works once the water passes its crest.", "Su eşiğini aşınca çalışan taşma kanalı.") },
          { term: tx("Attenuation", "Sönümleme"), def: tx("How much lower the outflow peak is than the inflow peak.", "Çıkış pikinin giriş pikinden ne kadar düşük olduğu.") },
          { term: tx("Delay (lag)", "Gecikme"), def: tx("Time between the inflow peak and the outflow peak.", "Giriş piki ile çıkış piki arasındaki süre.") },
          { term: tx("Freeboard", "Hava payı"), def: tx("Distance between the highest water level and the dam crest.", "En yüksek su seviyesi ile baraj kreti arasındaki mesafe.") },
          { term: tx("Level-pool routing", "Level-pool öteleme"), def: tx("Routing that assumes a flat water surface in the reservoir.", "Rezervuarda yatay su yüzeyi varsayan öteleme yöntemi.") },
        ]}
      />

      <GoverningEquationsReference />
    </div>
  );
}

/** Side view of the reservoir: water level, the two outlets, and arrows sized by flow. */
function ReservoirDiagram({ design, inflow, outflow, level }: { design: LessonDesign; inflow: number; outflow: number; level: number }) {
  const tx = useTx();
  const W = 600;
  const H = 230;
  const bed = 196;
  const top = 26;
  const yOf = (h: number) => bed - (h / 21) * (bed - top);
  const damX = 400;
  const damTop = 44; // crest width
  const yCrest = yOf(CREST_M);
  const ySpill = yOf(design.spillCrest);
  const yWater = yOf(level);
  // valley side slopes gently up to the left
  const valley = (h: number) => 70 + (1 - h / 21) * 60;
  const arrowW = (q: number) => 3 + Math.min(1, q / 300) * 22;
  const toeX = damX + damTop + (bed - yCrest) * 0.75;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={tx(`Reservoir: level ${level.toFixed(2)} m, inflow ${inflow.toFixed(0)} m³/s, outflow ${outflow.toFixed(0)} m³/s`, `Rezervuar: seviye ${level.toFixed(2)} m, giriş ${inflow.toFixed(0)} m³/s, çıkış ${outflow.toFixed(0)} m³/s`)}>
      {/* valley */}
      <path d={`M${valley(21)},${yOf(21)} L${valley(0)},${bed} L${damX},${bed}`} fill="none" stroke="var(--ink2)" strokeWidth={1.5} />
      <line x1={0} x2={W} y1={bed} y2={bed} stroke="var(--ink2)" strokeWidth={1.5} />
      {/* water */}
      <polygon points={`${valley(level)},${yWater} ${damX},${yWater} ${damX},${bed} ${valley(0)},${bed}`} style={{ fill: "var(--map-water)" }} />
      <line x1={valley(level)} x2={damX} y1={yWater} y2={yWater} stroke="var(--viz-in)" strokeWidth={2} />
      {/* dam body */}
      <polygon
        points={`${damX},${yCrest} ${damX + damTop},${yCrest} ${toeX},${bed} ${damX},${bed}`}
        fill="color-mix(in oklab, var(--ink2) 22%, var(--atlas-card))"
        stroke="var(--ink)"
        strokeWidth={1.5}
      />
      {/* spillway notch: a gap in the top of the dam down to the spillway crest */}
      {design.spillWidth > 0 && (
        <>
          <rect x={damX - 1} y={yCrest - 1} width={damTop + 2} height={ySpill - yCrest + 1} fill="var(--atlas-card)" />
          {level > design.spillCrest && (
            <rect x={damX - 1} y={Math.max(yWater, yCrest)} width={damTop + 2} height={ySpill - Math.max(yWater, yCrest)} style={{ fill: "var(--map-water)" }} />
          )}
          <line x1={damX} x2={damX + damTop} y1={ySpill} y2={ySpill} stroke="var(--viz-spill)" strokeWidth={3} />
        </>
      )}
      {/* bottom outlet pipe */}
      {design.outletD > 0 && <rect x={damX} y={bed - 8} width={toeX - damX} height={6} fill="var(--viz-outlet)" />}

      {/* level guides */}
      {[
        { y: yCrest, label: tx(`dam crest ${CREST_M} m`, `kret ${CREST_M} m`) },
        { y: ySpill, label: tx(`spillway crest ${design.spillCrest} m`, `savak eşiği ${design.spillCrest} m`) },
      ].map((g) => (
        <g key={g.label}>
          <line x1={valley(21) - 20} x2={damX} y1={g.y} y2={g.y} stroke="var(--ink2)" strokeWidth={1} strokeDasharray="4 4" />
          <text x={damX - 6} y={g.y - 4} textAnchor="end" fontSize="11" fill="var(--ink2)" className="font-display" paintOrder="stroke" stroke="var(--atlas-card)" strokeWidth={3}>
            {g.label}
          </text>
        </g>
      ))}
      <text x={valley(level) + 14} y={yWater - 7} textAnchor="start" fontSize="12.5" fontWeight={700} fill="var(--ink)" className="font-display" paintOrder="stroke" stroke="var(--atlas-card)" strokeWidth={3}>
        h = {level.toFixed(2)} m
      </text>

      {/* inflow arrow */}
      <g>
        <line x1={6} x2={valley(0) + 20} y1={bed - 14} y2={bed - 14} stroke="var(--viz-in)" strokeWidth={arrowW(inflow)} strokeLinecap="butt" />
        <polygon points={`${valley(0) + 20},${bed - 14 - arrowW(inflow) / 2 - 5} ${valley(0) + 36},${bed - 14} ${valley(0) + 20},${bed - 14 + arrowW(inflow) / 2 + 5}`} fill="var(--viz-in)" />
        <text x={6} y={bed - 22 - arrowW(inflow) / 2} fontSize="12" fontWeight={600} fill="var(--ink)" className="font-display">
          I = {inflow.toFixed(0)} m³/s
        </text>
      </g>
      {/* outflow arrow */}
      <g>
        <line x1={toeX + 4} x2={W - 26} y1={bed - 14} y2={bed - 14} stroke="var(--viz-out)" strokeWidth={arrowW(outflow)} />
        <polygon points={`${W - 26},${bed - 14 - arrowW(outflow) / 2 - 5} ${W - 8},${bed - 14} ${W - 26},${bed - 14 + arrowW(outflow) / 2 + 5}`} fill="var(--viz-out)" />
        <text x={W - 8} y={bed - 22 - arrowW(outflow) / 2} textAnchor="end" fontSize="12" fontWeight={600} fill="var(--ink)" className="font-display">
          Q = {outflow.toFixed(0)} m³/s
        </text>
      </g>
      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--mut)" className="font-display">
        {tx("Arrow thickness shows the flow", "Ok kalınlığı debiyi gösterir")}
      </text>
    </svg>
  );
}
