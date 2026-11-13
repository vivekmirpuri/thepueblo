/**
 * Distance helper for "nearby" sorting (F6) — SHARED file.
 *
 * Events are sorted in the browser: fine for a few hundred events.
 * shortcut: no geo index; switch to geohash queries (`geofire-common`) if the list grows past that.
 */
type Point = { lat: number; lng: number };

/** Great-circle distance in kilometres (haversine). */
export function distanceKm(a: Point, b: Point): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
