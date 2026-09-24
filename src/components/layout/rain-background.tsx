const DROP_COUNT = 28;
const DROPS_ON_SMALL_SCREENS = 14;

function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

const randomBetween = (random: () => number, min: number, max: number) =>
  min + random() * (max - min);

const drops = (() => {
  const random = createSeededRandom(2504);
  return Array.from({ length: DROP_COUNT }, (_, index) => ({
    id: index,
    leftPercent: randomBetween(random, 0, 100),
    heightPx: randomBetween(random, 36, 90),
    opacity: randomBetween(random, 0.15, 0.4),
    durationSeconds: randomBetween(random, 1.8, 3.6),
    delaySeconds: -randomBetween(random, 0, 3.6),
  }));
})();

export function RainBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden contain:strict">
      {drops.map((drop) => (
        <span
          key={drop.id}
          className={`rain-drop absolute top-0 w-px bg-linear-to-b from-transparent to-signal ${
            drop.id >= DROPS_ON_SMALL_SCREENS ? "max-sm:hidden" : ""
          }`}
          style={{
            left: `${drop.leftPercent}%`,
            height: `${drop.heightPx}px`,
            opacity: drop.opacity,
            ["--rain-duration" as string]: `${drop.durationSeconds}s`,
            ["--rain-delay" as string]: `${drop.delaySeconds}s`,
          }}
        />
      ))}
    </div>
  );
}
