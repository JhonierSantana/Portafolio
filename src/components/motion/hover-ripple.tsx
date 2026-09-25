"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/mini";
import { buildWavyCirclePath } from "@/lib/wavy-circle";

const RIPPLE_SIZE_PX = 90;
const RIPPLE_DURATION_SECONDS = 1.4;
const RIPPLE_START_OPACITY = 0.35;
const MIN_DISTANCE_BETWEEN_RIPPLES_PX = 70;
const MIN_TIME_BETWEEN_RIPPLES_MS = 110;
const MAX_ACTIVE_RIPPLES = 10;
const WAVE_LOBES = 10;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const WAVY_CIRCLE_PATH = buildWavyCirclePath({
  center: 50,
  baseRadius: 40,
  amplitude: 3,
  lobes: WAVE_LOBES,
});

function createRippleElement() {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("class", "absolute fill-none stroke-signal");
  svg.style.width = `${RIPPLE_SIZE_PX}px`;
  svg.style.height = `${RIPPLE_SIZE_PX}px`;
  svg.style.willChange = "transform, opacity";

  const path = document.createElementNS(SVG_NAMESPACE, "path");
  path.setAttribute("d", WAVY_CIRCLE_PATH);
  path.setAttribute("stroke-width", "1");
  svg.appendChild(path);
  return svg;
}

export function HoverRipple() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastRipple = { x: -Infinity, y: -Infinity, time: 0 };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || prefersReducedMotion.matches) return;
      if (layer.childElementCount >= MAX_ACTIVE_RIPPLES) return;

      const now = performance.now();
      if (now - lastRipple.time < MIN_TIME_BETWEEN_RIPPLES_MS) return;
      const distance = Math.hypot(event.clientX - lastRipple.x, event.clientY - lastRipple.y);
      if (distance < MIN_DISTANCE_BETWEEN_RIPPLES_PX) return;

      lastRipple = { x: event.clientX, y: event.clientY, time: now };

      const ripple = createRippleElement();
      ripple.style.left = `${event.clientX - RIPPLE_SIZE_PX / 2}px`;
      ripple.style.top = `${event.clientY - RIPPLE_SIZE_PX / 2}px`;
      layer.appendChild(ripple);

      animate(
        ripple,
        {
          transform: ["scale(0.2)", "scale(1.3)"],
          opacity: [RIPPLE_START_OPACITY, 0],
        },
        {
          duration: RIPPLE_DURATION_SECONDS,
          ease: "easeOut",
          onComplete: () => ripple.remove(),
        },
      );
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-100 overflow-hidden"
    />
  );
}
