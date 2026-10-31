/** Fine cocoa grains, scattered the same way on every render (a fixed seed), for one tile of the dust. */
const GRAINS = (() => {
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 260 }, () => ({
    x: rand() * 24,
    y: rand() * 24,
    r: 0.35 + rand() * 0.75,
    o: 0.45 + rand() * 0.55,
  }));
})();

/**
 * The cocoa dust as an SVG pattern: fill a shape with `url(#id)` to stencil it in cocoa, the way Aroma's
 * baristas dust the petal onto the foam. `scale` sizes the grains for the shape's own units.
 */
export function CocoaPattern({ id, scale = 1 }: { id: string; scale?: number }) {
  return (
    <pattern
      id={id}
      width="24"
      height="24"
      patternUnits="userSpaceOnUse"
      patternTransform={scale === 1 ? undefined : `scale(${scale})`}
    >
      {GRAINS.map((g) => (
        <circle key={`${g.x}-${g.y}`} cx={g.x} cy={g.y} r={g.r} fill="#5a3a24" opacity={g.o} />
      ))}
    </pattern>
  );
}
