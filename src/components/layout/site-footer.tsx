"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";

export function SiteFooter() {
  const { lang } = useAtlas();

  const FOOTER_LINKS = [
    { label: t(copy.footer.email, lang), href: "mailto:gurbuzfrk@gmail.com" },
    { label: t(copy.footer.github, lang), href: "https://github.com/gurbuzf" },
    { label: t(copy.footer.linkedin, lang), href: "https://www.linkedin.com/in/faruk-gurbuz" },
    { label: t(copy.footer.scholar, lang), href: "https://scholar.google.com/citations?user=CVfKPpUAAAAJ&hl=tr" },
  ];

  return (
    <footer className="mt-auto flex items-center justify-between gap-4 flex-wrap px-7 py-3.5 border-t-[1.5px] border-[var(--frame)] flex-none">
      <span className="font-plex-mono font-medium text-[10px] tracking-[0.12em] text-[var(--mut)]">
        {t(copy.footer.copyright, lang)}
      </span>
      <div className="flex gap-[18px] font-plex-mono font-medium text-[11px]">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener" : undefined}
            className="text-[var(--ink)] no-underline"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
