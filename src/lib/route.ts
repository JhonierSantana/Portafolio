import type { LatLng } from "@/lib/geo";

export type CityId = "socorro" | "bogota" | "medellin";

export const cities: Record<CityId, LatLng> = {
  socorro: { lat: 6.4683, lng: -73.2597 },
  bogota: { lat: 4.711, lng: -74.0721 },
  medellin: { lat: 6.2442, lng: -75.5812 },
};

export type RouteStop = {
  /** Matches `about.route.stops[].id` in messages/*.json. */
  id: string;
  city: CityId;
  /** Year the stop starts (the hometown has none). */
  year?: number;
};

/** Hometown first, then where each team is based, in the order the roles happened. */
export const routeStops: RouteStop[] = [
  { id: "home", city: "socorro" },
  { id: "holberton", city: "bogota", year: 2022 },
  { id: "medellin", city: "medellin", year: 2023 },
  { id: "bartik", city: "bogota", year: 2025 },
];
