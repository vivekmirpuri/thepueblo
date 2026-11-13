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
 * When the pins change (a filter, a search) the map zooms to fit them, and a chosen pin is centred,
 * so you always see what the list below shows. One finger scrolls the page and two move the map
 * (cooperative gestures), so the map never traps you while scrolling on a phone.
 *
 * It needs `window` (WebGL), so load it with next/dynamic and `ssr: false`.
 * Presentational: it never loads data; the page owns the events and the filters.
 */
import Map, { GeolocateControl, Marker, NavigationControl, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import { useEffect, useRef } from "react";
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

// MapLibre's own buttons and hints, in Spanish.
const LOCALE = {
  "GeolocateControl.FindMyLocation": "Ver dónde estoy",
  "GeolocateControl.LocationNotAvailable": "No podemos saber dónde estás",
  "NavigationControl.ZoomIn": "Acercar",
  "NavigationControl.ZoomOut": "Alejar",
  "NavigationControl.ResetBearing": "Poner el norte arriba",
  "Map.Title": "Mapa",
  "Marker.Title": "Punto en el mapa",
  "AttributionControl.ToggleAttribution": "Ver créditos del mapa",
  "CooperativeGesturesHandler.WindowsHelpText": "Usa Ctrl + rueda para acercar o alejar el mapa",
  "CooperativeGesturesHandler.MacHelpText": "Usa ⌘ + rueda para acercar o alejar el mapa",
  "CooperativeGesturesHandler.MobileHelpText": "Usa dos dedos para mover el mapa",
};

export function EventMap({
  events = [],
  selectedId,
  onSelect,
  pick,
  onPick,
  onLocate,
  onClear,
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
  /** Called when the person taps the map outside any pin, to close the chosen activity. */
  onClear?: () => void;
  className?: string;
}) {
  const map = useRef<MapRef>(null);
  const withPlace = events.filter((event) => event.location);
  const pins = withPlace.map((event) => `${event.id}:${event.location!.lng},${event.location!.lat}`).join("|");

  // Zoom to fit the pins whenever the set changes (a filter or a search), so map and list agree.
  useEffect(() => {
    const current = map.current;
    if (!current || !pins) return;
    const points = pins.split("|").map((pin) => pin.split(":")[1].split(",").map(Number) as [number, number]);
    const lngs = points.map(([lng]) => lng), lats = points.map(([, lat]) => lat);
    current.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], {
      padding: 48, maxZoom: 12, duration: 600,
    });
  }, [pins]);

  // Centre the chosen pin, without zooming out.
  const chosen = withPlace.find((event) => event.id === selectedId);
  useEffect(() => {
    if (!chosen?.location || !map.current) return;
    map.current.easeTo({ center: [chosen.location.lng, chosen.location.lat], zoom: Math.max(map.current.getZoom(), 10), duration: 500 });
  }, [chosen?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- only when the choice changes

  return (
    <div className={cn("h-[40vh] min-h-64 w-full overflow-hidden rounded-xl border", className)}>
      <Map
        ref={map}
        mapStyle={MAP_STYLE}
        locale={LOCALE}
        cooperativeGestures
        attributionControl={{ compact: true }}
        initialViewState={{ bounds: ARCHIPELAGO_BOUNDS, fitBoundsOptions: { padding: 24 } }}
        onClick={(event: MapLayerMouseEvent) => (onPick ? onPick({ lat: event.lngLat.lat, lng: event.lngLat.lng }) : onClear?.())}
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
          const isChosen = event.id === selectedId;
          return (
            <Marker
              key={event.id}
              longitude={event.location!.lng}
              latitude={event.location!.lat}
              anchor="bottom"
              onClick={(click) => {
                click.originalEvent.stopPropagation(); // a pin tap is not a tap on the empty map
                onSelect?.(event);
              }}
            >
              <button
                type="button"
                aria-label={event.title}
                aria-pressed={isChosen}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 border-background shadow-md transition-transform",
                  isChosen ? "z-10 scale-125 bg-primary text-primary-foreground" : "bg-background text-foreground",
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
