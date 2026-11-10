"use client";

import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Rocket,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import { CountUp } from "@/components/motion/count-up";
import { WaveDivider } from "@/components/ui/wave-divider";

export type Achievement = {
  id: string;
  metric?: { value: string; caption: string };
  lead: string;
  text: string;
};

export type AchievementGroup = {
  role: string;
  company: string;
  period: string;
  points: Achievement[];
};

export type RingLabels = {
  label: string;
  previous: string;
  next: string;
  position: string;
};

type Card = Achievement & { role: string; company: string; period: string };

const ICONS: Record<string, LucideIcon> = {
  "bartik-quality": ShieldCheck,
  "attendv-devops": Rocket,
  "autonomic-git": GitBranch,
};

/** How far the wheel turns per pixel dragged, and how far a flick carries it past where the finger left. */
const DEGREES_PER_PIXEL = 0.3;
const FLICK_DEGREES_PER_VELOCITY = 0.025;
/** Side-to-side spread of the wheel, in card widths. */
const SPREAD = 1.45;
/** How far the back of the wheel rises behind the front card, in pixels. */
const RISE = 110;
/** How far a card at the side of the wheel turns toward the middle, in degrees. It straightens to 0 at the front. */
const LEAN = 24;
/** Slow drift of the wheel on its own (degrees per second), how quickly it speeds up or slows down, and the wait after a touch. */
const DRIFT = 4;
const EASE_RATE = 2.2;
const RESUME_DELAY_MS = 2500;
const SPRING = { type: "spring", stiffness: 170, damping: 26 } as const;

const mod = (value: number, size: number) => ((value % size) + size) % size;

/** Position of one card on the wheel. The card always faces the viewer; only its place, size and fade change. */
function WheelCard({
  card,
  index,
  step,
  rotation,
  clock,
  isFront,
  onSelect,
}: {
  card: Card;
  index: number;
  step: number;
  rotation: MotionValue<number>;
  /** Seconds since the wheel mounted; drives the gentle float. Stays 0 for reduced motion. */
  clock: MotionValue<number>;
  isFront: boolean;
  onSelect: (index: number) => void;
}) {
  const radians = useTransform(
    rotation,
    (turn) => ((index * step + turn) * Math.PI) / 180,
  );
  // 1 at the front of the wheel, 0 at the back.
  const nearness = useTransform(radians, (angle) => (Math.cos(angle) + 1) / 2);

  const x = useTransform(
    radians,
    (angle) => `${Math.sin(angle) * SPREAD * 100}%`,
  );
  const rotateY = useTransform(radians, (angle) => -Math.sin(angle) * LEAN);
  // Each card bobs on its own beat, more the further back it is, so the wheel seems to hang in water.
  const y = useTransform(
    [nearness, clock],
    ([near, seconds]: number[]) =>
      (1 - near) * -RISE +
      Math.sin(seconds * 0.8 + index * 1.9) * (3 + 8 * (1 - near)),
  );
  const rotateZ = useTransform(
    [nearness, clock],
    ([near, seconds]: number[]) =>
      Math.sin(seconds * 0.6 + index * 2.3) * (0.4 + 1.4 * (1 - near)),
  );
  const scale = useTransform(nearness, (near) => 0.6 + 0.4 * near);
  const opacity = useTransform(nearness, (near) => 0.12 + 0.88 * near ** 3);
  const filter = useTransform(
    nearness,
    (near) => `blur(${((1 - near) * 4).toFixed(2)}px)`,
  );
  const zIndex = useTransform(nearness, (near) => Math.round(near * 100));

  const Icon = ICONS[card.id];

  return (
    <motion.article
      aria-hidden={!isFront}
      onTap={() => !isFront && onSelect(index)}
      style={{ x, y, rotateY, rotateZ, scale, opacity, filter, zIndex }}
      className={`absolute inset-x-0 top-0 mx-auto flex h-92 w-72 flex-col sm:w-80 ${
        isFront ? "" : "cursor-pointer"
      }`}
    >
      <WaveDivider size="h-4 sm:h-6" />
      <div className="flex flex-1 flex-col bg-card px-6">
        <p className="font-data text-xs text-muted-foreground">{card.period}</p>
        <p className="mt-1 text-sm font-medium">
          {card.role} <span className="text-signal">· {card.company}</span>
        </p>

        <div className="mt-3 min-h-16">
          {card.metric ? (
            <>
              <p className="font-display text-5xl font-medium leading-none tracking-tight text-signal">
                <CountUp value={card.metric.value} />
              </p>
              <p className="mt-2 text-xs leading-tight text-muted-foreground">
                {card.metric.caption}
              </p>
            </>
          ) : (
            Icon && (
              <Icon
                aria-hidden
                className="size-10 text-signal"
                strokeWidth={1.5}
              />
            )
          )}
        </div>

        <h3 className="mt-5 font-medium leading-snug">{card.lead}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {card.text}
        </p>
      </div>
      <WaveDivider flip size="h-4 sm:h-6" />
    </motion.article>
  );
}

/**
 * Achievements on a wheel: every card sits on a circle, the one in front is read in full and the rest
 * fade and shrink toward the back. Drag the wheel (a flick carries it), tap a card, use the arrow
 * buttons or the arrow keys to bring another one forward.
 */
export function AchievementRing({
  groups,
  labels,
}: {
  groups: AchievementGroup[];
  labels: RingLabels;
}) {
  const cards: Card[] = groups.flatMap(({ points, ...group }) =>
    points.map((point) => ({ ...point, ...group })),
  );
  const count = cards.length;
  const step = 360 / count;

  const reducedMotion = useReducedMotion();
  const rotation = useMotionValue(0);
  const [front, setFront] = useState(0);
  const settling = useRef<AnimationPlaybackControls | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const onScreen = useInView(stage);

  // Drift: the wheel turns slowly by itself. Its speed eases toward the target, so starting and
  // stopping (hover, touch, a click on a button) never jerks.
  const held = useRef(false); // pointer over the wheel, or focus inside it
  const busy = useRef(false); // being dragged, or settling on a card
  const resumeAt = useRef(0);
  const driftSpeed = useRef(0);

  const clock = useMotionValue(0);

  useAnimationFrame((time, delta) => {
    if (reducedMotion) return;
    clock.set(time / 1000);
    const seconds = Math.min(delta, 50) / 1000;
    const drifting =
      onScreen && !held.current && !busy.current && time >= resumeAt.current;
    const target = drifting ? -DRIFT : 0;
    driftSpeed.current +=
      (target - driftSpeed.current) * (1 - Math.exp(-EASE_RATE * seconds));
    if (Math.abs(driftSpeed.current) > 0.001)
      rotation.set(rotation.get() + driftSpeed.current * seconds);
  });

  useMotionValueEvent(rotation, "change", (turn) =>
    setFront(mod(Math.round(-turn / step), count)),
  );

  /** Turns the wheel so that `turns` is the card in front (an absolute turn count, not wrapped to the list). */
  const settleOn = (turns: number) => {
    settling.current?.stop();
    busy.current = true;
    driftSpeed.current = 0;
    const finish = () => {
      busy.current = false;
      resumeAt.current = performance.now() + RESUME_DELAY_MS;
    };
    settling.current = animate(rotation, -turns * step, {
      ...(reducedMotion ? { duration: 0 } : SPRING),
      onComplete: finish,
    });
  };

  const currentTurns = () => Math.round(-rotation.get() / step);

  const goBy = (delta: number) => settleOn(currentTurns() + delta);

  const bringToFront = (index: number) => {
    const turns = currentTurns();
    // Shortest way round the wheel, either direction.
    let delta = mod(index - mod(turns, count), count);
    if (delta > count / 2) delta -= count;
    settleOn(turns + delta);
  };

  const onPan = (_: PointerEvent, info: PanInfo) => {
    rotation.set(rotation.get() + info.delta.x * DEGREES_PER_PIXEL);
  };

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    const carried =
      rotation.get() + info.velocity.x * FLICK_DEGREES_PER_VELOCITY;
    settleOn(Math.round(-carried / step));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") goBy(1);
    else if (event.key === "ArrowLeft") goBy(-1);
    else return;
    event.preventDefault();
  };

  const position = labels.position
    .replace("{current}", String(front + 1))
    .replace("{total}", String(count));

  return (
    <div>
      <motion.div
        role="group"
        aria-roledescription="carousel"
        aria-label={labels.label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        ref={stage}
        onPointerEnter={() => (held.current = true)}
        onPointerLeave={() => (held.current = false)}
        onFocus={() => (held.current = true)}
        onBlur={() => (held.current = false)}
        onPanStart={() => {
          settling.current?.stop();
          busy.current = true;
          driftSpeed.current = 0;
        }}
        onPan={onPan}
        onPanEnd={onPanEnd}
        style={{ touchAction: "pan-y" }}
        className="relative h-120 cursor-grab select-none overflow-hidden pt-28 outline-none mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] focus-visible:ring-2 focus-visible:ring-signal/50 active:cursor-grabbing"
      >
        <div className="relative h-92 perspective-[1400px]">
          {cards.map((card, index) => (
            <WheelCard
              key={card.id}
              card={card}
              index={index}
              step={step}
              rotation={rotation}
              clock={clock}
              isFront={index === front}
              onSelect={bringToFront}
            />
          ))}
        </div>
      </motion.div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label={labels.previous}
          onClick={() => goBy(-1)}
          className="grid size-10 cursor-pointer place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-signal/50 hover:text-signal focus-visible:ring-2 focus-visible:ring-signal/50 focus-visible:outline-none active:scale-95"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <p
          aria-live="polite"
          className="min-w-20 text-center font-data text-xs text-muted-foreground"
        >
          {position}
        </p>
        <button
          type="button"
          aria-label={labels.next}
          onClick={() => goBy(1)}
          className="grid size-10 cursor-pointer place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-signal/50 hover:text-signal focus-visible:ring-2 focus-visible:ring-signal/50 focus-visible:outline-none active:scale-95"
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  );
}
