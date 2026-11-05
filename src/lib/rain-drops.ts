import { createSeededRandom, randomBetween } from "@/lib/seeded-random";

export type RainDrop = {
  id: number;
  leftPercent: number;
  heightPx: number;
  opacity: number;
  durationSeconds: number;
  delaySeconds: number;
};

/** Deterministic drops, so server and client render identical markup. */
export function buildRainDrops(count: number, seed: number): RainDrop[] {
  const random = createSeededRandom(seed);
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    leftPercent: randomBetween(random, 0, 100),
    heightPx: randomBetween(random, 36, 90),
    opacity: randomBetween(random, 0.15, 0.4),
    durationSeconds: randomBetween(random, 1.8, 3.6),
    delaySeconds: -randomBetween(random, 0, 3.6),
  }));
}
