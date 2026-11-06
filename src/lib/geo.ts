export type LatLng = { lat: number; lng: number };
export type Point = { x: number; y: number };

/**
 * Plain equirectangular projection (longitude -> x, latitude -> y, north up) of a few places into a
 * `width` x `height` box with `padding` around them. Fine for cities a few hundred km apart.
 */
export function projectPoints<Id extends string>(
  places: Record<Id, LatLng>,
  { width, height, padding }: { width: number; height: number; padding: number },
): Record<Id, Point> {
  const entries = Object.entries(places) as [Id, LatLng][];
  const lngs = entries.map(([, place]) => place.lng);
  const lats = entries.map(([, place]) => place.lat);
  const [minLng, maxLng, minLat, maxLat] = [Math.min(...lngs), Math.max(...lngs), Math.min(...lats), Math.max(...lats)];
  // One scale for both axes keeps distances undistorted; the box is centred around the places.
  const scale = Math.min((width - 2 * padding) / (maxLng - minLng), (height - 2 * padding) / (maxLat - minLat));
  const offsetX = (width - (maxLng - minLng) * scale) / 2;
  const offsetY = (height - (maxLat - minLat) * scale) / 2;

  return Object.fromEntries(
    entries.map(([id, place]) => [id, { x: offsetX + (place.lng - minLng) * scale, y: offsetY + (maxLat - place.lat) * scale }]),
  ) as Record<Id, Point>;
}

/**
 * One leg of the route: a cubic curve that always bulges to the same side of the direction of travel.
 * That way a leg and its return trip curve to opposite sides of the map instead of overlapping.
 */
function routeLeg(from: Point, to: Point, bulge: number) {
  const nx = -(to.y - from.y) * bulge;
  const ny = (to.x - from.x) * bulge;
  const c1 = { x: from.x + (to.x - from.x) / 3 + nx, y: from.y + (to.y - from.y) / 3 + ny };
  const c2 = { x: from.x + (2 * (to.x - from.x)) / 3 + nx, y: from.y + (2 * (to.y - from.y)) / 3 + ny };
  const format = ({ x, y }: Point) => `${x.toFixed(1)},${y.toFixed(1)}`;
  return `C${format(c1)} ${format(c2)} ${format(to)}`;
}

/** The route as separate paths, one per leg, so each leg's length can be measured on its own. */
export function buildRouteLegs(points: Point[], bulge = 0.22) {
  return points.slice(1).map((to, index) => {
    const from = points[index];
    return `M${from.x.toFixed(1)},${from.y.toFixed(1)} ${routeLeg(from, to, bulge)}`;
  });
}

/** A smooth path through `points`, made of the same legs as `buildRouteLegs`. */
export function buildRoutePath(points: Point[], bulge = 0.22) {
  const start = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  return [start, ...points.slice(1).map((to, index) => routeLeg(points[index], to, bulge))].join(" ");
}
