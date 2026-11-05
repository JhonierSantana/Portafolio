import type { RainDrop } from "@/lib/rain-drops";

/**
 * Falling drops. Odd drops are hidden below the `sm` breakpoint (half the rain on phones);
 * `tierOf` tags each drop so CSS can show more or fewer of them without re-rendering.
 */
export function RainDrops({ drops, tierOf }: { drops: RainDrop[]; tierOf?: (drop: RainDrop) => string }) {
  return drops.map((drop) => (
    <span
      key={drop.id}
      data-tier={tierOf?.(drop)}
      className={`rain-drop absolute top-0 w-px bg-linear-to-b from-transparent to-signal ${drop.id % 2 ? "max-sm:hidden" : ""}`}
      style={{
        left: `${drop.leftPercent}%`,
        height: `${drop.heightPx}px`,
        opacity: drop.opacity,
        ["--rain-duration" as string]: `${drop.durationSeconds}s`,
        ["--rain-delay" as string]: `${drop.delaySeconds}s`,
      }}
    />
  ));
}
