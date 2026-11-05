import { createSeededRandom, randomBetween } from "@/lib/seeded-random";

export type Bubble = {
  id: number;
  leftPercent: number;
  sizePx: number;
  durationSeconds: number;
  delaySeconds: number;
};

export function buildBubbles(count: number, seed: number): Bubble[] {
  const random = createSeededRandom(seed);
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    leftPercent: randomBetween(random, 2, 98),
    sizePx: randomBetween(random, 4, 12),
    durationSeconds: randomBetween(random, 9, 18),
    delaySeconds: -randomBetween(random, 0, 18),
  }));
}
