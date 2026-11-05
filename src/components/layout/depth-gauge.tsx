"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useTranslations } from "next-intl";

/** Depth reached at the bottom of a page, and where each ocean zone starts (as scroll progress). */
const MAX_DEPTH_M = 200;
const ZONES = [
  { key: "surface", from: 0 },
  { key: "reef", from: 0.25 },
  { key: "abyss", from: 0.65 },
] as const;

const zoneAt = (progress: number) => [...ZONES].reverse().find((zone) => progress >= zone.from) ?? ZONES[0];
const depthAt = (progress: number) => `-${Math.round((progress * MAX_DEPTH_M) / 5) * 5} m`;

/**
 * Scroll indicator as a dive: the line on the right fills as you go down, and a gauge riding
 * on it reads the depth and the ocean zone. Text is written straight to the DOM (no re-renders).
 */
export function DepthGauge() {
  const depthTexts = useTranslations("depth");
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const progress = reducedMotion ? scrollYProgress : smoothProgress;
  const gaugeY = useTransform(progress, (value) => `calc(${value} * (100vh - 3.5rem) + 1rem)`);
  const depthRef = useRef<HTMLSpanElement>(null);
  const zoneRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(progress, "change", (value) => {
    if (depthRef.current) depthRef.current.textContent = depthAt(value);
    const zoneLabel = depthTexts(`zones.${zoneAt(value).key}`);
    if (zoneRef.current && zoneRef.current.textContent !== zoneLabel) zoneRef.current.textContent = zoneLabel;
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 z-40">
      <div className="absolute inset-y-0 right-0 w-0.5 bg-border">
        <motion.div className="size-full origin-top bg-signal" style={{ scaleY: progress }} />
      </div>
      <motion.div
        style={{ y: gaugeY }}
        className="absolute right-2 top-0 hidden flex-col items-end rounded-sm border border-signal/40 bg-background/85 px-2 py-1 font-data leading-tight backdrop-blur-sm md:flex"
      >
        <span ref={depthRef} className="text-xs text-signal">
          {depthAt(0)}
        </span>
        <span ref={zoneRef} className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          {depthTexts("zones.surface")}
        </span>
      </motion.div>
    </div>
  );
}
