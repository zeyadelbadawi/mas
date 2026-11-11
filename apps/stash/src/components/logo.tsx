import { cn } from "@mas/ui";
import {
  LOGO_DESCRIPTOR,
  LOGO_RULES,
  LOGO_VIEWBOX,
  LOGO_WORDMARK,
  MONOGRAM,
  MONOGRAM_VIEWBOX,
  WORDMARK,
  WORDMARK_VIEWBOX,
} from "./logo-paths";

type MarkProps = { className?: string; title?: string };

function Svg({
  viewBox,
  title,
  className,
  children,
}: MarkProps & { viewBox: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("block", className)}
      // The logo reads left to right in both languages.
      direction="ltr"
    >
      {children}
    </svg>
  );
}

/** The full lock-up: STASH over PACKAGING SOLUTIONS, with its two rules. */
export function StashLogo({ className, title }: MarkProps) {
  return (
    <Svg viewBox={LOGO_VIEWBOX} className={className} title={title}>
      {[...LOGO_WORDMARK, ...LOGO_DESCRIPTOR, ...LOGO_RULES].map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </Svg>
  );
}

/** The wordmark alone. */
export function StashWordmark({ className, title }: MarkProps) {
  return (
    <Svg viewBox={WORDMARK_VIEWBOX} className={className} title={title}>
      {WORDMARK.map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </Svg>
  );
}

/** The "S" monogram. */
export function StashMonogram({ className, title }: MarkProps) {
  return (
    <Svg viewBox={MONOGRAM_VIEWBOX} className={className} title={title}>
      <path d={MONOGRAM} />
    </Svg>
  );
}
