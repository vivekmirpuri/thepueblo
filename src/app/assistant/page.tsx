"use client";
/**
 * xatsí, the assistant: free-text search, "Sugiéreme algo" and AI responses (F16) — Track C.
 * Built (not a placeholder).
 *
 * Pattern: this page is the CONTAINER. It loads the upcoming activities once, asks "@/lib/ai"
 * to rank them, then streams a short AI response from the xatsí Cloudflare Worker.
 * <AssistantChat> only draws. This page never imports a model.
 *
 * Open to everyone: you do not need an account to search, only for "Sugiéreme algo".
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import {
  recommendEvents,
  searchEvents,
  streamXatsiChat,
  toEventSummary,
  toProfileSummary,
  type ScoredEvent,
  type XatsiMode,
} from "@/lib/ai";
import { useUser } from "@/lib/auth";
import { listUpcomingEvents } from "@/lib/db";
import type { Meetup } from "@/lib/types";

export default function AssistantPage() {
  const { profile } = useUser();
  const [events, setEvents] = useState<Meetup[] | null>(null);
  const [results, setResults] = useState<ScoredEvent[] | null>(null);
  const [asked, setAsked] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiText, setAiText] = useState("");

  useEffect(() => {
    listUpcomingEvents()
      .then(setEvents)
      .catch(() => {
        toast.error("No se han podido cargar las actividades.");
        setEvents([]);
      });
  }, []);

  async function answer(
    question: string,
    mode: XatsiMode,
    find: (all: Meetup[]) => Promise<ScoredEvent[]>,
  ) {
    setAsked(question);
    setBusy(true);
    setAiText("");
    try {
      const all = events ?? (await listUpcomingEvents());
      const found = await find(all);
      setResults(found);
      setBusy(false);

      // Stream an AI comment about the results (gracefully falls back to a fixed sentence).
      const toSend = found.length > 0 ? found : all.slice(0, 4).map((event) => ({ event, score: 0 }));
      await streamXatsiChat(
        {
          prompt: question,
          events: toSend.map(({ event }) => toEventSummary(event)),
          profile: profile ? toProfileSummary(profile) : null,
          mode,
        },
        (token) => setAiText((prev) => prev + token),
      );
    } catch {
      setBusy(false);
    }
  }

  return (
    <AssistantChat
      results={results}
      asked={asked}
      busy={busy}
      aiText={aiText}
      canSuggest={!!profile}
      onAsk={(query) => answer(query, "search", (all) => searchEvents(query, all))}
      onSuggest={() =>
        profile && answer("lo que te puede gustar", "suggest", (all) => recommendEvents(profile, all))
      }
    />
  );
}
