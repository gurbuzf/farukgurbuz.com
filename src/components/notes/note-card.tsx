"use client";

import Link from "next/link";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { TagChip } from "@/components/atlas/tag-chip";
import type { FieldNote } from "@/content/types";

export function NoteCard({ note }: { note: FieldNote }) {
  const { lang } = useAtlas();
  const badgeBg = note.kind === "ROUTE" ? "var(--field)" : "var(--acc)";
  const badgeFg = note.kind === "ROUTE" ? "var(--paper)" : "var(--accInk)";

  return (
    <Link
      href={`/notes/${note.id}`}
      className="cursor-pointer bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)] px-[26px] py-[22px] flex flex-col gap-2.5 hover:shadow-[8px_8px_0_var(--shadow)] hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div className="flex justify-between items-baseline">
        <span
          className="font-plex-mono font-semibold text-[10px] tracking-[0.14em] px-2 py-1"
          style={{ background: badgeBg, color: badgeFg }}
        >
          {t(copy.noteBadge[note.kind], lang)}
        </span>
        <span className="font-plex-mono font-medium text-[11px] text-[var(--mut)]">
          {t(copy.notes.draftLabel, lang)}
        </span>
      </div>
      <div className="font-display font-semibold text-[22px] leading-[1.25] text-[var(--ink)]">
        {t(note.title, lang)}
      </div>
      <div className="font-display text-[14px] leading-[1.6] text-[var(--ink2)]">
        {t(note.desc, lang)}
      </div>
      <div className="flex justify-between items-center mt-auto">
        <div className="flex gap-1.5 flex-wrap">
          {note.tags.map((tg) => (
            <TagChip key={tg.en} label={t(tg, lang)} />
          ))}
        </div>
        <span className="font-plex-mono font-semibold text-[12px] text-[var(--acc)] whitespace-nowrap">
          {t(copy.notes.read, lang)}
        </span>
      </div>
    </Link>
  );
}
