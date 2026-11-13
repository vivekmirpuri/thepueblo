"use client";
/**
 * The map of the Canary Islands with a pin per activity (F4) — Track A. Built (not a placeholder).
 *
 * Two jobs, same map:
 *  - browsing: pass `events`; each in-person one gets a pin with its category icon, and tapping
 *    a pin calls `onSelect`.
 *  - choosing a place for a new activity: pass `onPick`; tapping anywhere reports the point.
 *  - the target button (top right) shows your position as a blue dot and reports it via `onLocate`.
 *
 * It needs `window` (WebGL), so load it with next/dynamic and `ssr: false`.
 * Presentational: it never loads data; the page owns the events and the filters.
 */
import Map, { GeolocateControl, Marker, NavigationControl, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPinIcon } from "lucide-react";
import { findCategory } from "@/lib/categories";
import { ARCHIPELAGO_BOUNDS, MAP_STYLE } from "@/lib/islands";
import { cn } from "@/lib/utils";
import type { Meetup } from "@/lib/types";

// The bundler does not serve MapLibre's worker, so we serve our own copy (scripts/copy-map-worker.mjs).
setWorkerUrl("/maplibre-gl-worker.mjs");

export type Point = { lat: number; lng: number };

export function EventMap({
  events = [],
  selectedId,
  onSelect,
  pick,
  onPick,
  onLocate,
  className,
}: {
  events?: Meetup[];
  selectedId?: string | null;
  onSelect?: (event: Meetup) => void;
  /** The place chosen so far, shown as a single pin. */
  pick?: Point | null;
  onPick?: (point: Point) => void;
  /** Called when the person taps "where am I" and the browser shares the position. Kept in memory only. */
  onLocate?: (point: Point) => void;
  className?: string;
}) {
  const withPlace = events.filter((event) => event.location);

  return (
    <div className={cn("h-[45vh] w-full overflow-hidden rounded-xl border", className)}>
      <Map
        mapStyle={MAP_STYLE}
        initialViewState={{ bounds: ARCHIPELAGO_BOUNDS, fitBoundsOptions: { padding: 24 } }}
        onClick={onPick ? (event: MapLayerMouseEvent) => onPick({ lat: event.lngLat.lat, lng: event.lngLat.lng }) : undefined}
        cursor={onPick ? "crosshair" : "grab"}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <GeolocateControl
          position="top-right"
          positionOptions={{ enableHighAccuracy: true }}
          onGeolocate={(event) => onLocate?.({ lat: event.coords.latitude, lng: event.coords.longitude })}
        />
        {withPlace.map((event) => {
          const Icon = findCategory(event.category)?.icon ?? MapPinIcon;
          const chosen = event.id === selectedId;
          return (
            <Marker
              key={event.id}
              longitude={event.location!.lng}
              latitude={event.location!.lat}
              anchor="bottom"
              onClick={() => onSelect?.(event)}
            >
              <button
                type="button"
                aria-label={event.title}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 border-background shadow-md transition-transform",
                  chosen ? "scale-125 bg-primary text-primary-foreground" : "bg-background text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            </Marker>
          );
        })}

        {pick && (
          <Marker longitude={pick.lng} latitude={pick.lat} anchor="bottom">
            <MapPinIcon className="size-8 fill-primary text-primary-foreground" aria-label="Lugar elegido" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
