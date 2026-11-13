/**
 * xatsí, the assistant — owned by Track C.
 *
 * This file is the CONTRACT the rest of the app uses. Tracks A and B import only from here.
 *
 * HOW IT WORKS: activities are ranked here, in the browser, by matching words (accents and
 * capitals ignored; title, description, category and place searched). For the chatbot, the best
 * ~20 become a numbered CATALOGUE that goes to the xatsí Worker (Cloudflare Workers AI) together
 * with the conversation; the model answers and cites activities as [[n]], and `parseRefs` turns
 * those back into the real activities. The model can only point at what is in the catalogue.
 *
 * NEXT (C3): an embedding model could re-rank by meaning ("moverme" → "caminata") without
 * changing these function shapes.
 */
import { findCategory } from "../categories";
import { INCLUSION } from "../inclusion";
import { homeName } from "../islands";
import { onlineLabel } from "../platforms";
import { PREFERS } from "../profile";
import type { Meetup, UserProfile } from "../types";

export { streamXatsiChat, streamXatsiConversation } from "./cloudflare";
export type { CatalogItem, ChatTurn, EventSummary, ProfileSummary, XatsiMode } from "./cloudflare";
import type { CatalogItem, EventSummary, ProfileSummary } from "./cloudflare";

/** Strips a Meetup to the lightweight shape the xatsí Worker expects. */
export function toEventSummary(event: Meetup): EventSummary {
  return {
    title: event.title,
    category: findCategory(event.category)?.label ?? event.category,
    startsAt: event.startsAt.toDate().toLocaleDateString("es-ES", {
      weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    }),
    placeName: event.placeName || "En línea",
    island: event.island,
    attendeeCount: event.attendeeIds.length,
    languages: [...new Set(Object.values(event.attendeeLanguages ?? {}).flat())],
  };
}

/** Strips a UserProfile to the lightweight shape the xatsí Worker expects. */
export function toProfileSummary(profile: UserProfile): ProfileSummary {
  return {
    displayName: profile.displayName,
    interests: profile.interests.map((id) => findCategory(id)?.label ?? id),
    languages: [...profile.languages],
    island: homeName(profile.island) ?? profile.island,
  };
}

export interface ScoredEvent {
  event: Meetup;
  /** 0–1, higher is closer. */
  score: number;
}

/** Lower-case, without accents, so "caminata" matches "Caminata" and "ñ" behaves. */
const plain = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/**
 * Filler words that say nothing about the activity. Without this list "algo al aire libre este
 * fin de semana" matched a café only because its description says "este café".
 * shortcut: time words ("semana", "hoy") are ignored, not used as a date filter; add one if asked.
 */
const FILLER = new Set(
  "algo este esta estos estas ese esa para con una uno unos unas que por los las del mas muy fin semana hoy manana plan planes quiero busco gustaria hacer cerca sitio otro".split(" "),
);

/** Words worth matching on: three letters or more and not filler. */
const words = (text: string) =>
  plain(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 2 && !FILLER.has(word));

const haystack = (event: Meetup) => {
  const cat = findCategory(event.category);
  return plain(
    [event.title, event.description, event.placeName, cat?.label ?? "", cat?.description ?? ""]
      .filter(Boolean)
      .join(" "),
  );
};

/** True when every meaningful word typed appears in the activity. Used by the search bar on the map. */
export function matchesText(query: string, event: Meetup): boolean {
  const asked = words(query);
  if (asked.length === 0) return true;
  const text = haystack(event);
  return asked.every((word) => text.includes(word));
}

function rank(text: string, events: Meetup[], limit: number): ScoredEvent[] {
  const asked = words(text);
  if (asked.length === 0) return [];
  return events
    .map((event) => {
      const text = haystack(event);
      const hits = asked.filter((word) => text.includes(word)).length;
      return { event, score: hits / asked.length };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.event.startsAt.toMillis() - b.event.startsAt.toMillis())
    .slice(0, limit);
}

/** F9 — activities that look like the one being written. Used by the create form (Track B). */
export async function findSimilarEvents(text: string, events: Meetup[], limit = 3): Promise<ScoredEvent[]> {
  // Half the words have to match before we interrupt someone who is writing.
  return rank(text, events, limit).filter((result) => result.score >= 0.5);
}

/** F16 — free-text search. "algo al aire libre este finde" → the activities that fit. */
export async function searchEvents(query: string, events: Meetup[], limit = 6): Promise<ScoredEvent[]> {
  return rank(query, events, limit);
}

/**
 * F16 — "Sugiéreme algo": builds a sentence out of your profile (your interests, your island)
 * and searches with it, then pushes up anything where someone already speaks your languages.
 */
export async function recommendEvents(profile: UserProfile, events: Meetup[], limit = 6): Promise<ScoredEvent[]> {
  const interests = profile.interests.map((id) => findCategory(id)?.label ?? "").filter(Boolean);
  const island = homeName(profile.island) ?? "";
  const asked = [...interests, island, profile.bio].join(" ");

  const scored = rank(asked, events, events.length).map((result) => {
    const spoken = Object.values(result.event.attendeeLanguages ?? {}).flat();
    const shared = profile.languages.some((code) => spoken.includes(code));
    const sameIsland = result.event.island === profile.island;
    return { ...result, score: result.score + (shared ? 0.3 : 0) + (sameIsland ? 0.2 : 0) };
  });

  // With an empty profile nothing matches, so fall back to whatever happens soonest.
  const best = scored.sort((a, b) => b.score - a.score).slice(0, limit);
  if (best.length > 0) return best;
  return [...events]
    .sort((a, b) => a.startsAt.toMillis() - b.startsAt.toMillis())
    .slice(0, limit)
    .map((event) => ({ event, score: 0 }));
}

// ── Chatbot: catalogue in, cited activities out ──────────────────────────────

const WHEN = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/** The profile for the chatbot, without the person's name: the model does not need it. */
export function toChatProfile(profile: UserProfile) {
  const { interests, languages, island } = toProfileSummary(profile);
  return { interests, languages, island, prefers: PREFERS.find((item) => item.id === profile.prefers)?.label };
}

/** One line of the catalogue the model reads. */
export function toCatalogItem(event: Meetup, ref: number): CatalogItem {
  const people = event.attendeeIds.length;
  return {
    ref,
    title: event.title,
    category: findCategory(event.category)?.label ?? event.category,
    when: WHEN.format(event.startsAt.toDate()),
    where: event.mode === "online" ? onlineLabel(event.onlinePlatform) : [event.placeName, homeName(event.island)].filter(Boolean).join(", "),
    people: `${people} ${people === 1 ? "persona" : "personas"}${event.capacity ? ` (aforo ${event.capacity})` : ""}`,
    languages: [...new Set(Object.values(event.attendeeLanguages ?? {}).flat())],
    inclusion: INCLUSION.filter((item) => event.inclusion?.includes(item.id)).map((item) => item.label),
  };
}

/**
 * The activities the model may choose from: the best word matches for what was asked, then the
 * ones that fit the profile, then the soonest, so even "¿qué hago hoy?" has real options.
 */
export function buildCatalog(query: string, profile: UserProfile | null, events: Meetup[], size = 20): Meetup[] {
  const picked = new Map<string, Meetup>();
  const add = (list: Meetup[]) => list.forEach((event) => picked.size < size && picked.set(event.id, event));
  add(rank(query, events, size).map((result) => result.event));
  if (profile) {
    const interests = profile.interests.map((id) => findCategory(id)?.label ?? "").join(" ");
    add(rank(`${interests} ${homeName(profile.island) ?? ""}`, events, size).map((result) => result.event));
  }
  add([...events].sort((a, b) => a.startsAt.toMillis() - b.startsAt.toMillis()));
  return [...picked.values()];
}

/** Word matches only (no profile, no filler): used for cards when the model cites nothing. */
export const keywordMatches = (query: string, events: Meetup[], limit = 3) =>
  rank(query, events, limit).map((result) => result.event);

/**
 * Turns the model's [[3]] citations (also [3], which small models write) into the catalogue's
 * activities, in order and without repeats, and removes the markers from the text.
 */
export function parseRefs(text: string, catalog: Meetup[]): { clean: string; picked: Meetup[] } {
  const picked: Meetup[] = [];
  const clean = text
    .replace(/\[\[?\s*(\d{1,2})\s*\]?\]/g, (_match, ref: string) => {
      const event = catalog[Number(ref) - 1];
      if (event && !picked.includes(event)) picked.push(event);
      return "";
    })
    .replace(/[ \t]+([.,;:!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  return { clean, picked };
}
