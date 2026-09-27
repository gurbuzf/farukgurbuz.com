"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useTx } from "./lab-kit";

export type ChartSeries = {
  id: string;
  label: string;
  /** CSS color (use the --viz-* tokens) */
  color: string;
  /** [x, y] pairs sorted by x */
  points: [number, number][];
  dashed?: boolean;
  /** Light fill under the line */
  area?: boolean;
};

export type RefLine = { axis: "x" | "y"; value: number; label: string; /** put a y-line label under the line */ below?: boolean };
export type Marker = { x: number; y: number; label: string; color: string };

function niceTicks(max: number, count = 5): number[] {
  const safe = max > 0 ? max : 1;
  const raw = safe / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const top = Math.ceil(safe / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

/** Value of a series at x (linear interpolation). */
function valueAt(points: [number, number][], x: number): number | null {
  if (points.length === 0) return null;
  if (x <= points[0][0]) return points[0][1];
  if (x >= points[points.length - 1][0]) return points[points.length - 1][1];
  let lo = 0;
  let hi = points.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid][0] <= x) lo = mid;
    else hi = mid;
  }
  const [x0, y0] = points[lo];
  const [x1, y1] = points[hi];
  return x1 === x0 ? y0 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
}

export function LineChart({
  series,
  xLabel,
  yLabel,
  xUnit,
  yUnit,
  xMax,
  yMax,
  refLines = [],
  markers = [],
  cursorX = null,
  onCursor,
  height = 240,
  ariaLabel,
  xDecimals = 1,
  yDecimals = 1,
  tableStep,
}: {
  series: ChartSeries[];
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  xMax: number;
  yMax?: number;
  refLines?: RefLine[];
  markers?: Marker[];
  /** Externally controlled cursor (e.g. an animation time) */
  cursorX?: number | null;
  /** Called while the reader hovers/focuses the chart (null when leaving) */
  onCursor?: (x: number | null) => void;
  height?: number;
  ariaLabel: string;
  xDecimals?: number;
  yDecimals?: number;
  tableStep?: number;
}) {
  const tx = useTx();
  const clipId = useId();
  const [hoverX, setHoverX] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [boxW, setBoxW] = useState(600);

  // Draw in real pixels so text stays readable on narrow screens.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBoxW(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = Math.max(300, boxW || 600);
  const H = Math.round(height * Math.min(1, Math.max(0.8, W / 600)));
  const m = { l: 50, r: 14, t: 14, b: 40 };
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;

  const dataMax = Math.max(
    1e-6,
    ...series.flatMap((s) => s.points.map((p) => p[1])),
    ...refLines.filter((r) => r.axis === "y").map((r) => r.value)
  );
  const yTicks = niceTicks(yMax ?? dataMax * 1.05, 4);
  const yTop = yTicks[yTicks.length - 1];
  const xTicks = niceTicks(xMax, 6).filter((v) => v <= xMax + 1e-9);

  const sx = (x: number) => m.l + (x / xMax) * pw;
  const sy = (y: number) => m.t + ph - (Math.min(y, yTop) / yTop) * ph;

  const paths = useMemo(
    () =>
      series.map((s) => {
        const d = s.points.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(" ");
        const area = s.points.length
          ? `${d} L${sx(s.points[s.points.length - 1][0]).toFixed(1)},${sy(0)} L${sx(s.points[0][0]).toFixed(1)},${sy(0)} Z`
          : "";
        return { id: s.id, d, area };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, xMax, yTop, H, W]
  );
  // dashed (reference) lines go underneath the live ones
  const drawOrder = series.map((s, i) => ({ s, i })).sort((a, b) => Number(!!b.s.dashed) - Number(!!a.s.dashed));

  const shownX = hoverX ?? cursorX;

  const setX = (x: number | null) => {
    setHoverX(x);
    onCursor?.(x);
  };

  const handleMove = (e: PointerEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement!;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const x = Math.max(0, Math.min(xMax, ((px - m.l) / pw) * xMax));
    setX(x);
  };

  const handleKey = (e: KeyboardEvent<SVGRectElement>) => {
    const step = xMax / 48;
    const cur = hoverX ?? cursorX ?? 0;
    if (e.key === "ArrowRight") setX(Math.min(xMax, cur + step));
    else if (e.key === "ArrowLeft") setX(Math.max(0, cur - step));
    else if (e.key === "Escape") setX(null);
    else return;
    e.preventDefault();
  };

  const tableXs = useMemo(() => {
    const step = tableStep ?? xMax / 12;
    const xs: number[] = [];
    for (let x = 0; x <= xMax + 1e-9; x += step) xs.push(Number(x.toFixed(6)));
    return xs;
  }, [tableStep, xMax]);

  return (
    <figure className="m-0 flex flex-col gap-2">
      {series.length > 1 && (
        <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {series.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5 font-display text-[12.5px] text-[var(--ink2)]">
              <svg width="18" height="6" aria-hidden>
                <line x1="1" y1="3" x2="17" y2="3" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dashed ? "4 3" : undefined} strokeLinecap="round" />
              </svg>
              {s.label}
            </span>
          ))}
        </figcaption>
      )}

      {/* y-axis title (HTML, above the tick column, so it never collides with ticks) */}
      <div className="font-display text-[11.5px] text-[var(--ink2)] -mb-1.5">
        {yLabel} ({yUnit})
      </div>

      <div className="relative" ref={boxRef}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none" role="img" aria-label={ariaLabel}>
          <defs>
            <clipPath id={clipId}>
              <rect x={m.l} y={m.t} width={pw} height={ph} />
            </clipPath>
          </defs>

          {/* grid + y ticks */}
          {yTicks.map((v) => (
            <g key={`y${v}`}>
              <line x1={m.l} x2={m.l + pw} y1={sy(v)} y2={sy(v)} stroke="var(--line)" strokeWidth={1} />
              <text x={m.l - 6} y={sy(v) + 3.5} textAnchor="end" fontSize="11" fill="var(--ink2)" className="font-plex-mono tabular-nums">
                {v}
              </text>
            </g>
          ))}
          {xTicks.map((v) => (
            <text key={`x${v}`} x={sx(v)} y={m.t + ph + 15} textAnchor="middle" fontSize="11" fill="var(--ink2)" className="font-plex-mono tabular-nums">
              {v}
            </text>
          ))}
          <line x1={m.l} x2={m.l + pw} y1={sy(0)} y2={sy(0)} stroke="var(--ink2)" strokeWidth={1} />
          <text x={m.l + pw} y={H - 6} textAnchor="end" fontSize="11" fill="var(--ink2)" className="font-display">
            {xLabel} ({xUnit})
          </text>

          <g clipPath={`url(#${clipId})`}>
            {/* reference lines (thresholds) */}
            {refLines.map((r) =>
              r.axis === "y" ? (
                <line key={r.label} x1={m.l} x2={m.l + pw} y1={sy(r.value)} y2={sy(r.value)} stroke="var(--ink2)" strokeWidth={1} strokeDasharray="5 4" />
              ) : (
                <line key={r.label} x1={sx(r.value)} x2={sx(r.value)} y1={m.t} y2={m.t + ph} stroke="var(--ink2)" strokeWidth={1} strokeDasharray="5 4" />
              )
            )}

            {series.map((s, i) =>
              s.area ? <path key={`a${s.id}`} d={paths[i].area} fill={s.color} opacity={0.12} /> : null
            )}
            {drawOrder.map(({ s, i }) => (
              <path
                key={s.id}
                d={paths[i].d}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? "6 4" : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* reference line labels */}
          {refLines.map((r) =>
            r.axis === "y" ? (
              <text key={`t${r.label}`} x={m.l + 6} y={sy(r.value) + (r.below ? 14 : -5)} fontSize="11" fill="var(--ink)" className="font-display" paintOrder="stroke" stroke="var(--atlas-card)" strokeWidth={3}>
                {r.label}
              </text>
            ) : (
              <text key={`t${r.label}`} x={sx(r.value) + 5} y={m.t + 12} fontSize="11" fill="var(--ink)" className="font-display" paintOrder="stroke" stroke="var(--atlas-card)" strokeWidth={3}>
                {r.label}
              </text>
            )
          )}

          {/* annotated points */}
          {markers.map((mk) => {
            const x = sx(mk.x);
            const y = sy(mk.y);
            const right = x < m.l + pw * 0.62;
            return (
              <g key={mk.label}>
                <circle cx={x} cy={y} r={5} fill={mk.color} stroke="var(--atlas-card)" strokeWidth={2} />
                <text
                  x={right ? x + 9 : x - 9}
                  y={y - 8}
                  textAnchor={right ? "start" : "end"}
                  fontSize="11.5"
                  fontWeight={600}
                  fill="var(--ink)"
                  className="font-display"
                  paintOrder="stroke"
                  stroke="var(--atlas-card)"
                  strokeWidth={3.5}
                >
                  {mk.label}
                </text>
              </g>
            );
          })}

          {/* cursor */}
          {shownX !== null && (
            <g pointerEvents="none">
              <line x1={sx(shownX)} x2={sx(shownX)} y1={m.t} y2={m.t + ph} stroke="var(--ink)" strokeWidth={1} />
              {series.map((s) => {
                const v = valueAt(s.points, shownX);
                return v === null ? null : (
                  <circle key={s.id} cx={sx(shownX)} cy={sy(v)} r={4} fill={s.color} stroke="var(--atlas-card)" strokeWidth={2} />
                );
              })}
            </g>
          )}

          {/* hit area: hover or focus + arrow keys */}
          <rect
            x={m.l}
            y={m.t}
            width={pw}
            height={ph}
            fill="transparent"
            tabIndex={0}
            aria-label={tx("Chart cursor: use left and right arrow keys", "Grafik imleci: sol ve sağ ok tuşlarını kullanın")}
            className="cursor-crosshair outline-none focus-visible:stroke-[var(--acc)]"
            onPointerMove={handleMove}
            onPointerLeave={() => setX(null)}
            onKeyDown={handleKey}
            onBlur={() => setX(null)}
          />
        </svg>

        {/* tooltip */}
        {shownX !== null && (
          <div
            className="absolute top-2 pointer-events-none z-10 px-2.5 py-2 bg-[var(--atlas-card)] border border-[var(--frame)] shadow-[3px_3px_0_var(--shadow)] min-w-[140px]"
            style={
              shownX / xMax < 0.55
                ? { left: `calc(${(sx(shownX) / W) * 100}% + 12px)` }
                : { right: `calc(${100 - (sx(shownX) / W) * 100}% + 12px)` }
            }
          >
            <div className="font-plex-mono text-[10.5px] text-[var(--mut)]">
              {xLabel} = {shownX.toFixed(xDecimals)} {xUnit}
            </div>
            {series.map((s) => {
              const v = valueAt(s.points, shownX);
              return (
                <div key={s.id} className="flex items-center gap-1.5 mt-0.5">
                  <svg width="12" height="4" aria-hidden>
                    <line x1="0" y1="2" x2="12" y2="2" stroke={s.color} strokeWidth="2.5" />
                  </svg>
                  <span className="font-plex-mono text-[12.5px] font-bold text-[var(--ink)] tabular-nums">
                    {v === null ? "–" : v.toFixed(yDecimals)}
                  </span>
                  <span className="font-display text-[11.5px] text-[var(--ink2)]">{s.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <details className="font-display text-[12px] text-[var(--ink2)]">
        <summary className="cursor-pointer w-fit text-[var(--mut)] hover:text-[var(--ink)]">{tx("Show data table", "Veri tablosunu göster")}</summary>
        <div className="mt-1.5 max-h-56 overflow-auto border border-[var(--line)]">
          <table className="w-full text-left font-plex-mono text-[11.5px] tabular-nums">
            <thead className="sticky top-0 bg-[var(--paper)]">
              <tr>
                <th className="px-2 py-1 font-semibold">
                  {xLabel} ({xUnit})
                </th>
                {series.map((s) => (
                  <th key={s.id} className="px-2 py-1 font-semibold">
                    {s.label} ({yUnit})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableXs.map((x) => (
                <tr key={x} className="border-t border-[var(--line)]">
                  <td className="px-2 py-0.5">{x.toFixed(xDecimals)}</td>
                  {series.map((s) => {
                    const v = valueAt(s.points, x);
                    return (
                      <td key={s.id} className="px-2 py-0.5">
                        {v === null ? "–" : v.toFixed(yDecimals)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
