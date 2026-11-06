import { describe, expect, it } from "vitest";
import { buildRouteLegs, buildRoutePath, projectPoints } from "@/lib/geo";
import { cities, routeStops } from "@/lib/route";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

describe("projectPoints", () => {
  const box = { width: 400, height: 300, padding: 30 };
  const points = projectPoints(cities, box);

  it("keeps every city inside the padded box", () => {
    for (const { x, y } of Object.values(points)) {
      expect(x).toBeGreaterThanOrEqual(box.padding - 0.001);
      expect(x).toBeLessThanOrEqual(box.width - box.padding + 0.001);
      expect(y).toBeGreaterThanOrEqual(box.padding - 0.001);
      expect(y).toBeLessThanOrEqual(box.height - box.padding + 0.001);
    }
  });

  it("puts north up and east to the right", () => {
    expect(points.socorro.y).toBeLessThan(points.bogota.y); // Socorro is north of Bogotá
    expect(points.socorro.x).toBeGreaterThan(points.medellin.x); // Socorro is east of Medellín
    expect(points.bogota.x).toBeGreaterThan(points.medellin.x);
  });
});

describe("buildRoutePath", () => {
  it("starts at the first point and ends at the last", () => {
    const path = buildRoutePath([{ x: 0, y: 0 }, { x: 100, y: 50 }, { x: 20, y: 120 }]);
    expect(path.startsWith("M0.0,0.0")).toBe(true);
    expect(path.endsWith("20.0,120.0")).toBe(true);
    expect(path.match(/C/g)).toHaveLength(2);
  });
});

describe("route stops", () => {
  it("have text in both languages, in the same order", () => {
    const ids = routeStops.map((stop) => stop.id);
    expect(es.about.route.stops.map((stop) => stop.id)).toEqual(ids);
    expect(en.about.route.stops.map((stop) => stop.id)).toEqual(ids);
  });

  it("only name cities that have coordinates", () => {
    for (const stop of routeStops) expect(cities[stop.city]).toBeDefined();
  });
});

describe("buildRouteLegs", () => {
  it("makes one path per leg that joins up with the full route", () => {
    const points = [{ x: 0, y: 0 }, { x: 100, y: 50 }, { x: 20, y: 120 }];
    const legs = buildRouteLegs(points);
    expect(legs).toHaveLength(2);
    expect(legs[0].startsWith("M0.0,0.0")).toBe(true);
    expect(legs[1].startsWith("M100.0,50.0")).toBe(true);
    // Every curve of every leg appears, in order, in the full path.
    const curves = legs.map((leg) => leg.slice(leg.indexOf("C")));
    expect(buildRoutePath(points)).toBe(`M0.0,0.0 ${curves.join(" ")}`);
  });
});
