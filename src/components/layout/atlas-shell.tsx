import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function AtlasShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-0 min-[1400px]:p-4 flex justify-center">
      <div className="w-[min(1400px,100%)] bg-[var(--paper)] border-0 min-[1400px]:border-[1.5px] border-[var(--frame)] flex flex-col">
        <SiteHeader />
        <main className="flex flex-col flex-1 min-h-0">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
