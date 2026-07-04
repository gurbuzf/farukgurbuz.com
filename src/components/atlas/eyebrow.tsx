import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="font-plex-mono font-medium text-[12px] tracking-[0.16em] text-[var(--acc)]">
      {children}
    </div>
  );
}
