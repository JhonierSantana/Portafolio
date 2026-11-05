"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { RainDrops } from "@/components/ui/rain-drops";
import { useStore } from "@/hooks/use-store";
import { ambienceStore, selectRainLevel } from "@/lib/ambience-store";
import { buildBubbles } from "@/lib/bubbles";
import { buildRainDrops, type RainDrop } from "@/lib/rain-drops";

/** Drops from these indexes on only fall when it rains harder (see `.ambient-rain` in globals.css). */
const HEAVY_FROM = 28;
const STORM_FROM = 48;
const drops = buildRainDrops(64, 2504);
const bubbles = buildBubbles(14, 1207);
const tierOf = (drop: RainDrop) => (drop.id >= STORM_FROM ? "storm" : drop.id >= HEAVY_FROM ? "heavy" : "light");

/**
 * The sea behind every page. Near the top it rains as hard as it really does in Socorro;
 * scrolling down dives under the surface: the rain fades, the water deepens and bubbles rise.
 * Only opacity and transforms animate, so it all stays on the compositor.
 */
export function AmbientBackground() {
  const rainLevel = selectRainLevel(useStore(ambienceStore));
  const { scrollYProgress } = useScroll();
  const depth = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const rainOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden contain-strict">
      <motion.div style={{ opacity: depth }} className="absolute inset-0 will-change-[opacity]">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-sea/40 to-sea-deep" />
        {bubbles.map((bubble) => (
          <span
            key={bubble.id}
            className={`bubble absolute bottom-0 rounded-full border border-signal/40 bg-signal/10 ${bubble.id % 2 ? "max-sm:hidden" : ""}`}
            style={{
              left: `${bubble.leftPercent}%`,
              width: `${bubble.sizePx}px`,
              height: `${bubble.sizePx}px`,
              ["--bubble-duration" as string]: `${bubble.durationSeconds}s`,
              ["--bubble-delay" as string]: `${bubble.delaySeconds}s`,
            }}
          />
        ))}
      </motion.div>

      <motion.div style={{ opacity: rainOpacity }} data-level={rainLevel} className="ambient-rain absolute inset-0">
        <RainDrops drops={drops} tierOf={tierOf} />
        <div className="lightning absolute inset-0 bg-foreground" />
      </motion.div>
    </div>
  );
}
