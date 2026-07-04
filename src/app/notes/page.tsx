"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { notes } from "@/content/notes";
import { NoteCard } from "@/components/notes/note-card";

export default function NotesPage() {
  const { lang } = useAtlas();

  return (
    <div data-screen-label="Field Notes — writing" className="px-6 md:px-11 pt-14 pb-16">
      <div className="font-plex-mono font-medium text-[12px] tracking-[0.16em] text-[var(--acc)]">
        {t(copy.notes.sheetEyebrow, lang)}
      </div>
      <h2 className="mt-3 font-display font-semibold text-[36px] sm:text-[54px] leading-[1.02] tracking-[-0.02em] text-[var(--ink)]">
        {t(copy.notes.title, lang)}
      </h2>
      <p className="mt-3.5 max-w-[640px] font-display text-[16px] leading-[1.6] text-[var(--ink2)]">
        {t(copy.notes.desc, lang)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-9">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
      <div className="mt-7 font-display text-[13px] text-[var(--mut)]">{t(copy.notes.footerNote, lang)}</div>
    </div>
  );
}
