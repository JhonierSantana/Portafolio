"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { createRainLayer } from "@/components/ambience/rain-layer";
import { buildBubbles } from "@/lib/bubbles";

const bubbles = buildBubbles(14, 1207);
const BackgroundRain = createRainLayer({ count: 64, seed: 2504 });

/**
 * The sea behind every page. Near the top it rains as hard as it really does in Socorro;
 * scrolling down dives under the surface: the rain fades, the water deepens and bubbles rise.
 * Only opacity and transforms animate, so it all stays on the compositor.
 */
export function AmbientBackground() {
  const { scrollYProgress } = useScroll();
  const depth = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const rainOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden contain-strict">
      <motion.div style={{ opacity: depth }} className="absolute inset-0 will-change-[opacity]">
        {/* A flat colour that deepens with scroll, not a vertical gradient: gradients this dark
            only have a handful of shades and show visible bands. */}
        <div className="absolute inset-0 bg-sea-deep" />
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

      <BackgroundRain opacity={rainOpacity} className="absolute inset-0" />
    </div>
  );
}
