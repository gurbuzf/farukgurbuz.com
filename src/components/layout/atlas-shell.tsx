"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function AtlasShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      className={`min-h-screen p-0 min-[1400px]:p-3 flex justify-center ${
        isHome ? "min-[1100px]:h-dvh min-[1100px]:max-h-dvh min-[1100px]:overflow-hidden" : ""
      }`}
    >
      <div
        className={`w-[min(1400px,100%)] bg-[var(--paper)] border-0 min-[1400px]:border-[1.5px] border-[var(--frame)] flex flex-col ${
          isHome
            ? "min-[1100px]:h-full min-[1100px]:max-h-full min-[1100px]:overflow-hidden justify-between"
            : ""
        }`}
      >
        <SiteHeader />
        <main
          className={`flex flex-col flex-1 min-h-0 ${
            isHome ? "min-[1100px]:justify-center min-[1100px]:overflow-hidden" : ""
          }`}
        >
          {children}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

