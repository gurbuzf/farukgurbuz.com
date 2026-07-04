"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import Script from "next/script";
import type { Lang } from "@/content/copy";

type AtlasContextValue = {
  lang: Lang;
  dark: boolean;
  toggleLang: () => void;
  toggleDark: () => void;
};

const AtlasContext = createContext<AtlasContextValue | null>(null);

const STORAGE_KEY = "fg-atlas-prefs";

const INLINE_THEME_SCRIPT = `
(function () {
  try {
    var saved = JSON.parse(localStorage.getItem('${STORAGE_KEY}') || '{}');
    if (saved.dark) document.documentElement.setAttribute('data-atlas-dark', 'true');
  } catch (e) {}
})();
`;

export function AtlasProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      if (saved.lang === "tr" || saved.lang === "en") setLang(saved.lang);
      if (typeof saved.dark === "boolean") setDark(saved.dark);
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-atlas-dark", dark ? "true" : "false");
  }, [dark]);

  const persist = useCallback((next: { lang: Lang; dark: boolean }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "tr" : "en";
      persist({ lang: next, dark });
      return next;
    });
  }, [dark, persist]);

  const toggleDark = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      persist({ lang, dark: next });
      return next;
    });
  }, [lang, persist]);

  return (
    <AtlasContext.Provider value={{ lang, dark, toggleLang, toggleDark }}>
      <Script id="atlas-theme-init" strategy="beforeInteractive">
        {INLINE_THEME_SCRIPT}
      </Script>
      {children}
    </AtlasContext.Provider>
  );
}

export function useAtlas() {
  const ctx = useContext(AtlasContext);
  if (!ctx) throw new Error("useAtlas must be used within an AtlasProvider");
  return ctx;
}
