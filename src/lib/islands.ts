/**
 * The Canary Islands and the map defaults — SHARED file.
 *
 * `center` is [longitude, latitude], the order MapLibre expects. A person's island is the only
 * location we store for them; it is also the fallback for "nearby" when the browser refuses
 * to share the device location (F6).
 */
export const ISLANDS = [
  { id: "tenerife", name: "Tenerife", center: [-16.57, 28.29] },
  { id: "gran-canaria", name: "Gran Canaria", center: [-15.6, 27.96] },
  { id: "lanzarote", name: "Lanzarote", center: [-13.64, 29.04] },
  { id: "fuerteventura", name: "Fuerteventura", center: [-14.01, 28.36] },
  { id: "la-palma", name: "La Palma", center: [-17.86, 28.68] },
  { id: "la-gomera", name: "La Gomera", center: [-17.23, 28.1] },
  { id: "el-hierro", name: "El Hierro", center: [-18.0, 27.74] },
  { id: "la-graciosa", name: "La Graciosa", center: [-13.5, 29.25] },
] as const;

export type IslandId = (typeof ISLANDS)[number]["id"];

/** [[west, south], [east, north]] — the whole archipelago; use as the map's initial `bounds`. */
export const ARCHIPELAGO_BOUNDS: [[number, number], [number, number]] = [[-18.3, 27.5], [-13.2, 29.5]];

/** Free vector tiles, no API key. Pass as `mapStyle` to <Map> from "react-map-gl/maplibre". */
export const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
