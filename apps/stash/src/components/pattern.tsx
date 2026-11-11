import { useId } from "react";
import { cn } from "@mas/ui";
import { WORDMARK, WORDMARK_VIEWBOX } from "./logo-paths";

const [, , W, H] = WORDMARK_VIEWBOX.split(" ").map(Number) as [number, number, number, number];
/** One tile: a row of the wordmark, then a mirrored row shifted by half, as on the presentation's p.12. */
const GAP_X = W * 0.16;
const GAP_Y = H * 0.32;
const TILE_W = W + GAP_X;
const TILE_H = (H + GAP_Y) * 2;

/**
 * The identity's pattern (D77), built as drawn: the whole wordmark in rows, every other row mirrored and
 * offset, tone-on-tone. It fills its positioned parent and never takes pointer events.
 */
export function WordmarkPattern({
  className,
  /** The wordmark's height in px on screen. */
  size = 56,
}: {
  className?: string;
  size?: number;
}) {
  const id = useId().replace(/:/g, "");
  const scale = size / H;
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <g id={`${id}-w`}>
          {WORDMARK.map((d) => (
            <path key={d.slice(0, 24)} d={d} />
          ))}
        </g>
        <pattern
          id={`${id}-p`}
          width={TILE_W * scale}
          height={TILE_H * scale}
          patternUnits="userSpaceOnUse"
        >
          <g transform={`scale(${scale})`} fill="currentColor">
            <use href={`#${id}-w`} x={GAP_X / 2} y={GAP_Y / 2} />
            <g
              transform={`translate(${TILE_W / 2 + W + GAP_X / 2} ${H + GAP_Y * 1.5}) scale(-1 1)`}
            >
              <use href={`#${id}-w`} />
              <use href={`#${id}-w`} x={TILE_W} />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-p)`} />
    </svg>
  );
}
