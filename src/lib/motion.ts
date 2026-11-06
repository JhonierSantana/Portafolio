import type { Variants } from "motion/react";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};



export function staggerContainer(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

/** Length of the page-to-page transition; heavy work (e.g. the 3D avatar) waits this long to keep it smooth. */
export const PAGE_TRANSITION_SECONDS = 0.7;
