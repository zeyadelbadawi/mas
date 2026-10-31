import { PETAL_PATHS, PETAL_VIEWBOX } from "@/components/logo";
import { CocoaPattern } from "@/components/cocoa";

/**
 * The logo's petal dusted in cocoa onto the cappuccino at the centre of the morning table (06-aroma-replan
 * §6.2): an overlay tracked to the cup in the frame, never baked into the footage. `opacity` per petal is a
 * CSS expression of the scene's progress, so the petals settle one after another as the cup lands.
 */
export function ScenePetal({
  id,
  petalOpacity,
}: {
  id: string;
  petalOpacity: (index: number, count: number) => string;
}) {
  return (
    // The cup's foam sits at 50.4% × 56.6% of the frame, about 6% of its width across.
    <div className="absolute top-[56.6%] left-[50.4%] w-[3.9%] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply">
      <svg viewBox={PETAL_VIEWBOX} aria-hidden="true" focusable="false" className="h-auto w-full">
        <defs>
          <CocoaPattern id={id} scale={0.7} />
        </defs>
        {PETAL_PATHS.map((d, i) => (
          <path
            key={d.slice(0, 24)}
            d={d}
            fill={`url(#${id})`}
            style={{ opacity: petalOpacity(i, PETAL_PATHS.length) }}
          />
        ))}
      </svg>
    </div>
  );
}
