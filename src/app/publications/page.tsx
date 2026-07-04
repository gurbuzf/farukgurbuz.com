"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { publicationGroups } from "@/content/publications";

export default function PublicationsPage() {
  const { lang } = useAtlas();

  return (
    <div data-screen-label="Publications" className="px-6 md:px-11 pt-14 pb-16">
      <div className="font-plex-mono font-medium text-[12px] tracking-[0.16em] text-[var(--acc)]">
        {t(copy.pubs.sheetEyebrow, lang)}
      </div>
      <h1 className="mt-3 font-display font-semibold text-[36px] sm:text-[54px] leading-[1.02] tracking-[-0.02em] text-[var(--ink)]">
        {t(copy.pubs.title, lang)}
      </h1>

      <div className="max-w-[980px] mt-9 flex flex-col gap-[30px]">
        {publicationGroups.map((group) => (
          <div key={group.heading.en}>
            <div className="font-plex-mono font-semibold text-[11px] tracking-[0.16em] text-[var(--mut)] border-b-[1.5px] border-[var(--frame)] pb-2">
              {t(group.heading, lang)}
            </div>
            {group.entries.map((entry, i) => (
              <div
                key={entry.idLabel}
                className={`flex gap-3.5 py-4 ${
                  i < group.entries.length - 1 ? "border-b border-[var(--line)]" : ""
                }`}
              >
                <span
                  className="flex-none font-plex-mono font-semibold text-[11px] px-2 py-1 h-fit"
                  style={
                    entry.filled
                      ? { background: "var(--frame)", color: "var(--paper)" }
                      : { border: "1.5px solid var(--frame)", color: "var(--ink)" }
                  }
                >
                  {entry.idLabel}
                </span>
                <div>
                  <div className="font-display font-medium text-[16px] leading-[1.45] text-[var(--ink)]">
                    {entry.title}
                  </div>
                  <div className="mt-1.5 font-plex-mono text-[12.5px] text-[var(--mut)]">
                    {entry.authors.map((author, ai) => (
                      <span key={ai}>
                        {ai > 0 && ", "}
                        <span style={author === entry.highlightAuthor ? { color: "var(--acc)" } : undefined}>
                          {author}
                        </span>
                      </span>
                    ))}{" "}
                    · {entry.year} · {entry.venue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 font-plex-mono font-medium text-[12px] text-[var(--mut)]">
        {t(copy.pubs.fullRecord, lang)}{" "}
        <a href="https://scholar.google.com" target="_blank" rel="noopener" className="text-[var(--acc)]">
          Google Scholar →
        </a>
      </div>
    </div>
  );
}
