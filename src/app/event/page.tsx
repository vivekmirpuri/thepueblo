"use client";
/**
 * One activity: what it is, who is going, and the button to join (F10, F11, F13) — Track B.
 * Built (not a placeholder), including reviews (F12) and the link to the group chat (F14).
 *
 * Pattern: this page is the CONTAINER (loads the activity, joins and leaves).
 * The id comes from `?id=` and is read inside a <Suspense>, because a static export has no
 * dynamic routes like /event/[id].
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CalendarDaysIcon, GlobeIcon, MapPinIcon, MessageCircleIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { Reviews } from "@/components/event/Reviews";
import { LanguageFlags } from "@/components/shared/LanguageFlags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/auth";
import { findCategory } from "@/lib/categories";
import { onlineLabel, platformLabel } from "@/lib/platforms";
import { getEvent, joinEvent, leaveEvent, listReviews, saveReview } from "@/lib/db";
import { INCLUSION } from "@/lib/inclusion";
import type { Meetup, Review } from "@/lib/types";

const WHEN = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function EventDetail() {
  const id = useSearchParams().get("id");
  const { user, profile } = useUser();
  const [event, setEvent] = useState<Meetup | null>(null);
  const [looked, setLooked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  // Read once: whether the activity has started decides if reviews are open.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!id) return;
    getEvent(id)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLooked(true));
    listReviews(id)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [id]);

  if (!id || (looked && !event)) {
    return <p className="p-8 text-center text-sm text-muted-foreground">No encontramos esta actividad.</p>;
  }
  if (!event) {
    return (
      <div className="space-y-3 p-4" aria-busy="true">
        <span className="sr-only">Cargando…</span>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </div>
    );
  }

  const category = findCategory(event.category);
  const Icon = category?.icon;
  const joined = !!user && event.attendeeIds.includes(user.uid);
  const full = !!event.capacity && event.attendeeIds.length >= event.capacity && !joined;
  const started = event.startsAt.toMillis() <= now;

  async function toggleJoin() {
    if (!user || !profile || !id) return;
    setBusy(true);
    try {
      if (joined) await leaveEvent(id, user.uid);
      else await joinEvent(id, { uid: user.uid, languages: profile.languages });
      setEvent(await getEvent(id));
      toast.success(joined ? "Te has borrado de la actividad." : "¡Apuntado! Ya puedes hablar con el grupo.");
    } catch (error) {
      console.error(error);
      toast.error("No se ha podido guardar. Inténtalo otra vez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="space-y-4 p-4">
      {event.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.imageUrl} alt="" className="h-48 w-full rounded-xl object-cover" />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {category && Icon && (
          <Badge variant="secondary">
            <Icon className="size-3.5" aria-hidden /> {category.label}
          </Badge>
        )}
        {event.official && <Badge>Oficial</Badge>}
      </div>

      <h1 className="text-2xl font-semibold">{event.title}</h1>
      <p className="text-sm text-muted-foreground">Lo organiza {event.organizerName}</p>

      <p className="flex items-center gap-2 text-sm">
        <CalendarDaysIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        {WHEN.format(event.startsAt.toDate())}
      </p>
      <p className="flex items-center gap-2 text-sm">
        {event.mode === "online" ? (
          <>
            <GlobeIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            {joined && event.onlineUrl ? (
              <a href={event.onlineUrl} target="_blank" rel="noreferrer" className="underline">
                Entrar a la videollamada{platformLabel(event.onlinePlatform) && event.onlinePlatform !== "otra" ? ` (${platformLabel(event.onlinePlatform)})` : ""}
              </a>
            ) : (
              `${onlineLabel(event.onlinePlatform)}. Apúntate para ver el enlace.`
            )}
          </>
        ) : (
          <>
            <MapPinIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            {event.placeName}
          </>
        )}
      </p>

      {event.description && <p className="whitespace-pre-line text-sm">{event.description}</p>}

      {event.location && <EventMapLazy event={event} />}

      <section className="space-y-2 rounded-xl border p-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <UsersIcon className="size-4" aria-hidden />
          {event.attendeeIds.length}
          {event.capacity ? ` de ${event.capacity}` : ""}{" "}
          {event.attendeeIds.length === 1 && !event.capacity ? "persona apuntada" : "personas apuntadas"}
        </h2>
        <LanguageFlags languages={event.attendeeLanguages ?? {}} />
        <p className="text-xs text-muted-foreground">Las banderas son los idiomas que habla la gente que va.</p>
      </section>

      {event.inclusion?.length > 0 && (
        <section className="space-y-2 rounded-xl border p-3">
          <h2 className="text-sm font-semibold">Accesibilidad</h2>
          <ul className="space-y-1 text-sm">
            {INCLUSION.filter((item) => event.inclusion.includes(item.id)).map(({ id: key, label, icon: Mark }) => (
              <li key={key} className="flex items-center gap-2">
                <Mark className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-2">
        {!user ? (
          <Button nativeButton={false} render={<Link href="/login/" />} size="lg">
            Entra para apuntarte
          </Button>
        ) : (
          <Button size="lg" variant={joined ? "outline" : "default"} onClick={toggleJoin} disabled={busy || full}>
            {full ? "Completo" : joined ? "Ya no voy" : "Me apunto"}
          </Button>
        )}
        {joined && (
          <Button nativeButton={false} render={<Link href={`/chats/?event=${event.id}`} />} variant="outline" size="lg">
            <MessageCircleIcon aria-hidden /> Hablar con el grupo
          </Button>
        )}
      </div>

      <Reviews
        reviews={reviews}
        myUid={user?.uid}
        canReview={joined && started}
        waitingToStart={joined && !started}
        onSave={async (rating, text) => {
          if (!user || !profile || !id) return;
          await saveReview(id, { uid: user.uid, name: profile.displayName, rating: rating as Review["rating"], text });
          setReviews(await listReviews(id));
        }}
      />
    </article>
  );
}

const Map = dynamic(() => import("@/components/map/EventMap").then((module) => module.EventMap), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full rounded-xl" />,
});

function EventMapLazy({ event }: { event: Meetup }) {
  return <Map events={[event]} selectedId={event.id} className="h-48" />;
}

export default function EventPage() {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-40" />}>
      <EventDetail />
    </Suspense>
  );
}
