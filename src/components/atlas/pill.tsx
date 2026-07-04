import type { ReactNode } from "react";

export function Pill({ children, filled = false }: { children: ReactNode; filled?: boolean }) {
  return (
    <span
      className="px-3.5 py-[7px] border-[1.5px] border-[var(--frame)] rounded-full font-plex-mono font-semibold text-[12px]"
      style={{
        color: filled ? "var(--paper)" : "var(--ink)",
        background: filled ? "var(--frame)" : "transparent",
      }}
    >
      {children}
    </span>
  );
}
