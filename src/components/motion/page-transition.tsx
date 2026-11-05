"use client";

import { useEffect, useState, type ReactNode } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { PAGE_TRANSITION_SECONDS } from "@/lib/motion";
import { STATIC_WAVE_VIEWBOX, WAVE_CREST_PATH } from "@/lib/wave-paths";

/**
 * Flipped by the first mount, which is the initial page load (the intro covers it).
 * Effects never run on the server, so the server render and the first client render agree.
 */
let hasMountedBefore = false;

const CREST_HEIGHT_PX = 40;
const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * Navigation transition that never hides the page: a thin water crest sweeps down the
 * viewport and the new route is revealed right behind it while it fades and rises in.
 * Mounted from `template.tsx`, which remounts on every navigation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [isNavigation] = useState(() => hasMountedBefore);
  const [finished, setFinished] = useState(false);
  const active = isNavigation && !finished && !reducedMotion;

  /** How far down (px) the crest has travelled; the reveal edge follows it. */
  const reveal = useMotionValue(0);
  const crestY = useTransform(reveal, (value) => value - CREST_HEIGHT_PX / 2);
  const clipPath = useMotionTemplate`inset(0px 0px calc(100% - ${reveal}px) 0px)`;

  useEffect(() => {
    hasMountedBefore = true;
  }, []);

  useEffect(() => {
    if (!active) return;
    const sweep = animate(reveal, window.innerHeight + CREST_HEIGHT_PX, {
      duration: PAGE_TRANSITION_SECONDS,
      ease: EASE,
      onComplete: () => setFinished(true),
    });
    return () => sweep.stop();
  }, [active, reveal]);

  return (
    <>
      {active && (
        <motion.svg
          aria-hidden
          viewBox={STATIC_WAVE_VIEWBOX}
          preserveAspectRatio="none"
          className="pointer-events-none fixed inset-x-0 top-0 z-90 w-full fill-none stroke-signal"
          style={{ y: crestY, height: CREST_HEIGHT_PX }}
        >
          <path d={WAVE_CREST_PATH} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        </motion.svg>
      )}
      <motion.div
        initial={active ? { opacity: 0, y: 14 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: PAGE_TRANSITION_SECONDS * 0.6, ease: "easeOut" }}
        style={{ clipPath: active ? clipPath : "none" }}
      >
        {children}
      </motion.div>
    </>
  );
}
