"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/motion";

const tags = {
  div: motion.div,
  section: motion.section,
  ol: motion.ol,
  ul: motion.ul,
  li: motion.li,
} as const;

type Tag = keyof typeof tags;

type RevealProps = HTMLMotionProps<"div"> & {
  as?: Tag;
  delay?: number;
};

/** Fades an element up into view the first time it scrolls into the viewport. */
export function Reveal({ as = "div", delay = 0, ...props }: RevealProps) {
  const Comp = tags[as] as typeof motion.div;
  return (
    <Comp
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      transition={{ duration: 0.5, delay }}
      {...props}
    />
  );
}

type RevealGroupProps = HTMLMotionProps<"div"> & {
  as?: Tag;
  stagger?: number;
};

/** Scroll-triggered container that staggers its RevealItem children in. */
export function RevealGroup({ as = "div", stagger = 0.1, ...props }: RevealGroupProps) {
  const Comp = tags[as] as typeof motion.div;
  return (
    <Comp
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer(stagger)}
      {...props}
    />
  );
}

type RevealItemProps = HTMLMotionProps<"div"> & {
  as?: Tag;
};

/** Child of RevealGroup — inherits stagger timing from the nearest RevealGroup. */
export function RevealItem({ as = "div", ...props }: RevealItemProps) {
  const Comp = tags[as] as typeof motion.div;
  return <Comp variants={fadeUp} transition={{ duration: 0.5 }} {...props} />;
}
