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
import { useEffect, useMemo, useState } from "react";
import { FilterIcon, LayersIcon, LocateFixedIcon, PlusIcon } from "lucide-react";
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
import { joinEvent, listUpcomingEvents } from "@/lib/db";
import { distanceKm } from "@/lib/geo";
import { INCLUSION, type InclusionId } from "@/lib/inclusion";
import { ISLANDS } from "@/lib/islands";
import type { Meetup } from "@/lib/types";

// The map needs `window` (WebGL), so it is only loaded in the browser.
const EventMap = dynamic(() => import("@/components/map/EventMap").then((module) => module.EventMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[45vh] w-full rounded-xl" />,
});

const SORTS = [
  { id: "soon", label: "Antes" },
  { id: "near", label: "Cerca" },
  { id: "people", label: "Más gente" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

export default function HomePage() {
  const { user, profile } = useUser();
  const router = useRouter();
  const [discovering, setDiscovering] = useState(false);
  const [events, setEvents] = useState<Meetup[] | null>(null);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [sort, setSort] = useState<SortId>("soon");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyOfficial, setOnlyOfficial] = useState(false);
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [onlyMyLanguages, setOnlyMyLanguages] = useState(false);
  // Chosen here and now, never saved: a disability is not something we store about a person.
  const [needs, setNeeds] = useState<InclusionId[]>([]);
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
  }, [events, category, onlyOfficial, onlyOnline, onlyMyLanguages, needs, sort, here, profile]);

  const selected = shown.find((event) => event.id === selectedId);

  return (
    <div className="space-y-4 p-4">
      <Button size="lg" className="h-12 w-full rounded-full text-base" onClick={() => setDiscovering(true)} disabled={!events?.length}>
        <LayersIcon aria-hidden /> Descubrir actividades
      </Button>

      <CategoryChips selected={category} onChange={setCategory} />

      <EventMap
        events={shown}
        selectedId={selectedId}
        onSelect={(event) => setSelectedId(event.id)}
        onLocate={(point) => {
          setHere(point);
          setSort("near");
        }}
      />

      {selected && <EventCard event={selected} distanceKm={here && selected.location ? distanceKm(here, selected.location) : undefined} />}

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
        <ul className="space-y-3">
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
