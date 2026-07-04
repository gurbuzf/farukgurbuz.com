"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { skillGroups, languages, contact } from "@/content/cv";

export function SkillsRail() {
  const { lang } = useAtlas();

  return (
    <div className="flex flex-col gap-6 lg:sticky lg:top-4">
      <div className="bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)]">
        <div className="px-4 py-3 bg-[var(--frame)] font-plex-mono font-semibold text-[11px] tracking-[0.16em] text-[var(--paper)]">
          {t(copy.cv.skillsHeading, lang)}
        </div>
        <div className="px-4 pt-4 pb-[18px] flex flex-col gap-[11px]">
          {skillGroups.map((group, gi) => (
            <div key={group.heading.en} className={gi > 0 ? "contents" : "contents"}>
              <div
                className={`font-plex-mono font-semibold text-[10px] tracking-[0.14em] text-[var(--acc)] ${
                  gi > 0 ? "mt-1.5" : ""
                }`}
              >
                {t(group.heading, lang)}
              </div>
              {group.skills.map((skill) => (
                <div key={skill.label} className="flex items-center gap-2.5">
                  <span className="flex-1 font-display font-medium text-[13px] text-[var(--ink)]">
                    {skill.label}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--atlas-card)] border border-[var(--line)] px-[18px] py-4">
        <div className="font-plex-mono font-semibold text-[11px] tracking-[0.16em] text-[var(--acc)]">
          {t(copy.cv.languagesHeading, lang)}
        </div>
        <div className="mt-2.5 flex flex-col gap-1.5 font-display text-[14px] text-[var(--ink2)]">
          {languages.map((l) => (
            <div key={l.label.en} className="flex justify-between">
              <span className="text-[var(--ink)] font-medium">{t(l.label, lang)}</span>
              <span className="font-plex-mono font-medium text-[11px]">{t(l.level, lang)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--atlas-card)] border border-[var(--line)] px-[18px] py-4">
        <div className="font-plex-mono font-semibold text-[11px] tracking-[0.16em] text-[var(--acc)]">
          {t(copy.cv.contactHeading, lang)}
        </div>
        <div className="mt-2.5 flex flex-col gap-[7px] font-plex-mono font-medium text-[12px]">
          {contact.map((c) => (
            <a key={c.href} href={c.href} className="text-[var(--ink)] no-underline">
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
