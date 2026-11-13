/**
 * The map of the Canary Islands with a pin per event (F4) — Track A. PLACEHOLDER.
 *
 * To build (A1):
 *  - `import Map, { Marker, Popup } from "react-map-gl/maplibre"` and `import "maplibre-gl/dist/maplibre-gl.css"`.
 *  - <Map mapStyle={MAP_STYLE} initialViewState={{ bounds: ARCHIPELAGO_BOUNDS }}> — both from "@/lib/islands".
 *  - One <Marker> per event that has a `location`; tapping it opens a small card (shadcn <Drawer> on phones).
 *  - The map needs `window`: load this component with `next/dynamic` and `ssr: false` from the page.
 *  - Presentational: receives `events` and `onSelect`; the page owns the data and the filters.
 *  - Also used by the create-event form (Track B) to pick a place: add an optional `onPick(lat, lng)`.
 */
import { Placeholder } from "@/components/shared/Placeholder";

export function EventMap() {
  return <Placeholder title="EventMap" track="A" features="F4" />;
}
