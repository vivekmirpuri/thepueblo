"use client";
/**
 * xatsí, the assistant: free-text search and "Sugiéreme algo" (F16) — Track C.
 * Built (not a placeholder).
 *
 * Pattern: this page is the CONTAINER. It loads the upcoming activities once and asks
 * "@/lib/ai" to rank them; <AssistantChat> only draws. This page never imports a model.
 * Open to everyone: you do not need an account to search, only for "Sugiéreme algo".
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import { recommendEvents, searchEvents, type ScoredEvent } from "@/lib/ai";
import { useUser } from "@/lib/auth";
import { listUpcomingEvents } from "@/lib/db";
import type { Meetup } from "@/lib/types";

export default function AssistantPage() {
  const { profile } = useUser();
  const [events, setEvents] = useState<Meetup[] | null>(null);
  const [results, setResults] = useState<ScoredEvent[] | null>(null);
  const [asked, setAsked] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listUpcomingEvents()
      .then(setEvents)
      .catch(() => {
        toast.error("No se han podido cargar las actividades.");
        setEvents([]);
      });
  }, []);

  async function answer(question: string, find: (all: Meetup[]) => Promise<ScoredEvent[]>) {
    setAsked(question);
    setBusy(true);
    try {
      setResults(await find(events ?? (await listUpcomingEvents())));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AssistantChat
      results={results}
      asked={asked}
      busy={busy}
      canSuggest={!!profile}
      onAsk={(query) => answer(query, (all) => searchEvents(query, all))}
      onSuggest={() => profile && answer("lo que te puede gustar", (all) => recommendEvents(profile, all))}
    />
  );
}
