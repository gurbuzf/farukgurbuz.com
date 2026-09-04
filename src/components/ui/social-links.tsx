"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";

export function GithubIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function LinkedinIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export function ScholarIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
    </svg>
  );
}

export function MailIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export interface SocialLinkItem {
  id: "github" | "scholar" | "linkedin" | "email";
  label: { en: string; tr: string };
  handle: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
}

export const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: "github",
    label: { en: "GitHub", tr: "GitHub" },
    handle: "@gurbuzf",
    href: "https://github.com/gurbuzf",
    icon: GithubIcon,
    iconClass: "text-[var(--ink)]",
  },
  {
    id: "scholar",
    label: { en: "Google Scholar", tr: "Google Scholar" },
    handle: "Faruk Gürbüz",
    href: "https://scholar.google.com/citations?user=CVfKPpUAAAAJ&hl=tr",
    icon: ScholarIcon,
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "linkedin",
    label: { en: "LinkedIn", tr: "LinkedIn" },
    handle: "/in/faruk-gurbuz",
    href: "https://www.linkedin.com/in/faruk-gurbuz",
    icon: LinkedinIcon,
    iconClass: "text-[#0077b5] dark:text-[#38a1db]",
  },
  {
    id: "email",
    label: { en: "Email", tr: "E-Posta" },
    handle: "gurbuzfrk@gmail.com",
    href: "mailto:gurbuzfrk@gmail.com",
    icon: MailIcon,
    iconClass: "text-red-500",
  },
];

interface SocialLinksProps {
  variant?: "hero" | "header" | "lab" | "footer";
  includeEmail?: boolean;
  className?: string;
}

export function SocialLinks({ variant = "hero", includeEmail = true, className = "" }: SocialLinksProps) {
  const { lang } = useAtlas();

  const linksToRender = includeEmail
    ? SOCIAL_LINKS
    : SOCIAL_LINKS.filter((item) => item.id !== "email");

  if (variant === "header") {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {linksToRender.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              title={`${t(item.label, lang)} (${item.handle})`}
              aria-label={t(item.label, lang)}
              className="group relative p-2 text-[var(--ink2)] hover:text-[var(--acc)] hover:bg-[var(--paper)] rounded-full transition-all duration-200"
            >
              <Icon size={17} className="transition-transform group-hover:scale-110" />
            </a>
          );
        })}
      </div>
    );
  }

  if (variant === "lab") {
    return (
      <div className={`flex items-center gap-2 sm:gap-3 flex-wrap ${className}`}>
        {linksToRender.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--atlas-card)] border border-[var(--frame)] hover:border-[var(--acc)] text-[var(--ink)] rounded-full text-[11px] font-plex-mono font-medium shadow-2xs hover:shadow-xs transition-all duration-200"
            >
              <Icon size={15} className={`${item.iconClass} group-hover:scale-110 transition-transform`} />
              <span>{t(item.label, lang)}</span>
            </a>
          );
        })}
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
        {linksToRender.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              title={`${t(item.label, lang)} (${item.handle})`}
              aria-label={t(item.label, lang)}
              className="group inline-flex items-center justify-center p-2 sm:px-3.5 sm:py-1.5 bg-[var(--atlas-card)] border border-[var(--line)] hover:border-[var(--frame)] hover:bg-[var(--frame)] hover:text-[var(--paper)] text-[var(--ink)] font-plex-mono text-[11px] font-semibold transition-all duration-200 shadow-2xs rounded-xs"
            >
              <Icon size={16} className={`${item.iconClass} group-hover:text-[var(--paper)] group-hover:scale-110 transition-all flex-none`} />
              <span className="hidden sm:inline ml-1.5">{t(item.label, lang)}</span>
            </a>
          );
        })}
      </div>
    );
  }

  // "hero" variant: prominent, high-visibility brand logos (Email excluded by default)
  return (
    <div className={`flex items-center gap-3.5 flex-wrap ${className}`}>
      {linksToRender.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group relative inline-flex items-center gap-2.5 px-4 py-2.5 bg-[var(--paper)] border-[1.5px] border-[var(--frame)] hover:border-[var(--acc)] text-[var(--ink)] font-display font-semibold text-[13px] shadow-[3px_3px_0_var(--shadow)] hover:shadow-[5px_5px_0_var(--shadow)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <Icon
              size={20}
              className={`${item.iconClass} group-hover:scale-110 transition-transform duration-200 flex-none`}
            />
            <span className="tracking-tight group-hover:text-[var(--acc)] transition-colors">
              {t(item.label, lang)}
            </span>
            <span className="text-[var(--mut)] font-plex-mono text-[11px] hidden sm:inline opacity-70 font-normal">
              {item.handle}
            </span>
          </a>
        );
      })}
    </div>
  );
}
