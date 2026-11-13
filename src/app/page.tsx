"use client";
/**
 * Home: the map, the category chips and the list of activities (F4, F5, F6, F7) — Track A.
 * Built (not a placeholder).
 *
 * Pattern: this page is the CONTAINER. It loads every upcoming activity once and then filters,
 * sorts and measures distances in the browser, so changing a filter is instant and costs nothing.
 * <EventMap>, <CategoryChips> and <EventCard> only receive props and draw.
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRightIcon, EyeOffIcon, FilterIcon, HeartIcon, LayersIcon, LocateFixedIcon, MapIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { CategoryChips } from "@/components/discover/CategoryChips";
import { SwipeDeck } from "@/components/discover/SwipeDeck";
import { Bubble } from "@/components/shared/Bubble";
import { EventCard } from "@/components/shared/EventCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { useUser } from "@/lib/auth";
import type { CategoryId } from "@/lib/categories";
import { matchesText } from "@/lib/ai";
import { Input } from "@/components/ui/input";
import { joinEvent, leaveEvent, listUpcomingEvents } from "@/lib/db";
import { distanceKm } from "@/lib/geo";
import { INCLUSION, type InclusionId } from "@/lib/inclusion";
import { ISLANDS } from "@/lib/islands";
import type { Meetup } from "@/lib/types";

// The map needs `window` (WebGL), so it is only loaded in the browser.
const EventMap = dynamic(() => import("@/components/map/EventMap").then((module) => module.EventMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[40vh] min-h-64 w-full rounded-xl" />,
});

const SORTS = [
  { id: "soon", label: "Antes" },
  { id: "near", label: "Cerca" },
  { id: "people", label: "Más gente" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

// Hiding the map is remembered on this device only (a convenience, not part of the profile).
// Storage can throw (private mode, blocked site data); then it is kept in memory for this visit.
const MAP_KEY = "map-hidden";
let mapHiddenMemory: string | null = null;
const mapListeners = new Set<() => void>();
function onMapPref(listener: () => void) {
  mapListeners.add(listener);
  return () => mapListeners.delete(listener);
}
function readMapHidden() {
  try {
    return localStorage.getItem(MAP_KEY) ?? mapHiddenMemory;
  } catch {
    return mapHiddenMemory;
  }
}
function writeMapHidden(value: string) {
  mapHiddenMemory = value;
  try {
    localStorage.setItem(MAP_KEY, value);
  } catch {}
  mapListeners.forEach((listener) => listener());
}

export default function HomePage() {
  const { user, profile } = useUser();
  const router = useRouter();
  const [discovering, setDiscovering] = useState(false);
  const [events, setEvents] = useState<Meetup[] | null>(null);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [text, setText] = useState("");
  const [sort, setSort] = useState<SortId>("soon");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyOfficial, setOnlyOfficial] = useState(false);
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [onlyMyLanguages, setOnlyMyLanguages] = useState(false);
  // Chosen here and now, never saved: a disability is not something we store about a person.
  const [needs, setNeeds] = useState<InclusionId[]>([]);
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const showMap = useSyncExternalStore(onMapPref, () => readMapHidden() !== "1", () => true);
  function toggleMap(show: boolean) {
    if (!show) setSelectedId(null);
    writeMapHidden(show ? "0" : "1");
  }

  useEffect(() => {
    listUpcomingEvents()
      .then(setEvents)
      .catch((error) => {
        console.error(error);
        toast.error("No se han podido cargar las actividades.");
        setEvents([]);
      });
  }, []);

  /** Asks the browser where we are. If it says no, we fall back to the centre of your island. */
  function locate() {
    setSort("near");
    const island = ISLANDS.find((item) => item.id === profile?.island);
    const fallback = () => {
      if (!island) return toast.error("Elige tu isla en tu perfil para ordenar por cercanía.");
      setHere({ lng: island.center[0], lat: island.center[1] });
      toast.info(`Sin ubicación: medimos desde el centro de ${island.name}.`);
    };
    if (!navigator.geolocation) return fallback();
    navigator.geolocation.getCurrentPosition(
      (position) => setHere({ lat: position.coords.latitude, lng: position.coords.longitude }),
      fallback,
      { timeout: 8000 },
    );
  }

  const shown = useMemo(() => {
    if (!events) return [];
    const mine = profile?.languages ?? [];
    const list = events.filter((event) => {
      if (category && event.category !== category) return false;
      if (text && !matchesText(text, event)) return false;
      if (onlyOfficial && !event.official) return false;
      if (onlyOnline && event.mode !== "online") return false;
      if (needs.some((need) => !event.inclusion?.includes(need))) return false;
      if (onlyMyLanguages) {
        const spoken = Object.values(event.attendeeLanguages ?? {}).flat();
        if (!mine.some((code) => spoken.includes(code))) return false;
      }
      return true;
    });

    const far = (event: Meetup) =>
      here && event.location ? distanceKm(here, event.location) : Number.POSITIVE_INFINITY;

    return list.sort((a, b) => {
      if (sort === "near") return far(a) - far(b);
      if (sort === "people") return b.attendeeIds.length - a.attendeeIds.length;
      return a.startsAt.toMillis() - b.startsAt.toMillis();
    });
  }, [events, category, text, onlyOfficial, onlyOnline, onlyMyLanguages, needs, sort, here, profile]);

  const selected = shown.find((event) => event.id === selectedId);
  const onMap = shown.filter((event) => event.location).length;
  const online = shown.length - onMap;

  return (
    <div className="space-y-4 p-4">
      {/* One slim row: what Descubrir does, in plain words, and how many cards there are. */}
      <button
        type="button"
        onClick={() => setDiscovering(true)}
        disabled={!events?.length}
        className="group flex min-h-14 w-full items-center gap-3 rounded-xl bg-primary px-3 py-2 text-left text-primary-foreground shadow-sm outline-none transition-transform active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-ring/50 disabled:opacity-60"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground text-primary" aria-hidden>
          <LayersIcon className="size-5" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block font-semibold">
            Descubrir{events?.length ? ` · ${events.length} actividades` : ""}
          </span>
          <span className="flex items-center gap-1 text-xs opacity-90">
            Una a una: <HeartIcon className="size-3" aria-hidden /> te apuntas, <XIcon className="size-3" aria-hidden /> pasas
          </span>
        </span>
        <ArrowRightIcon className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
      </button>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Busca: caminata, música, Tenerife…"
          aria-label="Buscar actividades"
          className="h-12 rounded-full pr-12 pl-10 text-base"
        />
        {text && (
          <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 size-10 -translate-y-1/2 rounded-full" onClick={() => setText("")} aria-label="Borrar la búsqueda">
            <XIcon aria-hidden />
          </Button>
        )}
      </div>

      <CategoryChips selected={category} onChange={setCategory} />

      <section className="space-y-2" aria-label="Mapa">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            {events === null
              ? "Cargando el mapa…"
              : showMap
                ? `${onMap} en el mapa${online ? ` · ${online} en línea (sin punto)` : ""}. Toca un punto para verla.`
                : `${shown.length} actividades. El mapa está oculto.`}
          </p>
          <Button variant="outline" className="h-10 shrink-0 rounded-full" onClick={() => toggleMap(!showMap)} aria-pressed={!showMap}>
            {showMap ? <EyeOffIcon aria-hidden /> : <MapIcon aria-hidden />}
            {showMap ? "Ocultar mapa" : "Ver mapa"}
          </Button>
        </div>

        {showMap && (
          <EventMap
            events={shown}
            selectedId={selectedId}
            onSelect={(event) => setSelectedId(event.id)}
            onClear={() => setSelectedId(null)}
            onLocate={(point) => {
              setHere(point);
              setSort("near");
            }}
          />
        )}

        {showMap && selected && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Has tocado en el mapa:</p>
              <Button variant="ghost" size="sm" className="h-9" onClick={() => setSelectedId(null)}>
                <XIcon aria-hidden /> Cerrar
              </Button>
            </div>
            <EventCard event={selected} distanceKm={here && selected.location ? distanceKm(here, selected.location) : undefined} />
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {SORTS.map((option) => (
          <Toggle
            key={option.id}
            variant="outline"
            pressed={sort === option.id}
            onPressedChange={() => (option.id === "near" && !here ? locate() : setSort(option.id))}
            className="h-10 rounded-full px-3 aria-pressed:border-primary aria-pressed:bg-primary/10"
          >
            {option.id === "near" && <LocateFixedIcon className="size-4" aria-hidden />}
            {option.label}
          </Toggle>
        ))}
        <Button
          variant="outline"
          className="ml-auto h-10 rounded-full"
          onClick={() => setShowFilters((open) => !open)}
          aria-expanded={showFilters}
        >
          <FilterIcon aria-hidden /> Filtros
        </Button>
      </div>

      {showFilters && (
        <div className="space-y-3 rounded-xl border p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Bubble label="Solo oficiales" pressed={onlyOfficial} onPressedChange={setOnlyOfficial} />
            <Bubble label="Solo en línea" pressed={onlyOnline} onPressedChange={setOnlyOnline} />
            <Bubble label="Hablan mis idiomas" pressed={onlyMyLanguages} onPressedChange={setOnlyMyLanguages} />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Accesible para mí</h2>
            <p className="text-xs text-muted-foreground">Solo se usa ahora, para buscar. No lo guardamos.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {INCLUSION.map((item) => (
                <Bubble
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  pressed={needs.includes(item.id)}
                  onPressedChange={(on) =>
                    setNeeds((current) => (on ? [...current, item.id] : current.filter((id) => id !== item.id)))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {events === null ? (
        <div className="space-y-3" aria-busy="true">
          <span className="sr-only">Cargando actividades…</span>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay actividades con estos filtros. Prueba a quitar alguno, o crea tú la primera.
        </p>
      ) : (
        <ul className="space-y-3" aria-label="Próximas actividades">
          {shown.map((event) => (
            <li key={event.id}>
              <EventCard
                event={event}
                distanceKm={here && event.location ? distanceKm(here, event.location) : undefined}
              />
            </li>
          ))}
        </ul>
      )}

      {discovering && events && (
        <SwipeDeck
          events={events}
          myUid={user?.uid}
          onClose={() => setDiscovering(false)}
          onJoin={async (event) => {
            if (!user || !profile) {
              toast.info("Entra en tu cuenta para apuntarte.");
              return router.push("/login/");
            }
            try {
              await joinEvent(event.id, { uid: user.uid, languages: profile.languages });
              setEvents((list) =>
                list?.map((item) =>
                  item.id === event.id
                    ? { ...item, attendeeIds: [...item.attendeeIds, user.uid], attendeeLanguages: { ...item.attendeeLanguages, [user.uid]: profile.languages } }
                    : item,
                ) ?? null,
              );
              toast.success(`Te has apuntado a «${event.title}».`);
            } catch {
              toast.error("No se ha podido apuntar. Puede que esté completa.");
            }
          }}
          onLeave={async (event) => {
            if (!user) return;
            try {
              await leaveEvent(event.id, user.uid);
              setEvents((list) =>
                list?.map((item) => {
                  if (item.id !== event.id) return item;
                  const languages = { ...item.attendeeLanguages };
                  delete languages[user.uid];
                  return { ...item, attendeeIds: item.attendeeIds.filter((id) => id !== user.uid), attendeeLanguages: languages };
                }) ?? null,
              );
              toast.info(`Ya no estás en «${event.title}».`);
            } catch {
              toast.error("No se ha podido deshacer.");
            }
          }}
        />
      )}

      <Button
        nativeButton={false}
        render={<Link href="/event/new/" />}
        size="lg"
        className="fixed right-4 bottom-20 z-10 rounded-full shadow-lg"
      >
        <PlusIcon aria-hidden /> Crear
      </Button>
    </div>
  );
}
