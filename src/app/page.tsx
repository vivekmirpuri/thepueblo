/**
 * Home: the map, the category chips and the event list — Track A. PLACEHOLDER.
 * Pattern: this page is the CONTAINER (loads data, holds state); components under
 * src/components/ only receive props and draw.
 *
 * To build (A1–A5):
 *  - Make this a client container: load events once with `listUpcomingEvents()` from "@/lib/db",
 *    hold the selected category, sort and filters in state, and pass plain props down.
 *  - Layout top to bottom: <CategoryChips>, <EventMap>, sort/filter row, list of <EventCard>.
 *  - Nearby (A4): ask `navigator.geolocation.getCurrentPosition`; sort with `distanceKm` from
 *    "@/lib/geo". If the user refuses, use the centre of their island from "@/lib/islands".
 *  - A5 filter: "accessible for me" — pick inclusion features from INCLUSION ("@/lib/inclusion") and show
 *    only events offering all of them. Kept in page state only, never saved to the profile.
 *  - Animate list changes lightly with `motion/react` (items fading in), nothing more.
 */
import { CategoryChips } from "@/components/discover/CategoryChips";
import { EventMap } from "@/components/map/EventMap";
import { Placeholder } from "@/components/shared/Placeholder";

export default function HomePage() {
  return (
    <>
      <Placeholder title="Mapa" track="A" features="F4 · F5 · F6 · F7" />
      <CategoryChips />
      <EventMap />
    </>
  );
}
