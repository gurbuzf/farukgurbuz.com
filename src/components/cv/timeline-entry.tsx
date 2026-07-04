import type { TimelineEntry as TimelineEntryType } from "@/content/cv";
import { copy, t, type Lang } from "@/content/copy";

const BADGE_VAR: Record<TimelineEntryType["badge"], string> = {
  acc: "var(--acc)",
  field: "var(--field)",
  role: "var(--role)",
  contour: "var(--contour)",
  gold: "var(--gold)",
};

export function TimelineEntry({ entry, lang }: { entry: TimelineEntryType; lang: Lang }) {
  const badgeBg = BADGE_VAR[entry.badge];
  const badgeFg = entry.badge === "acc" ? "var(--accInk)" : "var(--paper)";

  if (entry.emphasized) {
    return (
      <div className="relative bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)] px-6 py-5">
        <span
          className="absolute -left-8 top-[26px] w-3 h-3 rounded-full border-[2.5px]"
          style={{ background: "var(--paper)", borderColor: "var(--frame)" }}
        />
        <div className="flex gap-2.5 items-baseline flex-wrap">
          <span
            className="font-plex-mono font-semibold text-[10px] tracking-[0.12em] px-2 py-[3px]"
            style={{ background: badgeBg, color: badgeFg }}
          >
            {t(copy.cvBadge[entry.kind], lang)}
          </span>
          <span className="font-plex-mono font-medium text-[12px] text-[var(--mut)]">
            {t(entry.meta, lang)}
          </span>
        </div>
        <div className="mt-2.5 font-display font-semibold text-[21px] text-[var(--ink)]">
          {entry.title ? t(entry.title, lang) : null}
        </div>
        <ul className="mt-2.5 pl-[18px] font-display text-[14px] leading-[1.65] text-[var(--ink2)] list-disc">
          {entry.bullets?.map((b, i) => (
            <li key={i}>{t(b, lang)}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="relative bg-[var(--atlas-card)] border border-[var(--line)] px-6 py-3.5">
      <span
        className="absolute -left-[30px] top-[18px] w-2 h-2 rounded-full border-2"
        style={{ background: badgeBg, borderColor: "var(--frame)" }}
      />
      <div className="flex gap-2.5 items-baseline flex-wrap">
        <span
          className="font-plex-mono font-semibold text-[10px] tracking-[0.12em] px-2 py-[3px]"
          style={{ background: badgeBg, color: badgeFg }}
        >
          {t(copy.cvBadge[entry.kind], lang)}
        </span>
        <span className="font-plex-mono font-medium text-[12px] text-[var(--mut)]">
          {t(entry.meta, lang)}
        </span>
      </div>
      <div className="mt-2 font-display font-medium text-[15px] leading-[1.5] text-[var(--ink)]">
        {entry.text ? t(entry.text, lang) : null}
      </div>
    </div>
  );
}
