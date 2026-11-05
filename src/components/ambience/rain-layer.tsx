"use client";

import { motion, type MotionValue } from "motion/react";
import { RainDrops } from "@/components/ui/rain-drops";
import { useStore } from "@/hooks/use-store";
import { ambienceStore, selectRainLevel } from "@/lib/ambience-store";
import { buildRainDrops, type RainDrop } from "@/lib/rain-drops";

/** Share of the drops that fall at each level (see `.ambient-rain` in globals.css). */
const HEAVY_FROM = 0.44;
const STORM_FROM = 0.75;

/**
 * Rain that follows the live weather (or the storm easter egg). Every drop is rendered once,
 * tagged with the level it belongs to; a weather change only flips `data-level` and CSS shows
 * or hides drops, so nothing re-renders. Optional soft lightning flashes during storms.
 */
export function createRainLayer({ count, seed }: { count: number; seed: number }) {
  const drops = buildRainDrops(count, seed);
  const tierOf = (drop: RainDrop) =>
    drop.id >= count * STORM_FROM ? "storm" : drop.id >= count * HEAVY_FROM ? "heavy" : "light";

  return function RainLayer({ className = "", opacity }: { className?: string; opacity?: MotionValue<number> }) {
    const rainLevel = selectRainLevel(useStore(ambienceStore));
    return (
      <motion.div aria-hidden style={{ opacity }} data-level={rainLevel} className={`ambient-rain pointer-events-none ${className}`}>
        <RainDrops drops={drops} tierOf={tierOf} />
        <div className="lightning absolute inset-0 bg-foreground" />
      </motion.div>
    );
  };
}
