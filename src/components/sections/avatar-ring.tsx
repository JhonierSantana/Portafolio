"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { buildWavyCirclePath } from "@/lib/wavy-circle";

const PHOTO_LOBES = 8;
const RING_LOBES = 8;
const ATTRACTION_RADIUS_PX = 320;
const MAX_ATTRACTION_PX = 16;
const ATTRACTION_SPRING = { stiffness: 120, damping: 14, mass: 0.6 };

const PHOTO_WAVE_PATH = buildWavyCirclePath({
  center: 0.5,
  baseRadius: 0.47,
  amplitude: 0.013,
  lobes: PHOTO_LOBES,
});
const RING_WAVE_PATH = buildWavyCirclePath({
  center: 50,
  baseRadius: 47,
  amplitude: 1.4,
  lobes: RING_LOBES,
});

export function AvatarRing({
  size = "size-20",
  imgSize = 80,
}: {
  size?: string;
  imgSize?: number;
}) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const clipPathId = `avatar-wave-clip-${useId().replace(/:/g, "")}`;

  const pullX = useSpring(useMotionValue(0), ATTRACTION_SPRING);
  const pullY = useSpring(useMotionValue(0), ATTRACTION_SPRING);

  // The avatar is gently pulled toward the pointer when it comes close (like a wave drawn to a drop).
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reduceMotion) return;

    let pendingFrame = 0;
    let pointer = { x: 0, y: 0 };

    const updatePull = () => {
      pendingFrame = 0;
      const bounds = container.getBoundingClientRect();
      const deltaX = pointer.x - (bounds.left + bounds.width / 2);
      const deltaY = pointer.y - (bounds.top + bounds.height / 2);
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > ATTRACTION_RADIUS_PX || distance === 0) {
        pullX.set(0);
        pullY.set(0);
        return;
      }
      const strength = (1 - distance / ATTRACTION_RADIUS_PX) * MAX_ATTRACTION_PX;
      pullX.set((deltaX / distance) * strength);
      pullY.set((deltaY / distance) * strength);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!pendingFrame) pendingFrame = requestAnimationFrame(updatePull);
    };
    const handlePointerLeave = () => {
      pullX.set(0);
      pullY.set(0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      if (pendingFrame) cancelAnimationFrame(pendingFrame);
    };
  }, [reduceMotion, pullX, pullY]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${size} shrink-0`}
      style={{ x: pullX, y: pullY }}
    >
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
            <path d={PHOTO_WAVE_PATH} />
          </clipPath>
        </defs>
      </svg>

      <motion.svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute -inset-3 size-[calc(100%+1.5rem)] fill-none stroke-signal"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        <path
          d={RING_WAVE_PATH}
          strokeWidth={1.2}
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>

      <motion.div
        className={`relative ${size}`}
        animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0" style={{ clipPath: `url(#${clipPathId})` }}>
          <Image
            src="/images/jhonier.jpg"
            alt="Jhonier Santana"
            fill
            sizes={`${imgSize}px`}
            priority
            className="object-cover"
          />
        </div>
        <svg aria-hidden viewBox="0 0 1 1" className="absolute inset-0 size-full fill-none stroke-border">
          <path d={PHOTO_WAVE_PATH} strokeWidth={0.008} />
        </svg>
      </motion.div>
    </motion.div>
  );
}
