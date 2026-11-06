"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMotionValueEvent, useReducedMotion, useSpring } from "motion/react";
import { ScrollStory, StoryItem } from "@/components/sections/scroll-story";
import { Boat } from "@/components/ui/boat";
import { useFocusPosition } from "@/hooks/use-focus-position";
import { buildRouteLegs, buildRoutePath, projectPoints } from "@/lib/geo";
import { cities, routeStops, type CityId } from "@/lib/route";

export type RouteStopView = {
  id: string;
  label: string;
  detail: string;
};

type Props = {
  title: string;
  intro: string;
  cityNames: Record<CityId, string>;
  stops: RouteStopView[];
};

const MAP = { width: 360, height: 340, padding: 56 };
const POINTS = projectPoints(cities, MAP);
const STOP_POINTS = routeStops.map((stop) => POINTS[stop.city]);
const ROUTE_PATH = buildRoutePath(STOP_POINTS);
const ROUTE_LEGS = buildRouteLegs(STOP_POINTS);

/**
 * "My route": the cities where the teams I built with are based, joined by a wavy route.
 * The map stays centred on screen while the stops scroll; the boat sails to whichever stop is
 * nearest the middle, and that stop is the one in full colour. City positions come from real
 * coordinates (lib/route.ts), so distances are right.
 */
export function RouteMap({ title, intro, cityNames, stops }: Props) {
  const reducedMotion = useReducedMotion();
  const stopRefs = useRef<(HTMLLIElement | null)[]>([]);
  const routeRef = useRef<SVGPathElement>(null);
  const boatRef = useRef<SVGGElement>(null);
  const travelledRef = useRef<SVGPathElement>(null);

  // The boat and the highlighted stop follow whichever stop is nearest the middle of the screen.
  const { position: stopPosition, focus } = useFocusPosition(stopRefs);
  const smoothPosition = useSpring(stopPosition, { stiffness: 140, damping: 28, restDelta: 0.001 });

  // Where along the route (as a fraction of its length) each stop sits: the cumulative length of the
  // legs before it. Measuring the legs separately keeps the two visits to Bogotá apart.
  const stopFractions = useRef<number[]>([]);
  useEffect(() => {
    const measure = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const lengths = ROUTE_LEGS.map((leg) => {
      measure.setAttribute("d", leg);
      return measure.getTotalLength();
    });
    const total = lengths.reduce((sum, length) => sum + length, 0);
    let travelled = 0;
    stopFractions.current = [0, ...lengths.map((length) => (travelled += length) / total)];
  }, []);

  const place = useCallback((stopsPosition: number) => {
    const route = routeRef.current;
    const boat = boatRef.current;
    const travelled = travelledRef.current;
    const fractions = stopFractions.current;
    if (!route || !boat || !travelled || !fractions.length) return;

    // Stop positions (0, 1, 2...) map to where each stop sits along the route; in between, interpolate.
    const clamped = Math.min(fractions.length - 1, Math.max(0, stopsPosition));
    const from = Math.floor(clamped);
    const to = Math.min(fractions.length - 1, from + 1);
    const fraction = fractions[from] + (fractions[to] - fractions[from]) * (clamped - from);

    const total = route.getTotalLength();
    const length = fraction * total;
    const point = route.getPointAtLength(length);
    const ahead = route.getPointAtLength(Math.min(total, length + 2));
    const behind = route.getPointAtLength(Math.max(0, length - 2));
    // The boat's bow points down (+y), so its heading is the path direction minus 90 degrees.
    const heading = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI - 90;
    boat.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) rotate(${heading.toFixed(1)})`);
    travelled.setAttribute("stroke-dasharray", `${length.toFixed(1)} ${total.toFixed(1)}`);
  }, []);

  const boatPosition = reducedMotion ? stopPosition : smoothPosition;
  useMotionValueEvent(boatPosition, "change", place);
  useEffect(() => place(boatPosition.get()), [place, boatPosition]);

  const cityLabels = useMemo(
    () =>
      (Object.keys(cities) as CityId[]).map((id) => ({
        id,
        name: cityNames[id],
        point: POINTS[id],
        // Label sits beside the dot, on the side with more room; the southernmost city's goes below.
        anchor: POINTS[id].x > MAP.width / 2 ? ("end" as const) : ("start" as const),
        below: POINTS[id].y > MAP.height * 0.7,
      })),
    [cityNames],
  );

  return (
    <ScrollStory
      labelledBy="route-title"
      pinHeightRem={36}
      listClassName="divide-y divide-border"
      pinned={
        <>
          <h2 id="route-title" className="font-display text-3xl font-medium tracking-tight text-signal sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-sm text-muted-foreground">{intro}</p>
          <svg
            viewBox={`0 0 ${MAP.width} ${MAP.height}`}
            role="img"
            aria-label={`${title}: ${(Object.keys(cities) as CityId[]).map((id) => cityNames[id]).join(" · ")}`}
            className="mt-6 w-full overflow-visible"
          >
            <path ref={routeRef} d={ROUTE_PATH} fill="none" className="stroke-border" strokeWidth={2} strokeLinecap="round" strokeDasharray="2 6" />
            <path ref={travelledRef} d={ROUTE_PATH} fill="none" className="stroke-signal" strokeWidth={2.5} strokeLinecap="round" />

            {cityLabels.map(({ id, name, point, anchor, below }) => (
              <g key={id}>
                <circle cx={point.x} cy={point.y} r={5} className="fill-background stroke-signal" strokeWidth={1.5} />
                <text
                  x={below ? point.x : point.x + (anchor === "end" ? -32 : 32)}
                  y={below ? point.y + 26 : point.y + 4}
                  textAnchor={below ? "middle" : anchor}
                  className="fill-foreground font-display text-[15px]"
                >
                  {name}
                </text>
              </g>
            ))}

            <g ref={boatRef}>
              <Boat scale={1.3} />
            </g>
          </svg>
        </>
      }
    >
      {stops.map((stop, index) => {
        const view = routeStops[index];
        return (
          <StoryItem
            key={stop.id}
            active={index === focus.index}
            className="max-lg:py-5"
            ref={(item) => {
              stopRefs.current[index] = item;
            }}
          >
            <p className="font-data text-xs text-signal">
              {view.year ? `${view.year} · ` : ""}
              {cityNames[view.city]}
            </p>
            <h3 className="mt-1 text-lg font-medium">{stop.label}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{stop.detail}</p>
          </StoryItem>
        );
      })}
    </ScrollStory>
  );
}
