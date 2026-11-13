"use client";
/**
 * My group chats, and one chat when `?event=` is set (F14) — Track B. Built (not a placeholder).
 * Pattern: this page is the CONTAINER (loads my activities, subscribes to the messages, sends);
 * <ChatThread> only draws.
 *
 * The id is read with useSearchParams() inside a <Suspense>, because a static export has no
 * dynamic routes like /chats/[id]. Only people who joined an activity can read its chat:
 * firestore.rules enforce it, and this screen says so instead of showing an error.
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeftIcon, MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { ChatThread } from "@/components/chat/ChatThread";
import { EventRow } from "@/components/shared/EventRow";
import { LanguageFlags } from "@/components/shared/LanguageFlags";
import { RequireUser } from "@/components/shared/RequireUser";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getEvent, listMyEvents, sendMessage, watchMessages } from "@/lib/db";
import type { ChatMessage, Meetup, UserProfile } from "@/lib/types";


function Loading() {
  return (
    <div className="space-y-3 p-4" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

function ChatList({ uid }: { uid: string }) {
  const [events, setEvents] = useState<Meetup[] | null>(null);

  useEffect(() => {
    listMyEvents(uid)
      .then(setEvents)
      .catch(() => {
        toast.error("No se han podido cargar tus grupos.");
        setEvents([]);
      });
  }, [uid]);

  if (!events) return <Loading />;
  if (events.length === 0) {
    return (
      <section className="flex flex-col items-center gap-4 p-4 py-12 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageCircleIcon className="size-8" aria-hidden />
        </span>
        <h1 className="text-xl font-semibold">Todavía no estás en ningún grupo</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Cuando te apuntes a una actividad, aquí podrás hablar con el resto de personas que van.
        </p>
        <Button nativeButton={false} render={<Link href="/" />} size="lg">
          Buscar actividades
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-xl font-semibold">Mis grupos</h1>
      <ul className="divide-y rounded-xl border">
        {events.map((event) => (
          <EventRow key={event.id} event={event} href={`/chats/?event=${event.id}`} />
        ))}
      </ul>
    </div>
  );
}

function Chat({ eventId, uid, profile }: { eventId: string; uid: string; profile: UserProfile }) {
  const [event, setEvent] = useState<Meetup | null>(null);
  const [looked, setLooked] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const joined = !!event && event.attendeeIds.includes(uid);

  useEffect(() => {
    getEvent(eventId)
      .then(setEvent)
      .finally(() => setLooked(true));
  }, [eventId]);

  useEffect(() => {
    if (!joined) return;
    return watchMessages(eventId, setMessages, () => toast.error("No se han podido cargar los mensajes."));
  }, [eventId, joined]);

  if (!looked) return <Loading />;
  if (!event) return <p className="p-8 text-center text-sm text-muted-foreground">No encontramos esta actividad.</p>;

  return (
    <div className="space-y-3 p-4">
      <header className="flex items-center gap-2 border-b pb-3">
        <Button nativeButton={false} render={<Link href="/chats/" />} variant="ghost" size="icon" aria-label="Volver a mis grupos">
          <ArrowLeftIcon aria-hidden />
        </Button>
        <div className="min-w-0 flex-1">
          <Link href={`/event/?id=${event.id}`} className="block truncate font-semibold hover:underline">
            {event.title}
          </Link>
          <LanguageFlags languages={event.attendeeLanguages ?? {}} />
        </div>
      </header>

      {joined ? (
        <ChatThread
          messages={messages}
          myUid={uid}
          onSend={async (text) => {
            try {
              await sendMessage(eventId, { uid, displayName: profile.displayName, pronouns: profile.pronouns }, text);
            } catch {
              toast.error("No se ha podido enviar. Inténtalo otra vez.");
              throw new Error("send failed");
            }
          }}
        />
      ) : (
        <section className="space-y-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            El chat es solo para quienes se han apuntado. Apúntate para hablar con el grupo.
          </p>
          <Button nativeButton={false} render={<Link href={`/event/?id=${event.id}`} />}>
            Ver la actividad
          </Button>
        </section>
      )}
    </div>
  );
}

function ChatsScreen() {
  const eventId = useSearchParams().get("event");
  return (
    <RequireUser>
      {({ user, profile }) =>
        !profile ? null : eventId ? (
          <Chat eventId={eventId} uid={user.uid} profile={profile} />
        ) : (
          <ChatList uid={user.uid} />
        )
      }
    </RequireUser>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ChatsScreen />
    </Suspense>
  );
}
