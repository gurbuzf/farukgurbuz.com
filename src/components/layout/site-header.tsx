"use client";

import { useEffect, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const langToggle = (
    <button
      type="button"
      onClick={toggleLang}
      className="cursor-pointer flex-none whitespace-nowrap px-3 py-1 border border-[var(--frame)] rounded-full font-plex-mono font-semibold text-[11px] text-[var(--ink)]"
    >
      <span style={{ opacity: lang === "en" ? 1 : 0.4 }}>EN</span>
      <span className="opacity-40"> · </span>
      <span style={{ opacity: lang === "tr" ? 1 : 0.4 }}>TR</span>
    </button>
  );

  const darkToggle = (
    <button
      type="button"
      onClick={toggleDark}
      title="Light / dark"
      className="cursor-pointer text-[16px] leading-none text-[var(--ink)]"
    >
      {dark ? "◑" : "◐"}
    </button>
  );

  const hamburgerBars = (
    <span className="flex flex-col gap-[5px]">
      <span
        className={`block w-5 h-[1.5px] bg-[var(--ink)] transition-transform ${
          menuOpen ? "rotate-45 translate-y-[6.5px]" : ""
        }`}
      />
      <span className={`block w-5 h-[1.5px] bg-[var(--ink)] transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
      <span
        className={`block w-5 h-[1.5px] bg-[var(--ink)] transition-transform ${
          menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
        }`}
      />
    </span>
  );

  const navDropdownLinks = NAV_ORDER.map((item) => {
    const active = item.key === activeNav;
    return (
      <Link
        key={item.key}
        href={item.href}
        className="cursor-pointer whitespace-nowrap font-plex-mono font-medium text-[12px] tracking-[0.12em] py-2 border-b border-[var(--line)]"
        style={{ color: active ? "var(--acc)" : "var(--ink)" }}
      >
        {t(navLabels[item.key], lang)}
      </Link>
    );
  });

  return (
    <header className="relative flex flex-col min-[1400px]:flex-row min-[1400px]:items-center min-[1400px]:justify-between gap-3 min-[1400px]:gap-5 px-4 min-[1400px]:px-7 py-3 min-[1400px]:py-0 min-[1400px]:h-16 border-b-[1.5px] border-[var(--frame)] flex-none">
      <div className="flex items-center justify-between min-[1400px]:contents">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <img
            src={dark ? "/images/logo-white.png" : "/images/logo-navy.png"}
            alt="g. logo"
            className="h-[30px] w-auto block"
          />
          <span className="font-plex-mono font-semibold text-[12px] tracking-[0.12em] text-[var(--ink)]">
            <span className="min-[1400px]:hidden">{sheetLabel}</span>
            <span className="hidden min-[1400px]:inline">PERSONAL ATLAS — {sheetLabel}</span>
          </span>
        </Link>

        {/* below 1400px (phone + every tablet): single row — lang + dark sit beside the title; hamburger is detached below */}
        <div className="flex min-[1400px]:hidden items-center gap-3">
          {langToggle}
          {darkToggle}
        </div>
      </div>

      {/* below 1400px (phone + every tablet): hamburger floats detached below the header row; menu opens as a non-reflowing overlay */}
      <div className="min-[1400px]:hidden absolute top-full right-4 mt-3 z-40">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="cursor-pointer w-11 h-11 flex items-center justify-center bg-[var(--paper)] border-[1.5px] border-[var(--frame)] shadow-[4px_4px_0_var(--shadow)]"
        >
          {hamburgerBars}
        </button>

        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 w-[220px] bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)] flex flex-col p-2 gap-1">
            {navDropdownLinks}
          </div>
        )}
      </div>

      <div className="hidden min-[1400px]:flex items-center gap-[22px] flex-wrap">
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
        {langToggle}
        {darkToggle}
      </div>
    </header>
  );
}
