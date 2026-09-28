"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { SocialLinks } from "@/components/ui/social-links";

export function SiteFooter() {
  const { lang } = useAtlas();

  return (
    <footer className="mt-auto border-t-[1.5px] border-[var(--frame)] bg-[var(--paper)] py-4 sm:py-3 min-[1400px]:py-2.5 px-6 sm:px-10 lg:px-14 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 flex-none">
      <span className="font-plex-mono text-[11px] tracking-[0.12em] text-[var(--ink2)] text-center sm:text-left">
        {t(copy.footer.copyright, lang)}
      </span>

      {/* Social links hidden on mobile (< sm) to prevent clutter and repetition */}
      <div className="hidden sm:flex items-center gap-3">
        <SocialLinks variant="footer" />
      </div>
    </footer>
  );
}
