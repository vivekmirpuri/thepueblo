/**
 * Copies MapLibre's worker into public/ before dev and build.
 *
 * MapLibre starts a Web Worker and works out its URL from its own `import.meta.url`. Once the
 * bundler has moved the library into a chunk, that address points at a file nobody serves, so the
 * map loads no tiles. We serve the worker ourselves and tell MapLibre where it is
 * (`setWorkerUrl` in src/components/map/EventMap.tsx).
 *
 * It is copied on every run instead of being committed, so it can never drift from the installed
 * version of maplibre-gl. public/maplibre-gl-worker.mjs is gitignored.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

mkdirSync("public", { recursive: true });

const packageJson = createRequire(import.meta.url).resolve("maplibre-gl/package.json");
const worker = join(dirname(packageJson), "dist", "maplibre-gl-worker.mjs");
copyFileSync(worker, join("public", "maplibre-gl-worker.mjs"));
