import { PETAL_PATHS, PETAL_VIEWBOX } from "@/components/logo";

/**
 * The logo's petal dusted in cocoa onto the cappuccino at the centre of the morning table (06-aroma-replan
 * §6.2): an overlay tracked to the cup in the frame, never baked into the footage. `opacity` per petal is a
 * CSS expression of the scene's progress, so the petals settle one after another as the cup lands.
 */
export function ScenePetal({
  petalOpacity,
}: {
  petalOpacity: (index: number, count: number) => string;
}) {
  return (
    // The coffee in the cup is centred at 51.1% × 55.7% of the frame and 5.7% of its width across (a circle
    // fitted to the crema ring on the last frame); the stencil covers about 70% of it.
    <div className="absolute top-[55.66%] left-[51.11%] w-[3.9%] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply in-data-[animated=false]:hidden motion-reduce:hidden">
      <svg viewBox={PETAL_VIEWBOX} aria-hidden="true" focusable="false" className="h-auto w-full">
        {PETAL_PATHS.map((d, i) => (
          <path
            key={d.slice(0, 24)}
            d={d}
            fill="url(#aroma-dust-fine)"
            style={{ opacity: petalOpacity(i, PETAL_PATHS.length) }}
          />
        ))}
      </svg>
    </div>
  );
}
