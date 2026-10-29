// COVY brand motifs, drawn as SVG so they stay sharp, recolour with CSS and weigh nothing.

import type { SVGProps } from "react";

type SvgProps = Omit<SVGProps<SVGSVGElement>, "viewBox">;

/** The four-point star from the COVY logo. */
export function Star(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M12 0c.6 6.4 5 11.4 12 12-7 .6-11.4 5.6-12 12-.6-6.4-5-11.4-12-12 7-.6 11.4-5.6 12-12z" />
    </svg>
  );
}

/** A caladium leaf in the guide's two-tone style: pale blade, blue veins and edge. */
export function CaladiumLeaf({ tone = "blue", ...props }: SvgProps & { tone?: "blue" | "cocoa" }) {
  const edge = tone === "blue" ? "var(--covy-slate)" : "var(--covy-cocoa)";
  // Side veins leave the midrib and curve up and out to the edge.
  const veins = [104, 86, 68, 50, 32];
  return (
    <svg viewBox="-60 -10 120 150" aria-hidden="true" {...props}>
      <path
        d="M0 130 C14 112 58 100 58 72 C58 36 26 10 0 -6 C-26 10 -58 36 -58 72 C-58 100 -14 112 0 130 Z"
        fill="#eef0f2"
        stroke={edge}
        strokeWidth="3"
      />
      <g stroke={edge} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M0 122 L0 0" strokeWidth="2.4" />
        {veins.map((y) => (
          <g key={y}>
            <path d={`M0 ${y} Q 22 ${y - 6} ${44 - (104 - y) * 0.15} ${y - 26}`} />
            <path d={`M0 ${y} Q -22 ${y - 6} ${-44 + (104 - y) * 0.15} ${y - 26}`} />
          </g>
        ))}
      </g>
      <path
        d="M0 118 C10 106 40 96 46 72 C40 90 14 100 0 104 C-14 100 -40 90 -46 72 C-40 96 -10 106 0 118 Z"
        fill={edge}
        opacity="0.35"
      />
    </svg>
  );
}

/** Terrazzo specks from the floor: navy, slate and cocoa chips on pale stone, seeded so it never changes. */
export function Terrazzo({ className, chips = 140 }: { className?: string; chips?: number }) {
  const colours = ["var(--covy-navy)", "var(--covy-slate)", "var(--covy-cocoa)", "#b8c4cf"];
  const rand = (n: number) => {
    const s = Math.sin(n * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  };
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <rect width="400" height="240" fill="#f1eeeb" />
      {Array.from({ length: chips }, (_, i) => (
        <ellipse
          key={i}
          cx={rand(i + 1) * 400}
          cy={rand(i + 101) * 240}
          rx={1.2 + rand(i + 201) * 4.5}
          ry={0.8 + rand(i + 301) * 3}
          transform={`rotate(${rand(i + 401) * 180} ${rand(i + 1) * 400} ${rand(i + 101) * 240})`}
          fill={colours[i % colours.length]}
          opacity={0.55 + rand(i + 501) * 0.45}
        />
      ))}
    </svg>
  );
}
