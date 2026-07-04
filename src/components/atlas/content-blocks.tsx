import type { ContentBlock } from "@/content/types";

export function ContentBlocks({
  blocks,
  emptyLabel,
  emptyDesc,
}: {
  blocks: ContentBlock[];
  emptyLabel: string;
  emptyDesc: string;
}) {
  if (blocks.length === 0) {
    return (
      <div className="mt-8 border-[1.5px] border-dashed border-[var(--frame)] px-8 py-11 flex flex-col items-center gap-2.5 text-center">
        <span className="font-plex-mono font-semibold text-[11px] tracking-[0.16em] text-[var(--acc)]">
          {emptyLabel}
        </span>
        <span className="font-display text-[15px] leading-[1.6] text-[var(--ink2)] max-w-[480px]">
          {emptyDesc}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      {blocks.map((blk, i) => (
        <div key={i} className="flex flex-col">
          {blk.type === "heading" && (
            <h2 className="mt-2 font-display font-semibold text-[26px] leading-[1.25] text-[var(--ink)]">
              {blk.text}
            </h2>
          )}
          {blk.type === "text" && (
            <p className="font-display text-[16.5px] leading-[1.75] text-[var(--ink2)]">{blk.text}</p>
          )}
          {blk.type === "image" && (
            <figure className="m-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blk.src}
                alt={blk.caption}
                className="w-full block border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)]"
              />
              <figcaption className="mt-2.5 font-plex-mono font-medium text-[11px] tracking-[0.08em] text-[var(--mut)]">
                {blk.caption}
              </figcaption>
            </figure>
          )}
          {blk.type === "video" && (
            <video
              src={blk.src}
              controls
              className="w-full block border-[1.5px] border-[var(--frame)] shadow-[6px_6px_0_var(--shadow)]"
            />
          )}
          {blk.type === "iframe" && (
            <iframe
              src={blk.src}
              title={blk.caption}
              style={{ height: blk.height ?? "440px" }}
              className="w-full block border-[1.5px] border-[var(--frame)] bg-[var(--atlas-card)]"
            />
          )}
        </div>
      ))}
    </div>
  );
}
