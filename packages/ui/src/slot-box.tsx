import { cn } from "./cn";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** "1600 × 1000" → "16:10" */
export function aspectLabel(width: number, height: number): string {
  const g = gcd(width, height);
  return `${width / g}:${height / g}`;
}

type SlotBoxProps = {
  slotId: string;
  kind: "image" | "sequence";
  width: number;
  height: number;
  lines: string[];
  label: string;
  className?: string;
};

/**
 * The visible placeholder for any asset the designer or MAG pipeline hasn't delivered yet (CLAUDE.md rule 3).
 * Dashed border + hatch so it can never pass for a finished image. Reserves the exact aspect ratio (no CLS).
 */
export function SlotBox({ slotId, kind, width, height, lines, label, className }: SlotBoxProps) {
  return (
    <div
      role="img"
      aria-label={label}
      data-slot-id={slotId}
      data-slot-kind={kind}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={cn(
        "relative flex w-full max-w-full items-center justify-center overflow-hidden border border-dashed border-slot-fg/40 bg-slot text-slot-fg",
        "bg-[repeating-linear-gradient(135deg,transparent_0_14px,color-mix(in_oklab,currentColor_7%,transparent)_14px_15px)]",
        className,
      )}
    >
      <div className="flex max-w-[90%] flex-col items-center gap-1 text-center font-mono text-xs leading-snug sm:text-sm" dir="ltr">
        {lines.map((line, i) => (
          <span key={line} className={i === 0 ? "font-semibold" : "opacity-80"}>
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
