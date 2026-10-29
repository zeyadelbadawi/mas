// Black-and-white botanical line drawings in the spirit of the Aroma Lounge guide.
// Every stroke has pathLength=1 so <DrawOn> can draw it from 0 to 1 with stroke-dashoffset.

import type { SVGProps } from "react";

type SvgProps = Omit<SVGProps<SVGSVGElement>, "viewBox">;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  pathLength: 1,
};

/** An olive sprig: one arching stem with paired almond leaves. */
export function OliveSprig(props: SvgProps) {
  const leaves = [
    [52, 168, -38],
    [70, 140, 32],
    [84, 116, -42],
    [104, 92, 36],
    [118, 70, -46],
    [140, 52, 30],
    [152, 34, -20],
  ] as const;
  return (
    <svg viewBox="0 0 200 220" aria-hidden="true" {...props}>
      <path {...stroke} d="M30 210 C60 160 100 100 168 22" />
      {leaves.map(([x, y, r]) => (
        <path
          key={`${x}-${y}`}
          {...stroke}
          transform={`rotate(${r} ${x} ${y})`}
          d={`M${x} ${y} C${x + 10} ${y - 16} ${x + 34} ${y - 18} ${x + 44} ${y - 4} C${x + 30} ${y + 6} ${x + 12} ${y + 8} ${x} ${y} Z`}
        />
      ))}
      {leaves.map(([x, y, r]) => (
        <path
          key={`v${x}-${y}`}
          {...stroke}
          strokeWidth={0.8}
          transform={`rotate(${r} ${x} ${y})`}
          d={`M${x + 4} ${y - 1} L${x + 38} ${y - 5}`}
        />
      ))}
    </svg>
  );
}

/** A fern frond: a curved rachis with leaflets that shorten towards the tip. */
export function Frond(props: SvgProps) {
  const pairs = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg viewBox="0 0 200 220" aria-hidden="true" {...props}>
      <path {...stroke} d="M100 214 C96 160 104 90 120 14" />
      {pairs.map((i) => {
        const t = i / 9;
        const y = 196 - t * 172;
        const x = 99 + t * t * 20;
        const len = 52 * (1 - t * 0.75);
        return (
          <g key={i}>
            <path
              {...stroke}
              d={`M${x} ${y} C${x - len * 0.4} ${y - 4} ${x - len * 0.8} ${y - 14} ${x - len} ${y - 28}`}
            />
            <path
              {...stroke}
              d={`M${x} ${y} C${x + len * 0.4} ${y - 4} ${x + len * 0.8} ${y - 14} ${x + len} ${y - 28}`}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** A five-petal bloom, echoing the petal in the Aroma Lounge icon. */
export function Bloom(props: SvgProps) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <svg viewBox="0 0 200 220" aria-hidden="true" {...props}>
      <path {...stroke} d="M100 214 C98 180 104 150 100 118" />
      <path {...stroke} d="M100 176 C82 164 66 166 56 176 C70 184 86 184 100 176 Z" />
      {petals.map((r) => (
        <path
          key={r}
          {...stroke}
          transform={`rotate(${r} 100 80)`}
          d="M100 80 C82 60 84 30 100 18 C116 30 118 60 100 80 Z"
        />
      ))}
      <circle {...stroke} cx={100} cy={80} r={7} />
    </svg>
  );
}
