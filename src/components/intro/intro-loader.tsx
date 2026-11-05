"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { RainDrops } from "@/components/ui/rain-drops";
import { WaveEdge } from "@/components/ui/wave-edge";
import { INTRO_SEEN_KEY, introStore } from "@/lib/intro-store";
import { buildRainDrops } from "@/lib/rain-drops";
import { SCROLLING_WAVE_PATH, SCROLLING_WAVE_VIEWBOX } from "@/lib/wave-paths";
import { useStore } from "@/hooks/use-store";

/** The water always plays for at least this long, and never longer than the ceiling. */
const TIMING = {
  full: { minMs: 1400, maxMs: 3200 },
  reduced: { minMs: 400, maxMs: 1200 },
} as const;
const FILL_BEFORE_READY = 0.9;
const FINISH_SECONDS = 0.35;
const EXIT_EASE = [0.76, 0, 0.24, 1] as const;

const drops = buildRainDrops(12, 77);

/**
 * First-visit intro: rain fills the screen with water (the site's wavy card colour),
 * then the whole curtain lifts away. The page is already rendered underneath, so this
 * costs no extra loading time; it only waits for the 3D avatar, within a hard ceiling.
 */
export function IntroLoader() {
  const introTexts = useTranslations("intro");
  const heroTexts = useTranslations("hero");
  const { avatarReady, dismissed } = useStore(introStore);
  const reducedMotion = useReducedMotion() ?? false;
  const [minElapsed, setMinElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const progress = useMotionValue(0);
  const waterY = useTransform(progress, [0, 1], ["100%", "0%"]);
  const percentRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(progress, "change", (value) => {
    if (percentRef.current) percentRef.current.textContent = String(Math.round(value * 100));
  });

  useEffect(() => {
    if (sessionStorage.getItem(INTRO_SEEN_KEY)) {
      introStore.dismiss();
      return;
    }
    const { minMs, maxMs } = reducedMotion ? TIMING.reduced : TIMING.full;
    const fill = animate(progress, FILL_BEFORE_READY, { duration: reducedMotion ? 0 : minMs / 1000, ease: "easeInOut" });
    const minTimer = window.setTimeout(() => setMinElapsed(true), minMs);
    const maxTimer = window.setTimeout(() => setTimedOut(true), maxMs);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") introStore.dismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      fill.stop();
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [progress, reducedMotion]);

  useEffect(() => {
    if (dismissed) sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  }, [dismissed]);

  const ready = minElapsed && (avatarReady || timedOut);
  useEffect(() => {
    if (dismissed || !ready) return;
    const finish = animate(progress, 1, { duration: reducedMotion ? 0 : FINISH_SECONDS, onComplete: introStore.dismiss });
    return () => finish.stop();
  }, [dismissed, ready, progress, reducedMotion]);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          role="status"
          aria-label={introTexts("loading")}
          className="intro-overlay fixed inset-0 z-110 bg-background"
          exit={reducedMotion ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reducedMotion ? 0.25 : 0.8, ease: EXIT_EASE }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <RainDrops drops={drops} />
            <motion.div className="absolute inset-0" style={{ y: waterY }}>
              <svg
                viewBox={SCROLLING_WAVE_VIEWBOX}
                preserveAspectRatio="none"
                className="absolute bottom-full left-0 h-8 w-[200%] animate-wave-drift fill-card sm:h-14"
              >
                <path d={SCROLLING_WAVE_PATH} />
              </svg>
              <div className="size-full bg-card" />
            </motion.div>
          </div>

          <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-display text-4xl font-medium tracking-tight sm:text-6xl">{heroTexts("name")}</p>
            <p className="font-data text-sm text-signal">{heroTexts("role")}</p>
            <p aria-hidden className="font-data text-xs text-muted-foreground">
              <span ref={percentRef}>0</span>%
            </p>
          </div>

          <button
            type="button"
            onClick={introStore.dismiss}
            className="absolute inset-x-0 bottom-6 mx-auto h-11 w-fit cursor-pointer px-4 font-data text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {introTexts("skip")}
          </button>

          <WaveEdge />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
