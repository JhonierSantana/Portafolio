"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from "motion/react";

/** Share of the distance between two items (each side of an item) over which the focus stays put. */
const DWELL = 0.35;

/**
 * Turns a smooth position into one that lingers on each item: it holds still around the item and
 * only moves (eased) over the stretch between two items. That makes every item feel like a stop
 * without needing a lot of empty scroll between them.
 */
export function withDwell(position: number) {
  const base = Math.floor(position);
  const travelled = (position - base - DWELL) / (1 - 2 * DWELL);
  const t = Math.min(1, Math.max(0, travelled));
  return base + t * t * (3 - 2 * t);
}

export type FocusPosition = {
  /** Position among the items: 0 when the first one is centred on screen, 1 for the second. It lingers on each item (see `withDwell`). */
  position: MotionValue<number>;
  /** The item nearest the middle of the screen, and which way the visitor came from (1 = scrolling down). */
  focus: { index: number; direction: 1 | -1 };
};

/**
 * Tracks which of a list of elements is nearest the middle of the viewport. It measures the elements
 * themselves on every scroll (and on resize), so whatever shows the focus (a highlighted card, a big
 * year, a boat on a map) always agrees with what the visitor sees, whatever the element heights.
 */
export function useFocusPosition(itemsRef: RefObject<(HTMLElement | null)[]>): FocusPosition {
  const position = useMotionValue(0);
  const activeRef = useRef(0);
  const [focus, setFocus] = useState<FocusPosition["focus"]>({ index: 0, direction: 1 });
  const { scrollY } = useScroll();

  const measure = useCallback(() => {
    const centers = (itemsRef.current ?? []).map((item) => {
      const rect = item?.getBoundingClientRect();
      return rect ? rect.top + rect.height / 2 : 0;
    });
    const last = centers.length - 1;
    if (last < 0) return;
    const middle = window.innerHeight / 2;
    const gapBefore = Math.max(1, (centers[1] ?? centers[0] + 1) - centers[0]);
    const gapAfter = Math.max(1, centers[last] - (centers[last - 1] ?? centers[last] - 1));

    let next: number;
    if (middle <= centers[0]) {
      next = Math.max(-0.5, -(centers[0] - middle) / gapBefore);
    } else if (middle >= centers[last]) {
      next = Math.min(last + 0.5, last + (middle - centers[last]) / gapAfter);
    } else {
      const index = centers.findIndex((center, at) => middle >= center && middle <= centers[at + 1]);
      next = index + (middle - centers[index]) / Math.max(1, centers[index + 1] - centers[index]);
    }
    const stepped = withDwell(next);
    position.set(stepped);

    const index = Math.min(last, Math.max(0, Math.round(stepped)));
    if (index !== activeRef.current) {
      const direction = index > activeRef.current ? 1 : -1;
      activeRef.current = index;
      setFocus({ index, direction });
    }
  }, [itemsRef, position]);

  useMotionValueEvent(scrollY, "change", measure);
  useEffect(() => {
    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return { position, focus };
}
