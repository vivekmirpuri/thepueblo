"use client";
/**
 * "Descubrir": one activity at a time, full screen, swipe to decide — Track A. Built.
 *
 * Swipe right (or tap the heart) to join, left (or tap the cross) to skip, tap ⓘ to open it, and
 * the arrow undoes the last decision (if it was a join, you are taken off the activity again). Gestures are never the only way: every action also has a labelled button, so it works with a
 * keyboard, a screen reader or a shaky hand. The category bubbles at the top choose which topics
 * come into the deck; none chosen means all of them.
 *
 * Presentational: it decides nothing about accounts or Firestore. It reports `onJoin` and the
 * page does the joining (and sends signed-out people to /login/).
 */
import { useEffect, useMemo, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import Link from "next/link";
import { ArrowLeftIcon, CalendarDaysIcon, GlobeIcon, HeartIcon, InfoIcon, MapPinIcon, Undo2Icon, UndoIcon, UsersIcon, XIcon } from "lucide-react";
import { InclusionBadges } from "@/components/shared/InclusionBadges";
import { LanguageFlags } from "@/components/shared/LanguageFlags";
import { PhotoCredit } from "@/components/shared/PhotoCredit";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { onlineLabel } from "@/lib/platforms";
import { CATEGORIES, findCategory, type CategoryId } from "@/lib/categories";
import type { Meetup } from "@/lib/types";

const WHEN = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
/** How far (px) a card has to travel before it counts as a decision. */
const THRESHOLD = 110;

function Card({ event, onDecide }: { event: Meetup; onDecide: (join: boolean) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-12, 12]);
  const yes = useTransform(x, [30, THRESHOLD], [0, 1]);
  const no = useTransform(x, [-THRESHOLD, -30], [1, 0]);
  const category = findCategory(event.category);
  const Icon = category?.icon;

  function end(_: unknown, info: PanInfo) {
    if (info.offset.x > THRESHOLD) onDecide(true);
    else if (info.offset.x < -THRESHOLD) onDecide(false);
    else animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
  }

  return (
    <motion.article
      className="absolute inset-0 flex cursor-grab touch-pan-y flex-col overflow-hidden rounded-3xl border bg-card shadow-xl active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin={false}
      onDragEnd={end}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-label={event.title}
    >
      <div className="relative h-[48%] shrink-0 bg-muted">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.imageUrl} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          Icon && <Icon className="absolute inset-0 m-auto size-16 text-muted-foreground" aria-hidden />
        )}
        <PhotoCredit credit={event.imageCredit} />
        <motion.span style={{ opacity: yes }} className="absolute top-5 left-5 rotate-[-12deg] rounded-lg border-4 border-green-600 bg-white/90 px-3 py-1 text-2xl font-extrabold text-green-700" aria-hidden>
          ME APUNTO
        </motion.span>
        <motion.span style={{ opacity: no }} className="absolute top-5 right-5 rotate-12 rounded-lg border-4 border-stone-500 bg-white/90 px-3 py-1 text-2xl font-extrabold text-stone-600" aria-hidden>
          PASO
        </motion.span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-5">
        {category && Icon && (
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm">
            <Icon className="size-4" aria-hidden /> {category.label}
          </span>
        )}
        <h2 className="text-2xl leading-tight font-semibold">{event.title}</h2>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDaysIcon className="size-4 shrink-0" aria-hidden /> {WHEN.format(event.startsAt.toDate())}
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {event.mode === "online" ? <GlobeIcon className="size-4 shrink-0" aria-hidden /> : <MapPinIcon className="size-4 shrink-0" aria-hidden />}
          {event.mode === "online" ? onlineLabel(event.onlinePlatform) : event.placeName}
        </p>
        {event.description && <p className="line-clamp-3 text-sm">{event.description}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-2">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <UsersIcon className="size-4" aria-hidden /> {event.attendeeIds.length}
            {event.capacity ? ` / ${event.capacity}` : ""}
          </span>
          <LanguageFlags languages={event.attendeeLanguages ?? {}} />
          <InclusionBadges features={event.inclusion ?? []} />
        </div>
      </div>
    </motion.article>
  );
}

export function SwipeDeck({
  events,
  myUid,
  onJoin,
  onLeave,
  onClose,
}: {
  events: Meetup[];
  myUid?: string;
  /** Resolves when joined; the deck moves on either way. */
  onJoin: (event: Meetup) => Promise<void>;
  /** Undo of a join. */
  onLeave: (event: Meetup) => Promise<void>;
  onClose: () => void;
}) {
  const [topics, setTopics] = useState<CategoryId[]>([]);
  // Every decision, newest last, so the last one can be undone.
  const [history, setHistory] = useState<{ event: Meetup; joined: boolean }[]>([]);
  const seen = useMemo(() => history.map((item) => item.event.id), [history]);
  const still = useReducedMotion();

  // Full screen: the map page behind must not scroll (or show its scrollbar) while the deck is open.
  useEffect(() => {
    const before = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = before;
    };
  }, []);

  const deck = useMemo(
    () =>
      events.filter(
        (event) =>
          !seen.includes(event.id) &&
          !(myUid && event.attendeeIds.includes(myUid)) &&
          (topics.length === 0 || topics.includes(event.category)),
      ),
    [events, seen, myUid, topics],
  );
  const current = deck[0];

  function decide(join: boolean) {
    if (!current) return;
    setHistory((list) => [...list, { event: current, joined: join }]);
    if (join) void onJoin(current);
  }

  function undo() {
    const last = history.at(-1);
    if (!last) return;
    setHistory((list) => list.slice(0, -1));
    if (last.joined) void onLeave(last.event);
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-background" role="dialog" aria-modal="true" aria-label="Descubrir actividades">
      <header className="flex items-center gap-2 px-4 pt-4">
        <Button variant="ghost" onClick={onClose} className="-ml-2 h-11 gap-1.5 px-2 text-base">
          <ArrowLeftIcon aria-hidden /> Volver al mapa
        </Button>
        <h1 className="flex-1 text-right text-xl font-semibold">Descubrir</h1>
      </header>

      <div className="-mx-0 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Temas que quieres ver">
        <div className="flex w-max gap-2">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <Toggle
              key={id}
              variant="outline"
              pressed={topics.includes(id)}
              onPressedChange={(on) => setTopics((list) => (on ? [...list, id] : list.filter((item) => item !== id)))}
              className="h-10 shrink-0 rounded-full px-3 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-foreground"
            >
              <Icon className="size-4" aria-hidden /> {label}
            </Toggle>
          ))}
        </div>
      </div>

      <div className="relative mx-4 flex-1">
        {current ? (
          <>
            {deck[1] && <div className="absolute inset-x-3 top-3 bottom-0 rounded-3xl border bg-card/60" aria-hidden />}
            <Card key={current.id} event={current} onDecide={decide} />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <h2 className="text-lg font-semibold">Ya lo has visto todo</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              {topics.length ? "Prueba a elegir más temas arriba." : "Vuelve más tarde: cada día se crean actividades nuevas."}
            </p>
            {history.length > 0 && (
              <Button variant="outline" onClick={() => setHistory([])}>
                <UndoIcon aria-hidden /> Empezar otra vez
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-5 px-4 py-5">
        <Button variant="outline" className="size-12 rounded-full" onClick={undo} disabled={history.length === 0} aria-label="Deshacer la última decisión">
          <Undo2Icon className="size-5" aria-hidden />
        </Button>
        <Button variant="outline" className="size-16 rounded-full" onClick={() => decide(false)} disabled={!current} aria-label="Paso de esta actividad">
          <XIcon className="size-7" aria-hidden />
        </Button>
        <Button
          nativeButton={false}
          render={<Link href={current ? `/event/?id=${current.id}` : "/"} />}
          variant="outline"
          className="size-12 rounded-full"
          aria-label="Ver la actividad"
        >
          <InfoIcon className="size-5" aria-hidden />
        </Button>
        <Button className="size-16 rounded-full" onClick={() => decide(true)} disabled={!current} aria-label="Me apunto a esta actividad">
          <HeartIcon className="size-7" aria-hidden />
        </Button>
      </div>
      {!still && <span className="sr-only">Desliza a la derecha para apuntarte y a la izquierda para pasar.</span>}
    </div>
  );
}
