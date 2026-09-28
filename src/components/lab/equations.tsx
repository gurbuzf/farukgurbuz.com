"use client";

/**
 * Governing equations of the reservoir lesson, typeset with small HTML helpers.
 * Every constant shown here is the one used by src/lib/dam-routing.ts and
 * src/lib/reservoir-lesson.ts — keep them in sync if the model changes.
 */
import type { ReactNode } from "react";
import { CREST_M, HORIZON_H, STEPS } from "@/lib/reservoir-lesson";
import { useTx } from "./lab-kit";

const DT_MIN = (HORIZON_H / STEPS) * 60;

/* ── typesetting helpers ───────────────────────────────────────────── */

const MATH_FONT = "font-['STIX_Two_Math','Cambria_Math','Times_New_Roman',serif]";

/** Italic variable, optional subscript */
export function V({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      <i>{children}</i>
      {sub !== undefined && <sub className="not-italic text-[0.72em]">{sub}</sub>}
    </span>
  );
}

export function Frac({ n, d }: { n: ReactNode; d: ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle mx-1 leading-tight text-center">
      <span className="px-1 pb-0.5 border-b border-current">{n}</span>
      <span className="px-1 pt-0.5">{d}</span>
    </span>
  );
}

export function Sqrt({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-stretch align-middle mx-0.5 whitespace-nowrap">
      <span className="text-[1.15em] leading-none pr-px">√</span>
      <span className="border-t border-current pt-px px-0.5">{children}</span>
    </span>
  );
}

const Op = ({ children }: { children: ReactNode }) => <span className="mx-1.5">{children}</span>;

/** A displayed equation line: centred, scrolls sideways on narrow screens instead of wrapping. */
export function Eq({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="py-2 overflow-x-auto">
      <div className={`${MATH_FONT} text-[16px] text-[var(--ink)] text-center whitespace-nowrap min-w-max mx-auto`}>{children}</div>
      {note && <div className="mt-1 text-center font-display text-[12px] text-[var(--mut)]">{note}</div>}
    </div>
  );
}

/** Piecewise definition with a left brace. */
function Cases({ lhs, rows }: { lhs: ReactNode; rows: { expr: ReactNode; cond: ReactNode }[] }) {
  return (
    <div className="py-2 overflow-x-auto">
      <div className={`${MATH_FONT} text-[16px] text-[var(--ink)] flex items-center justify-center gap-2 min-w-max mx-auto`}>
        <span>{lhs}</span>
        <span>=</span>
        <span className="text-[2.6em] font-light leading-none -my-2 select-none" aria-hidden>
          {"{"}
        </span>
        <span className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1.5 items-center">
          {rows.map((r, i) => (
            <span key={i} className="contents">
              <span>{r.expr}</span>
              <span className="font-display text-[13px] text-[var(--ink2)]">{r.cond}</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

function Legend({ items }: { items: [ReactNode, string][] }) {
  return (
    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-display text-[12.5px] leading-snug text-[var(--ink2)]">
      {items.map(([sym, text], i) => (
        <span key={i} className="contents">
          <dt className={`${MATH_FONT} text-[14px] text-[var(--ink)] text-right`}>{sym}</dt>
          <dd>{text}</dd>
        </span>
      ))}
    </dl>
  );
}

/* ── the equations ─────────────────────────────────────────────────── */

const I_t = (
  <>
    <V>I</V>(<V>t</V>)
  </>
);
const Q_h = (
  <>
    <V>Q</V>(<V>h</V>)
  </>
);
const A_h = (
  <>
    <V>A</V>(<V>h</V>)
  </>
);

/** 1 · Inflow hydrograph (gamma-shaped) and flood volume */
export function InflowEquations() {
  const tx = useTx();
  return (
    <div>
      <Eq>
        {I_t}
        <Op>=</Op>
        <V sub="b">I</V>
        <Op>+</Op>(<V sub="p">I</V>
        <Op>−</Op>
        <V sub="b">I</V>)
        <span className="mx-1" />
        <span>
          (<Frac n={<V>t</V>} d={<V sub="p">T</V>} />)<sup className="text-[0.72em]">2.4</sup>
        </span>
        <span className="mx-1" />
        <span>
          exp
          <span className="text-[0.95em]">
            [−2.4(<Frac n={<V>t</V>} d={<V sub="p">T</V>} />
            − 1)]
          </span>
        </span>
      </Eq>
      <Eq>
        <V>V</V>
        <Op>=</Op>
        <span className="text-[1.4em] align-middle">∫</span>
        <span className="mx-1">
          [{I_t} − <V sub="b">I</V>] <V>dt</V>
        </span>
      </Eq>
      <Legend
        items={[
          [<V key="a" sub="p">I</V>, tx("peak inflow (m³/s)", "pik giriş debisi (m³/s)")],
          [<V key="b" sub="b">I</V>, tx("base flow, 5 m³/s", "taban akışı, 5 m³/s")],
          [<V key="c" sub="p">T</V>, tx("time to peak (h); at t = Tp the curve equals Ip exactly", "pike varış süresi (sa); t = Tp'de eğri tam olarak Ip'ye eşittir")],
          [<V key="d">V</V>, tx("flood volume above base flow (m³)", "taban akışı üzerindeki taşkın hacmi (m³)")],
        ]}
      />
    </div>
  );
}

/** 2 · Continuity (mass balance) */
export function ContinuityEquations() {
  const tx = useTx();
  return (
    <div>
      <Eq note={tx("change in stored water = water in − water out", "depolanan su değişimi = giren su − çıkan su")}>
        <Frac n={<V>dS</V>} d={<V>dt</V>} />
        <Op>=</Op>
        {I_t}
        <Op>−</Op>
        {Q_h}
        <span className="mx-5 text-[var(--mut)]">⟺</span>
        <Frac n={<V>dh</V>} d={<V>dt</V>} />
        <Op>=</Op>
        <Frac n={<>{I_t} − {Q_h}</>} d={A_h} />
      </Eq>
      <Legend
        items={[
          [<V key="s">S</V>, tx("stored volume (m³)", "depolanan hacim (m³)")],
          [<V key="h">h</V>, tx("water level above the reservoir bed (m)", "rezervuar tabanından su seviyesi (m)")],
          [A_h, tx("water-surface area at level h (m²); a large lake rises slowly", "h seviyesindeki su yüzeyi alanı (m²); büyük bir göl yavaş yükselir")],
        ]}
      />
      <p className="mt-2 font-display text-[12.5px] leading-snug text-[var(--ink2)]">
        {tx(
          "“Level-pool” routing assumes the lake surface stays flat, so a single level h describes the whole reservoir. The level peaks when dh/dt = 0, i.e. when I = Q.",
          "“Level-pool” ötelemesi göl yüzeyinin yatay kaldığını varsayar; böylece tek bir h seviyesi tüm rezervuarı tanımlar. Seviye dh/dt = 0 olduğunda, yani I = Q iken pik yapar."
        )}
      </p>
    </div>
  );
}

/** 3 · Stage–storage and stage–area relations */
export function StorageEquations() {
  const tx = useTx();
  const r = <Frac n={<V>h</V>} d={<V sub="c">H</V>} />;
  return (
    <div>
      <Eq>
        <V>S</V>(<V>h</V>)
        <Op>=</Op>
        <V sub="max">S</V>
        <span className="mx-1">
          [0.2 {r} + 0.8 ({r})<sup className="text-[0.72em]">2</sup>]
        </span>
      </Eq>
      <Eq>
        {A_h}
        <Op>=</Op>
        <Frac n={<V>dS</V>} d={<V>dh</V>} />
        <Op>=</Op>
        <Frac n={<V sub="max">S</V>} d={<V sub="c">H</V>} />
        <span className="mx-1">[0.2 + 1.6 {r}]</span>
      </Eq>
      <Legend
        items={[
          [<V key="m" sub="max">S</V>, tx("reservoir volume when full to the crest (the “reservoir size” slider)", "krete kadar dolu rezervuar hacmi (“rezervuar hacmi” kaydırıcısı)")],
          [<V key="c" sub="c">H</V>, tx(`dam crest level, ${CREST_M} m`, `baraj kret kotu, ${CREST_M} m`)],
        ]}
      />
      <p className="mt-2 font-display text-[12.5px] leading-snug text-[var(--ink2)]">
        {tx(
          "An idealized valley that widens with height (instead of surveyed bathymetry): the higher the water, the larger the lake surface.",
          "Ölçülmüş batimetri yerine yükseldikçe genişleyen idealize bir vadi: su yükseldikçe göl yüzeyi büyür."
        )}
      </p>
    </div>
  );
}

/** 4 · Outlet (rating) equations, piecewise in the water level */
export function RatingEquations() {
  const tx = useTx();
  const twoGh = (
    <Sqrt>
      2<V>g</V>
      <V>h</V>
    </Sqrt>
  );
  return (
    <div>
      <Eq>
        {Q_h}
        <Op>=</Op>
        <V sub={tx("outlet", "dip")}>Q</V>
        <Op>+</Op>
        <V sub={tx("spill", "savak")}>Q</V>
        <Op>+</Op>
        <V sub={tx("over", "aşım")}>Q</V>
      </Eq>
      <Cases
        lhs={<V sub={tx("outlet", "dip")}>Q</V>}
        rows={[
          {
            expr: (
              <>
                <V sub="1">c</V> <V sub="w">A</V>(<V>h</V>) {twoGh}
              </>
            ),
            cond: tx("h < d (pipe partly full)", "h < d (boru kısmen dolu)"),
          },
          {
            expr: (
              <>
                <V sub="1">c</V> <Frac n={<>π<V>d</V><sup className="text-[0.72em]">2</sup></>} d="4" /> {twoGh}
              </>
            ),
            cond: tx("h ≥ d (pipe full)", "h ≥ d (boru dolu)"),
          },
        ]}
      />
      <Cases
        lhs={<V sub={tx("spill", "savak")}>Q</V>}
        rows={[
          { expr: <>0</>, cond: tx("h ≤ Hs", "h ≤ Hs") },
          {
            expr: (
              <>
                <V sub="2">c</V> <V sub="s">L</V> (<V>h</V> − <V sub="s">H</V>)<sup className="text-[0.72em]">3/2</sup>
              </>
            ),
            cond: tx("h > Hs (water above the spillway crest)", "h > Hs (su savak eşiğinin üstünde)"),
          },
        ]}
      />
      <Cases
        lhs={<V sub={tx("over", "aşım")}>Q</V>}
        rows={[
          { expr: <>0</>, cond: tx("h ≤ Hc", "h ≤ Hc") },
          {
            expr: (
              <>
                <V sub="2">c</V> (<V sub="c">L</V> − <V sub="s">L</V>) (<V>h</V> − <V sub="c">H</V>)<sup className="text-[0.72em]">3/2</sup>
              </>
            ),
            cond: tx("h > Hc (dam overtopped!)", "h > Hc (baraj aşılıyor!)"),
          },
        ]}
      />
      <Eq>
        <V sub="w">A</V>(<V>h</V>)
        <Op>=</Op>
        <V>r</V>
        <sup className="text-[0.72em]">2</sup>
        <span className="mx-1">
          [arccos(1 − <Frac n={<V>h</V>} d={<V>r</V>} />) − (1 − <Frac n={<V>h</V>} d={<V>r</V>} />)
          <Sqrt>
            1 − (1 − <Frac n={<V>h</V>} d={<V>r</V>} />)<sup className="text-[0.72em]">2</sup>
          </Sqrt>
          ]
        </span>
        <span className="ml-2">
          , <V>r</V> = <V>d</V>/2
        </span>
      </Eq>
      <Legend
        items={[
          [<V key="c1" sub="1">c</V>, tx("outlet discharge coefficient, 0.62", "dip savak debi katsayısı, 0,62")],
          [<V key="c2" sub="2">c</V>, tx("weir coefficient, 2.0 m½/s", "savak katsayısı, 2,0 m½/s")],
          [<V key="g">g</V>, tx("gravity, 9.81 m/s²", "yerçekimi ivmesi, 9,81 m/s²")],
          [<V key="d">d</V>, tx("bottom outlet diameter (m)", "dip savak çapı (m)")],
          [<V key="Aw" sub="w">A</V>, tx("wetted area of a partly full circular pipe (m²)", "kısmen dolu dairesel borunun ıslak alanı (m²)")],
          [<V key="Ls" sub="s">L</V>, tx("spillway width (m)", "dolu savak genişliği (m)")],
          [<V key="Hs" sub="s">H</V>, tx("spillway crest level (m)", "dolu savak eşik kotu (m)")],
          [<V key="Lc" sub="c">L</V>, tx("dam crest length, 150 m", "baraj kret uzunluğu, 150 m")],
          [<V key="Hc" sub="c">H</V>, tx(`dam crest level, ${CREST_M} m`, `baraj kret kotu, ${CREST_M} m`)],
        ]}
      />
      <p className="mt-2 font-display text-[12.5px] leading-snug text-[var(--ink2)]">
        {tx(
          "Heads are measured from the reservoir bed and the weir heads are divided by a reference head of 1 m, so the units work out. Real outlets are calibrated in the field; these coefficients are typical textbook values.",
          "Yükler rezervuar tabanından ölçülür ve savak yükleri 1 m'lik bir referans yüke bölünür; böylece birimler tutarlı olur. Gerçek çıkış yapıları sahada kalibre edilir; bu katsayılar tipik ders kitabı değerleridir."
        )}
      </p>
    </div>
  );
}

/** 5 · Numerical solution: classical fixed-step RK4 */
export function RK4Equations() {
  const tx = useTx();
  const f = (t: ReactNode, h: ReactNode) => (
    <>
      <V>f</V>({t}, {h})
    </>
  );
  const half = <Frac n={<>Δ<V>t</V></>} d="2" />;
  return (
    <div>
      <Eq>
        {f(<V>t</V>, <V>h</V>)}
        <Op>=</Op>
        <Frac n={<>{I_t} − {Q_h}</>} d={A_h} />
      </Eq>
      <Eq>
        <V sub="1">k</V> = {f(<V sub="n">t</V>, <V sub="n">h</V>)}
        <span className="mx-4" />
        <V sub="2">k</V> = {f(<><V sub="n">t</V> + {half}</>, <><V sub="n">h</V> + {half}<V sub="1">k</V></>)}
      </Eq>
      <Eq>
        <V sub="3">k</V> = {f(<><V sub="n">t</V> + {half}</>, <><V sub="n">h</V> + {half}<V sub="2">k</V></>)}
        <span className="mx-4" />
        <V sub="4">k</V> = {f(<><V sub="n">t</V> + Δ<V>t</V></>, <><V sub="n">h</V> + Δ<V>t</V> <V sub="3">k</V></>)}
      </Eq>
      <Eq note={tx(`Δt = ${HORIZON_H} h / ${STEPS} steps = ${DT_MIN} min, fixed (no adaptive step control)`, `Δt = ${HORIZON_H} sa / ${STEPS} adım = ${DT_MIN} dk, sabit (uyarlamalı adım kontrolü yok)`)}>
        <V sub="n+1">h</V>
        <Op>=</Op>
        <V sub="n">h</V>
        <Op>+</Op>
        <Frac n={<>Δ<V>t</V></>} d="6" />
        <span className="mx-1">
          (<V sub="1">k</V> + 2<V sub="2">k</V> + 2<V sub="3">k</V> + <V sub="4">k</V>)
        </span>
      </Eq>
      <p className="mt-1 font-display text-[12.5px] leading-snug text-[var(--ink2)]">
        {tx(
          "The equation cannot be solved by hand because Q and A both depend on h, so the computer steps forward in time. Runge–Kutta (RK4) takes four slope samples inside each step and averages them, which is far more accurate than a single slope (Euler's method).",
          "Q ve A'nın ikisi de h'ye bağlı olduğu için denklem elle çözülemez; bilgisayar zamanda adım adım ilerler. Runge–Kutta (RK4) her adımın içinde dört eğim örneği alıp ortalamasını kullanır; bu, tek bir eğim kullanmaktan (Euler yöntemi) çok daha doğrudur."
        )}
      </p>
    </div>
  );
}

/** All governing equations in order, for the reference panel at the end of the lesson. */
export function GoverningEquationsReference() {
  const tx = useTx();
  const sections: { n: number; title: string; body: ReactNode }[] = [
    { n: 1, title: tx("Inflow hydrograph", "Giriş hidrografı"), body: <InflowEquations /> },
    { n: 2, title: tx("Continuity (mass balance)", "Süreklilik (kütle dengesi)"), body: <ContinuityEquations /> },
    { n: 3, title: tx("Stage–storage and stage–area", "Seviye–hacim ve seviye–alan"), body: <StorageEquations /> },
    { n: 4, title: tx("Outlet equations (rating curve)", "Çıkış yapısı denklemleri (anahtar eğrisi)"), body: <RatingEquations /> },
    { n: 5, title: tx("Numerical solution (RK4)", "Sayısal çözüm (RK4)"), body: <RK4Equations /> },
  ];
  return (
    <details className="group scroll-mt-[140px] bg-[var(--atlas-card)] border border-[var(--line)] open:border-[var(--frame)]" id="governing-equations">
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-2 font-display text-[14px] font-semibold text-[var(--ink)]">
          <span className={`${MATH_FONT} text-[16px] text-[var(--acc)]`}>∑</span>
          {tx("Governing equations — reservoir flood routing", "Temel denklemler — rezervuar taşkın ötelemesi")}
        </span>
        <span className="font-plex-mono text-[11px] text-[var(--mut)] group-open:hidden">{tx("Show", "Göster")} ▾</span>
        <span className="font-plex-mono text-[11px] text-[var(--mut)] hidden group-open:inline">{tx("Hide", "Gizle")} ▴</span>
      </summary>
      <div className="px-4 pb-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
        {sections.map((s) => (
          <section key={s.n} className={`p-4 bg-[var(--paper)] border border-[var(--line)] ${s.n === 4 ? "xl:col-span-2" : ""}`}>
            <h4 className="font-plex-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--acc)]">
              {s.n}. {s.title}
            </h4>
            <div className="mt-1">{s.body}</div>
          </section>
        ))}
      </div>
    </details>
  );
}
