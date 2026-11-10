"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { formatCount, parseCount } from "@/lib/count-up";

const DURATION_SECONDS = 1.3;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * A figure that counts up from 0 the first time it scrolls into view. The server renders the final
 * value (so it is right without JavaScript, and for reduced motion); on the client it is reset to 0
 * while off screen. Text is written straight to the element, so counting never re-renders React.
 */
export function CountUp({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const countTarget = useMemo(() => parseCount(value), [value]);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const done = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !countTarget || reducedMotion || done.current) return;
    element.textContent = formatCount(0, countTarget);
  }, [countTarget, reducedMotion]);

  useEffect(() => {
    const element = ref.current;
    if (!inView || !element || !countTarget || reducedMotion || done.current)
      return;
    const controls = animate(0, countTarget.target, {
      duration: DURATION_SECONDS,
      ease: EASE_OUT,
      onUpdate: (current) => {
        element.textContent = formatCount(current, countTarget);
      },
      onComplete: () => {
        done.current = true;
        element.textContent = value;
      },
    });
    return () => controls.stop();
  }, [inView, countTarget, reducedMotion, value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
    </span>
  );
}
