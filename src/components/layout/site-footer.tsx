"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { SocialLinks } from "@/components/ui/social-links";

export function SiteFooter() {
  const { lang } = useAtlas();

  return (
    <footer className="mt-auto border-t-[1.5px] border-[var(--frame)] bg-[var(--paper)] py-8 px-6 sm:px-10 lg:px-14 flex flex-col sm:flex-row items-center justify-between gap-6 flex-none">
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <span className="font-plex-mono font-semibold text-[11px] tracking-[0.14em] text-[var(--ink)]">
          FARUK GÜRBÜZ
        </span>
        <span className="font-plex-mono text-[10px] tracking-[0.08em] text-[var(--mut)]">
          {t(copy.footer.copyright, lang)}
        </span>
      </div>

      {/* Social links hidden on mobile (< sm) to prevent clutter and repetition */}
      <div className="hidden sm:flex items-center gap-3">
        <SocialLinks variant="footer" />
      </div>
    </footer>
  );
}
