/**
 * The MAS wordmark (D64), traced from the client's own Illustrator file (`3 logos.pdf`): three shapes built on
 * one diagonal cut, and the registered mark. Inline SVG, so it is sharp at every size and takes the colour
 * of its text (`currentColor`): gold, dark gray or soft grey, as the identity guide uses it. The tagline
 * ("Café & Restaurant Management") is set as real text beside it, so it reads in both languages.
 */

/** The wordmark's own diagonal, in degrees from the horizontal: the site's one repeated shape (D64). */
export const MAS_DIAGONAL_DEG = 50.5;

/** Wordmark only, origin at its top-left corner (825.5 × 208.7). */
export const WORDMARK_VIEWBOX = "0 0 826 209";
/** Wordmark with the registered mark above its right end. */
export const WORDMARK_REG_VIEWBOX = "0 -48 826 257";

export const WORDMARK_PATHS = [
  "M 254.10 0 L 168.70 0 L 168.48 100.25 L 86.64 0 L 0 0 L 0.01 208.70 L 87.38 208.70 L 87.33 143.38 L 15.31 56.68 L 36.45 56.68 L 114.95 143.38 L 163.62 208.70 L 250.32 208.70 L 250.41 143.38 L 182.37 56.68 L 201.21 56.68 L 267.95 143.38 L 326.83 208.70 L 424.76 208.70 L 332.80 95 Z",
  "M 285.36 0 L 453.01 208.70 L 485.87 143.38 L 412.88 56.68 L 431.72 56.68 L 561.20 208.70 L 642.71 208.70 L 473.63 0 Z",
  "M 769.28 72.66 L 592.31 72.66 L 604.02 56.68 L 753.68 56.68 L 708.40 0 L 595.21 0 L 546.96 61.68 L 607.16 132.60 L 786.50 132.60 L 774.79 148.03 L 701.54 148.03 L 670.26 208.70 L 783.61 208.70 L 825.52 143.38 Z",
] as const;

const REG_R =
  "M 802.32 -7.14 L 795.53 -18.42 L 789.73 -18.42 L 789.73 -7.14 L 788.03 -7.14 L 788.03 -33.62 L 795.31 -33.62 C 798.24 -33.62 800.45 -32.93 801.92 -31.54 C 803.39 -30.16 804.14 -28.32 804.14 -26.03 C 804.14 -24 803.56 -22.32 802.42 -21 C 801.27 -19.67 799.60 -18.86 797.42 -18.56 L 804.35 -7.14 Z M 789.73 -19.85 L 795.39 -19.85 C 797.72 -19.85 799.46 -20.42 800.62 -21.54 C 801.78 -22.68 802.35 -24.17 802.35 -26.03 C 802.35 -30.08 800 -32.10 795.31 -32.10 L 789.73 -32.10 Z M 789.73 -19.85";

type MarkProps = {
  className?: string;
  /** The registered mark (®) above the S, as on the identity guide. */
  registered?: boolean;
  /**
   * "solid" fills the letters; "outline" draws only their edges in thin lines, the guide's outline version
   * (pathLength 1 on each shape, so a stroke can be drawn on with stroke-dashoffset).
   */
  variant?: "solid" | "outline";
  /** Accessible name. Leave empty where the brand name is already in text next to it. */
  title?: string;
};

export function MasWordmark({
  className,
  registered = false,
  variant = "solid",
  title,
}: MarkProps) {
  const outline = variant === "outline";
  return (
    <svg
      viewBox={registered ? WORDMARK_REG_VIEWBOX : WORDMARK_VIEWBOX}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {WORDMARK_PATHS.map((d) => (
        <path
          key={d.slice(0, 16)}
          d={d}
          data-letter=""
          pathLength={outline ? 1 : undefined}
          fill={outline ? "none" : "currentColor"}
          stroke={outline ? "currentColor" : undefined}
          strokeWidth={outline ? 1.6 : undefined}
          strokeLinejoin="miter"
          vectorEffect={outline ? "non-scaling-stroke" : undefined}
        />
      ))}
      {registered ? (
        <g data-reg="">
          <circle
            cx={794.59}
            cy={-20.51}
            r={25.62}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          />
          <path d={REG_R} fill="currentColor" />
        </g>
      ) : null}
    </svg>
  );
}
