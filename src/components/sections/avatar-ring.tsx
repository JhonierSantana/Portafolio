"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export function AvatarRing({
  size = "size-20",
  imgSize = 80,
}: {
  size?: string;
  imgSize?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`relative ${size} shrink-0`}>
      <motion.span
        aria-hidden
        className="absolute -inset-3 rounded-full border border-dashed border-signal"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`relative ${size} overflow-hidden rounded-full border border-border`}
        animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/images/jhonier.jpg"
          alt="Jhonier Santana"
          fill
          sizes={`${imgSize}px`}
          priority
          className="object-cover grayscale contrast-125"
        />
        <div className="absolute inset-0 rounded-full bg-signal mix-blend-color opacity-70" />
        <div className="absolute inset-0 rounded-full bg-background/15" />
      </motion.div>
    </div>
  );
}
