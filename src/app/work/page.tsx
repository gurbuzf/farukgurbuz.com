"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { projects } from "@/content/projects";
import { ProjectCard } from "@/components/work/project-card";

export default function WorkPage() {
  const { lang } = useAtlas();

  return (
    <div data-screen-label="Work — projects" className="px-6 md:px-11 pt-14 pb-16">
      <div className="font-plex-mono font-medium text-[12px] tracking-[0.16em] text-[var(--acc)]">
        {t(copy.work.sheetEyebrow, lang)}
      </div>
      <h1 className="mt-3 font-display font-semibold text-[36px] sm:text-[54px] leading-[1.02] tracking-[-0.02em] text-[var(--ink)]">
        {t(copy.work.title, lang)}
      </h1>
      <p className="mt-3.5 max-w-[640px] font-display text-[16px] leading-[1.6] text-[var(--ink2)]">
        {t(copy.work.desc, lang)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-9">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <div className="mt-7 font-plex-mono font-medium text-[12px] text-[var(--mut)]">
        {t(copy.work.sourceLabel, lang)}{" "}
        <a
          href="https://github.com/gurbuzf"
          target="_blank"
          rel="noopener"
          className="text-[var(--acc)]"
        >
          github.com/gurbuzf
        </a>
      </div>
    </div>
  );
}
