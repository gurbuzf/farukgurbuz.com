"use client";

import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import { timeline } from "@/content/cv";
import { TimelineEntry } from "@/components/cv/timeline-entry";
import { SkillsRail } from "@/components/cv/skills-rail";

export default function CvPage() {
  const { lang } = useAtlas();

  return (
    <div data-screen-label="CV — interactive timeline" className="px-6 md:px-11 pt-14 pb-16">
      <div className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <div className="font-plex-mono font-medium text-[12px] tracking-[0.16em] text-[var(--acc)]">
            {t(copy.cv.sheetEyebrow, lang)}
          </div>
          <h2 className="mt-3 font-display font-semibold text-[36px] sm:text-[54px] leading-[1.02] tracking-[-0.02em] text-[var(--ink)]">
            {t(copy.cv.title, lang)}
          </h2>
          <p className="mt-3.5 max-w-[560px] font-display text-[16px] leading-[1.6] text-[var(--ink2)]">
            {t(copy.cv.desc, lang)}
          </p>
        </div>
        <a
          href="/Faruk_Gurbuz_CV.pdf"
          download="Faruk_Gurbuz_CV.pdf"
          className="no-underline px-[22px] py-[13px] bg-[var(--frame)] text-[var(--paper)] font-display font-semibold text-[13px] inline-flex items-center gap-2.5"
        >
          ↓ {t(copy.cv.download, lang)}
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-8 lg:gap-11 mt-11 items-start">
        {/* timeline */}
        <div className="relative pl-[34px]">
          <svg
            className="absolute left-2 top-2 bottom-2"
            style={{ width: "4px", height: "calc(100% - 16px)" }}
            preserveAspectRatio="none"
            viewBox="0 0 4 100"
            aria-hidden="true"
          >
            <line x1="2" y1="0" x2="2" y2="100" stroke="var(--river)" strokeWidth="4" />
            <line
              x1="2"
              y1="0"
              x2="2"
              y2="100"
              stroke="var(--riverEdge)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              style={{ animation: "flowdash 30s linear infinite" }}
            />
          </svg>

          <div className="flex flex-col gap-[22px]">
            {timeline.map((entry, i) => (
              <TimelineEntry key={i} entry={entry} lang={lang} />
            ))}

            <div className="relative pt-1 font-plex-mono font-medium text-[11px] tracking-[0.12em] text-[var(--mut)]">
              <span
                className="absolute -left-[30px] top-1 w-2 h-2 rounded-full border-2"
                style={{ background: "var(--river)", borderColor: "var(--frame)" }}
              />
              ▲ {t(copy.cv.sourceMarker, lang)}
            </div>
          </div>
        </div>

        <SkillsRail />
      </div>
    </div>
  );
}
