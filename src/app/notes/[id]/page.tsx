"use client";

import { useParams, notFound } from "next/navigation";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { findNote } from "@/content/notes";
import { BackLink } from "@/components/atlas/back-link";
import { TagChip } from "@/components/atlas/tag-chip";
import { ContentBlocks } from "@/components/atlas/content-blocks";

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useAtlas();
  const note = findNote(id);

  if (!note) notFound();

  const badgeBg = note.kind === "ROUTE" ? "var(--field)" : "var(--acc)";
  const badgeFg = note.kind === "ROUTE" ? "var(--paper)" : "var(--accInk)";

  return (
    <div className="px-6 md:px-11 pt-11 pb-18 flex justify-center">
      <div className="w-[min(840px,100%)]">
        <BackLink href="/notes">{t(copy.notes.back, lang)}</BackLink>

        <div className="flex gap-3 items-baseline mt-9 flex-wrap">
          <span
            className="font-plex-mono font-semibold text-[10px] tracking-[0.14em] px-2 py-1"
            style={{ background: badgeBg, color: badgeFg }}
          >
            {t(copy.noteBadge[note.kind], lang)}
          </span>
          <span className="font-plex-mono font-medium text-[11px] text-[var(--mut)]">
            {t(copy.notes.draftFieldNotes, lang)}
          </span>
        </div>

        <h1 className="mt-4 font-display font-semibold text-[32px] sm:text-[44px] leading-[1.12] tracking-[-0.02em] text-[var(--ink)]">
          {t(note.title, lang)}
        </h1>
        <p className="mt-4.5 font-display text-[18px] leading-[1.65] text-[var(--ink2)]">
          {t(note.desc, lang)}
        </p>
        <div className="flex gap-1.5 mt-4.5 flex-wrap">
          {note.tags.map((tg) => (
            <TagChip key={tg.en} label={t(tg, lang)} />
          ))}
        </div>
        <div className="mt-7 border-t-[1.5px] border-[var(--frame)]" />

        <ContentBlocks
          blocks={note.blocks}
          emptyLabel={t(copy.common.contentPending, lang)}
          emptyDesc={t(copy.notes.emptyDesc, lang)}
        />
      </div>
    </div>
  );
}
