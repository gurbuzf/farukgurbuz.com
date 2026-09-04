"use client";

import Link from "next/link";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { FeaturePhoto } from "./feature-photo";
import { SocialLinks, GithubIcon, LinkedinIcon, ScholarIcon, MailIcon } from "@/components/ui/social-links";
import { ArrowRight, FileText, BookOpen } from "lucide-react";

export function HeroMap() {
  const { lang, dark } = useAtlas();

  return (
    <div
      data-screen-label="Home — Hero Section"
      className="relative overflow-hidden w-full flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-2 min-[1100px]:py-0 h-full"
    >
      {/* ── Dynamic ambient glowing aura (Uber/Apple style breathing atmosphere) ── */}
      <div
        className="absolute top-1/4 -left-20 w-[480px] h-[480px] rounded-full pointer-events-none opacity-20 dark:opacity-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--acc) 0%, transparent 70%)",
          animation: "contourDrift 10s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute bottom-10 right-10 w-[420px] h-[420px] rounded-full pointer-events-none opacity-15 dark:opacity-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)",
          animation: "contourDrift 12s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* ── Subtle background topography texture ── */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 dark:opacity-10"
        style={{
          backgroundImage: "url('/images/terrain.png')",
          filter: "grayscale(30%) contrast(110%)",
        }}
      />

      {/* ── Soft gradient fade ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, var(--paper) 0%, color-mix(in srgb, var(--paper) 90%, transparent) 50%, color-mix(in srgb, var(--paper) 65%, transparent) 100%)",
        }}
      />

      {/* ── Modern technical grid dots ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Main Hero Content ── */}
      <div className="relative z-10 w-full max-w-[1140px] mx-auto flex-1 flex flex-col min-[1100px]:flex-row items-center justify-between gap-6 min-[1100px]:gap-10 py-2 min-[1100px]:py-2">
        {/* ── A. MOBILE & TABLET BESPOKE LAYOUT (< 1100px) ── */}
        <div className="flex min-[1100px]:hidden flex-col flex-1 justify-between w-full py-2 gap-4 sm:gap-6">
          {/* 1. Geodetic Hero Identity Crown */}
          <div className="flex flex-col items-center text-center pt-1">
            {/* Surveyor Lens Avatar with Geodetic Coordinate Ring */}
            <div className="relative flex items-center justify-center mb-3">
              {/* Topographic compass ring */}
              <div className="absolute -inset-2.5 rounded-full border border-dashed border-[var(--acc)]/35 animate-[spin_40s_linear_infinite]" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[var(--frame)] bg-[var(--paper)] shadow-[0_4px_16px_var(--shadow)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/faruk.jpg"
                  alt="Faruk Gürbüz"
                  className="w-full h-full object-cover grayscale-[10%]"
                  style={{ objectPosition: "50% 18%" }}
                />
              </div>
              {/* Geodetic Coordinates & Status Pill */}
              <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-[var(--paper)]/95 backdrop-blur-md border border-[var(--frame)] shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span className="font-plex-mono text-[9px] font-bold tracking-wider text-[var(--ink)]">
                  {lang === "tr" ? "İSTANBUL · 41°N 28°E" : "ISTANBUL · 41°N 28°E"}
                </span>
              </div>
            </div>

            {/* Name */}
            <h1 className="mt-2 font-display font-extrabold text-[32px] sm:text-[38px] leading-tight tracking-[-0.03em] text-[var(--ink)]">
              Faruk Gürbüz
            </h1>

            {/* Dual Science Disciplines (Precision Badges) */}
            <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-700 dark:text-sky-300 font-plex-mono text-[10.5px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-none" />
                <span>{lang === "tr" ? "Su Kaynakları Mühendisi" : "Water Resources Engineer"}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-plex-mono text-[10.5px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-none" />
                <span>{lang === "tr" ? "Mekansal Veri Bilimci" : "Geospatial Data Scientist"}</span>
              </div>
            </div>

            {/* Introduction Narrative */}
            <p className="mt-2.5 font-display text-[14px] sm:text-[15.5px] leading-[1.6] text-[var(--ink2)] max-w-[460px] mx-auto">
              {t(copy.home.heroDesc, lang)}
            </p>
          </div>

          {/* 2. Crown Jewel: Hydrology Lab Interactive Instrument Card */}
          <Link
            href="/lab"
            className="group relative overflow-hidden rounded-xl border border-sky-500/40 bg-gradient-to-br from-[#0c1628] via-[#0f203c] to-[#0a1424] text-white p-4 sm:p-5 shadow-[0_12px_28px_-8px_rgba(2,132,199,0.35)] transition-all duration-300 active:scale-[0.98]"
          >
            {/* Ambient glowing wave backdrop */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-sky-500/15 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

            {/* Card Top Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                </span>
                <span className="font-plex-mono font-bold text-[10px] tracking-[0.16em] text-sky-400 uppercase">
                  {lang === "tr" ? "İNTERAKTİF CBS // DENEY 01" : "INTERACTIVE GIS // EXP 01"}
                </span>
              </div>
              <span className="font-plex-mono text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-sky-200 border border-white/15">
                D8 DEM ENGINE
              </span>
            </div>

            {/* Center Flow Graphic & Title */}
            <div className="relative z-10 my-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-[17px] sm:text-[19px] tracking-tight text-white group-hover:text-sky-300 transition-colors">
                    {lang === "tr" ? "Havza Sınırlandırma & Akış Yönlendirme" : "Watershed Delineation & Flow Routing"}
                  </h2>
                  <p className="font-display text-[12px] text-slate-300 mt-0.5">
                    {lang === "tr"
                      ? "Anlık hidrograf & deterministik D8 akış simülasyonu"
                      : "Real-time hydrograph & deterministic D8 flow simulation"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 group-hover:bg-sky-400 group-hover:text-black group-hover:scale-110 transition-all flex-none ml-2 shadow-xs">
                  <ArrowRight size={18} />
                </div>
              </div>

              {/* Technical Indicator Sub-bar */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between font-plex-mono text-[9.5px] text-slate-400">
                <span>{lang === "tr" ? "Izgara: 1 km DEM" : "Grid: 1 km DEM"}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {lang === "tr" ? "Etkileşimli Simülasyon" : "Interactive Simulation"}
                </span>
                <span className="text-sky-300 font-semibold">{lang === "tr" ? "Başlat ⚡" : "Launch ⚡"}</span>
              </div>
            </div>
          </Link>

          {/* 3. Dual Exploration Grid (CV & Publications) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
            {/* CV Card */}
            <Link
              href="/cv"
              className="group relative flex flex-col justify-between p-3.5 rounded-lg bg-[var(--atlas-card)]/90 backdrop-blur-md border-[1.5px] border-[var(--frame)] shadow-xs hover:border-[var(--acc)] active:scale-[0.98] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-md bg-[var(--paper)] border border-[var(--frame)] flex items-center justify-center text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors">
                  <FileText size={15} />
                </div>
                <span className="font-plex-mono text-[9px] font-bold text-[var(--mut)] uppercase tracking-wider">
                  ATLAS // 02
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-[13.5px] text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors">
                    {lang === "tr" ? "İnteraktif CV" : "Curriculum Vitae"}
                  </h3>
                  <ArrowRight size={13} className="text-[var(--mut)] group-hover:translate-x-0.5 group-hover:text-[var(--acc)] transition-all" />
                </div>
                <p className="font-display text-[11px] text-[var(--ink2)] mt-0.5">
                  {lang === "tr" ? "Kariyer & Uzmanlıklar" : "Experience & Career"}
                </p>
              </div>
            </Link>

            {/* Publications Card */}
            <Link
              href="/publications"
              className="group relative flex flex-col justify-between p-3.5 rounded-lg bg-[var(--atlas-card)]/90 backdrop-blur-md border-[1.5px] border-[var(--frame)] shadow-xs hover:border-[var(--acc)] active:scale-[0.98] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-md bg-[var(--paper)] border border-[var(--frame)] flex items-center justify-center text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors">
                  <BookOpen size={15} />
                </div>
                <span className="font-plex-mono text-[9px] font-bold text-[var(--mut)] uppercase tracking-wider">
                  ATLAS // 03
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-[13.5px] text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors">
                    {lang === "tr" ? "Yayınlar" : "Publications"}
                  </h3>
                  <ArrowRight size={13} className="text-[var(--mut)] group-hover:translate-x-0.5 group-hover:text-[var(--acc)] transition-all" />
                </div>
                <p className="font-display text-[11px] text-[var(--ink2)] mt-0.5">
                  {lang === "tr" ? "Akademik Makaleler" : "Peer-Reviewed Works"}
                </p>
              </div>
            </Link>
          </div>

          {/* 4. The Cartographer's Dock: Floating Glass Social Capsule */}
          <div className="w-full p-2 rounded-xl bg-[var(--atlas-card)]/80 backdrop-blur-md border border-[var(--frame)]/40 shadow-xs flex items-center justify-between gap-2">
            <a
              href="https://github.com/gurbuzf"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub (@gurbuzf)"
              aria-label="GitHub"
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-[var(--paper)]/80 border border-[var(--frame)]/40 hover:border-[var(--acc)] active:scale-95 transition-all text-center group"
            >
              <GithubIcon size={20} className="text-[var(--ink)] group-hover:scale-110 transition-transform" />
              <span className="font-plex-mono text-[9.5px] font-bold text-[var(--ink)] mt-1">GitHub</span>
            </a>

            <a
              href="https://scholar.google.com/citations?user=CVfKPpUAAAAJ&hl=tr"
              target="_blank"
              rel="noopener noreferrer"
              title="Google Scholar"
              aria-label="Google Scholar"
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-[var(--paper)]/80 border border-[var(--frame)]/40 hover:border-[var(--acc)] active:scale-95 transition-all text-center group"
            >
              <ScholarIcon size={20} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="font-plex-mono text-[9.5px] font-bold text-[var(--ink)] mt-1">Scholar</span>
            </a>

            <a
              href="https://www.linkedin.com/in/faruk-gurbuz"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              aria-label="LinkedIn"
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-[var(--paper)]/80 border border-[var(--frame)]/40 hover:border-[var(--acc)] active:scale-95 transition-all text-center group"
            >
              <LinkedinIcon size={20} className="text-[#0077b5] dark:text-[#38a1db] group-hover:scale-110 transition-transform" />
              <span className="font-plex-mono text-[9.5px] font-bold text-[var(--ink)] mt-1">LinkedIn</span>
            </a>

            <a
              href="mailto:gurbuzfrk@gmail.com"
              title="Email (gurbuzfrk@gmail.com)"
              aria-label="Email"
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-[var(--paper)]/80 border border-[var(--frame)]/40 hover:border-[var(--acc)] active:scale-95 transition-all text-center group"
            >
              <MailIcon size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
              <span className="font-plex-mono text-[9.5px] font-bold text-[var(--ink)] mt-1">
                {lang === "tr" ? "E-Posta" : "Email"}
              </span>
            </a>
          </div>
        </div>

        {/* ── B. DESKTOP TWO-COLUMN LAYOUT (>= 1100px) — Compact Single-Viewport Framing ── */}
        <div className="hidden min-[1100px]:flex flex-col max-w-[620px]">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[var(--atlas-card)] border border-[var(--frame)] rounded-full w-fit shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--acc)] animate-pulse" />
            <span className="font-plex-mono font-bold text-[10px] tracking-[0.18em] text-[var(--acc)] uppercase">
              {t(copy.home.heroEyebrow, lang)}
            </span>
          </div>

          {/* Large Hero Name */}
          <h1 className="mt-2 font-display font-bold text-[48px] lg:text-[56px] xl:text-[64px] leading-[0.98] tracking-[-0.035em] text-[var(--ink)]">
            Faruk Gürbüz
          </h1>

          {/* Core Professional Disciplines (Clean Pill Badges) */}
          <div
            className="flex items-center gap-2 mt-2 text-[11px] font-plex-mono select-none flex-wrap"
            aria-label="Core disciplines"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-700 dark:text-sky-300 font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              <span>{lang === "tr" ? "Su Kaynakları Mühendisi" : "Water Resources Engineer"}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{lang === "tr" ? "Mekansal Veri Bilimci" : "Geospatial Data Scientist"}</span>
            </div>
          </div>

          {/* Introduction narrative */}
          <p className="mt-2.5 font-display text-[14px] lg:text-[15px] leading-[1.55] text-[var(--ink2)] max-w-[560px]">
            {t(copy.home.heroDesc, lang)}
          </p>

          {/* Featured Hydrology Lab Instrument Card (Desktop Edition) */}
          <div className="mt-3 flex flex-col gap-2.5">
            <Link
              href="/lab"
              className="group relative overflow-hidden rounded-xl border border-sky-500/40 bg-gradient-to-br from-[#0c1628] via-[#0f203c] to-[#0a1424] text-white p-3.5 sm:p-4 shadow-[0_8px_24px_-6px_rgba(2,132,199,0.35)] hover:shadow-[0_12px_28px_-4px_rgba(2,132,199,0.45)] hover:border-sky-400/60 transition-all duration-300 active:scale-[0.99]"
            >
              {/* Ambient glowing aura */}
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-sky-500/15 blur-2xl pointer-events-none group-hover:bg-sky-500/25 transition-all" />
              <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-36 h-36 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none group-hover:bg-emerald-500/25 transition-all" />

              {/* Card Top Header */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                  </span>
                  <span className="font-plex-mono font-bold text-[10px] tracking-[0.16em] text-sky-400 uppercase">
                    {lang === "tr" ? "İNTERAKTİF CBS // HİDROLOJİ ATÖLYESİ" : "INTERACTIVE GIS // HYDROLOGY LAB"}
                  </span>
                </div>
                <span className="font-plex-mono text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-sky-200 border border-white/15">
                  EXP 01 & 02
                </span>
              </div>

              {/* Center Flow Graphic & Title */}
              <div className="relative z-10 my-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-[17px] lg:text-[18px] tracking-tight text-white group-hover:text-sky-300 transition-colors">
                      {lang === "tr" ? "Havza Sınırlandırma & Baraj Hidroliği" : "Watershed Delineation & Dam Hydraulics"}
                    </h2>
                    <p className="font-display text-[12px] text-slate-300 mt-0.5">
                      {lang === "tr"
                        ? "D8 akış yönlendirmesi & 4. mertebe Runge-Kutta taşkın ötelemesi"
                        : "Deterministic D8 flow routing & RK4 reservoir flood routing"}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 group-hover:bg-sky-400 group-hover:text-black group-hover:scale-110 transition-all flex-none ml-3 shadow-sm">
                    <ArrowRight size={17} />
                  </div>
                </div>

                {/* Technical Indicator Sub-bar */}
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between font-plex-mono text-[9.5px] text-slate-400">
                  <span>{lang === "tr" ? "İki Ayrı Deney" : "2 Live Experiments"}</span>
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {lang === "tr" ? "Etkileşimli Simülasyon" : "Interactive Simulation"}
                  </span>
                  <span className="text-sky-300 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    {lang === "tr" ? "Laboratuvarı Aç ⚡" : "Launch Lab ⚡"}
                  </span>
                </div>
              </div>
            </Link>

            {/* Secondary Actions: CV & Publications */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/cv"
                className="group cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[var(--frame)] text-[var(--paper)] font-display font-semibold text-[12.5px] tracking-wide hover:bg-[var(--acc)] shadow-xs transition-all duration-200 rounded-xs"
              >
                <span>{t(copy.home.viewCv, lang)}</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/publications"
                className="cursor-pointer px-4 py-2 border-[1.5px] border-[var(--frame)] text-[var(--ink)] font-display font-medium text-[12.5px] tracking-wide hover:border-[var(--acc)] hover:text-[var(--acc)] bg-[var(--atlas-card)] shadow-xs transition-all duration-200 rounded-xs"
              >
                {t(copy.home.viewPubs, lang)}
              </Link>
            </div>
          </div>

          {/* Prominent High-Visibility Profile Logos */}
          <div className="mt-2.5 pt-2 border-t border-[var(--line)]">
            <SocialLinks variant="hero" includeEmail={false} />
          </div>
        </div>

        {/* Desktop Right Column: Faruk's Dynamic Portrait Card */}
        <div className="hidden min-[1100px]:block flex-none self-center">
          <FeaturePhoto lang={lang} />
        </div>
      </div>
    </div>
  );
}
