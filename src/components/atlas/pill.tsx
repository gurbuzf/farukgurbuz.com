import type { ReactNode } from "react";

export function Pill({ children, filled = false }: { children: ReactNode; filled?: boolean }) {
  return (
    <span
      className="px-3.5 py-[7px] border-[1.5px] border-[var(--frame)] rounded-full font-plex-mono font-semibold text-[12px] inline-block transition-transform duration-300 ease-out hover:-translate-y-[2px] hover:border-[var(--acc)]"
      style={{
        color: filled ? "var(--paper)" : "var(--ink)",
        background: filled ? "var(--frame)" : "transparent",
      }}
    >
      {children}
    </span>
  );
}
