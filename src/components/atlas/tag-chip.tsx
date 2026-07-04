export function TagChip({ label }: { label: string }) {
  return (
    <span className="font-plex-mono font-medium text-[10px] px-2 py-[3px] border border-[var(--line)] text-[var(--ink2)]">
      {label}
    </span>
  );
}
