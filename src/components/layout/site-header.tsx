"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAtlas } from "@/lib/atlas-provider";
import { navLabels, t } from "@/content/copy";
import { getNavKey, getPageKey, type NavKey } from "@/lib/page-key";
import { SocialLinks } from "@/components/ui/social-links";

const NAV_ORDER: { key: NavKey; href: string }[] = [
  { key: "home", href: "/" },
  { key: "lab", href: "/lab" },
  { key: "cv", href: "/cv" },
  { key: "pubs", href: "/publications" },
];

export function SiteHeader() {
  const { lang, dark, toggleLang, toggleDark } = useAtlas();
  const pathname = usePathname();
  const pageKey = getPageKey(pathname);
  const activeNav = getNavKey(pageKey);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const langToggle = (
    <button
      type="button"
      onClick={toggleLang}
      aria-label="Toggle language (English / Turkish)"
      className="cursor-pointer flex-none whitespace-nowrap px-3 py-1 border border-[var(--frame)] rounded-full font-plex-mono font-semibold text-[11px] text-[var(--ink)] hover:bg-[var(--paper)] hover:border-[var(--acc)] transition-colors"
    >
      <span style={{ opacity: lang === "en" ? 1 : 0.35 }}>EN</span>
      <span className="opacity-35"> · </span>
      <span style={{ opacity: lang === "tr" ? 1 : 0.35 }}>TR</span>
    </button>
  );

  const darkToggle = (
    <button
      type="button"
      onClick={toggleDark}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="cursor-pointer text-[16px] leading-none text-[var(--ink)] hover:text-[var(--acc)] transition-colors p-1"
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
    const isLab = item.key === "lab";

    if (isLab) {
      return (
        <Link
          key={item.key}
          href={item.href}
          className={`cursor-pointer whitespace-nowrap font-plex-mono font-bold text-[11px] tracking-[0.12em] px-3 py-2 rounded-xs border transition-all my-1 text-center w-fit shadow-xs ${
            dark
              ? "bg-[#f6f3ec] text-[#0b1526] border-[#f6f3ec] hover:bg-white hover:text-black"
              : "bg-[#16223a] text-[#f6f3ec] border-[#16223a] hover:bg-[var(--acc)] hover:border-[var(--acc)] hover:text-white"
          } ${active ? "ring-2 ring-[var(--acc)] ring-offset-1 ring-offset-[var(--paper)]" : ""}`}
        >
          {t(navLabels[item.key], lang)}
        </Link>
      );
    }

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
    <header className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 lg:px-10 py-3 sm:py-0 sm:h-16 border-b-[1.5px] border-[var(--frame)] bg-[var(--paper)]/95 backdrop-blur-md sticky top-0 z-40 flex-none transition-colors">
      <div className="flex items-center justify-between sm:contents">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <img
            src={dark ? "/images/logo-white.png" : "/images/logo-navy.png"}
            alt="Faruk Gürbüz logo"
            className="h-[34px] sm:h-[28px] w-auto block group-hover:scale-105 transition-transform"
          />
          <span className="hidden sm:inline font-plex-mono font-bold text-[13px] tracking-[0.16em] text-[var(--ink)]">
            FARUK GÜRBÜZ
          </span>
        </Link>

        {/* Mobile quick controls */}
        <div className="flex sm:hidden items-center gap-2">
          {langToggle}
          {darkToggle}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="cursor-pointer w-9 h-9 flex items-center justify-center bg-[var(--paper)] border border-[var(--frame)] shadow-xs"
          >
            {hamburgerBars}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 z-40 bg-[var(--atlas-card)] border-b-[1.5px] border-[var(--frame)] shadow-[0_8px_16px_var(--shadow)] flex flex-col px-6 py-4 gap-2">
          {navDropdownLinks}
        </div>
      )}

      {/* Desktop navigation & social quick links */}
      <div className="hidden sm:flex items-center gap-6">
        <nav className="flex items-center gap-5">
          {NAV_ORDER.map((item) => {
            const active = item.key === activeNav;
            const isLab = item.key === "lab";

            if (isLab) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`cursor-pointer whitespace-nowrap font-plex-mono font-bold text-[11.5px] tracking-[0.14em] px-3.5 py-1.5 rounded-xs border transition-all shadow-xs ${
                    dark
                      ? "bg-[#f6f3ec] text-[#0b1526] border-[#f6f3ec] hover:bg-white hover:text-black"
                      : "bg-[#16223a] text-[#f6f3ec] border-[#16223a] hover:bg-[var(--acc)] hover:border-[var(--acc)] hover:text-white"
                  } ${
                    active
                      ? "ring-2 ring-[var(--acc)] ring-offset-2 ring-offset-[var(--paper)]"
                      : ""
                  }`}
                >
                  {t(navLabels[item.key], lang)}
                </Link>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                className="cursor-pointer whitespace-nowrap font-plex-mono font-semibold text-[12px] tracking-[0.14em] py-1 border-b-2 transition-all hover:text-[var(--acc)]"
                style={{
                  color: active ? "var(--acc)" : "var(--ink)",
                  borderColor: active ? "var(--acc)" : "transparent",
                }}
              >
                {t(navLabels[item.key], lang)}
              </Link>
            );
          })}
        </nav>

        <div className="w-px h-4 bg-[var(--line)]" />

        {/* Social Icons with Tooltips */}
        <SocialLinks variant="header" />

        <div className="w-px h-4 bg-[var(--line)]" />

        {/* Lang & Theme toggles */}
        <div className="flex items-center gap-3">
          {langToggle}
          {darkToggle}
        </div>
      </div>
    </header>
  );
}
