/**
 * xatsí, the assistant that runs on your own device — owned by Track C.
 *
 * This file is the CONTRACT the rest of the app uses. Tracks A and B import only from here.
 *
 * WHAT WORKS TODAY: matching by words. It needs no model and no download, so xatsí answers the
 * moment you open it, on any phone. Accents and capitals are ignored, and the activity's title,
 * description, category and place are all searched.
 *
 * WHAT COMES NEXT (C3): the embedding model (see ./config.ts) re-ranks these same results by
 * meaning, so "algo para moverme" also finds "caminata". Plan: keep `rank` as the instant answer,
 * then, once the model has loaded, re-sort the top ~30 with cosine similarity. The functions below
 * keep their shape, so no screen has to change.
 *
 * Nothing here ever invents an activity: every result is a real document from Firestore.
 */
import { findCategory } from "../categories";
import { ISLANDS } from "../islands";
import type { Meetup, UserProfile } from "../types";

export interface ScoredEvent {
  event: Meetup;
  /** 0–1, higher is closer. */
  score: number;
}

/** Lower-case, without accents, so "caminata" matches "Caminata" and "ñ" behaves. */
const plain = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Words worth matching on: three letters or more, so "de", "la" and "en" do not count. */
const words = (text: string) => plain(text).split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 2);

const haystack = (event: Meetup) =>
  plain(
    [event.title, event.description, event.placeName, findCategory(event.category)?.label ?? ""]
      .filter(Boolean)
      .join(" "),
  );

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
  const island = ISLANDS.find((item) => item.id === profile.island)?.name ?? "";
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
