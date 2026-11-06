"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { Boat } from "@/components/ui/boat";

type RailStop = { id: string; jumpLabel: string };

type Props = {
  /** Where the visitor is, in stops: 0 = first role centred, 1 = second, fractions in between. */
  position: MotionValue<number>;
  stops: RailStop[];
  activeIndex: number;
  onJump: (index: number) => void;
  reducedMotion: boolean;
};

const WIDTH = 56;
const HEIGHT = 440;
const CENTER = WIDTH / 2;
const AMPLITUDE = 7;
const WAVELENGTH = 120;
/** Radians per second the swell travels down the line. */
const SWELL_SPEED = 1.6;
const SAMPLE_STEP = 6;

const waveX = (y: number, phase: number) =>
  CENTER + AMPLITUDE * Math.sin((2 * Math.PI * y) / WAVELENGTH - phase);
const waveSlope = (y: number, phase: number) =>
  ((AMPLITUDE * 2 * Math.PI) / WAVELENGTH) *
  Math.cos((2 * Math.PI * y) / WAVELENGTH - phase);

function linePath(fromY: number, toY: number, phase: number) {
  let path = `M${waveX(fromY, phase).toFixed(2)},${fromY.toFixed(2)}`;
  for (let y = fromY + SAMPLE_STEP; y < toY; y += SAMPLE_STEP)
    path += ` L${waveX(y, phase).toFixed(2)},${y.toFixed(2)}`;
  return `${path} L${waveX(toY, phase).toFixed(2)},${toY.toFixed(2)}`;
}

const stopY = (index: number, count: number) =>
  ((index + 0.5) / count) * HEIGHT;

/**
 * The sea line between the year and the cards: a swell keeps travelling down it, and a small
 * boat (seen from above) sails along it as the visitor scrolls, steering with the wave. Each
 * role is a buoy on the line that jumps to its card. Every frame writes straight to the DOM;
 * the loop only runs while the rail is on screen.
 */
export function SeaRail({
  position,
  stops,
  activeIndex,
  onJump,
  reducedMotion,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seaRef = useRef<SVGPathElement>(null);
  const wakeRef = useRef<SVGPathElement>(null);
  const boatRef = useRef<SVGGElement>(null);
  const buoyRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let frame = 0;
    let visible = false;
    const startedAt = performance.now();

    const draw = (now: number) => {
      const seconds = (now - startedAt) / 1000;
      const phase = reducedMotion ? 0 : seconds * SWELL_SPEED;
      const boatY = Math.min(HEIGHT, Math.max(0, ((position.get() + 0.5) / stops.length) * HEIGHT));

      seaRef.current?.setAttribute("d", linePath(0, HEIGHT, phase));
      wakeRef.current?.setAttribute(
        "d",
        linePath(0, Math.max(boatY, 0.1), phase),
      );

      // Bow points down the line and follows the slope of the wave; a gentle bob when motion is allowed.
      const heading = (-Math.atan(waveSlope(boatY, phase)) * 180) / Math.PI;
      const bob = reducedMotion ? 0 : Math.sin(seconds * 2.4) * 4;
      boatRef.current?.setAttribute(
        "transform",
        `translate(${waveX(boatY, phase).toFixed(2)} ${boatY.toFixed(2)}) rotate(${(heading + bob).toFixed(2)})`,
      );

      buoyRefs.current.forEach((buoy, index) => {
        if (!buoy) return;
        const y = stopY(index, stops.length);
        buoy.style.transform = `translate(${(waveX(y, phase) - 16).toFixed(2)}px, ${(y - 16).toFixed(2)}px)`;
      });

      if (visible && !reducedMotion) frame = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(draw);
    });
    observer.observe(container);
    // With reduced motion the line is still; it only redraws when the boat moves.
    const unsubscribe = position.on("change", () => {
      if (reducedMotion && visible) requestAnimationFrame(draw);
    });
    draw(performance.now());

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      unsubscribe();
    };
  }, [position, reducedMotion, stops.length]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto"
      style={{ width: WIDTH, height: HEIGHT }}
    >
      <svg
        aria-hidden
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="absolute inset-0 overflow-visible"
      >
        <path
          ref={seaRef}
          fill="none"
          className="stroke-border"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          ref={wakeRef}
          fill="none"
          className="stroke-signal"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <g ref={boatRef}>
          <Boat />
        </g>
      </svg>

      {stops.map((stop, index) => {
        const reached = index <= activeIndex;
        return (
          <button
            key={stop.id}
            ref={(buoy) => {
              buoyRefs.current[index] = buoy;
            }}
            type="button"
            onClick={() => onJump(index)}
            aria-label={stop.jumpLabel}
            aria-current={index === activeIndex ? "step" : undefined}
            className="group absolute left-0 top-0 flex size-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-signal"
          >
            {/* A buoy: a short bar across the line, wider and bright once the boat has reached it. */}
            <span
              className={`h-1 w-4 rounded-full transition-[transform,background-color] duration-300 ease-out group-hover:scale-x-125 ${
                reached ? "bg-signal" : "scale-x-75 bg-muted-foreground/60"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
