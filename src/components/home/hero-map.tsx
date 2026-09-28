"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { FeaturePhoto } from "./feature-photo";
import { RainTerrain } from "./rain-terrain";
import { SocialLinks, GithubIcon, LinkedinIcon, ScholarIcon } from "@/components/ui/social-links";
import { ArrowRight, FileText, BookOpen, CloudRain, Mountain, Shield } from "lucide-react";

/** Staggered entrance: each block rises in slightly after the previous one. */
const rise = (i: number): CSSProperties => ({ animationDelay: `${80 + i * 90}ms` });

export function HeroMap() {
  const { lang } = useAtlas();
  const tr = lang === "tr";
  const heroRef = useRef<HTMLDivElement | null>(null);

  const now = tr ? "Mühendis · Türkiye Su Enstitüsü (SUEN), İstanbul" : "Engineer · Turkish Water Institute (SUEN), İstanbul";
  const before = tr
    ? "DSİ · WMO nezdinde Türkiye Hidroloji Danışmanı · IIHR, Iowa Üniversitesi"
    : "DSİ · Türkiye's Hydrological Advisor at WMO · IIHR, University of Iowa";

  const lessons = [
    { href: "/lab#watershed", icon: Mountain, label: tr ? "Yağmur nereye gider?" : "Where does the rain go?" },
    { href: "/lab#dam", icon: Shield, label: tr ? "Baraj taşkını nasıl ehlileştirir?" : "How does a dam tame a flood?" },
  ];

  return (
    <div
      ref={heroRef}
      data-screen-label="Home — Hero Section"
      className="relative overflow-hidden w-full flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-2 min-[1100px]:py-0 h-full"
    >
      {/* ── Living terrain: contours + raindrops flowing downhill ── */}
      <RainTerrain pointerTarget={heroRef} className="absolute inset-0" />

      {/* ── Readability veils: text sits on calm paper, the terrain breathes on the right ── */}
      <div
        className="absolute inset-0 pointer-events-none hidden min-[1100px]:block"
        style={{
          background:
            "linear-gradient(90deg, var(--paper) 0%, color-mix(in srgb, var(--paper) 90%, transparent) 36%, color-mix(in srgb, var(--paper) 35%, transparent) 60%, transparent 82%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none min-[1100px]:hidden"
        style={{ background: "color-mix(in srgb, var(--paper) 74%, transparent)" }}
      />

      {/* ── Main Hero Content ── */}
      <div className="relative z-10 w-full max-w-[1140px] mx-auto flex-1 flex flex-col min-[1100px]:flex-row items-center justify-between gap-6 min-[1100px]:gap-10 py-2">
        {/* ── A. MOBILE & TABLET (< 1100px) ── */}
        <div className="flex min-[1100px]:hidden flex-col flex-1 justify-between w-full py-2 gap-4 sm:gap-6">
          <div className="flex flex-col items-center text-center pt-1">
            <div className="hero-rise relative flex items-center justify-center mb-3" style={rise(0)}>
              <div className="absolute -inset-2.5 rounded-full border border-dashed border-[var(--acc)]/35 animate-[spin_40s_linear_infinite]" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[var(--frame)] bg-[var(--paper)] shadow-[0_4px_16px_var(--shadow)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/faruk.jpg" alt="Faruk Gürbüz" className="w-full h-full object-cover" style={{ objectPosition: "50% 18%" }} />
              </div>
              <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-[var(--paper)]/95 backdrop-blur-md border border-[var(--frame)] shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-plex-mono text-[9px] font-bold tracking-wider text-[var(--ink)]">İSTANBUL · 41°N 28°E</span>
              </div>
            </div>

            <h1 className="hero-rise mt-2 font-display font-extrabold text-[34px] sm:text-[40px] leading-tight tracking-[-0.03em] text-[var(--ink)]" style={rise(1)}>
              Faruk Gürbüz
            </h1>
            <div className="hero-rise flex items-center justify-center gap-2 mt-1.5 flex-wrap" style={rise(2)}>
              <RolePill tone="sky">{tr ? "Su Kaynakları Mühendisi" : "Water Resources Engineer"}</RolePill>
              <RolePill tone="emerald">{tr ? "Mekansal Veri Bilimci" : "Geospatial Data Scientist"}</RolePill>
            </div>
            <p className="hero-rise mt-3 font-display text-[14.5px] sm:text-[15.5px] leading-[1.6] text-[var(--ink2)] max-w-[460px] mx-auto" style={rise(3)}>
              {t(copy.home.heroDesc, lang)}
            </p>
            <p className="hero-rise mt-2 font-plex-mono text-[10.5px] leading-[1.6] text-[var(--ink2)] max-w-[420px]" style={rise(4)}>
              <span className="font-bold text-[var(--acc)]">{tr ? "ŞİMDİ" : "NOW"}</span> · {now}
            </p>
          </div>

          <div className="hero-rise" style={rise(5)}>
            <LabCard lessons={lessons} tr={tr} compact />
          </div>

          <div className="hero-rise grid grid-cols-2 gap-2.5 sm:gap-3 w-full" style={rise(6)}>
            <MiniCard href="/cv" icon={<FileText size={15} />} title={tr ? "İnteraktif CV" : "Curriculum Vitae"} sub={tr ? "Kariyer & Uzmanlıklar" : "Experience & Career"} />
            <MiniCard href="/publications" icon={<BookOpen size={15} />} title={tr ? "Yayınlar" : "Publications"} sub={tr ? "Hakemli Makaleler" : "Peer-Reviewed Work"} />
          </div>

          <div className="hero-rise w-full p-2 rounded-xl bg-[var(--atlas-card)]/85 backdrop-blur-md border border-[var(--frame)]/40 shadow-xs grid grid-cols-3 gap-2" style={rise(7)}>
            <DockLink href="https://github.com/gurbuzf" label="GitHub" icon={<GithubIcon size={19} className="text-[var(--ink)]" />} />
            <DockLink href="https://scholar.google.com/citations?user=CVfKPpUAAAAJ&hl=tr" label="Scholar" icon={<ScholarIcon size={19} className="text-blue-600 dark:text-blue-400" />} />
            <DockLink href="https://www.linkedin.com/in/faruk-gurbuz" label="LinkedIn" icon={<LinkedinIcon size={19} className="text-[#0077b5] dark:text-[#38a1db]" />} />
          </div>

          <p className="flex items-center justify-center gap-1.5 font-display text-[12px] text-[var(--mut)]">
            <CloudRain size={13} className="text-[var(--acc)]" />
            {tr ? "Yağmur yağdırmak için arka plana dokunun" : "Tap the background to make it rain"}
          </p>
        </div>

        {/* ── B. DESKTOP (≥ 1100px) ── */}
        <div className="hidden min-[1100px]:flex flex-col max-w-[620px]">
          <div className="hero-rise inline-flex items-center gap-2 px-2.5 py-0.5 bg-[var(--atlas-card)] border border-[var(--frame)] rounded-full w-fit shadow-2xs" style={rise(0)}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--acc)] animate-pulse" />
            <span className="font-plex-mono font-bold text-[10px] tracking-[0.18em] text-[var(--acc)] uppercase">{t(copy.home.heroEyebrow, lang)}</span>
          </div>

          <h1 className="hero-rise mt-3 font-display font-bold text-[56px] xl:text-[68px] leading-[0.95] tracking-[-0.04em] text-[var(--ink)]" style={rise(1)}>
            Faruk Gürbüz
          </h1>

          <div className="hero-rise flex items-center gap-2 mt-3 flex-wrap" style={rise(2)}>
            <RolePill tone="sky">{tr ? "Su Kaynakları Mühendisi" : "Water Resources Engineer"}</RolePill>
            <RolePill tone="emerald">{tr ? "Mekansal Veri Bilimci" : "Geospatial Data Scientist"}</RolePill>
          </div>

          <p className="hero-rise mt-3.5 font-display text-[15.5px] leading-[1.6] text-[var(--ink2)] max-w-[560px]" style={rise(3)}>
            {t(copy.home.heroDesc, lang)}
          </p>

          <dl className="hero-rise mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-plex-mono text-[11.5px] leading-[1.5]" style={rise(4)}>
            <dt className="font-bold tracking-[0.12em] text-[var(--acc)]">{tr ? "ŞİMDİ" : "NOW"}</dt>
            <dd className="text-[var(--ink)]">{now}</dd>
            <dt className="font-bold tracking-[0.12em] text-[var(--mut)]">{tr ? "ÖNCE" : "BEFORE"}</dt>
            <dd className="text-[var(--ink2)]">{before}</dd>
          </dl>

          <div className="hero-rise mt-4 flex items-center gap-3" style={rise(5)}>
            <Link
              href="/cv"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--frame)] text-[var(--paper)] font-display font-semibold text-[13px] tracking-wide hover:bg-[var(--acc)] shadow-xs transition-colors"
            >
              {t(copy.home.viewCv, lang)}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/publications"
              className="px-5 py-2.5 border-[1.5px] border-[var(--frame)] text-[var(--ink)] font-display font-semibold text-[13px] tracking-wide hover:border-[var(--acc)] hover:text-[var(--acc)] bg-[var(--atlas-card)] transition-colors"
            >
              {t(copy.home.viewPubs, lang)}
            </Link>
          </div>

          <div className="hero-rise mt-5" style={rise(6)}>
            <LabCard lessons={lessons} tr={tr} />
          </div>

          <div className="hero-rise mt-4" style={rise(7)}>
            <SocialLinks variant="hero" />
          </div>
        </div>

        <div className="hero-rise hidden min-[1100px]:block flex-none self-center" style={rise(3)}>
          <FeaturePhoto lang={lang} />
        </div>
      </div>

      {/* ── Invitation to interact (desktop) ── */}
      <div className="hidden min-[1100px]:flex absolute right-6 bottom-4 z-10 items-center gap-2 px-3 py-1.5 bg-[var(--atlas-card)]/85 backdrop-blur-md border border-[var(--line)] shadow-2xs pointer-events-none">
        <CloudRain size={14} className="text-[var(--acc)]" />
        <span className="font-display text-[12px] text-[var(--ink2)]">
          {tr
            ? "İmleci gezdirerek yağmur yağdırın — her damla en dik yokuştan aşağı akar."
            : "Move your cursor to make it rain — every drop flows down the steepest slope."}
        </span>
      </div>
    </div>
  );
}

function RolePill({ tone, children }: { tone: "sky" | "emerald"; children: React.ReactNode }) {
  const cls =
    tone === "sky"
      ? "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300"
      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300";
  const dot = tone === "sky" ? "bg-sky-500" : "bg-emerald-500";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border backdrop-blur-sm font-plex-mono text-[11px] font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

/** Hydrology Lab teaser: the two lessons, each a direct link. */
function LabCard({ lessons, tr, compact = false }: { lessons: { href: string; icon: typeof Mountain; label: string }[]; tr: boolean; compact?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-sky-500/40 bg-gradient-to-br from-[#0c1628] via-[#0f203c] to-[#0a1424] text-white shadow-[0_12px_30px_-10px_rgba(2,132,199,0.45)]">
      <div className="absolute -top-12 -right-10 w-48 h-48 rounded-full bg-sky-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-14 -left-10 w-44 h-44 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
      <div className={`relative ${compact ? "p-4" : "p-4.5"}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-plex-mono text-[10px] font-bold tracking-[0.16em] text-sky-300 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
            </span>
            {tr ? "Ücretsiz etkileşimli dersler" : "Free interactive lessons"}
          </span>
          <span className="font-plex-mono text-[9.5px] whitespace-nowrap px-2 py-0.5 rounded-full bg-white/10 text-sky-100 border border-white/15">
            {tr ? "11 bölüm" : "11 chapters"}
            {!compact && " · EN / TR"}
          </span>
        </div>
        <Link href="/lab" className="group mt-2 flex items-center justify-between gap-3">
          <span>
            <span className="block font-display font-bold text-[20px] tracking-tight text-white group-hover:text-sky-300 transition-colors">
              {tr ? "Hidroloji Laboratuvarı" : "Hydrology Lab"}
            </span>
            <span className="block font-display text-[12.5px] text-slate-300 mt-0.5">
              {tr ? "Tek bir şeyi değiştirin, neden-sonuç ilişkisini görün." : "Change one thing, see cause and effect."}
            </span>
          </span>
          <span className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-200 group-hover:bg-sky-400 group-hover:text-[#0c1628] transition-colors flex-none">
            <ArrowRight size={17} />
          </span>
        </Link>
        <div className={`mt-3 pt-3 border-t border-white/10 grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
          {lessons.map((l, i) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-sky-400/40 transition-colors"
              >
                <Icon size={15} className="text-sky-300 flex-none" />
                <span className="font-display text-[12.5px] leading-tight text-slate-100">
                  <span className="block font-plex-mono text-[9px] tracking-[0.14em] text-slate-400 uppercase">
                    {tr ? "Ders" : "Lesson"} 0{i + 1}
                  </span>
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniCard({ href, icon, title, sub }: { href: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between gap-3 p-3.5 rounded-lg bg-[var(--atlas-card)]/90 backdrop-blur-md border-[1.5px] border-[var(--frame)] shadow-xs hover:border-[var(--acc)] active:scale-[0.98] transition-all"
    >
      <span className="w-7 h-7 rounded-md bg-[var(--paper)] border border-[var(--frame)] flex items-center justify-center text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors">
        {icon}
      </span>
      <span>
        <span className="flex items-center justify-between font-display font-bold text-[13.5px] text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors">
          {title}
          <ArrowRight size={13} className="text-[var(--mut)] group-hover:text-[var(--acc)]" />
        </span>
        <span className="block font-display text-[11px] text-[var(--ink2)] mt-0.5">{sub}</span>
      </span>
    </Link>
  );
}

function DockLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex flex-col items-center justify-center py-2 rounded-lg bg-[var(--paper)]/80 border border-[var(--frame)]/40 hover:border-[var(--acc)] active:scale-95 transition-all"
    >
      {icon}
      <span className="font-plex-mono text-[9.5px] font-bold text-[var(--ink)] mt-1">{label}</span>
    </a>
  );
}
