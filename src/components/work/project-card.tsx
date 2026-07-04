"use client";

import Link from "next/link";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { TagChip } from "@/components/atlas/tag-chip";
import type { Project } from "@/content/types";

export function ProjectCard({ project }: { project: Project }) {
  const { lang } = useAtlas();

  return (
    <Link
      href={`/work/${project.id}`}
      className="cursor-pointer bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)] px-6 py-[22px] flex flex-col gap-3 hover:shadow-[8px_8px_0_var(--shadow)] hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div className="flex justify-between items-baseline">
        <span className="font-plex-mono font-semibold text-[10px] tracking-[0.14em] px-2 py-1 bg-[var(--acc)] text-[var(--accInk)]">
          {t(project.tag, lang)}
        </span>
        <span className="font-plex-mono font-medium text-[11px] text-[var(--mut)]">{project.year}</span>
      </div>
      <div className="font-display font-semibold text-[20px] leading-[1.2] text-[var(--ink)]">
        {project.title}
      </div>
      <div className="font-display text-[13.5px] leading-[1.55] text-[var(--ink2)] flex-1">
        {t(project.desc, lang)}
      </div>
      <div className="flex justify-between items-center gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((tc) => (
            <TagChip key={tc} label={tc} />
          ))}
        </div>
        <span className="font-plex-mono font-semibold text-[12px] text-[var(--acc)] whitespace-nowrap">
          {t(copy.work.open, lang)}
        </span>
      </div>
    </Link>
  );
}
