"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAtlas } from "@/lib/atlas-provider";
import { navLabels, sheetLabels, t } from "@/content/copy";
import { getNavKey, getPageKey, type NavKey } from "@/lib/page-key";

const NAV_ORDER: { key: NavKey; href: string }[] = [
  { key: "home", href: "/" },
  { key: "notes", href: "/notes" },
  { key: "work", href: "/work" },
  { key: "cv", href: "/cv" },
  { key: "travels", href: "/travels" },
  { key: "pubs", href: "/publications" },
];

export function SiteHeader() {
  const { lang, dark, toggleLang, toggleDark } = useAtlas();
  const pathname = usePathname();
  const pageKey = getPageKey(pathname);
  const activeNav = getNavKey(pageKey);
  const sheetLabel = t(sheetLabels[pageKey], lang);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5 px-4 md:px-7 py-3 md:py-0 md:h-16 border-b-[1.5px] border-[var(--frame)] flex-none">
      <Link href="/" className="flex items-center gap-3 cursor-pointer">
        <img
          src={dark ? "/images/logo-white.png" : "/images/logo-navy.png"}
          alt="g. logo"
          className="h-[30px] w-auto block"
        />
        <span className="font-plex-mono font-semibold text-[12px] tracking-[0.12em] text-[var(--ink)]">
          PERSONAL ATLAS — {sheetLabel}
        </span>
      </Link>
      <div className="flex items-center gap-3 md:gap-[22px] flex-wrap">
        {NAV_ORDER.map((item) => {
          const active = item.key === activeNav;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="cursor-pointer whitespace-nowrap font-plex-mono font-medium text-[11px] md:text-[12px] tracking-[0.12em] py-1 border-b-2"
              style={{
                color: active ? "var(--acc)" : "var(--ink)",
                borderColor: active ? "var(--acc)" : "transparent",
              }}
            >
              {t(navLabels[item.key], lang)}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={toggleLang}
          className="cursor-pointer flex-none whitespace-nowrap px-3 py-1 border border-[var(--frame)] rounded-full font-plex-mono font-semibold text-[11px] text-[var(--ink)]"
        >
          <span style={{ opacity: lang === "en" ? 1 : 0.4 }}>EN</span>
          <span className="opacity-40"> · </span>
          <span style={{ opacity: lang === "tr" ? 1 : 0.4 }}>TR</span>
        </button>
        <button
          type="button"
          onClick={toggleDark}
          title="Light / dark"
          className="cursor-pointer text-[16px] leading-none text-[var(--ink)]"
        >
          {dark ? "◑" : "◐"}
        </button>
      </div>
    </div>
  );
}
