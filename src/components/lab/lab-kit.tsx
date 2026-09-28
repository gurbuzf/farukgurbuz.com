"use client";

import { useCallback, type ReactNode } from "react";
import { useAtlas } from "@/lib/atlas-provider";
import { ArrowLeft, ArrowRight, BookOpen, Check, FlaskConical, Lightbulb, Eye, Sigma, X } from "lucide-react";

export type Bi = { en: string; tr: string };

/** Pick the string for the active language: tx("English", "Türkçe"). */
export function useTx() {
  const { lang } = useAtlas();
  return useCallback((en: string, tr: string) => (lang === "tr" ? tr : en), [lang]);
}

export function fmt(n: number, decimals = 1) {
  return Number.isFinite(n) ? n.toFixed(decimals) : "–";
}

/* ── Chapter navigation ─────────────────────────────────────────────── */

export function ChapterNav({
  chapters,
  active,
  onSelect,
}: {
  chapters: Bi[];
  active: number;
  onSelect: (i: number) => void;
}) {
  const tx = useTx();
  return (
    <nav aria-label={tx("Lesson chapters", "Ders bölümleri")} className="w-full overflow-x-auto no-scrollbar">
      <ol className="flex min-w-max items-stretch gap-1.5">
        {chapters.map((c, i) => {
          const isActive = i === active;
          const done = i < active;
          return (
            <li key={c.en} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={isActive ? "step" : undefined}
                className={`cursor-pointer flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-left transition-colors ${
                  isActive
                    ? "bg-[var(--frame)] border-[var(--frame)] text-[var(--paper)]"
                    : "bg-[var(--atlas-card)] border-[var(--line)] text-[var(--ink2)] hover:border-[var(--frame)] hover:text-[var(--ink)]"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-plex-mono text-[11px] font-bold flex-none ${
                    isActive
                      ? "bg-[var(--paper)] text-[var(--ink)]"
                      : done
                      ? "bg-[var(--acc)] text-[var(--accInk)]"
                      : "bg-[var(--paper)] text-[var(--ink2)] border border-[var(--line)]"
                  }`}
                >
                  {done ? <Check size={12} strokeWidth={3} /> : i + 1}
                </span>
                <span className="font-display text-[13px] font-semibold whitespace-nowrap">{tx(c.en, c.tr)}</span>
              </button>
              {i < chapters.length - 1 && <span aria-hidden className="w-3 h-px bg-[var(--line)]" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Lesson panel: the idea → controls → try this → what you see ───── */

export function LessonPanel({
  index,
  total,
  title,
  idea,
  controls,
  tryThis,
  observe,
  math,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  title: string;
  idea: ReactNode;
  controls?: ReactNode;
  tryThis?: ReactNode[];
  observe?: ReactNode;
  /** Optional governing equations for this chapter, shown collapsed */
  math?: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const tx = useTx();
  return (
    <div className="flex flex-col bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] shadow-[5px_5px_0_var(--shadow)]">
      <div className="px-5 pt-4 pb-3 border-b border-[var(--line)]">
        <div className="font-plex-mono text-[10.5px] font-bold tracking-[0.14em] text-[var(--acc)] uppercase">
          {tx("Chapter", "Bölüm")} {index + 1} / {total}
        </div>
        <h3 className="mt-1 font-display font-bold text-[20px] leading-tight tracking-tight text-[var(--ink)]">{title}</h3>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        <Section icon={<Lightbulb size={14} />} label={tx("The idea", "Temel fikir")}>
          <div className="font-display text-[14px] leading-[1.6] text-[var(--ink2)] flex flex-col gap-2">{idea}</div>
        </Section>

        {controls && <div className="flex flex-col gap-3">{controls}</div>}

        {tryThis && tryThis.length > 0 && (
          <Section icon={<FlaskConical size={14} />} label={tx("Try this", "Bunu deneyin")}>
            <ul className="flex flex-col gap-1.5">
              {tryThis.map((item, i) => (
                <li key={i} className="flex gap-2 font-display text-[13.5px] leading-[1.5] text-[var(--ink2)]">
                  <span className="font-plex-mono text-[11px] font-bold text-[var(--acc)] mt-0.5">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {observe && (
          <div aria-live="polite" className="p-3.5 bg-[var(--paper)] border-l-[3px] border-[var(--acc)]">
            <div className="flex items-center gap-1.5 font-plex-mono text-[10.5px] font-bold tracking-[0.12em] uppercase text-[var(--ink)]">
              <Eye size={13} className="text-[var(--acc)]" />
              {tx("What you see", "Ne görüyorsunuz")}
            </div>
            <div className="mt-1.5 font-display text-[13.5px] leading-[1.6] text-[var(--ink)] flex flex-col gap-1.5">{observe}</div>
          </div>
        )}

        {math && (
          <details className="group border border-[var(--line)] open:border-[var(--frame)]">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-3 py-2">
              <span className="flex items-center gap-1.5 font-plex-mono text-[10.5px] font-bold tracking-[0.12em] uppercase text-[var(--ink)]">
                <Sigma size={13} className="text-[var(--acc)]" />
                {tx("The math behind it", "İşin matematiği")}
              </span>
              <span className="font-plex-mono text-[11px] text-[var(--mut)] group-open:hidden">▾</span>
              <span className="font-plex-mono text-[11px] text-[var(--mut)] hidden group-open:inline">▴</span>
            </summary>
            <div className="px-3 pb-3">{math}</div>
          </details>
        )}
      </div>

      <div className="mt-auto px-5 py-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!onPrev}
          className="cursor-pointer disabled:cursor-default disabled:opacity-30 inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--line)] hover:border-[var(--frame)] font-plex-mono text-[11px] font-semibold text-[var(--ink)]"
        >
          <ArrowLeft size={13} /> {tx("Back", "Geri")}
        </button>
        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--frame)] text-[var(--paper)] hover:bg-[var(--acc)] font-plex-mono text-[11px] font-semibold"
          >
            {tx("Next chapter", "Sonraki bölüm")} <ArrowRight size={13} />
          </button>
        ) : (
          <span className="font-plex-mono text-[11px] text-[var(--mut)]">{tx("Last chapter", "Son bölüm")}</span>
        )}
      </div>
    </div>
  );
}

function Section({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 font-plex-mono text-[10.5px] font-bold tracking-[0.12em] uppercase text-[var(--ink)]">
        <span className="text-[var(--acc)]">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/* ── Controls ──────────────────────────────────────────────────────── */

export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  decimals = 0,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  decimals?: number;
  hint?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-display text-[13px] font-semibold text-[var(--ink)]">{label}</span>
        <span className="font-plex-mono text-[13px] font-bold text-[var(--ink)] tabular-nums">
          {value.toFixed(decimals)}
          {unit && <span className="ml-1 text-[11px] font-medium text-[var(--ink2)]">{unit}</span>}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full h-1.5 cursor-pointer accent-[var(--acc)]"
      />
      {hint && <span className="block mt-0.5 font-display text-[11.5px] leading-snug text-[var(--mut)]">{hint}</span>}
    </label>
  );
}

export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      {label && <div className="font-display text-[13px] font-semibold text-[var(--ink)] mb-1.5">{label}</div>}
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            onClick={() => onChange(o.value)}
            className={`cursor-pointer px-2.5 py-1 border font-plex-mono text-[11px] font-semibold transition-colors ${
              o.value === value
                ? "bg-[var(--frame)] border-[var(--frame)] text-[var(--paper)]"
                : "bg-[var(--paper)] border-[var(--line)] text-[var(--ink2)] hover:border-[var(--frame)]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Read-outs ─────────────────────────────────────────────────────── */

export function Stat({
  label,
  value,
  unit,
  sub,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  /** Optional colored key (a series color) shown beside the label */
  tone?: string;
}) {
  return (
    <div className="p-3 bg-[var(--paper)] border border-[var(--line)]">
      <div className="flex items-center gap-1.5 font-plex-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--mut)]">
        {tone && <span aria-hidden className="w-2.5 h-[3px] rounded-full" style={{ background: tone }} />}
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-[22px] font-bold leading-none text-[var(--ink)]">{value}</span>
        {unit && <span className="font-plex-mono text-[11px] text-[var(--ink2)]">{unit}</span>}
      </div>
      {sub && <div className="mt-1 font-plex-mono text-[10.5px] text-[var(--mut)]">{sub}</div>}
    </div>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-2.5 bg-[var(--paper)] border border-[var(--line)] font-plex-mono text-[12.5px] leading-[1.7] text-[var(--ink)] overflow-x-auto">
      {children}
    </div>
  );
}

/** Pass / fail line for goals — icon + words, never color alone. */
export function Goal({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 font-display text-[13.5px] leading-snug text-[var(--ink)]">
      <span
        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-none text-white"
        style={{ background: ok ? "var(--viz-good)" : "var(--viz-bad)" }}
      >
        {ok ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
      </span>
      <span>
        <span className="sr-only">{ok ? "Met: " : "Not met: "}</span>
        {children}
      </span>
    </div>
  );
}

/* ── Cause → effect note ───────────────────────────────────────────── */

export type Change = {
  cause: string;
  from: string;
  to: string;
  effects: { label: string; from: number; to: number; unit: string; decimals?: number }[];
};

export function ChangeNote({ change, emptyHint }: { change: Change | null; emptyHint?: string }) {
  const tx = useTx();
  if (!change) {
    return (
      <p className="px-3 py-2 border border-dashed border-[var(--line)] font-display text-[12.5px] text-[var(--mut)]">
        {emptyHint ??
          tx(
            "Change a setting — this box will show what your change caused.",
            "Bir ayarı değiştirin — bu kutu değişikliğinizin neye yol açtığını gösterecek."
          )}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-1 px-3 py-2 bg-[var(--paper)] border border-[var(--line)]">
      <div className="font-display text-[13px] text-[var(--ink2)]">
        {tx("You changed", "Değiştirdiğiniz")} <strong className="text-[var(--ink)]">{change.cause}</strong>:{" "}
        <span className="font-plex-mono">
          {change.from} → {change.to}
        </span>
      </div>
      <ul className="flex flex-col gap-0.5">
        {change.effects.map((e) => {
          const d = e.to - e.from;
          const pct = Math.abs(e.from) > 1e-9 ? (d / Math.abs(e.from)) * 100 : null;
          const dec = e.decimals ?? 1;
          const same = Math.abs(d) < Math.pow(10, -dec) / 2;
          return (
            <li key={e.label} className="font-display text-[13px] text-[var(--ink)] flex flex-wrap gap-x-1.5">
              <span className="text-[var(--ink2)]">⇒ {e.label}:</span>
              <span className="font-plex-mono">
                {e.from.toFixed(dec)} → {e.to.toFixed(dec)} {e.unit}
              </span>
              <span className="font-plex-mono font-bold">
                {same ? tx("(no change)", "(değişmedi)") : `(${d > 0 ? "▲ +" : "▼ "}${pct !== null ? `${pct.toFixed(0)}%` : d.toFixed(dec)})`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Short manual & glossary ───────────────────────────────────────── */

export function Manual({
  title,
  steps,
  glossary,
}: {
  title: string;
  steps: string[];
  glossary: { term: string; def: string }[];
}) {
  const tx = useTx();
  return (
    <details className="group bg-[var(--atlas-card)] border border-[var(--line)] open:border-[var(--frame)]">
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-2 font-display text-[14px] font-semibold text-[var(--ink)]">
          <BookOpen size={15} className="text-[var(--acc)]" />
          {title}
        </span>
        <span className="font-plex-mono text-[11px] text-[var(--mut)] group-open:hidden">{tx("Show", "Göster")} ▾</span>
        <span className="font-plex-mono text-[11px] text-[var(--mut)] hidden group-open:inline">{tx("Hide", "Gizle")} ▴</span>
      </summary>
      <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="font-plex-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--acc)]">
            {tx("How to use", "Nasıl kullanılır")}
          </div>
          <ol className="mt-2 flex flex-col gap-1.5 list-decimal pl-5 font-display text-[13.5px] leading-[1.55] text-[var(--ink2)]">
            {steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
        <div>
          <div className="font-plex-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--acc)]">
            {tx("Glossary", "Sözlük")}
          </div>
          <dl className="mt-2 flex flex-col gap-1.5 font-display text-[13px] leading-[1.5]">
            {glossary.map((g) => (
              <div key={g.term}>
                <dt className="inline font-semibold text-[var(--ink)]">{g.term}: </dt>
                <dd className="inline text-[var(--ink2)]">{g.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </details>
  );
}
