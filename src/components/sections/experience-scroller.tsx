"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "motion/react";
import { WaveCard } from "@/components/ui/wave-card";
import { ScrollStory, StoryItem } from "@/components/sections/scroll-story";
import { SeaRail } from "@/components/sections/sea-rail";
import { useFocusPosition } from "@/hooks/use-focus-position";

export type ExperienceView = {
  id: string;
  year: number;
  period: string;
  duration: string;
  role: string;
  company: string;
  location: string;
  points: string[];
  /** Accessible name of the rail marker that jumps to this role. */
  jumpLabel: string;
};

type Props = {
  title: string;
  intro: string;
  total: { value: string; label: string };
  items: ExperienceView[];
};

/** Strong ease-out (Emil Kowalski): responsive start, soft landing. */
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * Scroll story (lg and up), three columns: the pinned role in focus (big year, period, duration),
 * the pinned sea line a boat sails down as you scroll, and the scrolling cards. Scrolling down
 * travels back in time. Below lg it is a plain list.
 */
export function ExperienceScroller({ title, intro, total, items }: Props) {
  const reducedMotion = useReducedMotion();
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  // Focus position in "stops": measured from the cards themselves on every scroll, so the year, the
  // highlighted card and the boat always agree, whatever the card heights.
  const { position: focusPosition, focus } = useFocusPosition(cardRefs);
  const smoothPosition = useSpring(focusPosition, { stiffness: 160, damping: 30, restDelta: 0.001 });

  const active = items[focus.index];
  const jumpTo = (index: number) =>
    cardRefs.current[index]?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });

  return (
    <ScrollStory
      labelledBy="experience-title"
      pinHeightRem={34}
      listClassName="space-y-6 lg:space-y-4"
      pinned={
        <>
          <h2 id="experience-title" className="font-display text-3xl font-medium tracking-tight text-signal sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-sm text-muted-foreground">{intro}</p>

          {/* Focus panel: a visual echo of the card in the middle of the screen (the cards carry the same text). */}
          <div className="mt-10 hidden lg:block">
            <div aria-hidden className="min-w-0">
              <div className="relative h-24 overflow-hidden">
                <AnimatePresence initial={false} custom={focus.direction} mode="popLayout">
                  <motion.p
                    key={active.year}
                    custom={focus.direction}
                    variants={{
                      enter: (direction: number) => ({ y: reducedMotion ? 0 : direction * 48, opacity: 0, filter: "blur(4px)" }),
                      center: { y: 0, opacity: 1, filter: "blur(0px)" },
                      exit: (direction: number) => ({ y: reducedMotion ? 0 : direction * -48, opacity: 0, filter: "blur(4px)" }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: reducedMotion ? 0 : 0.45, ease: EASE_OUT }}
                    className="absolute inset-x-0 top-0 font-display text-8xl font-medium leading-none tracking-tight tabular-nums"
                  >
                    {active.year}
                  </motion.p>
                </AnimatePresence>
              </div>
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
                  className="mt-4 space-y-1"
                >
                  <p className="font-data text-sm text-signal">{active.period}</p>
                  <p className="font-data text-sm text-muted-foreground">{active.duration}</p>
                  <p className="pt-2 text-sm text-foreground">
                    {active.role} · {active.company}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <p className="mt-10 border-t border-border pt-5 text-sm text-muted-foreground">
            <span className="block font-display text-2xl font-medium text-foreground">{total.value}</span>
            {total.label}
          </p>
        </>
      }
      rail={
        <SeaRail
          position={reducedMotion ? focusPosition : smoothPosition}
          stops={items.map(({ id, jumpLabel }) => ({ id, jumpLabel }))}
          activeIndex={focus.index}
          onJump={jumpTo}
          reducedMotion={Boolean(reducedMotion)}
        />
      }
    >
      {items.map((item, index) => (
        <StoryItem
          key={item.id}
          active={index === focus.index}
          ref={(card) => {
            cardRefs.current[index] = card;
          }}
        >
          <WaveCard className="w-full">
            <p className="font-data text-xs text-signal">
              {item.period} <span className="text-muted-foreground">· {item.duration}</span>
            </p>
            <h3 className="mt-1.5 text-lg font-medium">{item.role}</h3>
            <p className="text-sm text-muted-foreground">
              {item.company}, {item.location}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              {item.points.map((point) => (
                <li key={point} className="flex gap-2.5">
                  <span className="mt-2 h-px w-3 shrink-0 bg-border" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </WaveCard>
        </StoryItem>
      ))}
    </ScrollStory>
  );
}
