"use client";
/**
 * xatsí, the assistant chatbot (F16) — Track C. Built (not a placeholder).
 *
 * Pattern: this page is the CONTAINER. It keeps the conversation, loads the upcoming activities
 * once, builds the catalogue for each question ("@/lib/ai") and streams xatsí's reply from the
 * Worker. <AssistantChat> only draws. This page never imports a model.
 *
 * Open to everyone: you do not need an account to chat; with one, xatsí also knows your
 * interests, languages and island (never your name).
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AssistantChat, type ChatEntry } from "@/components/assistant/AssistantChat";
import {
  buildCatalog,
  keywordMatches,
  parseRefs,
  streamXatsiConversation,
  toCatalogItem,
  toChatProfile,
  toEventSummary,
} from "@/lib/ai";
import { useUser } from "@/lib/auth";
import { listUpcomingEvents } from "@/lib/db";
import type { Meetup } from "@/lib/types";

export default function AssistantPage() {
  const { profile } = useUser();
  const [events, setEvents] = useState<Meetup[] | null>(null);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listUpcomingEvents()
      .then(setEvents)
      .catch(() => {
        toast.error("No se han podido cargar las actividades.");
        setEvents([]);
      });
  }, []);

  async function ask(question: string) {
    if (busy) return;
    const history = [...entries, { role: "user" as const, text: question }];
    setEntries([...history, { role: "assistant", text: "" }]);
    setBusy(true);

    const all = events ?? (await listUpcomingEvents().catch(() => []));
    // The last two questions, so a follow-up like "¿y en Lanzarote?" keeps its topic.
    const query = history.filter((entry) => entry.role === "user").slice(-2).map((entry) => entry.text).join(" ");
    const catalog = buildCatalog(query, profile, all);
    const updateReply = (patch: Partial<ChatEntry>) =>
      setEntries((list) => [...list.slice(0, -1), { ...list[list.length - 1], ...patch }]);

    let raw = "";
    await streamXatsiConversation(
      {
        messages: history.map((entry) => ({ role: entry.role, content: entry.text })),
        catalog: catalog.map((event, index) => toCatalogItem(event, index + 1)),
        profile: profile ? toChatProfile(profile) : null,
        events: catalog.slice(0, 6).map(toEventSummary),
      },
      (token) => {
        raw += token;
        updateReply({ text: parseRefs(raw, catalog).clean });
      },
    );

    const { clean, picked } = parseRefs(raw, catalog);
    // An older Worker (or a reply that cites nothing) still gets cards when the words matched.
    updateReply({ text: clean, events: picked.length ? picked : keywordMatches(query, all) });
    setBusy(false);
  }

  return (
    <AssistantChat
      entries={entries}
      busy={busy}
      canSuggest={!!profile}
      onAsk={ask}
      onSuggest={() => ask("Sugiéreme algo que encaje conmigo")}
      onReset={() => setEntries([])}
    />
  );
}
