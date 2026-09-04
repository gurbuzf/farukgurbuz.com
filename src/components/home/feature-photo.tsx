"use client";

import { copy, t, type Lang } from "@/content/copy";
import {
  GithubIcon,
  LinkedinIcon,
  ScholarIcon,
  MailIcon,
} from "@/components/ui/social-links";

export function FeaturePhoto({ lang }: { lang: Lang }) {
  return (
    <div className="group relative flex flex-col items-center sm:items-start gap-4 p-5 bg-[var(--atlas-card)]/90 backdrop-blur-md border-[1.5px] border-[var(--frame)] shadow-[8px_8px_0_var(--shadow)] hover:shadow-[12px_12px_0_var(--shadow)] transition-all duration-300 max-w-[300px]">
      {/* Subtle top corner tech accent */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[var(--acc)] rounded-xs pointer-events-none" />

      <div className="relative w-[210px] h-[250px] sm:w-[250px] sm:h-[290px] overflow-hidden border border-[var(--frame)] bg-[var(--paper)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/faruk.jpg"
          alt="Faruk Gürbüz"
          className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-102 transition-all duration-500 ease-out"
          style={{ objectPosition: "50% 18%" }}
        />

        {/* Floating live status indicator — green dot only */}
        <div className="absolute bottom-2.5 left-2.5 w-6 h-6 bg-[var(--paper)]/90 backdrop-blur-sm border border-[var(--frame)] rounded-full flex items-center justify-center shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-[16px] text-[var(--ink)] tracking-tight">
            Faruk Gürbüz
          </span>
          <span className="font-plex-mono text-[10px] font-semibold text-[var(--acc)]">
            M.Sc.
          </span>
        </div>

        <p className="font-display text-[12px] text-[var(--ink2)] leading-snug">
          {t(copy.home.profileRole, lang)}
        </p>

        {/* Quick Social Mini-Toolbar */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-[var(--line)]">
          <span className="font-plex-mono text-[9.5px] text-[var(--mut)] uppercase tracking-wider">
            {lang === "tr" ? "BAĞLANTILAR" : "CONNECT"}
          </span>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/gurbuzf"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="p-1.5 text-[var(--ink)] hover:text-[var(--acc)] hover:bg-[var(--paper)] rounded-sm transition-colors"
            >
              <GithubIcon size={14} />
            </a>
            <a
              href="https://scholar.google.com/citations?user=CVfKPpUAAAAJ&hl=tr"
              target="_blank"
              rel="noopener noreferrer"
              title="Google Scholar"
              className="p-1.5 text-[var(--ink)] hover:text-[var(--acc)] hover:bg-[var(--paper)] rounded-sm transition-colors"
            >
              <ScholarIcon size={14} />
            </a>
            <a
              href="https://www.linkedin.com/in/faruk-gurbuz"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              className="p-1.5 text-[var(--ink)] hover:text-[var(--acc)] hover:bg-[var(--paper)] rounded-sm transition-colors"
            >
              <LinkedinIcon size={14} />
            </a>
            <a
              href="mailto:gurbuzfrk@gmail.com"
              title="Email"
              className="p-1.5 text-[var(--ink)] hover:text-[var(--acc)] hover:bg-[var(--paper)] rounded-sm transition-colors"
            >
              <MailIcon size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
