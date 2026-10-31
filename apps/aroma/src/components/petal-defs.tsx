import type { SVGProps } from "react";
import { CocoaPattern } from "./cocoa";
import { LogoSymbols, PETAL_VIEWBOX } from "./logo";

/**
 * Drawn once per page (in the layout): the logo's petal and wordmark as symbols and the cocoa dust as patterns,
 * so every logo, the menu's petals and the three cocoa stencils (splash, morning, lake) reference one copy
 * instead of repeating the artwork in the HTML.
 */
export function PetalDefs() {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute size-0 overflow-hidden">
      <defs>
        <CocoaPattern id="aroma-dust" />
        {/* Finer grains for the small stencil on the cup in the scenes. */}
        <pattern id="aroma-dust-fine" href="#aroma-dust" patternTransform="scale(0.7)" />
        <LogoSymbols />
      </defs>
    </svg>
  );
}

/** The symbol's own width and height: `<use>` draws it from the origin of the outer viewBox. */
const PETAL_SIZE = PETAL_VIEWBOX.split(" ").slice(2).join(" ");

/** The logo's petal by reference to PetalDefs; filled with the logo green unless `fill` says otherwise. */
export function PetalMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={`0 0 ${PETAL_SIZE}`}
      fill="var(--aroma-green)"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <use href="#aroma-petal" />
    </svg>
  );
}
