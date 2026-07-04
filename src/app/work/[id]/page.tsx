"use client";

import { useParams, notFound } from "next/navigation";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { findProject } from "@/content/projects";
import { BackLink } from "@/components/atlas/back-link";
import { TagChip } from "@/components/atlas/tag-chip";
import { ContentBlocks } from "@/components/atlas/content-blocks";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useAtlas();
  const project = findProject(id);

  if (!project) notFound();

  return (
    <div className="px-6 md:px-11 pt-11 pb-18 flex justify-center">
      <div className="w-[min(840px,100%)]">
        <BackLink href="/work">{t(copy.work.back, lang)}</BackLink>

        <div className="flex gap-3 items-baseline mt-9 flex-wrap">
          <span className="font-plex-mono font-semibold text-[10px] tracking-[0.14em] px-2 py-1 bg-[var(--acc)] text-[var(--accInk)]">
            {t(project.tag, lang)}
          </span>
          <span className="font-plex-mono font-medium text-[11px] text-[var(--mut)]">
            {project.year} · {t(copy.work.workTag, lang)}
          </span>
        </div>

        <h1 className="mt-4 font-display font-semibold text-[32px] sm:text-[44px] leading-[1.12] tracking-[-0.02em] text-[var(--ink)]">
          {project.title}
        </h1>
        <p className="mt-4.5 font-display text-[18px] leading-[1.65] text-[var(--ink2)]">
          {t(project.desc, lang)}
        </p>
        <div className="flex gap-1.5 mt-4.5 flex-wrap">
          {project.tech.map((tc) => (
            <TagChip key={tc} label={tc} />
          ))}
        </div>
        <div className="mt-7 border-t-[1.5px] border-[var(--frame)]" />

        <ContentBlocks
          blocks={project.blocks}
          emptyLabel={t(copy.common.contentPending, lang)}
          emptyDesc={t(copy.work.emptyDesc, lang)}
        />
      </div>
    </div>
  );
}
