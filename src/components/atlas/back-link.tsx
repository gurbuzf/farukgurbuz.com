import Link from "next/link";
import type { ReactNode } from "react";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="cursor-pointer inline-flex items-center gap-2 font-plex-mono font-semibold text-[11px] tracking-[0.12em] px-4 py-[9px] border-[1.5px] border-[var(--frame)] bg-[var(--atlas-card)] text-[var(--ink)] hover:bg-[var(--frame)] hover:text-[var(--paper)]"
    >
      ← {children}
    </Link>
  );
}
